import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  RefreshControl,
  Modal,
  TextInput,
  Linking,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { MotiView } from '../components/Motion';
import * as Location from 'expo-location';
import { api } from '../services/api';
import { THEMES, TYPOGRAPHY, SHADOWS, RADIUS } from '../constants/theme';
import { AnimatedButton } from '../components/AnimatedButton';
import {
  CheckmarkSvg,
  PhoneCallSvg,
  AlertTriangleSvg,
  MailEnvelopeSvg,
  DocumentCertificateSvg,
  ClockTimeSvg,
  CloseCrossSvg,
  BedRosterGridSvg,
  ChevronRightSvg,
  TrashSvg,
  PlusAddSvg,
  BellNotificationSvg,
  AdminShieldHqSvg,
  LocationPinSvg,
  SearchSvg,
  IcuBedSvg,
  VentilatorSvg,
  GeneralWardBedSvg,
  EmergencyCrossSvg,
  HospitalFacilitySvg
} from '../components/icons';
import { DEFAULT_KOLHAPUR_HOSPITALS } from '../constants/kolhapurHospitals';

export default function AdminDashboard({ navigation }) {
  const [hospitals, setHospitals] = useState(DEFAULT_KOLHAPUR_HOSPITALS);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'approved' | 'pending'

  // Form State for Adding Hospital
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    emergencyContact: '',
    adminEmail: '',
    password: '',
    category: 'Multi-Specialty & Trauma Care',
    city: 'Kolhapur',
    totalBeds: '',
    icuBeds: '',
    lat: '16.7050',
    lng: '74.2433',
  });

  const theme = THEMES.super_admin;

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/admin/hospitals');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setHospitals(res.data);
        return;
      }
    } catch (err) {
      console.log('Error fetching admin hospitals, trying fallback /hospitals:', err?.message);
    }

    try {
      const fallbackRes = await api.get('/hospitals');
      if (fallbackRes.data && Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
        setHospitals(fallbackRes.data);
      }
    } catch (e) {
      console.log('Fallback fetch also failed, keeping default Kolhapur hospitals');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHospitals();
  };

  const updateStatus = async (id, status, name) => {
    try {
      await api.put(`/admin/hospitals/${id}/status`, { status });
      Alert.alert(
        status === 'approved' ? 'Registration Approved' : 'Registration Declined',
        `Hospital "${name}" has been ${status}. ${status === 'approved' ? 'The hospital authority can now log in and manage emergency wards.' : 'Login access is disabled.'}`
      );
      fetchHospitals();
    } catch (err) {
      Alert.alert('Update Failed', err.message);
    }
  };

  const handleDeleteHospital = (hospital) => {
    Alert.alert(
      'Revoke Hospital Authority',
      `Are you sure you want to completely deregister "${hospital.name}" from the network registry? This will revoke access and clear ward records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Deregister & Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/hospitals/${hospital._id}`);
              Alert.alert('Removed', `Hospital "${hospital.name}" has been removed from registry.`);
              fetchHospitals();
            } catch (err) {
              Alert.alert('Deletion Failed', err.message);
            }
          }
        }
      ]
    );
  };

  const handleDetectDeviceGPS = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setFormData(prev => ({
          ...prev,
          lat: loc.coords.latitude.toFixed(4),
          lng: loc.coords.longitude.toFixed(4)
        }));
        Alert.alert('GPS Location Detected', `Coordinates set to current device location (${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)})`);
      } else {
        Alert.alert('Permission Denied', 'Unable to access device GPS coordinates.');
      }
    } catch (err) {
      Alert.alert('GPS Error', err.message);
    } finally {
      setLocating(false);
    }
  };

  const handleCreateHospital = async () => {
    if (!formData.name.trim() || !formData.address.trim() || !formData.adminEmail.trim()) {
      Alert.alert('Incomplete Form', 'Please provide Hospital Name, Physical Address, and Admin Email.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/hospitals', formData);
      Alert.alert(
        'Hospital Authorized & Operational',
        `"${formData.name}" has been registered with immediate Super Admin authorization.\n\nAdmin Login: ${formData.adminEmail}\nPassword: ${formData.password || 'password123'}`
      );
      setShowAddModal(false);
      setFormData({
        name: '',
        address: '',
        contactNumber: '',
        emergencyContact: '',
        adminEmail: '',
        password: '',
        category: 'Multi-Specialty & Trauma Care',
        city: 'Kolhapur',
        totalBeds: '',
        icuBeds: '',
        lat: '16.7050',
        lng: '74.2433',
      });
      fetchHospitals();
    } catch (err) {
      Alert.alert('Creation Failed', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Dialer Unavailable', `Contact Number: ${phoneNumber}`);
    });
  };

  const pendingList = hospitals.filter(h => h.status === 'pending');
  const approvedList = hospitals.filter(h => h.status === 'approved');

  const filteredHospitals = hospitals.filter(h => {
    const matchesTab = 
      filterTab === 'all' ? true :
      filterTab === 'approved' ? h.status === 'approved' :
      h.status === 'pending';

    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = h.name?.toLowerCase().includes(q);
    const addrMatch = h.address?.toLowerCase().includes(q);
    const emailMatch = h.adminEmail?.toLowerCase().includes(q);
    const catMatch = h.category?.toLowerCase().includes(q);
    return nameMatch || addrMatch || emailMatch || catMatch;
  });

  const renderHospitalCard = (item, index) => {
    const isApproved = item.status === 'approved';
    const isPending = item.status === 'pending';
    const contact = item.contactNumber || '+91 231 264 1125';
    const emergencyPhone = item.emergencyContact || '+91 231 264 1911';

    const totalCapacity = item.totalCapacity || item.totalBeds || 100;
    const totalAvail = item.totalAvailable ?? item.totalBeds ?? 40;
    const icuAvail = item.icuAvailable ?? 8;
    const icuTotal = item.icuTotal ?? 20;
    const emergencyAvail = item.emergencyAvailable ?? 10;
    const emergencyTotal = item.emergencyTotal ?? 25;
    const generalAvail = item.generalAvailable ?? 22;
    const generalTotal = item.generalTotal ?? 50;
    const ventilatorAvail = item.ventilatorAvailable ?? 4;
    const ventilatorTotal = item.ventilatorTotal ?? 12;

    const availPercent = totalCapacity > 0 ? Math.round((totalAvail / totalCapacity) * 100) : 0;
    const isHighAvail = availPercent >= 25;

    return (
      <MotiView
        key={item._id || item.id || `hospital-${index}`}
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: Math.min(index * 35, 300), type: 'timing', duration: 320 }}
        style={[
          styles.card, 
          SHADOWS.medium, 
          { 
            backgroundColor: theme.surface, 
            borderColor: isPending ? '#F59E0B' : '#E2E8F0',
            borderLeftWidth: isPending ? 4 : 1,
          }
        ]}
      >
        {/* Top Header: Name, Category, Address & Status */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <View style={styles.hospitalBuildingBadge}>
                <HospitalFacilitySvg size={14} color={theme.primary} />
              </View>
              <Text style={[TYPOGRAPHY.h2, { color: theme.text, flexShrink: 1 }]} numberOfLines={1}>
                {item.name}
              </Text>
              {isApproved && (
                <View style={styles.verifiedCheckBadge}>
                  <CheckmarkSvg size={14} color="#10B981" circled={true} />
                </View>
              )}
            </View>

            {/* Category Pill */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText} numberOfLines={1}>
                {item.category || 'Multi-Specialty & Trauma Care'}
              </Text>
            </View>

            {/* Physical Location */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <LocationPinSvg size={13} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, flex: 1 }]} numberOfLines={1}>
                {item.address || 'Dasara Chowk, Kolhapur'}
              </Text>
            </View>
          </View>

          {/* Operational Status Badge */}
          <View style={[
            styles.statusPill, 
            { 
              backgroundColor: isApproved ? '#ECFDF5' : (isPending ? '#FEF3C7' : '#FEE2E2'),
              borderColor: isApproved ? '#A7F3D0' : (isPending ? '#FDE68A' : '#FECDD3'),
            }
          ]}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: isApproved ? '#10B981' : (isPending ? '#F59E0B' : '#EF4444') }
            ]} />
            <Text style={[
              TYPOGRAPHY.micro, 
              { 
                color: isApproved ? '#065F46' : (isPending ? '#92400E' : '#991B1B'), 
                fontWeight: '700' 
              }
            ]}>
              {isApproved ? 'OPERATIONAL' : (isPending ? 'PENDING' : item.status.toUpperCase())}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: '#F1F5F9' }]} />

        {/* Real-Time Bed Capacity & 4-Ward Inventory Section */}
        <View style={styles.bedSectionContainer}>
          <View style={styles.bedSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <BedRosterGridSvg size={15} color={theme.primary} style={{ marginRight: 6 }} />
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.text, fontSize: 12 }]}>
                REAL-TIME BED CAPACITY
              </Text>
            </View>
            <View style={[
              styles.bedAvailPill, 
              { backgroundColor: isHighAvail ? '#ECFDF5' : '#FEF3C7', borderColor: isHighAvail ? '#A7F3D0' : '#FDE68A' }
            ]}>
              <View style={[styles.liveDot, { backgroundColor: isHighAvail ? '#10B981' : '#F59E0B' }]} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: isHighAvail ? '#065F46' : '#92400E' }}>
                {totalAvail} / {totalCapacity} Free ({availPercent}%)
              </Text>
            </View>
          </View>

          {/* 4-Ward Breakdown Grid */}
          <View style={styles.wardGrid}>
            {/* ICU Ward */}
            <View style={[styles.wardCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
              <View style={styles.wardCardTop}>
                <View style={[styles.wardIconBadge, { backgroundColor: '#EEF2FF' }]}>
                  <IcuBedSvg size={13} color="#4F46E5" />
                </View>
                <Text style={[TYPOGRAPHY.micro, { color: '#64748B', fontWeight: '700' }]}>ICU WARD</Text>
              </View>
              <Text style={[TYPOGRAPHY.h3, { color: '#1E293B', fontSize: 15, marginTop: 4 }]}>
                {icuAvail}
                <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>/{icuTotal}</Text>
              </Text>
              <Text style={{ fontSize: 9.5, color: '#4F46E5', fontWeight: '700', marginTop: 2 }}>
                {icuAvail} Available
              </Text>
            </View>

            {/* Emergency Ward */}
            <View style={[styles.wardCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
              <View style={styles.wardCardTop}>
                <View style={[styles.wardIconBadge, { backgroundColor: '#FFE4E6' }]}>
                  <EmergencyCrossSvg size={13} color="#E11D48" />
                </View>
                <Text style={[TYPOGRAPHY.micro, { color: '#64748B', fontWeight: '700' }]}>EMERGENCY</Text>
              </View>
              <Text style={[TYPOGRAPHY.h3, { color: '#1E293B', fontSize: 15, marginTop: 4 }]}>
                {emergencyAvail}
                <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>/{emergencyTotal}</Text>
              </Text>
              <Text style={{ fontSize: 9.5, color: '#E11D48', fontWeight: '700', marginTop: 2 }}>
                {emergencyAvail} Available
              </Text>
            </View>

            {/* General Ward */}
            <View style={[styles.wardCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
              <View style={styles.wardCardTop}>
                <View style={[styles.wardIconBadge, { backgroundColor: '#CCFBF1' }]}>
                  <GeneralWardBedSvg size={13} color="#0D9488" />
                </View>
                <Text style={[TYPOGRAPHY.micro, { color: '#64748B', fontWeight: '700' }]}>GENERAL</Text>
              </View>
              <Text style={[TYPOGRAPHY.h3, { color: '#1E293B', fontSize: 15, marginTop: 4 }]}>
                {generalAvail}
                <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>/{generalTotal}</Text>
              </Text>
              <Text style={{ fontSize: 9.5, color: '#0D9488', fontWeight: '700', marginTop: 2 }}>
                {generalAvail} Available
              </Text>
            </View>

            {/* Ventilator Ward */}
            <View style={[styles.wardCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
              <View style={styles.wardCardTop}>
                <View style={[styles.wardIconBadge, { backgroundColor: '#FEF3C7' }]}>
                  <VentilatorSvg size={13} color="#D97706" />
                </View>
                <Text style={[TYPOGRAPHY.micro, { color: '#64748B', fontWeight: '700' }]}>VENTILATOR</Text>
              </View>
              <Text style={[TYPOGRAPHY.h3, { color: '#1E293B', fontSize: 15, marginTop: 4 }]}>
                {ventilatorAvail}
                <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>/{ventilatorTotal}</Text>
              </Text>
              <Text style={{ fontSize: 9.5, color: '#D97706', fontWeight: '700', marginTop: 2 }}>
                {ventilatorAvail} Available
              </Text>
            </View>
          </View>
        </View>

        {/* Accreditation & Regulatory Verification Strip */}
        <View style={[styles.docAuditStrip, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <DocumentCertificateSvg size={14} color={theme.primary} style={{ marginRight: 6 }} />
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.text, fontSize: 12 }]} numberOfLines={1}>
                {item.documentName || `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}_Establishment_License.pdf`}
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.micro, { color: '#64748B' }]}>
              License: {item.licenseNumber || `MH-KOP-MED-2026-${String(index + 1).padStart(3, '0')}`} • {item.documentType || 'Govt Clinical Establishment License (Class A)'}
            </Text>
          </View>

          <View style={[
            styles.otpAuditBadge,
            { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }
          ]}>
            <CheckmarkSvg size={11} color="#16A34A" circled={true} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#15803D' }}>
              GOVT ACCREDITED
            </Text>
          </View>
        </View>

        {/* Contact Numbers & Information Breakdown */}
        <View style={styles.contactContainer}>
          {/* Official Reception Contact */}
          <View style={styles.contactRowHighlight}>
            <View style={[styles.iconPill, { backgroundColor: '#EFF6FF' }]}>
              <PhoneCallSvg size={14} color="#2563EB" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[TYPOGRAPHY.micro, { color: '#64748B' }]}>OFFICIAL RECEPTION CONTACT</Text>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: theme.text, fontWeight: '600' }]}>{contact}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.miniDialBtn, { backgroundColor: '#EFF6FF' }]}
              onPress={() => handleCall(contact)}
              activeOpacity={0.7}
            >
              <PhoneCallSvg size={15} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* Emergency 24x7 Helpline */}
          <View style={[styles.contactRowHighlight, { marginTop: 6, backgroundColor: '#FFF1F2' }]}>
            <View style={[styles.iconPill, { backgroundColor: '#FFE4E6' }]}>
              <AlertTriangleSvg size={14} color="#E11D48" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[TYPOGRAPHY.micro, { color: '#BE123C' }]}>24x7 EMERGENCY HELPLINE</Text>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: '#E11D48', fontWeight: '700' }]}>{emergencyPhone}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.miniDialBtn, { backgroundColor: '#FFE4E6' }]}
              onPress={() => handleCall(emergencyPhone)}
              activeOpacity={0.7}
            >
              <PhoneCallSvg size={15} color="#E11D48" />
            </TouchableOpacity>
          </View>

          {/* Admin Authority Login Email */}
          <View style={[styles.adminEmailRow, { backgroundColor: '#F8FAFC' }]}>
            <MailEnvelopeSvg size={14} color="#64748B" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={[TYPOGRAPHY.micro, { color: '#64748B' }]}>HOSPITAL AUTHORITY EMAIL</Text>
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>
                {item.adminEmail || 'admin@hospital.com'}
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textMuted, fontStyle: 'italic' }]}>
              Kolhapur District
            </Text>
          </View>
        </View>

        {/* Pending Review Actions */}
        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.btnAction, { backgroundColor: theme.success }]} 
              onPress={() => updateStatus(item._id, 'approved', item.name)}
            >
              <CheckmarkSvg size={16} color="#FFFFFF" circled={true} style={{ marginRight: 4 }} />
              <Text style={[TYPOGRAPHY.captionBold, { color: '#FFFFFF' }]}>Approve & Authorize</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnAction, { backgroundColor: theme.surfaceSubtle, borderWidth: 1, borderColor: theme.border }]} 
              onPress={() => updateStatus(item._id, 'rejected', item.name)}
            >
              <CloseCrossSvg size={16} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.textSecondary }]}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Approved Hospital Quick Controls: Inspect Wards & Delete */}
        {isApproved && (
          <View style={styles.actionRowContainer}>
            <TouchableOpacity 
              style={[styles.btnInspectWards, { backgroundColor: theme.primary }]} 
              onPress={() => navigation.navigate('InspectWards', { 
                hospitalId: item._id, 
                hospitalName: item.name, 
                isAdminInspection: true 
              })}
              activeOpacity={0.8}
            >
              <BedRosterGridSvg size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={[TYPOGRAPHY.captionBold, { color: '#FFFFFF', flex: 1 }]}>
                Inspect Live Wards & Beds
              </Text>
              <ChevronRightSvg size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnDelete, { borderColor: '#FECDD3' }]} 
              onPress={() => handleDeleteHospital(item)}
              activeOpacity={0.7}
            >
              <TrashSvg size={16} color="#E11D48" />
            </TouchableOpacity>
          </View>
        )}
      </MotiView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Super Admin Top Header with Add Hospital CTA */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[TYPOGRAPHY.micro, { color: theme.primary }]}>SUPER ADMIN AUTHORITY</Text>
          <Text style={[TYPOGRAPHY.h1, { color: theme.text }]}>Network Registry</Text>
        </View>

        {/* Add Hospital Button (New Module Authority) */}
        <TouchableOpacity 
          style={[styles.addHospitalBtn, { backgroundColor: theme.primary }]}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <PlusAddSvg size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={[TYPOGRAPHY.captionBold, { color: '#FFFFFF' }]}>Add Hospital</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Registry Overview Stats */}
        <View style={[styles.statsRow, { backgroundColor: theme.surface, borderColor: theme.border }, SHADOWS.soft]}>
          <View style={styles.statCol}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>TOTAL HOSPITALS</Text>
            <Text style={[TYPOGRAPHY.h1, { color: theme.text, marginTop: 2 }]}>{hospitals.length}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statCol}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>OPERATIONAL</Text>
            <Text style={[TYPOGRAPHY.h1, { color: theme.success, marginTop: 2 }]}>{approvedList.length}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statCol}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>PENDING REVIEW</Text>
            <Text style={[TYPOGRAPHY.h1, { color: pendingList.length > 0 ? '#B45309' : theme.textMuted, marginTop: 2 }]}>
              {pendingList.length}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SearchSvg size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search Kolhapur hospitals by name or area..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <CloseCrossSvg size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            style={[
              styles.filterTabPill,
              filterTab === 'all' && [styles.filterTabPillActive, { backgroundColor: theme.primary, borderColor: theme.primary }]
            ]}
            onPress={() => setFilterTab('all')}
          >
            <Text style={[styles.filterTabText, filterTab === 'all' && styles.filterTabTextActive]}>
              All ({hospitals.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTabPill,
              filterTab === 'approved' && [styles.filterTabPillActive, { backgroundColor: theme.success, borderColor: theme.success }]
            ]}
            onPress={() => setFilterTab('approved')}
          >
            <Text style={[styles.filterTabText, filterTab === 'approved' && styles.filterTabTextActive]}>
              Operational ({approvedList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTabPill,
              filterTab === 'pending' && [styles.filterTabPillActive, { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }]
            ]}
            onPress={() => setFilterTab('pending')}
          >
            <Text style={[styles.filterTabText, filterTab === 'pending' && styles.filterTabTextActive]}>
              Pending ({pendingList.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pending Notifications Alert Banner */}
        {pendingList.length > 0 && filterTab !== 'approved' && (
          <MotiView 
            from={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={[styles.alertBanner, SHADOWS.soft]}
          >
            <View style={styles.alertIconCircle}>
              <BellNotificationSvg size={20} color="#B45309" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: '#B45309' }]}>
                {pendingList.length} Registration Request{pendingList.length > 1 ? 's' : ''} Pending
              </Text>
              <Text style={[TYPOGRAPHY.caption, { color: '#92400E', marginTop: 2 }]}>
                Review institutional verification details below to allow authority logins.
              </Text>
            </View>
          </MotiView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[TYPOGRAPHY.captionBold, { color: theme.textSecondary }]}>
            AUTHORIZED KOLHAPUR FACILITIES ({filteredHospitals.length})
          </Text>
        </View>

        {filteredHospitals.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <HospitalFacilitySvg size={44} color={theme.textMuted} />
            <Text style={[TYPOGRAPHY.h3, { color: theme.text, marginTop: 12 }]}>No Hospitals Found</Text>
            <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, textAlign: 'center', marginTop: 4 }]}>
              {searchQuery ? `No hospital matched "${searchQuery}".` : 'No hospital facilities in this category.'}
            </Text>
            {searchQuery ? (
              <TouchableOpacity
                style={[styles.resetSearchBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                onPress={() => setSearchQuery('')}
              >
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.primary }]}>Clear Search</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          filteredHospitals.map((h, i) => renderHospitalCard(h, i))
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* MODULE: Add Hospital Modal (Authority to Register & Provision) */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={[styles.modalRolePill, { backgroundColor: theme.primaryLight }]}>
                  <AdminShieldHqSvg size={14} color={theme.primary} style={{ marginRight: 4 }} />
                  <Text style={[TYPOGRAPHY.micro, { color: theme.primary }]}>SUPER ADMIN AUTHORIZATION</Text>
                </View>
                <Text style={[TYPOGRAPHY.h1, { color: theme.text, marginTop: 4 }]}>Add New Hospital</Text>
                <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
                  Instantly provision accredited hospital, contact desk & login
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.modalCloseBtn, { backgroundColor: theme.surfaceSubtle }]}
                onPress={() => setShowAddModal(false)}
              >
                <CloseCrossSvg size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Form Scroll */}
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Hospital Name */}
              <View style={styles.formGroup}>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Hospital Facility Name *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="e.g. St. Jude Trauma & Multi-Specialty Hospital"
                  placeholderTextColor={theme.textMuted}
                  value={formData.name}
                  onChangeText={(val) => setFormData(p => ({ ...p, name: val }))}
                />
              </View>

              {/* Physical Address */}
              <View style={styles.formGroup}>
                <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Physical Street Address *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="e.g. Plot 44, Medical Ring Road, Sector 5"
                  placeholderTextColor={theme.textMuted}
                  value={formData.address}
                  onChangeText={(val) => setFormData(p => ({ ...p, address: val }))}
                />
              </View>

              {/* Contact Numbers Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Official Contact Phone *</Text>
                  <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                    placeholder="+91 231 264 1125"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="phone-pad"
                    value={formData.contactNumber}
                    onChangeText={(val) => setFormData(p => ({ ...p, contactNumber: val }))}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[TYPOGRAPHY.captionBold, { color: '#E11D48' }]}>24/7 Emergency Line *</Text>
                  <TextInput
                    style={[styles.input, { borderColor: '#FECDD3', color: '#E11D48', backgroundColor: '#FFF1F2' }]}
                    placeholder="+91 231 264 1911"
                    placeholderTextColor="#FDA4AF"
                    keyboardType="phone-pad"
                    value={formData.emergencyContact}
                    onChangeText={(val) => setFormData(p => ({ ...p, emergencyContact: val }))}
                  />
                </View>
              </View>

              {/* Admin Credentials Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Admin Login Email *</Text>
                  <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                    placeholder="admin@hospital.com"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.adminEmail}
                    onChangeText={(val) => setFormData(p => ({ ...p, adminEmail: val }))}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Initial Password</Text>
                  <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                    placeholder="password123"
                    placeholderTextColor={theme.textMuted}
                    value={formData.password}
                    onChangeText={(val) => setFormData(p => ({ ...p, password: val }))}
                  />
                </View>
              </View>

              {/* Capacity and Category */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Total Bed Capacity</Text>
                  <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                    placeholder="80"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                    value={formData.totalBeds}
                    onChangeText={(val) => setFormData(p => ({ ...p, totalBeds: val }))}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>ICU Beds</Text>
                  <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                    placeholder="18"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                    value={formData.icuBeds}
                    onChangeText={(val) => setFormData(p => ({ ...p, icuBeds: val }))}
                  />
                </View>
              </View>

              {/* GPS Coordinates */}
              <View style={styles.formGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>GPS Coordinates (Lat / Lng)</Text>
                  <TouchableOpacity 
                    style={styles.gpsSyncPill}
                    onPress={handleDetectDeviceGPS}
                    disabled={locating}
                  >
                    {locating ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <>
                        <LocationPinSvg size={13} color={theme.primary} style={{ marginRight: 4 }} />
                        <Text style={[TYPOGRAPHY.micro, { color: theme.primary }]}>Detect Device GPS</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.formRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderColor: theme.border, color: theme.text }]}
                    placeholder="Latitude (16.7050)"
                    placeholderTextColor={theme.textMuted}
                    value={formData.lat}
                    onChangeText={(val) => setFormData(p => ({ ...p, lat: val }))}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1, borderColor: theme.border, color: theme.text }]}
                    placeholder="Longitude (74.2433)"
                    placeholderTextColor={theme.textMuted}
                    value={formData.lng}
                    onChangeText={(val) => setFormData(p => ({ ...p, lng: val }))}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ marginTop: 12, marginBottom: 40, gap: 10 }}>
                {submitting ? (
                  <View style={[styles.loadingBox, { backgroundColor: theme.primaryLight }]}>
                    <ActivityIndicator color={theme.primary} />
                    <Text style={[TYPOGRAPHY.bodyMedium, { color: theme.primary, marginLeft: 10 }]}>
                      Authorizing hospital and configuring wards...
                    </Text>
                  </View>
                ) : (
                  <>
                    <AnimatedButton
                      title="Authorize & Register Hospital"
                      onPress={handleCreateHospital}
                      theme={theme}
                      icon={<CheckmarkSvg size={18} color="#FFFFFF" strokeWidth={2.8} />}
                    />
                    <AnimatedButton
                      title="Cancel"
                      onPress={() => setShowAddModal(false)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  addHospitalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: 14,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  scrollContent: { 
    padding: 16, 
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    padding: 0,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterTabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabPillActive: {},
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 16,
  },
  alertIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 4,
  },
  card: { 
    padding: 16, 
    borderRadius: RADIUS.lg, 
    marginBottom: 14, 
    borderWidth: 1, 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
  },
  hospitalBuildingBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  verifiedCheckBadge: {
    marginLeft: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 6,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  divider: { 
    height: 1, 
    marginVertical: 12, 
  },
  // Bed Capacity & Ward Grid Styles
  bedSectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  bedSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bedAvailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  wardGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  wardCard: {
    flex: 1,
    padding: 7,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  wardCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  wardIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 3,
  },
  docAuditStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: 8,
  },
  otpAuditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  contactContainer: {
    marginBottom: 6,
  },
  contactRowHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: RADIUS.md,
    backgroundColor: '#F8FAFC',
  },
  adminEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    borderRadius: RADIUS.sm,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniDialBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: { 
    flexDirection: 'row', 
    gap: 10, 
    marginTop: 8, 
  },
  btnAction: { 
    flex: 1, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 10, 
    borderRadius: RADIUS.sm,
  },
  actionRowContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  btnInspectWards: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
  },
  btnDelete: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginVertical: 16,
  },
  resetSearchBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
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
    marginBottom: 12,
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
  gpsSyncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: '#EFF6FF',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: RADIUS.md,
  },
});
