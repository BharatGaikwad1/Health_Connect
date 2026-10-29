import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  RefreshControl,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { MotiView } from '../components/Motion';
import { api } from '../services/api';
import { THEMES, TYPOGRAPHY, SHADOWS, RADIUS } from '../constants/theme';
import { AnimatedButton } from '../components/AnimatedButton';
import { 
  IcuBedSvg, 
  VentilatorSvg, 
  GeneralWardBedSvg, 
  EmergencyCrossSvg, 
  AmbulanceSvg,
  MinusRemoveSvg,
  PlusAddSvg,
  LogOutSvg,
  ChevronBackSvg,
  RefreshSyncSvg,
  HospitalFacilitySvg,
  PhoneCallSvg,
  EditPencilSvg,
  ClockTimeSvg,
  DocumentCertificateSvg,
  CheckmarkSvg,
  CloseCrossSvg
} from '../components/icons';

export default function HospitalDashboard({ route, navigation }) {
  const { hospitalId, isAdminInspection } = route.params || {};
  const [beds, setBeds] = useState(() => [
    { category: 'ICU', total: 25, occupied: 15, available: 10 },
    { category: 'General', total: 60, occupied: 38, available: 22 },
    { category: 'Emergency', total: 20, occupied: 12, available: 8 },
    { category: 'Ventilator', total: 15, occupied: 10, available: 5 }
  ]);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  // Discharge history state
  const [discharges, setDischarges] = useState([]);
  const [loadingDischarges, setLoadingDischarges] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [selectedDischargeCategory, setSelectedDischargeCategory] = useState('ICU');
  const [dischargePatientName, setDischargePatientName] = useState('');
  const [dischargeReason, setDischargeReason] = useState('Medical Stabilization & Full Recovery');
  const [dischargingPatient, setDischargingPatient] = useState(false);

  // Edit contacts form state
  const [contactForm, setContactForm] = useState({
    contactNumber: '',
    emergencyContact: '',
    address: '',
    category: '',
  });

  const theme = THEMES.hospital_admin;
  const bedCategories = ['ICU', 'General', 'Emergency', 'Ventilator'];

  useEffect(() => {
    fetchBeds();
    fetchHospitalData();
    fetchDischarges();
  }, [hospitalId]);

  const fetchHospitalData = async () => {
    if (!hospitalId) return;
    try {
      const res = await api.get(`/hospitals/${hospitalId}`);
      setHospitalInfo(res.data);
      setContactForm({
        contactNumber: res.data.contactNumber || '+91 80 2841 5000',
        emergencyContact: res.data.emergencyContact || '+91 80 2841 5911',
        address: res.data.address || '',
        category: res.data.category || 'Multi-Specialty & Trauma Care',
      });
    } catch (err) {
      console.log('Unable to load hospital profile:', err.message);
    }
  };

  const fetchBeds = async () => {
    if (!hospitalId) return;
    try {
      const res = await api.get(`/beds/${hospitalId}`);
      setBeds(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchDischarges = async () => {
    if (!hospitalId) return;
    try {
      setLoadingDischarges(true);
      const res = await api.get(`/beds/${hospitalId}/discharges`);
      setDischarges(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log('Error fetching discharge history:', err.message);
    } finally {
      setLoadingDischarges(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBeds();
    fetchHospitalData();
    fetchDischarges();
  };

  const getBedInfo = (category) => {
    return beds.find(b => b.category === category) || { total: 0, occupied: 0 };
  };

  const updateBedCount = async (category, field, change) => {
    const current = getBedInfo(category);
    let newTotal = current.total;
    let newOccupied = current.occupied;

    if (field === 'total') newTotal = Math.max(0, current.total + change);
    if (field === 'occupied') newOccupied = Math.max(0, Math.min(newTotal, current.occupied + change));

    try {
      await api.put(`/beds/${hospitalId}/${category}`, { 
        total: newTotal, 
        occupied: newOccupied,
        reason: 'Ward Bed Occupancy Adjustment'
      });
      fetchBeds();
      // If occupied beds decreased, discharge history was logged! Refresh immediately:
      if (field === 'occupied' && change < 0) {
        fetchDischarges();
      }
    } catch (err) {
      Alert.alert('Error updating bed count', err.message);
    }
  };

  const handleConfirmDischarge = async () => {
    const current = getBedInfo(selectedDischargeCategory);
    if (current.occupied <= 0) {
      Alert.alert('No Patients In Ward', `There are currently 0 occupied beds in the ${selectedDischargeCategory} ward.`);
      return;
    }

    setDischargingPatient(true);
    try {
      await api.post(`/beds/${hospitalId}/discharge`, {
        category: selectedDischargeCategory,
        patientName: dischargePatientName.trim() || undefined,
        reason: dischargeReason.trim() || undefined,
        bedsFreed: 1
      });

      setShowDischargeModal(false);
      setDischargePatientName('');
      setDischargeReason('Medical Stabilization & Full Recovery');
      
      // Refresh beds and discharge history immediately!
      await fetchBeds();
      await fetchDischarges();

      Alert.alert(
        'Patient Discharged Successfully', 
        `1 ${selectedDischargeCategory} bed has been freed and live network availability updated!`
      );
    } catch (err) {
      Alert.alert('Discharge Failed', err.response?.data?.error || err.message);
    } finally {
      setDischargingPatient(false);
    }
  };

  const handleCall = (number) => {
    if (!number) return;
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert('Dialer Unavailable', `Hospital Contact: ${number}`);
    });
  };

  const handleSaveContacts = async () => {
    if (!contactForm.contactNumber.trim() || !contactForm.emergencyContact.trim()) {
      Alert.alert('Missing Field', 'Please provide both Official Phone and Emergency Contact Number.');
      return;
    }

    setSavingContact(true);
    try {
      const res = await api.put(`/hospitals/${hospitalId}`, contactForm);
      setHospitalInfo(res.data);
      setShowEditContactModal(false);
      Alert.alert('Contacts Updated', 'Your hospital phone lines and address have been updated across the network.');
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.error || err.message);
    } finally {
      setSavingContact(false);
    }
  };

  // Aggregated totals
  const totalBeds = beds.reduce((acc, b) => acc + (b.total || 0), 0);
  const occupiedBeds = beds.reduce((acc, b) => acc + (b.occupied || 0), 0);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ICU': return 'pulse';
      case 'Emergency': return 'alert-circle';
      case 'Ventilator': return 'fitness';
      default: return 'bed';
    }
  };

  const renderWardIcon = (category, color, size = 18) => {
    switch (category) {
      case 'ICU':
        return <IcuBedSvg size={size} color={color} />;
      case 'Emergency':
        return <EmergencyCrossSvg size={size} color={color} />;
      case 'Ventilator':
        return <VentilatorSvg size={size} color={color} />;
      default:
        return <GeneralWardBedSvg size={size} color={color} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'ICU': return '#EF4444';
      case 'Emergency': return '#F59E0B';
      case 'Ventilator': return '#6366F1';
      default: return '#3B82F6';
    }
  };

  const formatDischargeTime = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const d = new Date(dateString);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 60) {
        return `${Math.max(1, diffMins)}m ago`;
      }
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return `${diffHours}h ago`;
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  const renderBedCategory = (item, index) => {
    const info = getBedInfo(item);
    const free = Math.max(0, info.total - info.occupied);
    const occupancyRate = info.total > 0 ? (info.occupied / info.total) * 100 : 0;
    const isCritical = occupancyRate >= 90;
    
    return (
      <MotiView
        key={item}
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 70, type: 'timing', duration: 350 }}
        style={[styles.card, SHADOWS.medium, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoryTitleRow}>
            <View style={[styles.iconHalo, { backgroundColor: theme.primaryLight }]}>
              {renderWardIcon(item, theme.primary, 18)}
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={[TYPOGRAPHY.h3, { color: theme.text }]}>{item} Ward</Text>
              <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>
                {Math.round(occupancyRate)}% OCCUPIED • {free} AVAILABLE NOW
              </Text>
            </View>
          </View>

          <View style={[
            styles.badge, 
            { backgroundColor: free > 0 ? theme.successLight : '#FEE2E2' }
          ]}>
            <Text style={[
              TYPOGRAPHY.captionBold, 
              { color: free > 0 ? theme.success : theme.accent }
            ]}>
              {free} Free
            </Text>
          </View>
        </View>

        {/* Real-time Occupancy Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.surfaceSubtle }]}>
            <MotiView 
              style={[
                styles.progressFill, 
                { backgroundColor: isCritical ? theme.accent : theme.primary }
              ]} 
              animate={{ width: `${Math.min(100, occupancyRate)}%` }}
              transition={{ type: 'spring', damping: 15 }}
            />
          </View>
        </View>
        
        {/* Real-time Stepper Controls */}
        <View style={styles.controlsGrid}>
          <View style={styles.controlGroup}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 8 }]}>TOTAL CAPACITY</Text>
            <View style={[styles.stepper, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <TouchableOpacity 
                style={[styles.stepperBtn, { backgroundColor: theme.surface }]} 
                onPress={() => updateBedCount(item, 'total', -1)}
              >
                <MinusRemoveSvg size={16} color={theme.text} />
              </TouchableOpacity>
              <Text style={[TYPOGRAPHY.h3, { color: theme.text, width: 38, textAlign: 'center' }]}>
                {info.total}
              </Text>
              <TouchableOpacity 
                style={[styles.stepperBtn, { backgroundColor: theme.surface }]} 
                onPress={() => updateBedCount(item, 'total', 1)}
              >
                <PlusAddSvg size={16} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.controlGroup}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginBottom: 8 }]}>IN-PATIENT OCCUPIED</Text>
            <View style={[styles.stepper, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <TouchableOpacity 
                style={[styles.stepperBtn, { backgroundColor: theme.surface }]} 
                onPress={() => updateBedCount(item, 'occupied', -1)}
              >
                <MinusRemoveSvg size={16} color={theme.text} />
              </TouchableOpacity>
              <Text style={[TYPOGRAPHY.h3, { color: theme.text, width: 38, textAlign: 'center' }]}>
                {info.occupied}
              </Text>
              <TouchableOpacity 
                style={[styles.stepperBtn, { backgroundColor: theme.surface }]} 
                onPress={() => updateBedCount(item, 'occupied', 1)}
              >
                <PlusAddSvg size={16} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Discharge Button (Direct Requirement) */}
        <TouchableOpacity
          style={[styles.wardDischargeBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
          onPress={() => {
            setSelectedDischargeCategory(item);
            setShowDischargeModal(true);
          }}
          activeOpacity={0.8}
        >
          <LogOutSvg size={15} color="#059669" style={{ marginRight: 6 }} />
          <Text style={[TYPOGRAPHY.captionBold, { color: '#059669' }]}>
            Discharge Patient from {item} (Free Bed & Log History)
          </Text>
        </TouchableOpacity>
      </MotiView>
    );
  };

  const canGoBack = navigation?.canGoBack ? navigation.canGoBack() : false;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {canGoBack && (
          <TouchableOpacity 
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle }]}
            onPress={() => navigation.goBack()}
          >
            <ChevronBackSvg size={20} color={theme.text} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1, marginLeft: canGoBack ? 10 : 0 }}>
          <View style={styles.badgeFacility}>
            <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />
            <Text style={[TYPOGRAPHY.micro, { color: theme.primary }]}>
              {isAdminInspection ? 'SUPER ADMIN INSPECTION' : (hospitalInfo?.name ? hospitalInfo.name.toUpperCase() : 'HOSPITAL AUTHORITY PORTAL')}
            </Text>
          </View>
          <Text style={[TYPOGRAPHY.h1, { color: theme.text, marginTop: 2 }]} numberOfLines={1}>
            {isAdminInspection ? `${hospitalInfo?.name || 'Hospital'} Wards` : 'Ward & Emergency Control'}
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
            {isAdminInspection ? 'Live ICU & emergency ward audit' : 'Live occupancy, discharge history & emergency desk'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.syncBtn, { backgroundColor: theme.surfaceSubtle }]}
          onPress={onRefresh}
        >
          <RefreshSyncSvg size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hospital Facility Scope Badge Card */}
        {hospitalInfo && (
          <MotiView 
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={[styles.hospitalMetaBar, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
          >
            <HospitalFacilitySvg size={16} color={theme.primary} crossColor="#EF4444" style={{ marginRight: 8 }} />
            <Text style={[TYPOGRAPHY.caption, { color: theme.text, flex: 1 }]} numberOfLines={1}>
              <Text style={{ fontWeight: '700' }}>{hospitalInfo.name}</Text> • {hospitalInfo.address}
            </Text>
            <View style={[styles.verifiedPill, { backgroundColor: theme.successLight }]}>
              <Text style={[TYPOGRAPHY.micro, { color: theme.success }]}>ACCREDITED</Text>
            </View>
          </MotiView>
        )}

        {/* FACILITY TELEPHONY & CONTACT DESK */}
        <MotiView 
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={[styles.contactCard, SHADOWS.medium, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <View style={styles.contactCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.phoneIconBox, { backgroundColor: theme.primaryLight }]}>
                <PhoneCallSvg size={18} color={theme.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[TYPOGRAPHY.h3, { color: theme.text }]}>Facility Contact Numbers</Text>
                <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
                  Visible to nearby patients seeking emergency care & beds
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.editContactBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
              onPress={() => setShowEditContactModal(true)}
            >
              <EditPencilSvg size={15} color={theme.primary} style={{ marginRight: 4 }} />
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.primary }]}>Edit Numbers</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Numbers Grid */}
          <View style={styles.numbersGrid}>
            {/* Official Reception */}
            <View style={[styles.numberTile, { backgroundColor: '#F8FAFC', borderColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>OFFICIAL RECEPTION / OPD</Text>
                <Text style={[TYPOGRAPHY.h3, { color: theme.text, marginTop: 4 }]}>
                  {hospitalInfo?.contactNumber || '+91 80 2841 5000'}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.callActionBtn, { backgroundColor: theme.primaryLight }]}
                onPress={() => handleCall(hospitalInfo?.contactNumber || '+91 80 2841 5000')}
              >
                <PhoneCallSvg size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>

            {/* 24x7 Emergency Helpline */}
            <View style={[styles.numberTile, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3', marginTop: 10 }]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AmbulanceSvg size={16} color="#E11D48" bodyColor="#E11D48" style={{ marginRight: 6 }} />
                  <Text style={[TYPOGRAPHY.micro, { color: '#BE123C' }]}>24x7 TRAUMA & AMBULANCE HOTLINE</Text>
                  <View style={[styles.liveBlinker, { backgroundColor: '#E11D48' }]} />
                </View>
                <Text style={[TYPOGRAPHY.h3, { color: '#E11D48', marginTop: 4 }]}>
                  {hospitalInfo?.emergencyContact || '+91 80 2841 5911'}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.callActionBtn, { backgroundColor: '#FFE4E6' }]}
                onPress={() => handleCall(hospitalInfo?.emergencyContact || '+91 80 2841 5911')}
              >
                <PhoneCallSvg size={16} color="#E11D48" />
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>

        {/* Aggregated Ward Summary */}
        <MotiView 
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={[styles.summaryCard, SHADOWS.soft, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <View style={styles.summaryCol}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>TOTAL BEDS</Text>
            <Text style={[TYPOGRAPHY.h1, { color: theme.text, marginTop: 4 }]}>{totalBeds}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryCol}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>OCCUPIED</Text>
            <Text style={[TYPOGRAPHY.h1, { color: theme.primary, marginTop: 4 }]}>{occupiedBeds}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryCol}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>AVAILABLE</Text>
            <Text style={[TYPOGRAPHY.h1, { color: theme.success, marginTop: 4 }]}>{availableBeds}</Text>
          </View>
        </MotiView>

        {/* WARD CATEGORIES HEADER */}
        <View style={styles.sectionHeader}>
          <Text style={[TYPOGRAPHY.captionBold, { color: theme.textSecondary }]}>
            WARD CATEGORIES & LIVE CAPACITIES
          </Text>
        </View>

        {bedCategories.map((cat, i) => renderBedCategory(cat, i))}

        {/* DISCHARGE HISTORY SECTION (Direct User Requirement) */}
        <View style={[styles.sectionHeader, { marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ClockTimeSvg size={16} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[TYPOGRAPHY.captionBold, { color: theme.textSecondary }]}>
              PATIENT DISCHARGE HISTORY & BED AVAILABILITY AUDIT
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.refreshPill, { backgroundColor: theme.surfaceSubtle }]}
            onPress={fetchDischarges}
          >
            <RefreshSyncSvg size={12} color={theme.primary} style={{ marginRight: 4 }} />
            <Text style={[TYPOGRAPHY.micro, { color: theme.primary }]}>REFRESH</Text>
          </TouchableOpacity>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={[styles.dischargeContainerCard, SHADOWS.medium, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <View style={styles.dischargeCardHeader}>
            <View>
              <Text style={[TYPOGRAPHY.h3, { color: theme.text }]}>Live Discharge Audit Trail</Text>
              <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, marginTop: 2 }]}>
                Logged automatically each time beds are freed and availability is updated
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.successLight }]}>
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.success }]}>
                {discharges.length} Discharges Logged
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {loadingDischarges ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary, marginTop: 8 }]}>Loading discharge log...</Text>
            </View>
          ) : discharges.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <DocumentCertificateSvg size={32} color={theme.textMuted} />
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.textSecondary, marginTop: 8 }]}>
                No Discharges Recorded Yet
              </Text>
              <Text style={[TYPOGRAPHY.caption, { color: theme.textMuted, textAlign: 'center', marginTop: 4 }]}>
                When beds are freed using the Discharge button or occupied stepper, audit entries will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.dischargeList}>
              {discharges.map((item, idx) => (
                <View 
                  key={item._id || idx}
                  style={[
                    styles.dischargeRowItem, 
                    { borderColor: theme.border },
                    idx === discharges.length - 1 && { borderBottomWidth: 0 }
                  ]}
                >
                  <View style={styles.dischargeRowTop}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={[styles.dischargeIconBadge, { backgroundColor: `${getCategoryColor(item.category)}18` }]}>
                        {renderWardIcon(item.category, getCategoryColor(item.category), 14)}
                      </View>
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]} numberOfLines={1}>
                          {item.patientName || 'In-Patient'}
                        </Text>
                        <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>
                          ID: {item.patientId || 'HC-DIS-8821'} • {item.category} Ward
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={[styles.freedBedPill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                        <CheckmarkSvg size={11} color="#059669" style={{ marginRight: 3 }} />
                        <Text style={[TYPOGRAPHY.micro, { color: '#059669', fontWeight: '700' }]}>
                          +{item.bedsFreed || 1} BED FREED
                        </Text>
                      </View>
                      <Text style={[TYPOGRAPHY.micro, { color: theme.textMuted, marginTop: 4 }]}>
                        {formatDischargeTime(item.createdAt || item.dischargeDate)}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.dischargeDetailBox, { backgroundColor: theme.surfaceSubtle }]}>
                    <Text style={[TYPOGRAPHY.caption, { color: theme.text, fontSize: 12 }]}>
                      <Text style={{ fontWeight: '700', color: theme.textSecondary }}>Reason: </Text>
                      {item.reason || 'Treatment stabilization complete'}
                    </Text>
                    <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary, marginTop: 3 }]}>
                      Officer: {item.dischargedBy || 'Hospital Medical Officer'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </MotiView>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Discharge Patient Modal (Direct Requirement) */}
      <Modal
        visible={showDischargeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDischargeModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[TYPOGRAPHY.h1, { color: theme.text }]}>
                  Discharge Patient ({selectedDischargeCategory})
                </Text>
                <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
                  Frees 1 bed and updates live availability network in real-time
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.modalCloseBtn, { backgroundColor: theme.surfaceSubtle }]}
                onPress={() => setShowDischargeModal(false)}
              >
                <CloseCrossSvg size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Patient Name / Reference (Optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="e.g. Ramesh Sharma or Patient #408"
                placeholderTextColor={theme.textMuted}
                value={dischargePatientName}
                onChangeText={setDischargePatientName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Discharge Reason / Notes</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="e.g. Full Recovery, Transferred, Outpatient Care"
                placeholderTextColor={theme.textMuted}
                value={dischargeReason}
                onChangeText={setDischargeReason}
              />
            </View>

            <View style={[styles.dischargeNoticeBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <CheckmarkSvg size={16} color="#059669" circled={true} style={{ marginRight: 8 }} />
              <Text style={[TYPOGRAPHY.caption, { color: '#065F46', flex: 1 }]}>
                This action will immediately decrement occupied count for {selectedDischargeCategory} ward and record in discharge history.
              </Text>
            </View>

            <View style={{ marginTop: 18, marginBottom: 24 }}>
              <AnimatedButton
                title={dischargingPatient ? "Recording Discharge..." : "Confirm Patient Discharge & Free Bed"}
                onPress={handleConfirmDischarge}
                theme={theme}
                icon={<CheckmarkSvg size={18} color="#FFFFFF" strokeWidth={2.8} />}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Contacts Modal */}
      <Modal
        visible={showEditContactModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditContactModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[TYPOGRAPHY.h1, { color: theme.text }]}>Update Facility Contacts</Text>
                <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
                  Ensure patients can contact your emergency desk
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.modalCloseBtn, { backgroundColor: theme.surfaceSubtle }]}
                onPress={() => setShowEditContactModal(false)}
              >
                <CloseCrossSvg size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[TYPOGRAPHY.captionBold, { color: theme.text }]}>Official Reception / OPD Phone</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="+91 80 2841 5000"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
                value={contactForm.contactNumber}
                onChangeText={(val) => setContactForm(p => ({ ...p, contactNumber: val }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[TYPOGRAPHY.captionBold, { color: '#E11D48' }]}>24x7 Emergency / Ambulance Hotline</Text>
              <TextInput
                style={[styles.input, { borderColor: '#FECDD3', color: '#E11D48', backgroundColor: '#FFF1F2' }]}
                placeholder="+91 80 2841 5911"
                placeholderTextColor="#FDA4AF"
                keyboardType="phone-pad"
                value={contactForm.emergencyContact}
                onChangeText={(val) => setContactForm(p => ({ ...p, emergencyContact: val }))}
              />
            </View>

            <View style={{ marginTop: 18, marginBottom: 24 }}>
              <AnimatedButton
                title={savingContact ? "Broadcasting Phone Numbers..." : "Save & Broadcast Contact Numbers"}
                onPress={handleSaveContacts}
                theme={theme}
                icon={<CheckmarkSvg size={18} color="#FFFFFF" strokeWidth={2.8} />}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    paddingTop: Platform.OS === 'ios' ? 56 : 38, 
    paddingBottom: 16, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
  },
  badgeFacility: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scrollContent: { 
    padding: 20 
  },
  hospitalMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 16,
  },
  verifiedPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginLeft: 8,
  },
  contactCard: {
    padding: 18,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: 16,
  },
  contactCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  numbersGrid: {
    gap: 10,
  },
  numberTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  callActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  liveBlinker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  summaryCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    paddingVertical: 20, 
    borderRadius: RADIUS.lg, 
    marginBottom: 20, 
    borderWidth: 1, 
  },
  summaryCol: { 
    alignItems: 'center', 
    flex: 1 
  },
  summaryDivider: { 
    width: 1, 
    height: 38, 
  },
  sectionHeader: {
    marginBottom: 12,
  },
  refreshPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  card: { 
    padding: 18, 
    borderRadius: RADIUS.lg, 
    marginBottom: 14, 
    borderWidth: 1, 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
  },
  categoryTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconHalo: { 
    width: 36, 
    height: 36, 
    borderRadius: RADIUS.md, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  badge: { 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: RADIUS.full, 
  },
  progressContainer: { 
    marginVertical: 16 
  },
  progressBar: { 
    height: 6, 
    borderRadius: 3, 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 3 
  },
  controlsGrid: { 
    flexDirection: 'row', 
    gap: 12, 
  },
  controlGroup: { 
    flex: 1 
  },
  stepper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderRadius: RADIUS.md, 
    padding: 4, 
    borderWidth: 1, 
  },
  stepperBtn: { 
    width: 34, 
    height: 34, 
    borderRadius: RADIUS.sm, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  wardDischargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: 14,
  },
  dischargeContainerCard: {
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  dischargeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dischargeList: {
    gap: 12,
  },
  dischargeRowItem: {
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  dischargeRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dischargeIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freedBedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  dischargeDetailBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: RADIUS.sm,
  },
  dischargeNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: 8,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: 24,
    paddingHorizontal: 20,
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
  formGroup: {
    marginBottom: 14,
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
