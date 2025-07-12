import React, { useState } from 'react';
import {
  Input as NBInput,
  IInputProps,
  FormControl,
  Icon,
  Pressable,
  Box,
  Text,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

// AdVantage Design System - Modern Input Component
interface CustomInputProps extends IInputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'outline' | 'filled' | 'glass' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'md' | 'lg' | 'xl' | '2xl';
}

export const Input: React.FC<CustomInputProps> = ({
  label,
  helperText,
  errorMessage,
  isRequired = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outline',
  size = 'md',
  rounded = 'xl',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!errorMessage;
  const isFloating = variant === 'floating';

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          borderWidth: 2,
          borderColor: hasError ? 'danger.400' : isFocused ? 'primary.500' : 'gray.300',
          bg: 'white',
          _dark: {
            bg: 'dark.100',
            borderColor: hasError ? 'danger.400' : isFocused ? 'primary.500' : 'dark.300',
          },
        };
      case 'filled':
        return {
          borderWidth: 0,
          bg: 'gray.100',
          _dark: {
            bg: 'dark.200',
          },
        };
      case 'glass':
        return {
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          bg: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        };
      case 'floating':
        return {
          borderWidth: 2,
          borderColor: hasError ? 'danger.400' : isFocused ? 'primary.500' : 'gray.300',
          bg: 'white',
          _dark: {
            bg: 'dark.100',
            borderColor: hasError ? 'danger.400' : isFocused ? 'primary.500' : 'dark.300',
          },
        };
      default:
        return {};
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          fontSize: 'sm',
          py: 2,
          px: 3,
        };
      case 'md':
        return {
          fontSize: 'md',
          py: 3,
          px: 4,
        };
      case 'lg':
        return {
          fontSize: 'lg',
          py: 4,
          px: 5,
        };
      default:
        return {};
    }
  };

  return (
    <FormControl isRequired={isRequired} isInvalid={hasError}>
      {label && !isFloating && (
        <Text
          fontSize="sm"
          fontWeight="600"
          fontFamily="Inter"
          color={hasError ? 'danger.600' : 'gray.700'}
          mb={2}
          _dark={{
            color: hasError ? 'danger.400' : 'dark.700',
          }}
        >
          {label}
          {isRequired && (
            <Text color="danger.500" ml={1}>
              *
            </Text>
          )}
        </Text>
      )}
      
      <Box position="relative">
        <NBInput
          variant={variant === 'glass' || variant === 'floating' ? 'outline' : (variant as any)}
          borderRadius={rounded}
          fontFamily="Inter"
          _focus={{
            borderColor: hasError ? 'danger.400' : 'primary.500',
            shadow: 3,
          }}
          _invalid={{
            borderColor: 'danger.400',
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          InputLeftElement={
            leftIcon ? (
              <Box ml={4}>
                <Icon
                  as={MaterialIcons}
                  name={leftIcon}
                  size={size === 'sm' ? 4 : size === 'md' ? 5 : 6}
                  color={hasError ? 'danger.400' : isFocused ? 'primary.500' : 'gray.400'}
                />
              </Box>
            ) : undefined
          }
          InputRightElement={
            rightIcon ? (
              <Pressable 
                onPress={onRightIconPress} 
                mr={4}
                _pressed={{
                  opacity: 0.7
                }}
              >
                <Icon
                  as={MaterialIcons}
                  name={rightIcon}
                  size={size === 'sm' ? 4 : size === 'md' ? 5 : 6}
                  color={hasError ? 'danger.400' : isFocused ? 'primary.500' : 'gray.400'}
                />
              </Pressable>
            ) : undefined
          }
          {...getVariantStyles()}
          {...getSizeStyles()}
          {...props}
        />
        
        {/* Floating Label */}
        {isFloating && label && (
          <Box
            position="absolute"
            left={4}
            top={isFocused || props.value ? -2 : 3}
            bg={'white'}
            px={2}
            zIndex={1}
            _dark={{
              bg: 'dark.100',
            }}
          >
            <Text
              fontSize={isFocused || props.value ? 'xs' : 'md'}
              fontWeight="500"
              fontFamily="Inter"
              color={hasError ? 'danger.600' : isFocused ? 'primary.500' : 'gray.500'}
              _dark={{
                color: hasError ? 'danger.400' : isFocused ? 'primary.400' : 'dark.500',
              }}
            >
              {label}
              {isRequired && (
                <Text color="danger.500" ml={1}>
                  *
                </Text>
              )}
            </Text>
          </Box>
        )}
      </Box>

      {hasError && (
        <Text
          fontSize="xs"
          color="danger.600"
          fontFamily="Inter"
          mt={1}
          _dark={{
            color: 'danger.400',
          }}
        >
          {errorMessage}
        </Text>
      )}
      
      {helperText && !hasError && (
        <Text
          fontSize="xs"
          color="gray.500"
          fontFamily="Inter"
          mt={1}
          _dark={{
            color: 'dark.500',
          }}
        >
          {helperText}
        </Text>
      )}
    </FormControl>
  );
};

// Password Input Component
interface PasswordInputProps extends Omit<CustomInputProps, 'rightIcon' | 'onRightIconPress' | 'type'> {
  showPasswordToggle?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  showPasswordToggle = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      type={showPassword ? 'text' : 'password'}
      rightIcon={showPasswordToggle ? (showPassword ? 'visibility-off' : 'visibility') : undefined}
      onRightIconPress={showPasswordToggle ? () => setShowPassword(!showPassword) : undefined}
      {...props}
    />
  );
};