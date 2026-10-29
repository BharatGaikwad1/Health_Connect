export const THEMES = {
  patient: {
    name: 'patient',
    primary: '#2563EB', // Precision cobalt blue
    primaryHover: '#1D4ED8',
    primaryLight: '#EFF6FF',
    primaryBorder: '#BFDBFE',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    accent: '#E11D48', // High-urgency crimson for SOS & emergencies
    accentLight: '#FFE4E6',
    success: '#059669',
    successLight: '#ECFDF5',
    warning: '#D97706',
    warningLight: '#FFFBEB',
  },
  hospital_admin: {
    name: 'hospital_admin',
    primary: '#0D9488', // Modern clinical teal
    primaryHover: '#0F766E',
    primaryLight: '#F0FDFA',
    primaryBorder: '#99F6E4',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F0FDFA',
    text: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    accent: '#EA580C', // Alert amber for bed saturation
    accentLight: '#FFEDD5',
    success: '#059669',
    successLight: '#ECFDF5',
    warning: '#D97706',
    warningLight: '#FFFBEB',
  },
  super_admin: {
    name: 'super_admin',
    primary: '#6366F1', // Authoritative deep indigo
    primaryHover: '#4F46E5',
    primaryLight: '#EEF2FF',
    primaryBorder: '#C7D2FE',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F5F3FF',
    text: '#090D16',
    textSecondary: '#334155',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    accent: '#9333EA',
    accentLight: '#FAF5FF',
    success: '#059669',
    successLight: '#ECFDF5',
    warning: '#D97706',
    warningLight: '#FFFBEB',
  }
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  large: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  }
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4, lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', letterSpacing: -0.1, lineHeight: 21 },
  bodyMedium: { fontSize: 15, fontWeight: '500', letterSpacing: -0.1, lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '500', letterSpacing: 0, lineHeight: 17 },
  captionBold: { fontSize: 13, fontWeight: '700', letterSpacing: 0.1, lineHeight: 17 },
  micro: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

