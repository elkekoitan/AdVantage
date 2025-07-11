import React, { useState } from 'react';
import {
  Input as NBInput,
  IInputProps,
  FormControl,
  VStack,
  HStack,
  Text,
  Icon,
  Pressable,
  Box,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomInputProps extends IInputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'outline' | 'filled' | 'underlined' | 'unstyled';
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
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!errorMessage;

  return (
    <FormControl isRequired={isRequired} isInvalid={hasError}>
      {label && (
        <FormControl.Label
          _text={{
            fontSize: 'sm',
            fontWeight: '600',
            color: hasError ? 'danger.600' : 'gray.700',
          }}
        >
          {label}
        </FormControl.Label>
      )}
      
      <Box position="relative">
        <NBInput
          variant={variant}
          size="md"
          borderRadius={8}
          borderColor={hasError ? 'danger.400' : isFocused ? 'primary.400' : 'gray.300'}
          borderWidth={variant === 'outline' ? 1 : 0}
          bg={variant === 'filled' ? 'gray.50' : 'white'}
          _focus={{
            borderColor: hasError ? 'danger.400' : 'primary.400',
            bg: 'white',
            shadow: 1,
          }}
          _invalid={{
            borderColor: 'danger.400',
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          InputLeftElement={
            leftIcon ? (
              <Icon
                as={MaterialIcons}
                name={leftIcon}
                size={5}
                ml={3}
                color={hasError ? 'danger.400' : isFocused ? 'primary.400' : 'gray.400'}
              />
            ) : undefined
          }
          InputRightElement={
            rightIcon ? (
              <Pressable onPress={onRightIconPress} mr={3}>
                <Icon
                  as={MaterialIcons}
                  name={rightIcon}
                  size={5}
                  color={hasError ? 'danger.400' : isFocused ? 'primary.400' : 'gray.400'}
                />
              </Pressable>
            ) : undefined
          }
          {...props}
        />
      </Box>

      {hasError && (
        <FormControl.ErrorMessage
          _text={{
            fontSize: 'xs',
            color: 'danger.600',
          }}
        >
          {errorMessage}
        </FormControl.ErrorMessage>
      )}
      
      {helperText && !hasError && (
        <FormControl.HelperText
          _text={{
            fontSize: 'xs',
            color: 'gray.500',
          }}
        >
          {helperText}
        </FormControl.HelperText>
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