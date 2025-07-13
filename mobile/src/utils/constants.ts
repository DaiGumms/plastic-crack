// API Configuration
export const API_CONFIG = {
  BASE_URL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5001/api/v1'
      : 'https://your-production-api.com/api/v1',
  TIMEOUT: 10000,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Plastic Crack',
  VERSION: '1.0.0',
  BUILD: '1',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@plastic_crack_token',
  USER_DATA: '@plastic_crack_user',
  THEME: '@plastic_crack_theme',
};

// Colors
export const COLORS = {
  primary: '#2196F3',
  secondary: '#FFC107',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#00BCD4',
  light: '#F5F5F5',
  dark: '#212121',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography
export const TYPOGRAPHY = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
