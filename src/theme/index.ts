import { extendTheme } from 'native-base';

// AdVantage Design System 2025
export const theme = extendTheme({
  colors: {
    // Modern Primary Colors (Blue)
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Ana mavi
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    // Modern Secondary Colors (Purple)
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef', // Ana mor
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    // System Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#10b981', // Ana yeşil
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Ana sarı
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Ana kırmızı
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Ana bilgi mavisi
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // Light Theme Neutrals
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    // Dark Theme Neutrals
    dark: {
      50: '#18181b',
      100: '#27272a',
      200: '#3f3f46',
      300: '#52525b',
      400: '#71717a',
      500: '#a1a1aa',
      600: '#d4d4d8',
      700: '#e4e4e7',
      800: '#f4f4f5',
      900: '#fafafa',
    },
  },
  // Modern Typography System
  fontConfig: {
    Inter: {
      100: {
        normal: 'Inter-Thin',
      },
      200: {
        normal: 'Inter-ExtraLight',
      },
      300: {
        normal: 'Inter-Light',
      },
      400: {
        normal: 'Inter-Regular',
      },
      500: {
        normal: 'Inter-Medium',
      },
      600: {
        normal: 'Inter-SemiBold',
      },
      700: {
        normal: 'Inter-Bold',
      },
      800: {
        normal: 'Inter-ExtraBold',
      },
      900: {
        normal: 'Inter-Black',
      },
    },
    JetBrainsMono: {
      400: {
        normal: 'JetBrainsMono-Regular',
      },
      500: {
        normal: 'JetBrainsMono-Medium',
      },
      700: {
        normal: 'JetBrainsMono-Bold',
      },
    },
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrainsMono',
  },
  fontSizes: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },
  lineHeights: {
    '2xs': 16,
    xs: 18,
    sm: 20,
    md: 22,
    lg: 24,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },
  // Modern Spacing System
  space: {
    px: '1px',
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
    36: 144,
    40: 160,
    44: 176,
    48: 192,
    52: 208,
    56: 224,
    60: 240,
    64: 256,
    72: 288,
    80: 320,
    96: 384,
  },
  // Modern Border Radius
  radii: {
    none: 0,
    sm: 4,
    base: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },
  // Modern Component Styles
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'xl',
        _text: {
          fontWeight: '600',
        },
      },
      variants: {
        solid: {
          shadow: 2,
          _pressed: {
            shadow: 1,
            transform: [{ scale: 0.98 }],
          },
        },
        outline: {
          borderWidth: 2,
          _pressed: {
            transform: [{ scale: 0.98 }],
          },
        },
        ghost: {
          _pressed: {
            transform: [{ scale: 0.98 }],
          },
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          _pressed: {
            bg: 'rgba(255, 255, 255, 0.2)',
            transform: [{ scale: 0.98 }],
          },
        },
      },
      sizes: {
        sm: {
          px: 4,
          py: 2,
          _text: { fontSize: 'sm' },
        },
        md: {
          px: 6,
          py: 3,
          _text: { fontSize: 'md' },
        },
        lg: {
          px: 8,
          py: 4,
          _text: { fontSize: 'lg' },
        },
      },
      defaultProps: {
        size: 'md',
        variant: 'solid',
        colorScheme: 'primary',
      },
    },
    Input: {
      baseStyle: {
        borderRadius: 'xl',
        borderWidth: 2,
        fontSize: 'md',
        px: 4,
        py: 3,
        _focus: {
          borderColor: 'primary.500',
          shadow: 3,
        },
      },
      variants: {
        outline: {
          bg: 'transparent',
          borderColor: 'gray.300',
          _dark: {
            borderColor: 'dark.300',
            bg: 'dark.100',
          },
        },
        filled: {
          bg: 'gray.100',
          borderColor: 'transparent',
          _dark: {
            bg: 'dark.200',
          },
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        },
      },
      defaultProps: {
        variant: 'outline',
        size: 'md',
      },
    },
    Box: {
      variants: {
        card: {
          bg: 'white',
          borderRadius: '2xl',
          shadow: 2,
          p: 6,
          _dark: {
            bg: 'dark.100',
          },
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2xl',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    Text: {
      variants: {
        heading: {
          fontWeight: '700',
          color: 'gray.900',
          _dark: {
            color: 'dark.900',
          },
        },
        body: {
          fontWeight: '400',
          color: 'gray.700',
          _dark: {
            color: 'dark.700',
          },
        },
        caption: {
          fontWeight: '400',
          fontSize: 'sm',
          color: 'gray.500',
          _dark: {
            color: 'dark.500',
          },
        },
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});