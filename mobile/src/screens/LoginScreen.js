import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Linking
} from 'react-native';
import * as Location from 'expo-location';
import { MotiView, MotiText } from '../components/Motion';
import { api, setAuthToken } from '../services/api';
import { THEMES, TYPOGRAPHY, SHADOWS, RADIUS } from '../constants/theme';
import { AnimatedButton } from '../components/AnimatedButton';
import { 
  BrandLogoSvg, 
  HospitalFacilitySvg, 
  UserProfileSvg, 
  AdminShieldHqSvg, 
  InfoCircleSvg, 
  MailEnvelopeSvg, 
  LockSecuritySvg, 
  EyeSvg, 
  EyeOffSvg, 
  LogInSvg 
} from '../components/icons';

const ROLES = [
  { 
    id: 'patient', 
    label: 'Patient', 
    icon: 'person', 
    tagline: 'Emergency care, nearby hospital finder & real-time beds',
    theme: THEMES.patient 
  },
  { 
    id: 'hospital_admin', 
    label: 'Hospital', 
    icon: 'business', 
    tagline: 'Manage live bed rosters, ICU capacity & admissions',
    theme: THEMES.hospital_admin 
  },
  { 
    id: 'super_admin', 
    label: 'HQ Admin', 
    icon: 'shield-checkmark', 
    tagline: 'Facility approval, governance & network surveillance',
    theme: THEMES.super_admin 
  }
];

export default function LoginScreen({ navigation, route }) {
  const [activeRole, setActiveRole] = useState(ROLES[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const theme = activeRole.theme;

  // Handle prefill from registration (e.g. when account already exists)
  useEffect(() => {
    if (route?.params?.initialRole) {
      const match = ROLES.find(r => r.id === route.params.initialRole);
      if (match) setActiveRole(match);
    }
    if (route?.params?.prefillEmail) {
      setEmail(route.params.prefillEmail);
    }
  }, [route?.params?.initialRole, route?.params?.prefillEmail]);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert('Required Fields', 'Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { 
        email: cleanEmail, 
        password: cleanPassword, 
        role: activeRole.id 
      });

      const userRole = res.data?.user?.role || activeRole.id;

      // When role is patient, mandatory location permission MUST be granted before logging in
      if (userRole === 'patient') {
        let permStatus = 'undetermined';
        let canAskAgain = true;

        try {
          const currentPerm = await Location.getForegroundPermissionsAsync();
          permStatus = currentPerm.status;
          canAskAgain = currentPerm.canAskAgain;

          if (permStatus !== 'granted') {
            const reqRes = await Location.requestForegroundPermissionsAsync();
            permStatus = reqRes.status;
            canAskAgain = reqRes.canAskAgain;
          }
        } catch (locErr) {
          console.warn('Location permission request error:', locErr);
        }

        if (permStatus !== 'granted') {
          // Patient refused location access: DO NOT log in or open application
          setLoading(false);
          Alert.alert(
            'Location Access Required',
            'Health Connect cannot start without location access.\n\nLive GPS coordinates are required to find nearby hospitals and compute live emergency bed availability.\n\nPlease grant location permission to sign in.',
            [
              { text: 'Cancel', style: 'cancel' },
              !canAskAgain
                ? {
                    text: 'Open App Settings',
                    onPress: () => Linking.openSettings(),
                  }
                : {
                    text: 'Grant Permission',
                    onPress: () => handleLogin(),
                  },
            ]
          );
          return;
        }
      }

      // Location granted (or admin user): proceed with login and token storage
      setAuthToken(res.data.token);

      if (userRole === 'super_admin') {
        navigation.reset({ index: 0, routes: [{ name: 'AdminTabs' }] });
      } else if (userRole === 'hospital_admin') {
        navigation.reset({ 
          index: 0, 
          routes: [{ name: 'HospitalTabs', params: { hospitalId: res.data.user.hospitalId } }] 
        });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'PatientTabs' }] });
      }
    } catch (err) {
      console.log('Login request error:', err);
      const resData = err.response?.data;
      if (resData?.status === 'pending' || resData?.error?.includes('Pending')) {
        Alert.alert(
          'Awaiting Super Admin Approval (Step 5)',
          resData.message || 'Your hospital documents and OTP have been verified! The Super Admin must approve your registration before you can log in.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (resData?.step === 'otp_verification') {
        Alert.alert(
          'OTP Verification Incomplete (Step 3)',
          resData.message || 'Please complete your document upload and OTP verification.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Complete Verification', 
              onPress: () => navigation.navigate('RegisterHospital', { initialRole: 'hospital_admin' }) 
            }
          ]
        );
        return;
      }

      let errorMsg = resData?.message || resData?.error || err.message || 'Unable to sign in. Please verify credentials.';
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        errorMsg = 'Cannot connect to backend server. Please verify your phone and computer are on the same Wi-Fi.';
      }
      Alert.alert('Authentication Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardWrapper}>
          {/* Header Brand */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18 }}
            style={styles.brandHeader}
          >
            <View style={styles.logoBadge}>
              <BrandLogoSvg size={58} primaryColor={theme.primary} secondaryColor={theme.accent || '#06B6D4'} />
            </View>
            <MotiText 
              style={[TYPOGRAPHY.h1, { color: theme.text, marginTop: 14 }]}
            >
              Health Connect
            </MotiText>
            <Text style={[TYPOGRAPHY.body, { color: theme.textSecondary, marginTop: 4, textAlign: 'center' }]}>
              Healthcare Emergency & Bed Availability Grid
            </Text>
          </MotiView>

          {/* Role Segmented Tabs */}
          <View style={[styles.roleContainer, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            {ROLES.map((role) => {
              const isActive = activeRole.id === role.id;
              const roleIconColor = isActive ? theme.primary : theme.textMuted;
              return (
                <TouchableOpacity
                  key={role.id}
                  activeOpacity={0.8}
                  style={[
                    styles.roleTab,
                    isActive && [
                      styles.roleTabActive, 
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      SHADOWS.sm
                    ]
                  ]}
                  onPress={() => setActiveRole(role)}
                >
                  {role.id === 'hospital_admin' ? (
                    <HospitalFacilitySvg size={16} color={roleIconColor} style={{ marginRight: 6 }} />
                  ) : role.id === 'super_admin' ? (
                    <AdminShieldHqSvg size={16} color={roleIconColor} style={{ marginRight: 6 }} />
                  ) : (
                    <UserProfileSvg size={16} color={roleIconColor} style={{ marginRight: 6 }} />
                  )}
                  <Text style={[
                    TYPOGRAPHY.caption, 
                    { 
                      color: isActive ? theme.primary : theme.textMuted,
                      fontWeight: isActive ? '700' : '500'
                    }
                  ]}>
                    {role.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Role Intent Banner */}
          <MotiView 
            key={activeRole.id}
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 250 }}
            style={[styles.roleBanner, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }]}
          >
            <InfoCircleSvg size={18} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, flex: 1 }]}>
              {activeRole.tagline}
            </Text>
          </MotiView>

          {/* Credentials Inputs */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <View style={styles.inputWrapper}>
              <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>
                Account Email
              </Text>
              <View style={[
                styles.inputBox, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: focusedInput === 'email' ? theme.primary : theme.border 
                },
                focusedInput === 'email' && SHADOWS.sm
              ]}>
                <MailEnvelopeSvg 
                  size={20} 
                  color={focusedInput === 'email' ? theme.primary : theme.textMuted} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputWrapper}>
              <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>
                Password
              </Text>
              <View style={[
                styles.inputBox, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: focusedInput === 'password' ? theme.primary : theme.border 
                },
                focusedInput === 'password' && SHADOWS.sm
              ]}>
                <LockSecuritySvg 
                  size={20} 
                  color={focusedInput === 'password' ? theme.primary : theme.textMuted} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeToggle}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOffSvg size={20} color={theme.textMuted} />
                  ) : (
                    <EyeSvg size={20} color={theme.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In CTA */}
            <View style={{ marginTop: 14 }}>
              <AnimatedButton
                title={`Sign In as ${activeRole.label}`}
                onPress={handleLogin}
                theme={theme}
                loading={loading}
                icon={<LogInSvg size={18} color="#FFFFFF" />}
              />
            </View>

            {/* Registration Actions for Patients & Hospitals */}
            {activeRole.id === 'patient' && (
              <TouchableOpacity 
                style={styles.secondaryAction}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Register', { initialRole: 'patient' })}
              >
                <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
                  New patient?{' '}
                  <Text style={{ color: theme.primary, fontWeight: '700' }}>
                    Create Account & Instant Sign In →
                  </Text>
                </Text>
              </TouchableOpacity>
            )}

            {activeRole.id === 'hospital_admin' && (
              <TouchableOpacity 
                style={styles.secondaryAction}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Register', { initialRole: 'hospital_admin' })}
              >
                <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
                  New healthcare facility?{' '}
                  <Text style={{ color: theme.primary, fontWeight: '700' }}>
                    Register for Network Approval →
                  </Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    ...SHADOWS.md,
  },
  roleContainer: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 4,
    borderWidth: 1,
    marginBottom: 14,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  roleTabActive: {
    borderWidth: 1,
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: 18,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  eyeToggle: {
    padding: 4,
  },
  secondaryAction: {
    marginTop: 18,
    alignItems: 'center',
    padding: 8,
  }
});
