import React from 'react';
import { Button as NBButton, IButtonProps } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomButtonProps extends Omit<IButtonProps, 'leftIcon' | 'rightIcon'> {
  title: string;
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: string;
  leftIcon?: string;
  rightIcon?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
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
  ...props
}) => {
  return (
    <NBButton
      variant={variant}
      size={size}
      colorScheme={colorScheme}
      isLoading={isLoading}
      isDisabled={isDisabled}
      leftIcon={
        leftIcon ? (
          <MaterialIcons name={leftIcon as any} size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
        ) : undefined
      }
      rightIcon={
        rightIcon ? (
          <MaterialIcons name={rightIcon as any} size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
        ) : undefined
      }
      _text={{
        fontSize: size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg',
        fontWeight: '600',
      }}
      borderRadius={size === 'xs' ? 6 : size === 'sm' ? 8 : size === 'md' ? 10 : 12}
      shadow={variant === 'solid' ? 2 : 0}
      {...props}
    >
      {title}
    </NBButton>
  );
};