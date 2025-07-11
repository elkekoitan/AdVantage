import React from 'react';
import { Badge as NBBadge, IBadgeProps, Text, HStack, Icon } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomBadgeProps extends Omit<IBadgeProps, 'leftIcon' | 'rightIcon' | 'rounded'> {
  label: string;
  variant?: 'solid' | 'outline' | 'subtle';
  colorScheme?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: string;
  rightIcon?: string;
  rounded?: boolean;
}

export const Badge: React.FC<CustomBadgeProps> = ({
  label,
  variant = 'solid',
  colorScheme = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  rounded = true,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'solid':
        return {
          bg: `${colorScheme}.500`,
          _text: { color: 'white' },
        };
      case 'outline':
        return {
          bg: 'transparent',
          borderWidth: 1,
          borderColor: `${colorScheme}.500`,
          _text: { color: `${colorScheme}.500` },
        };
      case 'subtle':
        return {
          bg: `${colorScheme}.100`,
          _text: { color: `${colorScheme}.700` },
        };
      default:
        return {
          bg: `${colorScheme}.500`,
          _text: { color: 'white' },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          px: 2,
          py: 1,
          _text: { fontSize: 'xs', fontWeight: '500' },
          iconSize: 12,
        };
      case 'md':
        return {
          px: 3,
          py: 1.5,
          _text: { fontSize: 'sm', fontWeight: '500' },
          iconSize: 14,
        };
      case 'lg':
        return {
          px: 4,
          py: 2,
          _text: { fontSize: 'md', fontWeight: '500' },
          iconSize: 16,
        };
      default:
        return {
          px: 3,
          py: 1.5,
          _text: { fontSize: 'sm', fontWeight: '500' },
          iconSize: 14,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const iconColor = variant === 'solid' ? 'white' : `${colorScheme}.500`;

  return (
    <NBBadge
      borderRadius={rounded ? 'full' : 'md' as any}
      alignSelf="flex-start"
      {...variantStyles}
      {...sizeStyles}
      {...props}
    >
      <HStack alignItems="center" space={1}>
        {leftIcon && (
          <Icon
            as={MaterialIcons}
            name={leftIcon as any}
            size={sizeStyles.iconSize}
            color={iconColor}
          />
        )}
        <Text {...sizeStyles._text} {...variantStyles._text}>
          {label}
        </Text>
        {rightIcon && (
          <Icon
            as={MaterialIcons}
            name={rightIcon as any}
            size={sizeStyles.iconSize}
            color={iconColor}
          />
        )}
      </HStack>
    </NBBadge>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'expired' | 'paused';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: 'Aktif',
          colorScheme: 'success',
          leftIcon: 'check-circle',
        };
      case 'inactive':
        return {
          label: 'Pasif',
          colorScheme: 'gray',
          leftIcon: 'pause-circle-outline',
        };
      case 'pending':
        return {
          label: 'Beklemede',
          colorScheme: 'warning',
          leftIcon: 'schedule',
        };
      case 'completed':
        return {
          label: 'Tamamlandı',
          colorScheme: 'success',
          leftIcon: 'check-circle',
        };
      case 'cancelled':
        return {
          label: 'İptal Edildi',
          colorScheme: 'danger',
          leftIcon: 'cancel',
        };
      case 'expired':
        return {
          label: 'Süresi Doldu',
          colorScheme: 'danger',
          leftIcon: 'access-time',
        };
      case 'paused':
        return {
          label: 'Duraklatıldı',
          colorScheme: 'warning',
          leftIcon: 'pause',
        };
      default:
        return {
          label: 'Bilinmiyor',
          colorScheme: 'gray',
          leftIcon: 'help-outline',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      label={config.label}
      colorScheme={config.colorScheme as any}
      leftIcon={config.leftIcon}
      size={size}
      variant="subtle"
    />
  );
};

// Priority Badge Component
interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'low':
        return {
          label: 'Düşük',
          colorScheme: 'info',
          leftIcon: 'keyboard-arrow-down' as keyof typeof MaterialIcons.glyphMap,
        };
      case 'medium':
        return {
          label: 'Orta',
          colorScheme: 'warning',
          leftIcon: 'remove' as keyof typeof MaterialIcons.glyphMap,
        };
      case 'high':
        return {
          label: 'Yüksek',
          colorScheme: 'danger',
          leftIcon: 'keyboard-arrow-up' as keyof typeof MaterialIcons.glyphMap,
        };
      case 'urgent':
        return {
          label: 'Acil',
          colorScheme: 'danger',
          leftIcon: 'priority-high' as keyof typeof MaterialIcons.glyphMap,
        };
      default:
        return {
          label: 'Orta',
          colorScheme: 'warning',
          leftIcon: 'remove' as keyof typeof MaterialIcons.glyphMap,
        };
    }
  };

  const config = getPriorityConfig();

  return (
    <Badge
      label={config.label}
      colorScheme={config.colorScheme as any}
      leftIcon={config.leftIcon}
      size={size}
      variant="solid"
    />
  );
};