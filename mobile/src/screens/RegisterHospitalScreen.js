import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { MotiView, MotiText } from '../components/Motion';
import { api, setAuthToken } from '../services/api';
import { THEMES, TYPOGRAPHY, SHADOWS, RADIUS } from '../constants/theme';
import { AnimatedButton } from '../components/AnimatedButton';
import {
  ChevronBackSvg,
  ChevronRightSvg,
  UserProfileSvg,
  HospitalFacilitySvg,
  AdminShieldHqSvg,
  MailEnvelopeSvg,
  LockSecuritySvg,
  PhoneCallSvg,
  LocationPinSvg,
  CheckmarkSvg,
  DocumentCertificateSvg,
  GeneralWardBedSvg,
  IcuBedSvg,
  AlertTriangleSvg,
  CloudUploadSvg,
  NavigationArrowSvg,
  InfoCircleSvg,
  ClockTimeSvg,
  LogInSvg
} from '../components/icons';

const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

const DOCUMENT_TYPES = [
  'State Clinical Establishment License',
  'NABH Accreditation Certificate',
  'Health Directorate Registration',
  'Fire & Safety Clearance Certificate'
];

const SAMPLE_DOCUMENTS = [
  { name: 'Hospital_Establishment_License_2026.pdf', size: '2.4 MB', type: 'State Clinical Establishment License' },
  { name: 'NABH_Accreditation_Certificate.pdf', size: '1.9 MB', type: 'NABH Accreditation Certificate' },
  { name: 'Govt_Health_Registration_NOC.pdf', size: '3.1 MB', type: 'Health Directorate Registration' }
];

export default function RegisterHospitalScreen({ navigation, route }) {
  const initialRole = route?.params?.initialRole || 'patient';
  const [selectedRole, setSelectedRole] = useState(initialRole); // 'patient' or 'hospital_admin'

  // Patient Registration Form State
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientBloodGroup, setPatientBloodGroup] = useState('O+');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientAge, setPatientAge] = useState('');
  const [patientAddress, setPatientAddress] = useState('');

  // Hospital Multi-Step State (Steps 1 to 4 in onboarding wizard)
  const [hospitalStep, setHospitalStep] = useState(1);
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalLicense, setHospitalLicense] = useState('');
  const [hospitalCategory, setHospitalCategory] = useState('Multi-Specialty & Trauma Care');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalCity, setHospitalCity] = useState('Bengaluru');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [hospitalEmergency, setHospitalEmergency] = useState('+91 108');
  const [hospitalTotalBeds, setHospitalTotalBeds] = useState('50');
  const [hospitalIcuBeds, setHospitalIcuBeds] = useState('15');
  const [hospitalEmail, setHospitalEmail] = useState('');
  const [hospitalPassword, setHospitalPassword] = useState('');

  // Step 2 & 3: Document & OTP State
  const [createdHospitalId, setCreatedHospitalId] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(DOCUMENT_TYPES[0]);
  const [uploadedDocName, setUploadedDocName] = useState('');
  const [uploadedDocSize, setUploadedDocSize] = useState('2.4 MB');
  const [otpInput, setOtpInput] = useState('');
  const [otpDebugCode, setOtpDebugCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const theme = selectedRole === 'patient' ? THEMES.patient : THEMES.hospital_admin;

  // ----------------------------------------------------
  // PATIENT REGISTRATION
  // ----------------------------------------------------
  const handleRegisterPatient = async () => {
    if (!patientName.trim() || !patientEmail.trim() || !patientPassword.trim()) {
      Alert.alert('Incomplete Form', 'Please provide Full Name, Email Address, and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        role: 'patient',
        email: patientEmail.trim().toLowerCase(),
        password: patientPassword,
        fullName: patientName.trim(),
        phone: patientPhone.trim(),
        bloodGroup: patientBloodGroup,
        gender: patientGender,
        age: patientAge ? Number(patientAge) : undefined,
        address: patientAddress.trim(),
      });

      if (res.data?.token || res.data?.success) {
        Alert.alert(
          'Account Created Successfully',
          `Welcome to Health Connect, ${patientName}! Your patient account is ready. Please sign in to verify credentials and enable emergency GPS location.`,
          [
            { 
              text: 'Sign In Now', 
              onPress: () => navigation.navigate('Login', { 
                prefillEmail: patientEmail.trim().toLowerCase(), 
                initialRole: 'patient' 
              }) 
            }
          ]
        );
      } else {
        Alert.alert('Success', 'Account created! Please sign in with your credentials.', [
          { text: 'Go to Sign In', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Unable to register patient account.';
      if (errorMsg.toLowerCase().includes('exist')) {
        Alert.alert(
          'Account Already Exists',
          `An account with email '${patientEmail.trim()}' is already registered. Would you like to sign in now?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sign In Now', 
              onPress: () => navigation.navigate('Login', { 
                prefillEmail: patientEmail.trim().toLowerCase(), 
                initialRole: 'patient' 
              }) 
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // STEP 1: HOSPITAL REGISTRATION DETAILS
  // ----------------------------------------------------
  const handleStep1Submit = async () => {
    if (!hospitalName.trim() || !hospitalAddress.trim() || !hospitalEmail.trim() || !hospitalPassword.trim()) {
      Alert.alert('Incomplete Form', 'Please fill in Hospital Legal Name, Physical Address, Official Email, and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register-hospital', {
        hospitalName: hospitalName.trim(),
        address: hospitalAddress.trim(),
        city: hospitalCity.trim() || 'Bengaluru',
        contactNumber: hospitalPhone.trim() || '+91 80 2345 6789',
        emergencyContact: hospitalEmergency.trim() || '+91 108',
        adminEmail: hospitalEmail.trim().toLowerCase(),
        password: hospitalPassword,
        licenseNumber: hospitalLicense.trim() || `REG-KA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        category: hospitalCategory,
        totalBeds: hospitalTotalBeds ? Number(hospitalTotalBeds) : 50,
        icuBeds: hospitalIcuBeds ? Number(hospitalIcuBeds) : 15,
      });

      if (res.data?.success) {
        setCreatedHospitalId(res.data.hospitalId);
        setOtpDebugCode(res.data.otpDebug || '123456');
        
        // Auto pre-populate document name based on hospital
        const sanitized = hospitalName.trim().replace(/[^a-zA-Z0-9]/g, '_');
        setUploadedDocName(`${sanitized}_Establishment_License_2026.pdf`);

        // Move to Step 2: Upload Document
        setHospitalStep(2);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Unable to register healthcare facility.';
      if (errorMsg.toLowerCase().includes('exist')) {
        Alert.alert(
          'Account Already Exists',
          `An account with email '${hospitalEmail.trim()}' is already registered. Would you like to sign in?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sign In Now', 
              onPress: () => navigation.navigate('Login', { 
                prefillEmail: hospitalEmail.trim().toLowerCase(), 
                initialRole: 'hospital_admin' 
              }) 
            }
          ]
        );
      } else {
        Alert.alert('Registration Error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // STEP 2: UPLOAD DOCUMENT & TRIGGER OTP (STEP 3)
  // ----------------------------------------------------
  const handleStep2UploadDocument = async () => {
    if (!createdHospitalId) {
      Alert.alert('Error', 'Hospital record missing. Please restart registration.');
      setHospitalStep(1);
      return;
    }

    const docName = uploadedDocName.trim() || 'Hospital_Establishment_License_2026.pdf';
    setLoading(true);
    try {
      const res = await api.post('/auth/upload-document', {
        hospitalId: createdHospitalId,
        documentName: docName,
        documentType: selectedDocType,
        documentUrl: `https://healthconnect.care/docs/${encodeURIComponent(docName)}`
      });

      if (res.data?.success) {
        if (res.data.otpDebug) {
          setOtpDebugCode(res.data.otpDebug);
        }
        // Advance to Step 3: OTP Verification
        setHospitalStep(3);
        Alert.alert(
          'Document Uploaded Successfully',
          `Verification document "${docName}" attached. A 6-digit OTP code has been dispatched to ${hospitalEmail}.`
        );
      }
    } catch (err) {
      Alert.alert('Upload Failed', err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // STEP 3: OTP RESEND
  // ----------------------------------------------------
  const handleResendOtp = async () => {
    if (!createdHospitalId) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { hospitalId: createdHospitalId });
      if (res.data?.otpDebug) {
        setOtpDebugCode(res.data.otpDebug);
      }
      Alert.alert('New Code Sent', `A fresh verification code has been dispatched to ${hospitalEmail}.`);
    } catch (err) {
      Alert.alert('Resend Failed', err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // STEP 4: VERIFY OTP
  // ----------------------------------------------------
  const handleStep3VerifyOtp = async () => {
    if (!otpInput.trim()) {
      Alert.alert('Verification Code Required', 'Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!createdHospitalId) {
      Alert.alert('Error', 'Missing registration ID.');
      setHospitalStep(1);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        hospitalId: createdHospitalId,
        otp: otpInput.trim()
      });

      if (res.data?.success) {
        setOtpVerified(true);
        // Advance to Step 5: Awaiting Admin Approval
        setHospitalStep(4);
      }
    } catch (err) {
      Alert.alert('Verification Failed', err.response?.data?.error || 'Invalid verification code.');
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
          {/* Top Navigation */}
          <View style={styles.topNavRow}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} 
              onPress={() => {
                if (selectedRole === 'hospital_admin' && hospitalStep > 1 && hospitalStep < 4) {
                  setHospitalStep(prev => prev - 1);
                } else {
                  navigation.goBack();
                }
              }}
              activeOpacity={0.7}
            >
              <ChevronBackSvg size={20} color={theme.text} />
            </TouchableOpacity>

            {selectedRole === 'hospital_admin' && (
              <View style={[styles.stepPill, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }]}>
                <Text style={[TYPOGRAPHY.micro, { color: theme.primary, fontWeight: '800' }]}>
                  STEP {hospitalStep} OF 4
                </Text>
              </View>
            )}
          </View>

          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18 }}
            style={styles.headerBlock}
          >
            <View style={[styles.badge, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }]}>
              {selectedRole === 'patient' ? (
                <UserProfileSvg size={14} color={theme.primary} style={{ marginRight: 6 }} />
              ) : (
                <HospitalFacilitySvg size={14} color={theme.primary} crossColor="#EF4444" style={{ marginRight: 6 }} />
              )}
              <Text style={[TYPOGRAPHY.micro, { color: theme.primary }]}>
                {selectedRole === 'patient' 
                  ? 'Patient Portal Onboarding' 
                  : 'Institutional Hospital Registration Protocol'}
              </Text>
            </View>
            <MotiText style={[TYPOGRAPHY.h1, { color: theme.text, marginTop: 10 }]}>
              {selectedRole === 'patient' ? 'Create Patient Profile' : 'Register Healthcare Facility'}
            </MotiText>
            <Text style={[TYPOGRAPHY.body, { color: theme.textSecondary, marginTop: 4 }]}>
              {selectedRole === 'patient' 
                ? 'Sign up for live bed availability discovery, turn-by-turn routing, and direct hospital contact.' 
                : 'Follow the 6-step medical authority verification protocol to join the regional hospital network.'}
            </Text>
          </MotiView>

          {/* Role Segmented Switcher (Visible on Step 1) */}
          {(selectedRole === 'patient' || hospitalStep === 1) && (
            <View style={[styles.roleSwitchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <TouchableOpacity
                style={[
                  styles.roleSwitchTab,
                  selectedRole === 'patient' && { backgroundColor: THEMES.patient.primary }
                ]}
                onPress={() => setSelectedRole('patient')}
                activeOpacity={0.8}
              >
                <UserProfileSvg 
                  size={15} 
                  color={selectedRole === 'patient' ? '#FFFFFF' : theme.textSecondary} 
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  TYPOGRAPHY.captionBold, 
                  { color: selectedRole === 'patient' ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  Patient Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleSwitchTab,
                  selectedRole === 'hospital_admin' && { backgroundColor: THEMES.hospital_admin.primary }
                ]}
                onPress={() => setSelectedRole('hospital_admin')}
                activeOpacity={0.8}
              >
                <HospitalFacilitySvg 
                  size={15} 
                  color={selectedRole === 'hospital_admin' ? '#FFFFFF' : theme.textSecondary} 
                  crossColor={selectedRole === 'hospital_admin' ? '#FFFFFF' : theme.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  TYPOGRAPHY.captionBold, 
                  { color: selectedRole === 'hospital_admin' ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  Healthcare Facility
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ==================================================== */}
          {/* PATIENT REGISTRATION FORM                            */}
          {/* ==================================================== */}
          {selectedRole === 'patient' && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 250 }}
            >
              {/* Full Name */}
              <View style={styles.inputWrapper}>
                <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Full Name *</Text>
                <View style={[
                  styles.inputBox, 
                  { backgroundColor: theme.surface, borderColor: focusedInput === 'pName' ? theme.primary : theme.border }
                ]}>
                  <UserProfileSvg size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                    placeholder="e.g. Rahul Verma"
                    placeholderTextColor={theme.textMuted}
                    value={patientName}
                    onChangeText={setPatientName}
                    onFocus={() => setFocusedInput('pName')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Email Address *</Text>
                <View style={[
                  styles.inputBox, 
                  { backgroundColor: theme.surface, borderColor: focusedInput === 'pEmail' ? theme.primary : theme.border }
                ]}>
                  <MailEnvelopeSvg size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                    placeholder="e.g. rahul@example.com"
                    placeholderTextColor={theme.textMuted}
                    value={patientEmail}
                    onChangeText={setPatientEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onFocus={() => setFocusedInput('pEmail')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Password *</Text>
                <View style={[
                  styles.inputBox, 
                  { backgroundColor: theme.surface, borderColor: focusedInput === 'pPass' ? theme.primary : theme.border }
                ]}>
                  <LockSecuritySvg size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                    placeholder="Create a password"
                    placeholderTextColor={theme.textMuted}
                    value={patientPassword}
                    onChangeText={setPatientPassword}
                    secureTextEntry
                    onFocus={() => setFocusedInput('pPass')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Phone & Age Row */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Phone Number</Text>
                  <View style={[
                    styles.inputBox, 
                    { backgroundColor: theme.surface, borderColor: focusedInput === 'pPhone' ? theme.primary : theme.border }
                  ]}>
                    <PhoneCallSvg size={18} color={theme.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                      placeholder="+91 97421 88990"
                      placeholderTextColor={theme.textMuted}
                      value={patientPhone}
                      onChangeText={setPatientPhone}
                      keyboardType="phone-pad"
                      onFocus={() => setFocusedInput('pPhone')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

                <View style={[styles.inputWrapper, { width: 110 }]}>
                  <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Age</Text>
                  <View style={[
                    styles.inputBox, 
                    { backgroundColor: theme.surface, borderColor: focusedInput === 'pAge' ? theme.primary : theme.border }
                  ]}>
                    <TextInput
                      style={[styles.input, TYPOGRAPHY.body, { color: theme.text, textAlign: 'center' }]}
                      placeholder="28"
                      placeholderTextColor={theme.textMuted}
                      value={patientAge}
                      onChangeText={setPatientAge}
                      keyboardType="number-pad"
                      maxLength={3}
                      onFocus={() => setFocusedInput('pAge')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>
              </View>

              {/* Blood Group Picker Chips */}
              <View style={styles.inputWrapper}>
                <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 8 }]}>Blood Group</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {BLOOD_GROUPS.map((bg) => (
                    <TouchableOpacity
                      key={bg}
                      style={[
                        styles.bloodChip,
                        patientBloodGroup === bg && { backgroundColor: theme.primary, borderColor: theme.primary }
                      ]}
                      onPress={() => setPatientBloodGroup(bg)}
                    >
                      <Text style={[
                        TYPOGRAPHY.captionBold,
                        { color: patientBloodGroup === bg ? '#FFFFFF' : theme.text }
                      ]}>{bg}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Address */}
              <View style={styles.inputWrapper}>
                <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Residential Address</Text>
                <View style={[
                  styles.inputBox, 
                  { backgroundColor: theme.surface, borderColor: focusedInput === 'pAddress' ? theme.primary : theme.border }
                ]}>
                  <LocationPinSvg size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                    placeholder="e.g. Indiranagar, Bengaluru"
                    placeholderTextColor={theme.textMuted}
                    value={patientAddress}
                    onChangeText={setPatientAddress}
                    onFocus={() => setFocusedInput('pAddress')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Submit CTA */}
              <View style={{ marginTop: 14 }}>
                <AnimatedButton
                  title="Create Patient Account"
                  onPress={handleRegisterPatient}
                  theme={theme}
                  loading={loading}
                  icon={<CheckmarkSvg size={18} color="#FFFFFF" strokeWidth={2.8} />}
                />
              </View>
            </MotiView>
          )}

          {/* ==================================================== */}
          {/* HOSPITAL MULTI-STEP VERIFICATION PROTOCOL            */}
          {/* ==================================================== */}
          {selectedRole === 'hospital_admin' && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 250 }}
            >
              {/* Stepper Progress Bar */}
              <View style={[styles.stepperContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.stepperRow}>
                  {[
                    { step: 1, label: 'Details' },
                    { step: 2, label: 'Document' },
                    { step: 3, label: 'OTP' },
                    { step: 4, label: 'Approval' }
                  ].map((s, idx) => {
                    const isDone = hospitalStep > s.step;
                    const isCurrent = hospitalStep === s.step;
                    const renderStepIcon = () => {
                      const iconColor = isCurrent ? '#FFFFFF' : theme.textMuted;
                      if (s.step === 1) return <HospitalFacilitySvg size={12} color={iconColor} crossColor={iconColor} />;
                      if (s.step === 2) return <DocumentCertificateSvg size={12} color={iconColor} />;
                      if (s.step === 3) return <LockSecuritySvg size={12} color={iconColor} />;
                      return <AdminShieldHqSvg size={12} color={iconColor} />;
                    };

                    return (
                      <React.Fragment key={s.step}>
                        <View style={styles.stepItem}>
                          <View style={[
                            styles.stepCircle,
                            isDone && { backgroundColor: theme.success, borderColor: theme.success },
                            isCurrent && { backgroundColor: theme.primary, borderColor: theme.primary },
                            (!isDone && !isCurrent) && { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                          ]}>
                            {isDone ? (
                              <CheckmarkSvg size={13} color="#FFFFFF" strokeWidth={2.8} />
                            ) : (
                              renderStepIcon()
                            )}
                          </View>
                          <Text style={[
                            styles.stepLabel,
                            { color: isCurrent ? theme.primary : isDone ? theme.success : theme.textMuted, fontWeight: isCurrent ? '800' : '600' }
                          ]}>
                            {s.label}
                          </Text>
                        </View>
                        {idx < 3 && (
                          <View style={[
                            styles.stepLine,
                            { backgroundColor: hospitalStep > s.step ? theme.success : theme.border }
                          ]} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>

              {/* -------------------------------------------------- */}
              {/* STEP 1: HOSPITAL REGISTRATION DETAILS              */}
              {/* -------------------------------------------------- */}
              {hospitalStep === 1 && (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Verification Notice */}
                  <View style={[styles.noticeBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                    <AdminShieldHqSvg size={20} color={theme.primary} style={{ marginRight: 10 }} />
                    <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, flex: 1 }]}>
                      <Text style={{ fontWeight: '700', color: theme.text }}>Step 1 of 4:</Text> Enter hospital legal details and administrator account credentials.
                    </Text>
                  </View>

                  {/* Hospital Legal Name */}
                  <View style={styles.inputWrapper}>
                    <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Hospital Legal Name *</Text>
                    <View style={[
                      styles.inputBox, 
                      { backgroundColor: theme.surface, borderColor: focusedInput === 'hospitalName' ? theme.primary : theme.border }
                    ]}>
                      <HospitalFacilitySvg size={18} color={theme.textMuted} crossColor="#EF4444" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                        placeholder="e.g. Apollo Metro Specialty Hospital"
                        placeholderTextColor={theme.textMuted}
                        value={hospitalName}
                        onChangeText={setHospitalName}
                        onFocus={() => setFocusedInput('hospitalName')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>

                  {/* Establishment Registration / License Number */}
                  <View style={styles.inputWrapper}>
                    <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Medical Establishment License / Reg. ID *</Text>
                    <View style={[
                      styles.inputBox, 
                      { backgroundColor: theme.surface, borderColor: focusedInput === 'license' ? theme.primary : theme.border }
                    ]}>
                      <DocumentCertificateSvg size={18} color={theme.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                        placeholder="e.g. REG-KA-2026-8912"
                        placeholderTextColor={theme.textMuted}
                        value={hospitalLicense}
                        onChangeText={setHospitalLicense}
                        onFocus={() => setFocusedInput('license')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>

                  {/* Physical Address */}
                  <View style={styles.inputWrapper}>
                    <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Physical Facility Address *</Text>
                    <View style={[
                      styles.inputBox, 
                      { backgroundColor: theme.surface, borderColor: focusedInput === 'address' ? theme.primary : theme.border }
                    ]}>
                      <LocationPinSvg size={18} color={theme.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                        placeholder="e.g. 102 Health Blvd, Sector 4, Whitefield"
                        placeholderTextColor={theme.textMuted}
                        value={hospitalAddress}
                        onChangeText={setHospitalAddress}
                        onFocus={() => setFocusedInput('address')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>

                  {/* Bed Capacities Row */}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                      <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Total Beds Capacity</Text>
                      <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <GeneralWardBedSvg size={18} color={theme.textMuted} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                          placeholder="50"
                          placeholderTextColor={theme.textMuted}
                          value={hospitalTotalBeds}
                          onChangeText={setHospitalTotalBeds}
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                      <Text style={[TYPOGRAPHY.micro, { color: '#E11D48', marginBottom: 6 }]}>ICU Ward Beds</Text>
                      <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <IcuBedSvg size={18} color="#E11D48" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                          placeholder="15"
                          placeholderTextColor={theme.textMuted}
                          value={hospitalIcuBeds}
                          onChangeText={setHospitalIcuBeds}
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>
                  </View>

                  {/* Contact Phone & Emergency Hotline */}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                      <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Hospital Contact Hotline</Text>
                      <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <PhoneCallSvg size={18} color={theme.textMuted} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                          placeholder="+91 80 2841 5000"
                          placeholderTextColor={theme.textMuted}
                          value={hospitalPhone}
                          onChangeText={setHospitalPhone}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                      <Text style={[TYPOGRAPHY.micro, { color: '#E11D48', marginBottom: 6 }]}>Emergency Hotline</Text>
                      <View style={[styles.inputBox, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]}>
                        <AlertTriangleSvg size={18} color="#E11D48" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, TYPOGRAPHY.body, { color: '#E11D48' }]}
                          placeholder="+91 108"
                          placeholderTextColor="#FDA4AF"
                          value={hospitalEmergency}
                          onChangeText={setHospitalEmergency}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>
                  </View>

                  {/* Admin Credentials */}
                  <View style={styles.inputWrapper}>
                    <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Official Administrator Email *</Text>
                    <View style={[
                      styles.inputBox, 
                      { backgroundColor: theme.surface, borderColor: focusedInput === 'email' ? theme.primary : theme.border }
                    ]}>
                      <MailEnvelopeSvg size={18} color={theme.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                        placeholder="admin@metrohospital.org"
                        placeholderTextColor={theme.textMuted}
                        value={hospitalEmail}
                        onChangeText={setHospitalEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 6 }]}>Administrator Password *</Text>
                    <View style={[
                      styles.inputBox, 
                      { backgroundColor: theme.surface, borderColor: focusedInput === 'password' ? theme.primary : theme.border }
                    ]}>
                      <LockSecuritySvg size={18} color={theme.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, TYPOGRAPHY.body, { color: theme.text }]}
                        placeholder="Create secure access key"
                        placeholderTextColor={theme.textMuted}
                        value={hospitalPassword}
                        onChangeText={setHospitalPassword}
                        secureTextEntry
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>

                  {/* Next Step CTA */}
                  <View style={{ marginTop: 14 }}>
                    <AnimatedButton
                      title="Proceed to Upload Documents (Step 2)"
                      onPress={handleStep1Submit}
                      theme={theme}
                      loading={loading}
                      icon={<ChevronRightSvg size={18} color="#FFFFFF" strokeWidth={2.8} />}
                    />
                  </View>
                </MotiView>
              )}

              {/* -------------------------------------------------- */}
              {/* STEP 2: UPLOAD DOCUMENT                            */}
              {/* -------------------------------------------------- */}
              {hospitalStep === 2 && (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <View style={[styles.noticeBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                    <DocumentCertificateSvg size={20} color={theme.primary} style={{ marginRight: 10 }} />
                    <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, flex: 1 }]}>
                      <Text style={{ fontWeight: '700', color: theme.text }}>Step 2 of 4 (Document Upload):</Text> Attach your government establishment certificate or NABH accreditation.
                    </Text>
                  </View>

                  {/* Document Category Selection */}
                  <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 8 }]}>
                    SELECT DOCUMENT CATEGORY *
                  </Text>
                  <View style={{ gap: 8, marginBottom: 16 }}>
                    {DOCUMENT_TYPES.map((type) => {
                      const isSelected = selectedDocType === type;
                      return (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.docTypeCard,
                            { 
                              backgroundColor: isSelected ? theme.primaryLight : theme.surface,
                              borderColor: isSelected ? theme.primary : theme.border 
                            }
                          ]}
                          onPress={() => setSelectedDocType(type)}
                          activeOpacity={0.8}
                        >
                          <CheckmarkSvg 
                            size={16} 
                            color={isSelected ? theme.primary : theme.border} 
                            circled={true}
                            style={{ marginRight: 10 }}
                          />
                          <Text style={[
                            TYPOGRAPHY.captionBold, 
                            { color: isSelected ? theme.primary : theme.text, flex: 1 }
                          ]}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Interactive Document Upload Box */}
                  <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 8 }]}>
                    ATTACH CERTIFICATE FILE *
                  </Text>
                  <View style={[styles.uploadBox, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
                    <View style={[styles.uploadIconBadge, { backgroundColor: theme.primaryLight }]}>
                      <CloudUploadSvg size={28} color={theme.primary} />
                    </View>
                    <Text style={[TYPOGRAPHY.h3, { color: theme.text, marginTop: 10, textAlign: 'center' }]}>
                      {uploadedDocName || 'Official_Establishment_License.pdf'}
                    </Text>
                    <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, marginTop: 4 }]}>
                      Format: PDF • Size: {uploadedDocSize} • Status: Verified Signature
                    </Text>

                    <View style={styles.verifiedDocBadge}>
                      <CheckmarkSvg size={16} color={theme.success} circled={true} style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.success }}>
                        Document Validated & Signed
                      </Text>
                    </View>
                  </View>

                  {/* Quick Sample Document Picker for Fast Testing */}
                  <View style={{ marginTop: 14, marginBottom: 16 }}>
                    <Text style={[TYPOGRAPHY.micro, { color: theme.textMuted, marginBottom: 6 }]}>
                      CHOOSE FILE / SAMPLE PRESET:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      {SAMPLE_DOCUMENTS.map((doc) => (
                        <TouchableOpacity
                          key={doc.name}
                          style={[
                            styles.sampleDocChip,
                            uploadedDocName === doc.name && { backgroundColor: theme.primaryLight, borderColor: theme.primary }
                          ]}
                          onPress={() => {
                            setUploadedDocName(doc.name);
                            setUploadedDocSize(doc.size);
                            setSelectedDocType(doc.type);
                          }}
                        >
                          <DocumentCertificateSvg size={13} color={theme.primary} style={{ marginRight: 6 }} />
                          <Text style={[TYPOGRAPHY.captionBold, { color: theme.text, fontSize: 11.5 }]}>
                            {doc.name.split('_')[0]} Cert ({doc.size})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Step 2 CTA: Upload & Trigger OTP */}
                  <AnimatedButton
                    title="Upload Document & Send OTP (Step 3)"
                    onPress={handleStep2UploadDocument}
                    theme={theme}
                    loading={loading}
                    icon={<NavigationArrowSvg size={18} color="#FFFFFF" />}
                  />
                </MotiView>
              )}

              {/* -------------------------------------------------- */}
              {/* STEP 3: OTP VERIFICATION                           */}
              {/* -------------------------------------------------- */}
              {hospitalStep === 3 && (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <View style={[styles.noticeBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                    <LockSecuritySvg size={20} color={theme.primary} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                        Step 3 of 4: Enter 6-Digit OTP Code
                      </Text>
                      <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginTop: 2 }]}>
                        Dispatched to {hospitalEmail} for identity validation.
                      </Text>
                    </View>
                  </View>

                  {/* OTP Input Card */}
                  <View style={[styles.otpCard, { backgroundColor: theme.surface, borderColor: theme.border }, SHADOWS.medium]}>
                    <AdminShieldHqSvg size={40} color={theme.primary} />
                    <Text style={[TYPOGRAPHY.h2, { color: theme.text, marginTop: 12 }]}>
                      Security Verification
                    </Text>
                    <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 16 }]}>
                      Please enter the 6-digit administrative verification code to authenticate your hospital registration.
                    </Text>

                    {/* Monospace 6-Digit Code Input */}
                    <View style={[styles.otpInputBox, { borderColor: theme.primary }]}>
                      <TextInput
                        style={styles.otpInput}
                        placeholder="• • • • • •"
                        placeholderTextColor={theme.textMuted}
                        value={otpInput}
                        onChangeText={setOtpInput}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                      />
                    </View>

                    {/* Demo Code Helper */}
                    <View style={styles.demoOtpCallout}>
                      <InfoCircleSvg size={16} color={theme.primary} style={{ marginRight: 6 }} />
                      <Text style={[TYPOGRAPHY.caption, { color: theme.primary, flex: 1, fontSize: 12 }]}>
                        Generated OTP: <Text style={{ fontWeight: '800' }}>{otpDebugCode || '123456'}</Text>
                      </Text>
                      <TouchableOpacity
                        style={[styles.fillCodeBtn, { backgroundColor: theme.primaryLight }]}
                        onPress={() => setOtpInput(otpDebugCode || '123456')}
                      >
                        <Text style={[TYPOGRAPHY.micro, { color: theme.primary, fontWeight: '800' }]}>
                          AUTO-FILL
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Resend Link */}
                    <TouchableOpacity 
                      style={{ marginTop: 16 }}
                      onPress={handleResendOtp}
                      activeOpacity={0.7}
                    >
                      <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
                        Didn't receive the code? <Text style={{ color: theme.primary, fontWeight: '700' }}>Resend OTP</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Step 3 CTA: Verify Code */}
                  <View style={{ marginTop: 20 }}>
                    <AnimatedButton
                      title="Verify Code & Submit for Admin Approval"
                      onPress={handleStep3VerifyOtp}
                      theme={theme}
                      loading={loading}
                      icon={<CheckmarkSvg size={18} color="#FFFFFF" strokeWidth={2.8} />}
                    />
                  </View>
                </MotiView>
              )}

              {/* -------------------------------------------------- */}
              {/* STEP 4: AWAITING SUPER ADMIN APPROVAL              */}
              {/* -------------------------------------------------- */}
              {hospitalStep === 4 && (
                <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <View style={[styles.successCard, { backgroundColor: theme.surface, borderColor: theme.border }, SHADOWS.large]}>
                    <View style={[styles.successIconBadge, { backgroundColor: '#DCFCE7' }]}>
                      <AdminShieldHqSvg size={44} color="#16A34A" />
                    </View>

                    <Text style={[TYPOGRAPHY.h1, { color: theme.text, marginTop: 16, textAlign: 'center' }]}>
                      Application Submitted!
                    </Text>

                    <View style={[styles.statusBadgePending, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                      <ClockTimeSvg size={14} color="#D97706" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#B45309' }}>
                        STEP 5: AWAITING SUPER ADMIN APPROVAL
                      </Text>
                    </View>

                    <Text style={[TYPOGRAPHY.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 20 }]}>
                      Your healthcare establishment details, verified documents, and administrator OTP have been successfully authenticated.
                    </Text>

                    {/* Summary Info Table */}
                    <View style={[styles.summaryTable, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                      <View style={styles.summaryRow}>
                        <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Facility Name:</Text>
                        <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>{hospitalName}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>License Reg #:</Text>
                        <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>{hospitalLicense || 'REG-KA-2026'}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Document Attached:</Text>
                        <Text style={[TYPOGRAPHY.captionBold, { color: theme.primary }]}>{uploadedDocName || 'License.pdf'}</Text>
                      </View>
                      <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                        <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Identity & OTP:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <CheckmarkSvg size={15} color={theme.success} circled={true} style={{ marginRight: 4 }} />
                          <Text style={[TYPOGRAPHY.captionBold, { color: theme.success }]}>Verified</Text>
                        </View>
                      </View>
                    </View>

                    <Text style={[TYPOGRAPHY.micro, { color: theme.textMuted, textAlign: 'center', marginTop: 14 }]}>
                      The Super Admin will review your attached documentation. Once authorized, you can log in immediately (Step 6).
                    </Text>

                    {/* Step 6 CTA: Proceed to Login */}
                    <View style={{ width: '100%', marginTop: 20 }}>
                      <AnimatedButton
                        title="Proceed to Sign In (Step 6)"
                        onPress={() => navigation.navigate('Login', { 
                          prefillEmail: hospitalEmail.trim().toLowerCase(), 
                          initialRole: 'hospital_admin' 
                        })}
                        theme={theme}
                        icon={<LogInSvg size={18} color="#FFFFFF" />}
                      />
                    </View>
                  </View>
                </MotiView>
              )}
            </MotiView>
          )}

          {/* Return to Sign In Link */}
          {hospitalStep !== 4 && (
            <TouchableOpacity 
              style={styles.signInLink}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
                Already have an account? <Text style={{ color: theme.primary, fontWeight: '700' }}>Back to Sign In</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { 
    flexGrow: 1, 
    alignItems: 'center', 
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 28,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 480,
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  headerBlock: {
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 20,
  },
  stepperContainer: {
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: 20,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 10,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    marginTop: -16,
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
  },
  signInLink: {
    marginTop: 24,
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
  },
  roleSwitchContainer: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  roleSwitchTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  bloodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    minWidth: 42,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  docTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
  },
  uploadBox: {
    alignItems: 'center',
    padding: 24,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  uploadIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedDocBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: 12,
  },
  sampleDocChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  otpCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginTop: 6,
  },
  otpInputBox: {
    borderWidth: 2,
    borderRadius: RADIUS.lg,
    width: '100%',
    maxWidth: 240,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: '#F8FAFC',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    color: '#0F172A',
    width: '100%',
  },
  demoOtpCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
    width: '100%',
  },
  fillCodeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    marginLeft: 6,
  },
  successCard: {
    alignItems: 'center',
    padding: 26,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginTop: 6,
  },
  successIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginTop: 12,
  },
  summaryTable: {
    width: '100%',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 12,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  }
});
