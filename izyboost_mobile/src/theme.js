
export const COLORS = {
  primary: '#10B981', // Emerald Green (matching "growth/boost")
  secondary: '#3B82F6', // Blue
  accent: '#F59E0B', // Orange
  background: '#F9FAFB', // Light Gray Background for modern feel
  surface: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
  white: '#FFFFFF',
  black: '#000000',
  success: '#10B981',
  error: '#EF4444',
  border: '#E5E7EB',
  inputBackground: '#F3F4F6',
  gray: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const FONTS = {
  bold: { fontWeight: '700' },
  medium: { fontWeight: '500' },
  regular: { fontWeight: '400' },
  // If custom fonts are loaded later, update here: E.g., fontFamily: 'Inter-Bold'
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5.46,
    elevation: 5,
  },
};
