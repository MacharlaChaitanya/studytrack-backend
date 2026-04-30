/**
 * Sphere — Design System Tokens
 * Extracted from Stitch "Serene Scholar" design system
 */

export const COLORS = {
  // Core Palette
  background: '#F5F5DC',       // Paper-like beige
  card: '#FAF3E0',             // Cream card surface
  primary: '#1E1E1E',          // Deep charcoal
  secondary: '#6B6B6B',        // Muted grey
  accent: '#C8A97E',           // Warm gold
  error: '#BA1A1A',            // Error red
  white: '#FFFFFF',

  // Surface Hierarchy
  surface: '#FDF8F8',
  surfaceContainer: '#F1EDEC',
  surfaceContainerLow: '#F7F3F2',
  surfaceContainerHigh: '#EBE7E6',
  surfaceContainerHighest: '#E5E2E1',
  surfaceDim: '#DDD9D8',

  // On-surface
  onSurface: '#1C1B1B',
  onSurfaceVariant: '#444748',
  onSecondaryContainer: '#626262',

  // Status Colors
  successBg: '#DCFCE7',
  successText: '#15803D',
  warningBg: '#FFEDD5',
  warningText: '#C2410C',
  infoBg: '#DBEAFE',
  infoText: '#1D4ED8',

  // Outline
  outline: '#747878',
  outlineVariant: '#C4C7C7',

  // Transparency helpers
  accentLight: 'rgba(200, 169, 126, 0.1)',
  accentMedium: 'rgba(200, 169, 126, 0.2)',
  primaryLight: 'rgba(30, 30, 30, 0.05)',
  primaryFaint: 'rgba(30, 30, 30, 0.04)',
};

export const FONTS = {
  family: 'Manrope',
  familyBold: 'Manrope-Bold',
  familySemiBold: 'Manrope-SemiBold',
  familyMedium: 'Manrope-Medium',
  familyExtraBold: 'Manrope-ExtraBold',

  // Typography presets
  h1: {
    fontFamily: 'Manrope-Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
  },
  h2: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  h3: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: 'Manrope',
    fontSize: 18,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: 'Manrope',
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: 'Manrope',
    fontSize: 14,
    lineHeight: 20,
  },
  labelCaps: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  tiny: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  containerPadding: 20,
  cardGap: 12,
};

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  ambient: {
    shadowColor: '#1E1E1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
  },
  lift: {
    shadowColor: '#1E1E1E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 4,
  },
  navBar: {
    shadowColor: '#1E1E1E',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 8,
  },
};
