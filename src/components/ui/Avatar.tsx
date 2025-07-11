import React from 'react';
import {
  Avatar as NBAvatar,
  IAvatarProps,
  Box,
  Text,
  HStack,
  VStack,
  Badge,
  Pressable,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomAvatarProps extends IAvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circular' | 'rounded' | 'square';
  showBadge?: boolean;
  badgeColor?: string;
  badgePosition?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  onPress?: () => void;
  fallbackIcon?: keyof typeof MaterialIcons.glyphMap;
}

interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    id: string;
  }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  spacing?: number;
  onPress?: (id: string) => void;
}

interface UserAvatarProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
    isOnline?: boolean;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showDetails?: boolean;
  showOnlineStatus?: boolean;
  onPress?: () => void;
}

export const Avatar: React.FC<CustomAvatarProps> = ({
  src,
  name,
  size = 'md',
  variant = 'circular',
  showBadge = false,
  badgeColor = 'success.500',
  badgePosition = 'bottom-right',
  onPress,
  fallbackIcon = 'person',
  ...props
}) => {
  const getBorderRadius = () => {
    switch (variant) {
      case 'circular':
        return 'full';
      case 'rounded':
        return 'lg';
      case 'square':
        return 'none';
      default:
        return 'full';
    }
  };

  const getBadgePosition = () => {
    const positions = {
      'top-right': { top: 0, right: 0 },
      'bottom-right': { bottom: 0, right: 0 },
      'top-left': { top: 0, left: 0 },
      'bottom-left': { bottom: 0, left: 0 },
    };
    return positions[badgePosition];
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const AvatarComponent = (
    <Box position="relative">
      <NBAvatar
        size={size}
        borderRadius={getBorderRadius()}
        source={src ? { uri: src } : undefined}
        {...props}
      >
        {name ? (
          getInitials(name)
        ) : (
          <MaterialIcons name={fallbackIcon} size={size === 'xs' ? 16 : size === 'sm' ? 20 : size === 'md' ? 24 : size === 'lg' ? 32 : size === 'xl' ? 40 : 48} color="white" />
        )}
      </NBAvatar>
      
      {showBadge && (
        <Box
          position="absolute"
          {...getBadgePosition()}
          w={size === 'xs' ? 2 : size === 'sm' ? 3 : 4}
          h={size === 'xs' ? 2 : size === 'sm' ? 3 : 4}
          bg={badgeColor}
          borderRadius="full"
          borderWidth={2}
          borderColor="white"
        />
      )}
    </Box>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} _pressed={{ opacity: 0.8 }}>
        {AvatarComponent}
      </Pressable>
    );
  }

  return AvatarComponent;
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 3,
  size = 'md',
  spacing = -2,
  onPress,
}) => {
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <HStack alignItems="center">
      {displayAvatars.map((avatar, index) => (
        <Box key={avatar.id} ml={index > 0 ? spacing : 0} zIndex={displayAvatars.length - index}>
          <Avatar
            src={avatar.src}
            name={avatar.name}
            size={size}
            onPress={onPress ? () => onPress(avatar.id) : undefined}
            borderWidth={2}
            borderColor="white"
          />
        </Box>
      ))}
      
      {remainingCount > 0 && (
        <Box ml={spacing} zIndex={0}>
          <NBAvatar size={size} bg="gray.400" borderWidth={2} borderColor="white">
            <Text color="white" fontSize={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} fontWeight="600">
              +{remainingCount}
            </Text>
          </NBAvatar>
        </Box>
      )}
    </HStack>
  );
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showDetails = false,
  showOnlineStatus = false,
  onPress,
}) => {
  const AvatarWithStatus = (
    <Avatar
      src={user.avatar}
      name={user.name}
      size={size}
      showBadge={showOnlineStatus && user.isOnline}
      badgeColor={user.isOnline ? 'success.500' : 'gray.400'}
      onPress={onPress}
    />
  );

  if (!showDetails) {
    return AvatarWithStatus;
  }

  const Component = (
    <HStack space={3} alignItems="center">
      {AvatarWithStatus}
      <VStack flex={1}>
        <Text fontSize={size === 'xs' ? 'sm' : size === 'sm' ? 'md' : 'lg'} fontWeight="600" color="gray.800">
          {user.name}
        </Text>
        {user.email && (
          <Text fontSize={size === 'xs' ? 'xs' : 'sm'} color="gray.500">
            {user.email}
          </Text>
        )}
        {showOnlineStatus && (
          <Text fontSize="xs" color={user.isOnline ? 'success.600' : 'gray.400'}>
            {user.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
          </Text>
        )}
      </VStack>
    </HStack>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} _pressed={{ opacity: 0.8 }}>
        {Component}
      </Pressable>
    );
  }

  return Component;
};

// Company Avatar Component
interface CompanyAvatarProps {
  company: {
    id: string;
    name: string;
    logo?: string;
    category?: string;
    verified?: boolean;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showDetails?: boolean;
  onPress?: () => void;
}

export const CompanyAvatar: React.FC<CompanyAvatarProps> = ({
  company,
  size = 'md',
  showDetails = false,
  onPress,
}) => {
  const AvatarWithVerification = (
    <Box position="relative">
      <Avatar
        src={company.logo}
        name={company.name}
        size={size}
        variant="rounded"
        fallbackIcon="business"
        onPress={onPress}
      />
      {company.verified && (
        <Box
          position="absolute"
          bottom={-1}
          right={-1}
          bg="primary.500"
          borderRadius="full"
          p={0.5}
          borderWidth={2}
          borderColor="white"
        >
          <MaterialIcons name="verified" size={12} color="white" />
        </Box>
      )}
    </Box>
  );

  if (!showDetails) {
    return AvatarWithVerification;
  }

  const Component = (
    <HStack space={3} alignItems="center">
      {AvatarWithVerification}
      <VStack flex={1}>
        <HStack alignItems="center" space={1}>
          <Text fontSize={size === 'xs' ? 'sm' : size === 'sm' ? 'md' : 'lg'} fontWeight="600" color="gray.800">
            {company.name}
          </Text>
          {company.verified && (
            <MaterialIcons name="verified" size={16} color="#2196F3" />
          )}
        </HStack>
        {company.category && (
          <Text fontSize={size === 'xs' ? 'xs' : 'sm'} color="gray.500">
            {company.category}
          </Text>
        )}
      </VStack>
    </HStack>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} _pressed={{ opacity: 0.8 }}>
        {Component}
      </Pressable>
    );
  }

  return Component;
};