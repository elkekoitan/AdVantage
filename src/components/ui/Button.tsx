import React from 'react';
import { Button as NBButton, IButtonProps } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

// AdVantage Design System 2025 - Modern Button Component
interface CustomButtonProps extends Omit<IButtonProps, 'leftIcon' | 'rightIcon'> {
  title: string;
  variant?: 'solid' | 'outline' | 'ghost' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colorScheme?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  hapticFeedback?: boolean;
}

export const Button: React.FC<CustomButtonProps> = ({
  title,
  variant = 'solid',
  size = 'md',
  colorScheme = 'primary',
  leftIcon,
  rightIcon,
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  rounded = '2xl',
  hapticFeedback = true,
  ...props
}) => {
  // Icon size mapping
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'md': return 18;
      case 'lg': return 20;
      case 'xl': return 22;
      default: return 18;
    }
  };

  // 2025 Design System - Enhanced variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          bg: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          _pressed: {
            bg: 'rgba(255, 255, 255, 0.2)',
            opacity: 0.8,
          },
          _text: {
            color: 'white',
            fontWeight: '600',
          },
        };
      case 'gradient':
        return {
          bg: `${colorScheme}.500`,
          _pressed: {
            opacity: 0.8,
          },
          _text: {
            color: 'white',
            fontWeight: '600',
            fontFamily: 'Inter',
          },
        };
      default:
        return {
          _pressed: {
            opacity: 0.8,
          },
          _text: {
            fontWeight: '600',
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <NBButton
      variant={variant === 'glass' || variant === 'gradient' ? 'solid' : variant}
      size={size}
      colorScheme={colorScheme}
      isLoading={isLoading}
      isDisabled={isDisabled}
      width={fullWidth ? 'full' : undefined}
      borderRadius={rounded}
      leftIcon={
        leftIcon ? (
          <MaterialIcons name={leftIcon} size={getIconSize()} />
        ) : undefined
      }
      rightIcon={
        rightIcon ? (
          <MaterialIcons name={rightIcon} size={getIconSize()} />
        ) : undefined
      }
      // Apply custom variant styles
      {...variantStyles}
      // Override with default styles if not set in variant
       _text={{
         ...variantStyles._text,
         fontWeight: variantStyles._text?.fontWeight || '600',
         fontFamily: variantStyles._text?.fontFamily || 'Inter',
       }}
       _pressed={{
         ...variantStyles._pressed,
         opacity: variantStyles._pressed?.opacity || 0.8,
       }}
      {...props}
    >
      {title}
    </NBButton>
  );
};