import React from 'react';
import { Button as NBButton, IButtonProps, Text } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomButtonProps extends IButtonProps {
  title: string;
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: string;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
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
          <MaterialIcons name={leftIcon} size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
        ) : undefined
      }
      rightIcon={
        rightIcon ? (
          <MaterialIcons name={rightIcon} size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
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
      <Text color={variant === 'solid' ? 'white' : colorScheme + '.600'}>
        {title}
      </Text>
    </NBButton>
  );
};