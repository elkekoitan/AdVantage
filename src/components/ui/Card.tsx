import React from 'react';
import { Box, IBoxProps, VStack, HStack, Heading, Text, Pressable } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

// AdVantage Design System 2025 - Modern Card Component
interface CardProps extends IBoxProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outline' | 'filled' | 'ghost' | 'glass' | 'gradient';
  onPress?: () => void;
  isDisabled?: boolean;
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  padding?: number;

  hoverEffect?: boolean;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
}

interface CardBodyProps {
  children: React.ReactNode;
}

interface CardFooterProps {
  children: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, rightElement, leftIcon }) => {
  return (
    <HStack justifyContent="space-between" alignItems="center" mb={3}>
      <HStack alignItems="center" flex={1} space={3}>
        {leftIcon && (
          <Box 
            bg="primary.100" 
            p={2} 
            borderRadius="lg"
            _dark={{
              bg: 'dark.300',
            }}
          >
            <MaterialIcons 
              name={leftIcon} 
              size={20} 
              color="#0ea5e9" 
            />
          </Box>
        )}
        <VStack flex={1}>
          <Heading 
            size="md" 
            color="gray.900"
            fontFamily="Inter"
            fontWeight="700"
            _dark={{
              color: 'dark.900',
            }}
          >
            {title}
          </Heading>
          {subtitle && (
            <Text 
              fontSize="sm" 
              color="gray.500"
              fontFamily="Inter"
              _dark={{
                color: 'dark.500',
              }}
            >
              {subtitle}
            </Text>
          )}
        </VStack>
      </HStack>
      {rightElement}
    </HStack>
  );
};

const CardBody: React.FC<CardBodyProps> = ({ children }) => {
  return <Box>{children}</Box>;
};

const CardFooter: React.FC<CardFooterProps> = ({ children }) => {
  return (
    <Box mt={3} pt={3} borderTopWidth={1} borderTopColor="gray.100">
      {children}
    </Box>
  );
};

/* eslint-disable react/prop-types */
const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({ 
  children, 
  variant = 'elevated', 
  onPress, 
  isDisabled = false, 
  rounded = '2xl',
  padding = 6,

  hoverEffect = true,
  ...props 
}) => {
  const getCardStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          bg: 'white',
          shadow: 3,
          borderWidth: 0,
          _dark: {
            bg: 'dark.100',
            shadow: 0,
            borderWidth: 1,
            borderColor: 'dark.300',
          },
        };
      case 'outline':
        return {
          bg: 'white',
          borderWidth: 2,
          borderColor: 'gray.200',
          shadow: 0,
          _dark: {
            bg: 'dark.100',
            borderColor: 'dark.300',
          },
        };
      case 'filled':
        return {
          bg: 'gray.50',
          borderWidth: 0,
          shadow: 0,
          _dark: {
            bg: 'dark.200',
          },
        };
      case 'ghost':
        return {
          bg: 'transparent',
          borderWidth: 0,
          shadow: 0,
        };
      case 'glass':
        return {
          bg: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          shadow: 0,
        };
      case 'gradient':
        return {
          bg: {
            linearGradient: {
              colors: ['primary.50', 'secondary.50'],
              start: [0, 0],
              end: [1, 1],
            },
          },
          borderWidth: 0,
          shadow: 2,
          _dark: {
            bg: {
              linearGradient: {
                colors: ['dark.200', 'dark.300'],
                start: [0, 0],
                end: [1, 1],
              },
            },
          },
        };
      default:
        return {
          bg: 'white',
          shadow: 3,
          borderWidth: 0,
          _dark: {
            bg: 'dark.100',
          },
        };
    }
  };

  const cardStyles = getCardStyles();

  const CardContent = (
    <Box
      borderRadius={rounded}
      p={padding}
      opacity={isDisabled ? 0.6 : 1}
      // Modern hover and press effects
      {...cardStyles}
      {...props}
    >
      {children}
    </Box>
  );

  if (onPress && !isDisabled) {
    return (
      <Pressable 
        onPress={onPress} 
        _pressed={{ 
          opacity: 0.8,
        }}
        _hover={hoverEffect ? {
          opacity: 0.95,
        } : {}}
      >
        {CardContent}
      </Pressable>
    );
  }

  return CardContent;
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };