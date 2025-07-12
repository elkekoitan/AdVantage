import React from 'react';
import PropTypes from 'prop-types';
import { Box, IBoxProps, VStack, HStack, Heading, Text, Pressable } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

interface CardProps extends IBoxProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outline' | 'filled' | 'ghost';
  onPress?: () => void;
  isDisabled?: boolean;
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
    <HStack justifyContent="space-between" alignItems="center" mb={2}>
      <HStack alignItems="center" flex={1}>
        {leftIcon && (
          <MaterialIcons name={leftIcon} size={20} color="#374151" style={{ marginRight: 8 }} />
        )}
        <VStack flex={1}>
          <Heading size="sm" color="gray.800">
            {title}
          </Heading>
          {subtitle && (
            <Text fontSize="xs" color="gray.500">
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

const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({ children, variant = 'elevated', onPress, isDisabled = false, ...props }) => {
  const getCardStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          bg: 'white',
          shadow: 3,
          borderWidth: 0,
        };
      case 'outline':
        return {
          bg: 'white',
          borderWidth: 1,
          borderColor: 'gray.200',
          shadow: 0,
        };
      case 'filled':
        return {
          bg: 'gray.50',
          borderWidth: 0,
          shadow: 0,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          borderWidth: 0,
          shadow: 0,
        };
      default:
        return {
          bg: 'white',
          shadow: 3,
          borderWidth: 0,
        };
    }
  };

  const cardStyles = getCardStyles();

  const CardContent = (
    <Box
      borderRadius={12}
      p={4}
      opacity={isDisabled ? 0.6 : 1}
      {...cardStyles}
      {...props}
    >
      {children}
    </Box>
  );

  if (onPress && !isDisabled) {
    return (
      <Pressable onPress={onPress} _pressed={{ opacity: 0.8 }}>
        {CardContent}
      </Pressable>
    );
  }

  return CardContent;
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

Card.propTypes = {
  children: PropTypes.any.isRequired,
  variant: PropTypes.oneOf(['elevated', 'outline', 'filled', 'ghost']),
  onPress: PropTypes.func,
  isDisabled: PropTypes.bool,
};

Card.defaultProps = {
  variant: 'elevated',
  isDisabled: false,
};

export { Card };