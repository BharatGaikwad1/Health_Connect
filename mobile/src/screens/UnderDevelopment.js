import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MotiView } from '../components/Motion';
import { THEMES, TYPOGRAPHY, SHADOWS, RADIUS } from '../constants/theme';
import { BloodDropSvg, InfoCircleSvg } from '../components/icons';

export default function UnderDevelopment({ route }) {
  const { title } = route.params || { title: 'Module' };
  const theme = THEMES.patient;
  
  const isBloodBank = title.toLowerCase().includes('blood') || title.toLowerCase().includes('bank');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MotiView 
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        style={[styles.card, SHADOWS.medium, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        {/* Module Icon Halo */}
        <View style={[styles.iconHalo, { backgroundColor: theme.accentLight }]}>
          {isBloodBank ? (
            <BloodDropSvg size={54} color={theme.accent} secondaryColor="#F87171" />
          ) : (
            <InfoCircleSvg size={54} color={theme.primary} />
          )}
        </View>

        {/* Status Chip */}
        <View style={[styles.statusChip, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
          <View style={[styles.statusIndicator, { backgroundColor: '#F59E0B' }]} />
          <Text style={[TYPOGRAPHY.micro, { color: theme.textSecondary }]}>
            SCHEDULED FOR FUTURE RELEASE
          </Text>
        </View>

        {/* Title */}
        <Text style={[TYPOGRAPHY.h1, { color: theme.text, marginTop: 16, textAlign: 'center' }]}>
          {title}
        </Text>

        <Text style={[TYPOGRAPHY.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 22 }]}>
          This service module is currently under development. Real-time emergency bed management and hospital routing remain active and operational.
        </Text>

        {/* Technical Notice */}
        <View style={[styles.technicalBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <InfoCircleSvg size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <Text style={[TYPOGRAPHY.caption, { color: theme.textMuted, flex: 1 }]}>
            Strict protocol requirement: No active transactions or data intake permitted during development.
          </Text>
        </View>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  card: { 
    width: '100%',
    maxWidth: 400,
    padding: 32, 
    borderRadius: RADIUS.xl, 
    borderWidth: 1, 
    alignItems: 'center' 
  },
  iconHalo: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginTop: 20,
  },
  statusIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  technicalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: 24,
    width: '100%',
  }
});
