export const colors = {
  primary: '#C1793D',
  primaryDark: '#9C5A26',
  primaryLight: '#FBEADA',

  secondary: '#7A4B23',
  secondaryLight: '#F3E4D3',

  accent: '#E0A458',
  accentLight: '#FDF3E7',

  success: '#3F8F5F',
  successLight: '#E4F4E9',
  warning: '#C9822B',
  warningLight: '#FBEEDC',
  danger: '#C1502E',
  dangerLight: '#FBE7E0',

  background: '#FDF7F1',
  surface: '#FFFFFF',
  surfaceAlt: '#FBF2E8',
  border: '#EFDFCB',

  textPrimary: '#3A2A1B',
  textSecondary: '#8A6E56',
  textMuted: '#B8A38C',
  textInverse: '#FFFFFF',

  overlay: 'rgba(58, 42, 27, 0.55)',
} as const;

export const gradients = {
  primary: ['#D98F4E', '#B0602A'] as const,
  hero: ['#F3A65A', '#C1793D', '#8C5423'] as const,
  card: ['#FFFFFF', '#FBEADA'] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34, letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#7A4B23',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  soft: {
    shadowColor: '#7A4B23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  glow: {
    shadowColor: '#C1793D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
} as const;
