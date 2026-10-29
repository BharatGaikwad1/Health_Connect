import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  RefreshControl 
} from 'react-native';
import { MotiView } from '../components/Motion';
import { api } from '../services/api';

import { THEMES, TYPOGRAPHY, SHADOWS, RADIUS } from '../constants/theme';
import { 
  RefreshSyncSvg, 
  HospitalFacilitySvg, 
  BloodDropSvg, 
  MinusRemoveSvg, 
  PlusAddSvg 
} from '../components/icons';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function HospitalBloodScreen({ route }) {
  const { hospitalId } = route.params || {};
  const [bloodStock, setBloodStock] = useState(() => 
    BLOOD_GROUPS.map((group, idx) => ({
      bloodGroup: group,
      units: [18, 8, 22, 6, 12, 4, 25, 5][idx] || 10,
      status: 'Adequate'
    }))
  );
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingGroup, setUpdatingGroup] = useState(null);
  const theme = THEMES.hospital_admin;

  useEffect(() => {
    fetchHospitalData();
    fetchBloodInventory();
  }, [hospitalId]);

  const fetchHospitalData = async () => {
    if (!hospitalId) return;
    try {
      const res = await api.get(`/hospitals/${hospitalId}`);
      setHospitalInfo(res.data);
    } catch (err) {
      console.log('Unable to load hospital profile:', err.message);
    }
  };

  const fetchBloodInventory = async () => {
    if (!hospitalId) return;
    try {
      const res = await api.get(`/blood/${hospitalId}`);
      setBloodStock(res.data);
    } catch (err) {
      console.error('Error fetching blood stock:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBloodInventory();
    fetchHospitalData();
  };

  const getStockItem = (group) => {
    return bloodStock.find(item => item.bloodGroup === group) || {
      bloodGroup: group,
      units: 0,
      status: 'Critical'
    };
  };

  const updateBloodUnits = async (group, change) => {
    const current = getStockItem(group);
    const newUnits = Math.max(0, current.units + change);
    setUpdatingGroup(group);

    // Optimistic UI update
    setBloodStock(prev => {
      const exists = prev.some(item => item.bloodGroup === group);
      if (exists) {
        return prev.map(item => item.bloodGroup === group ? { ...item, units: newUnits } : item);
      }
      return [...prev, { bloodGroup: group, units: newUnits, status: newUnits <= 2 ? 'Critical' : 'Available' }];
    });

    try {
      const res = await api.put(`/blood/${hospitalId}/${encodeURIComponent(group)}`, { units: newUnits });
      // Update with server verified record
      setBloodStock(prev => prev.map(item => item.bloodGroup === group ? res.data : item));
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update blood units.');
      fetchBloodInventory();
    } finally {
      setUpdatingGroup(null);
    }
  };

  const getStatusBadgeStyle = (units) => {
    if (units <= 2) {
      return { 
        bg: '#FEE2E2', 
        text: '#DC2626', 
        label: 'CRITICAL RESERVE' 
      };
    }
    if (units <= 6) {
      return { 
        bg: '#FEF3C7', 
        text: '#D97706', 
        label: 'LOW SUPPLY' 
      };
    }
    if (units >= 25) {
      return { 
        bg: '#EDE9FE', 
        text: '#7C3AED', 
        label: 'SURPLUS' 
      };
    }
    return { 
      bg: '#ECFDF5', 
      text: '#059669', 
      label: 'STABLE RESERVE' 
    };
  };

  const totalUnits = bloodStock.reduce((acc, curr) => acc + (curr.units || 0), 0);
  const criticalCount = BLOOD_GROUPS.filter(g => getStockItem(g).units <= 2).length;
  const stableCount = BLOOD_GROUPS.filter(g => getStockItem(g).units > 6).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Dynamic Scoped Hospital Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeFacility}>
            <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />
            <Text style={[TYPOGRAPHY.micro, { color: theme.primary }]}>
              {hospitalInfo?.name ? hospitalInfo.name.toUpperCase() : 'LICENSED MEDICAL FACILITY'}
            </Text>
          </View>
          <Text style={[TYPOGRAPHY.h1, { color: theme.text, marginTop: 2 }]}>
            Blood Bank Authority
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
            Direct unit management & emergency transfusion reserve
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.syncBtn, { backgroundColor: theme.surfaceSubtle }]}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <RefreshSyncSvg size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
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
              <Text style={[TYPOGRAPHY.micro, { color: theme.success }]}>ACTIVE PORTAL</Text>
            </View>
          </MotiView>
        )}

        {/* Aggregate Telemetry Strip */}
        <MotiView 
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18 }}
          style={[styles.summaryCard, SHADOWS.soft, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <View style={styles.summaryCol}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>TOTAL UNITS</Text>
            <Text style={[TYPOGRAPHY.h1, { color: theme.text, marginTop: 4 }]}>{totalUnits}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryCol}>
            <Text style={[TYPOGRAPHY.micro, { color: '#DC2626' }]}>CRITICAL LOW</Text>
            <Text style={[TYPOGRAPHY.h1, { color: '#DC2626', marginTop: 4 }]}>{criticalCount}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryCol}>
            <Text style={[TYPOGRAPHY.micro, { color: theme.success }]}>STABLE TYPES</Text>
            <Text style={[TYPOGRAPHY.h1, { color: theme.success, marginTop: 4 }]}>{stableCount}</Text>
          </View>
        </MotiView>

        {/* Section Heading */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[TYPOGRAPHY.captionBold, { color: theme.textSecondary }]}>
            BLOOD GROUP RESERVES & INVENTORY CONTROL
          </Text>
          <Text style={[TYPOGRAPHY.micro, { color: theme.textMuted }]}>
            8 RECOGNIZED TYPES
          </Text>
        </View>

        {/* Blood Groups Grid */}
        <View style={styles.groupsGrid}>
          {BLOOD_GROUPS.map((group, index) => {
            const item = getStockItem(group);
            const badge = getStatusBadgeStyle(item.units);

            return (
              <MotiView
                key={group}
                from={{ opacity: 0, translateY: 14 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 50, type: 'timing', duration: 320 }}
                style={[
                  styles.bloodCard, 
                  SHADOWS.medium, 
                  { backgroundColor: theme.surface, borderColor: theme.border }
                ]}
              >
                {/* Blood Group Header */}
                <View style={styles.cardTopRow}>
                  <View style={styles.typeHaloWrapper}>
                    <View style={styles.bloodDropBadge}>
                      <BloodDropSvg size={18} color="#E11D48" secondaryColor="#FB7185" />
                    </View>
                    <View style={{ marginLeft: 8 }}>
                      <Text style={[TYPOGRAPHY.h2, { color: theme.text, fontWeight: '800' }]}>
                        {group}
                      </Text>
                      <Text style={[TYPOGRAPHY.micro, { color: theme.textMuted }]}>
                        Rh {group.includes('+') ? 'Positive' : 'Negative'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[TYPOGRAPHY.micro, { color: badge.text, fontSize: 10 }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Stock Level Display */}
                <View style={styles.unitDisplayRow}>
                  <View>
                    <Text style={[TYPOGRAPHY.h1, { color: theme.text, fontSize: 32, lineHeight: 36 }]}>
                      {item.units}
                    </Text>
                    <Text style={[TYPOGRAPHY.caption, { color: theme.textSecondary }]}>
                      Packaged Units (450ml)
                    </Text>
                  </View>
                </View>

                {/* Authority Stepper Controls */}
                <View style={[styles.stepperContainer, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                  <TouchableOpacity
                    style={[styles.stepperBtn, { backgroundColor: theme.surface }]}
                    onPress={() => updateBloodUnits(group, -1)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MinusRemoveSvg size={18} color={theme.text} />
                  </TouchableOpacity>

                  <View style={styles.stepperLabel}>
                    <Text style={[TYPOGRAPHY.captionBold, { color: theme.textSecondary }]}>
                      Adjust Stock
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.stepperBtn, { backgroundColor: theme.surface }]}
                    onPress={() => updateBloodUnits(group, 1)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <PlusAddSvg size={18} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </MotiView>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  badgeFacility: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  syncBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  scrollContent: {
    padding: 16,
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: 18,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 36,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  groupsGrid: {
    gap: 12,
  },
  bloodCard: {
    padding: 18,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeHaloWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodDropBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  unitDisplayRow: {
    marginBottom: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 4,
  },
  stepperBtn: {
    width: 40,
    height: 36,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperLabel: {
    flex: 1,
    alignItems: 'center',
  },
});
