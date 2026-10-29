import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking
} from 'react-native';
import { MotiView } from '../components/Motion';
import { api, setAuthToken } from '../services/api';
import { THEMES, TYPOGRAPHY, SHADOWS, RADIUS } from '../constants/theme';
import { AnimatedButton } from '../components/AnimatedButton';
import {
  UserProfileSvg,
  HospitalFacilitySvg,
  AdminShieldHqSvg,
  BloodDropSvg,
  PhoneCallSvg,
  AlertTriangleSvg,
  EmergencyCrossSvg,
  LocationPinSvg,
  DocumentCertificateSvg,
  BedRosterGridSvg,
  CheckmarkSvg,
  LockSecuritySvg,
  LogOutSvg,
  CloseCrossSvg,
  EditPencilSvg
} from '../components/icons';

export default function ProfileScreen({ route, navigation }) {
  const theme = route.params?.theme || THEMES.patient;
  const hospitalId = route.params?.hospitalId;

  const isPatient = theme === THEMES.patient;
  const isHospital = theme === THEMES.hospital_admin;
  const isAdmin = theme === THEMES.super_admin;

  const roleTitle = isAdmin 
    ? 'HQ Super Administrator' 
    : isHospital 
    ? 'Hospital Medical Authority' 
    : 'Registered Patient';

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(() => ({
    fullName: isHospital ? 'Dr. Abhijit Deshmukh' : (isAdmin ? 'Chief System Administrator' : 'Ramesh Patil'),
    email: isHospital ? 'medical.director@cprhospital.org' : (isAdmin ? 'hq.admin@healthconnect.org' : 'patient@healthconnect.org'),
    phone: isHospital ? '+91 231 264 1125' : (isAdmin ? '+91 80 2200 9900' : '+91 98220 12345'),
    bloodGroup: 'O+',
    gender: 'Male',
    age: isHospital ? 48 : (isAdmin ? 42 : 32),
    address: isHospital ? 'Dasara Chowk, Kolhapur, Maharashtra' : (isAdmin ? 'HealthConnect Command Centre' : 'Shahupuri 3rd Lane, Kolhapur, Maharashtra 416001'),
    emergencyContactName: isHospital ? 'Hospital Emergency Desk' : (isAdmin ? 'Command Centre Lead' : 'Sunita Patil'),
    emergencyContactPhone: isHospital ? '+91 231 264 1911' : (isAdmin ? '+91 80 2200 9911' : '+91 98220 54321'),
    allergies: 'None Reported',
    chronicConditions: 'None',
    designation: isHospital ? 'Chief Medical Superintendent' : (isAdmin ? 'Central Healthcare Director' : ''),
    department: isHospital ? 'Critical Care & Trauma Surgery' : (isAdmin ? 'Health Informatics' : ''),
    licenseNumber: isHospital ? 'MH-MC-KOP-2004-9812' : (isAdmin ? 'GOV-HQ-SEC-001' : '')
  }));
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable Form State
  const [editForm, setEditForm] = useState({
    fullName: isHospital ? 'Dr. Abhijit Deshmukh' : (isAdmin ? 'Chief System Administrator' : 'Ramesh Patil'),
    phone: isHospital ? '+91 231 264 1125' : (isAdmin ? '+91 80 2200 9900' : '+91 98220 12345'),
    bloodGroup: 'O+',
    gender: 'Male',
    age: isHospital ? '48' : (isAdmin ? '42' : '32'),
    address: isHospital ? 'Dasara Chowk, Kolhapur, Maharashtra' : (isAdmin ? 'HealthConnect Command Centre' : 'Shahupuri 3rd Lane, Kolhapur, Maharashtra 416001'),
    emergencyContactName: isHospital ? 'Hospital Emergency Desk' : (isAdmin ? 'Command Centre Lead' : 'Sunita Patil'),
    emergencyContactPhone: isHospital ? '+91 231 264 1911' : (isAdmin ? '+91 80 2200 9911' : '+91 98220 54321'),
    allergies: 'None Reported',
    chronicConditions: 'None',
    designation: isHospital ? 'Chief Medical Superintendent' : (isAdmin ? 'Central Healthcare Director' : ''),
    department: isHospital ? 'Critical Care & Trauma Surgery' : (isAdmin ? 'Health Informatics' : ''),
    licenseNumber: isHospital ? 'MH-MC-KOP-2004-9812' : (isAdmin ? 'GOV-HQ-SEC-001' : '')
  });

  useEffect(() => {
    fetchProfile();
  }, [hospitalId]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      const user = res.data.user || {};
      const hospital = res.data.hospital || null;

      if (user && Object.keys(user).length > 0) {
        setProfileData(prev => ({ ...prev, ...user }));
      }
      if (hospital) {
        setHospitalInfo(hospital);
      } else if (hospitalId) {
        try {
          const hRes = await api.get(`/hospitals/${hospitalId}`);
          setHospitalInfo(hRes.data);
        } catch (e) {
          console.log('Hospital fetch fallback error:', e.message);
        }
      }

      setEditForm(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        phone: user.phone || prev.phone,
        bloodGroup: user.bloodGroup || prev.bloodGroup,
        gender: user.gender || prev.gender || 'Not Specified',
        age: user.age ? String(user.age) : prev.age,
        address: user.address || prev.address,
        emergencyContactName: user.emergencyContactName || prev.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone || prev.emergencyContactPhone,
        allergies: user.allergies || prev.allergies,
        chronicConditions: user.chronicConditions || prev.chronicConditions,
        designation: user.designation || prev.designation,
        department: user.department || prev.department,
        licenseNumber: user.licenseNumber || prev.licenseNumber
      }));
    } catch (err) {
      console.log('Profile background sync:', err.message);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        age: editForm.age ? parseInt(editForm.age, 10) : 0
      };
      const res = await api.put('/auth/profile', payload);
      setProfileData(res.data.user);
      setShowEditModal(false);
      Alert.alert('Profile Updated', 'Your authenticated identity details have been successfully synchronized.');
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Sign Out',
      'Are you sure you want to end your current authenticated session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            setAuthToken(null);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        }
      ]
    );
  };

  if (loading && !profileData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[TYPOGRAPHY.bodyMedium, { color: theme.textSecondary, marginTop: 12 }]}>
          Loading profile details...
        </Text>
      </View>
    );
  }

  const displayName = profileData?.fullName || (isHospital ? hospitalInfo?.name : (isAdmin ? 'System Super Admin' : 'Registered Patient'));
  const displayEmail = profileData?.email || 'authenticated@healthconnect.org';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header Hero Card */}
      <MotiView
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 18 }}
        style={[styles.profileCard, SHADOWS.medium, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        {/* Avatar with Role Badge */}
        <View style={styles.avatarRow}>
          <View style={[styles.avatarWrapper, { backgroundColor: theme.primaryLight }]}>
            {isAdmin ? (
              <AdminShieldHqSvg size={42} color={theme.primary} />
            ) : isHospital ? (
              <HospitalFacilitySvg size={42} color={theme.primary} crossColor="#EF4444" />
            ) : (
              <UserProfileSvg size={42} color={theme.primary} />
            )}
          </View>
          {isPatient && profileData?.bloodGroup && (
            <View style={[styles.bloodBadgeOverlay, { backgroundColor: '#E11D48' }]}>
              <Text style={[TYPOGRAPHY.micro, { color: '#FFFFFF', fontWeight: '900' }]}>
                {profileData.bloodGroup}
              </Text>
            </View>
          )}
        </View>

        {/* Role Pill */}
        <View style={[styles.rolePill, { backgroundColor: theme.surfaceSubtle }]}>
          <View style={[styles.activeDot, { backgroundColor: theme.success }]} />
          <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>
            {roleTitle.toUpperCase()} • ACTIVE
          </Text>
        </View>

        <Text style={[TYPOGRAPHY.h1, { color: theme.text, marginTop: 10, textAlign: 'center' }]}>
          {displayName}
        </Text>
        <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, marginTop: 2, textAlign: 'center' }]}>
          {displayEmail}
        </Text>

        {/* Edit Profile CTA Button */}
        <TouchableOpacity 
          style={[styles.editProfileBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
          onPress={() => setShowEditModal(true)}
          activeOpacity={0.8}
        >
          <EditPencilSvg size={15} color={theme.primary} style={{ marginRight: 6 }} />
          <Text style={[TYPOGRAPHY.captionBold, { color: theme.primary }]}>Edit Profile Details</Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* 1. ROLE SPECIFIC PROFILE FIELDS */}
        {isPatient && (
          <View style={styles.sectionBlock}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 12 }]}>
              MEDICAL & HEALTH INFORMATION
            </Text>

            <View style={styles.fieldGrid}>
              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <BloodDropSvg size={16} color="#E11D48" secondaryColor="#FB7185" style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Blood Group</Text>
                </View>
                <View style={[styles.bloodPill, { backgroundColor: '#FFF1F2' }]}>
                  <Text style={[TYPOGRAPHY.captionBold, { color: '#E11D48' }]}>
                    {profileData?.bloodGroup || 'O+'}
                  </Text>
                </View>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <PhoneCallSvg size={16} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Phone Number</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {profileData?.phone || '+91 97421 88990'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <UserProfileSvg size={16} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Demographics</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {profileData?.gender || 'Male'} • {profileData?.age ? `${profileData.age} Yrs` : '28 Yrs'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <EmergencyCrossSvg size={16} color="#E11D48" style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Emergency Contact</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: '#E11D48' }]}>
                  {profileData?.emergencyContactName || 'Priya Verma (Spouse)'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <PhoneCallSvg size={16} color="#E11D48" style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Emergency Phone</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: '#E11D48' }]}>
                  {profileData?.emergencyContactPhone || '+91 97421 88991'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <AlertTriangleSvg size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Known Allergies</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {profileData?.allergies || 'Penicillin, Shellfish'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <EmergencyCrossSvg size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Chronic Conditions</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {profileData?.chronicConditions || 'Mild Asthma'}
                </Text>
              </View>

              <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
                <View style={styles.fieldLeft}>
                  <LocationPinSvg size={16} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Address</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text, flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                  {profileData?.address || 'Bellandur, Bengaluru'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {isHospital && (
          <View style={styles.sectionBlock}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 12 }]}>
              HOSPITAL AUTHORITY CREDENTIALS
            </Text>

            <View style={styles.fieldGrid}>
              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <HospitalFacilitySvg size={16} color={theme.primary} crossColor="#EF4444" style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Facility Name</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {hospitalInfo?.name || 'City Care Hospital'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <PhoneCallSvg size={16} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Reception Contact</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {hospitalInfo?.contactNumber || '+91 80 2841 5000'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <PhoneCallSvg size={16} color="#E11D48" style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>24x7 Emergency Line</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: '#E11D48' }]}>
                  {hospitalInfo?.emergencyContact || '+91 80 2841 5911'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <DocumentCertificateSvg size={16} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Administrator Title</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {profileData?.designation || 'Medical Superintendent'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <BedRosterGridSvg size={16} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Department</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {profileData?.department || 'Critical Care Operations'}
                </Text>
              </View>

              <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
                <View style={styles.fieldLeft}>
                  <CheckmarkSvg size={16} color={theme.success} circled={true} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>License Reg.</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.success }]}>
                  {profileData?.licenseNumber || 'KA-MED-REG-44910'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {isAdmin && (
          <View style={styles.sectionBlock}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 12 }]}>
              CENTRAL DIRECTIVE & SYSTEM JURISDICTION
            </Text>

            <View style={styles.fieldGrid}>
              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <DocumentCertificateSvg size={16} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Official Title</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {profileData?.designation || 'Chief Regional Health Controller'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <AdminShieldHqSvg size={16} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Directorate</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {profileData?.department || 'Emergency Healthcare Directorate'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <PhoneCallSvg size={16} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Direct Phone</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                  {profileData?.phone || '+91 98450 11223'}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldLeft}>
                  <LockSecuritySvg size={16} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Access Clearance</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.primary }]}>
                  Tier 4 Super Directive
                </Text>
              </View>

              <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
                <View style={styles.fieldLeft}>
                  <HospitalFacilitySvg size={16} color={theme.success} crossColor="#10B981" style={{ marginRight: 8 }} />
                  <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>Jurisdiction</Text>
                </View>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.success }]}>
                  State Emergency Network
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Sign Out Action */}
        <View style={{ width: '100%', marginTop: 24 }}>
          <AnimatedButton 
            title="Terminate Session & Sign Out" 
            onPress={handleLogout} 
            theme={theme}
            variant="outline"
            icon={<LogOutSvg size={18} color={theme.primary} />}
          />
        </View>
      </MotiView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[TYPOGRAPHY.h1, { color: theme.text }]}>Edit Profile Details</Text>
                <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
                  Update personal, medical & contact information
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.modalCloseBtn, { backgroundColor: theme.surfaceSubtle }]}
                onPress={() => setShowEditModal(false)}
              >
                <CloseCrossSvg size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Full Name */}
              <View style={styles.formGroup}>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Full Name *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="Your full name"
                  placeholderTextColor={theme.textMuted}
                  value={editForm.fullName}
                  onChangeText={(val) => setEditForm(p => ({ ...p, fullName: val }))}
                />
              </View>

              {/* Phone Number */}
              <View style={styles.formGroup}>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="phone-pad"
                  value={editForm.phone}
                  onChangeText={(val) => setEditForm(p => ({ ...p, phone: val }))}
                />
              </View>

              {/* Patient Fields */}
              {isPatient && (
                <>
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[TYPOGRAPHY.captionBold, { color: '#E11D48' }]}>Blood Group</Text>
                      <TextInput
                        style={[styles.input, { borderColor: '#FECDD3', color: '#E11D48' }]}
                        placeholder="O+, A+, B+, etc."
                        placeholderTextColor="#FDA4AF"
                        value={editForm.bloodGroup}
                        onChangeText={(val) => setEditForm(p => ({ ...p, bloodGroup: val }))}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Age</Text>
                      <TextInput
                        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                        placeholder="28"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="numeric"
                        value={editForm.age}
                        onChangeText={(val) => setEditForm(p => ({ ...p, age: val }))}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Gender</Text>
                    <TextInput
                      style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                      placeholder="Male / Female / Other"
                      placeholderTextColor={theme.textMuted}
                      value={editForm.gender}
                      onChangeText={(val) => setEditForm(p => ({ ...p, gender: val }))}
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[TYPOGRAPHY.captionBold, { color: '#E11D48' }]}>Emergency Contact Name</Text>
                      <TextInput
                        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                        placeholder="e.g. Priya Verma"
                        placeholderTextColor={theme.textMuted}
                        value={editForm.emergencyContactName}
                        onChangeText={(val) => setEditForm(p => ({ ...p, emergencyContactName: val }))}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[TYPOGRAPHY.captionBold, { color: '#E11D48' }]}>Emergency Contact Phone</Text>
                      <TextInput
                        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                        placeholder="+91 97421 88991"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="phone-pad"
                        value={editForm.emergencyContactPhone}
                        onChangeText={(val) => setEditForm(p => ({ ...p, emergencyContactPhone: val }))}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Known Allergies</Text>
                    <TextInput
                      style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                      placeholder="e.g. Penicillin, Shellfish"
                      placeholderTextColor={theme.textMuted}
                      value={editForm.allergies}
                      onChangeText={(val) => setEditForm(p => ({ ...p, allergies: val }))}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Chronic Conditions</Text>
                    <TextInput
                      style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                      placeholder="e.g. Mild Asthma, Diabetes"
                      placeholderTextColor={theme.textMuted}
                      value={editForm.chronicConditions}
                      onChangeText={(val) => setEditForm(p => ({ ...p, chronicConditions: val }))}
                    />
                  </View>
                </>
              )}

              {/* Staff / Admin Fields */}
              {(isHospital || isAdmin) && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Professional Designation / Title</Text>
                    <TextInput
                      style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                      placeholder="e.g. Chief Medical Superintendent"
                      placeholderTextColor={theme.textMuted}
                      value={editForm.designation}
                      onChangeText={(val) => setEditForm(p => ({ ...p, designation: val }))}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Department / Unit</Text>
                    <TextInput
                      style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                      placeholder="e.g. Emergency Healthcare Operations"
                      placeholderTextColor={theme.textMuted}
                      value={editForm.department}
                      onChangeText={(val) => setEditForm(p => ({ ...p, department: val }))}
                    />
                  </View>

                  {isHospital && (
                    <View style={styles.formGroup}>
                      <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Medical License Registration Number</Text>
                      <TextInput
                        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                        placeholder="KA-MED-REG-44910"
                        placeholderTextColor={theme.textMuted}
                        value={editForm.licenseNumber}
                        onChangeText={(val) => setEditForm(p => ({ ...p, licenseNumber: val }))}
                      />
                    </View>
                  )}
                </>
              )}

              {/* Address */}
              <View style={styles.formGroup}>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Physical / Residential Address</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="Street, City, Pincode"
                  placeholderTextColor={theme.textMuted}
                  value={editForm.address}
                  onChangeText={(val) => setEditForm(p => ({ ...p, address: val }))}
                />
              </View>

              {/* Action Buttons */}
              <View style={{ marginTop: 14, marginBottom: 30, gap: 10 }}>
                {saving ? (
                  <ActivityIndicator color={theme.primary} />
                ) : (
                  <>
                    <AnimatedButton
                      title="Save Profile Changes"
                      onPress={handleSaveProfile}
                      theme={theme}
                      icon={<CheckmarkSvg size={18} color="#FFFFFF" strokeWidth={2.8} />}
                    />
                    <AnimatedButton
                      title="Cancel"
                      onPress={() => setShowEditModal(false)}
                      theme={theme}
                      variant="outline"
                    />
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  contentContainer: { 
    padding: 16, 
    paddingTop: 48,
    paddingBottom: 100,
    alignItems: 'center' 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: { 
    width: '100%',
    maxWidth: 480,
    padding: 22, 
    borderRadius: RADIUS.xl, 
    borderWidth: 1, 
    alignItems: 'center' 
  },
  avatarRow: {
    position: 'relative',
  },
  avatarWrapper: { 
    width: 86, 
    height: 86, 
    borderRadius: 43, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  bloodBadgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginTop: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginTop: 14,
  },
  divider: { 
    width: '100%', 
    height: 1, 
    marginVertical: 18 
  },
  sectionBlock: {
    width: '100%',
    marginBottom: 8,
  },
  fieldGrid: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    marginTop: 6,
  },
});
