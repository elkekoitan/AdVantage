import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Spinner,
  Text,
  Skeleton,
  Center,
  IBoxProps,
} from 'native-base';

interface LoadingProps extends IBoxProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'spinner' | 'skeleton' | 'overlay';
}

interface SkeletonLoaderProps {
  lines?: number;
  avatar?: boolean;
  card?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  variant = 'spinner',
  ...props
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'md':
        return 'lg';
      case 'lg':
        return 'xl';
      default:
        return 'lg';
    }
  };

  if (variant === 'overlay') {
    return (
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(255, 255, 255, 0.8)"
        zIndex={999}
        {...props}
      >
        <Center flex={1}>
          <VStack space={3} alignItems="center">
            <Spinner size={getSpinnerSize()} color="primary.500" />
            {text && (
              <Text fontSize={size === 'sm' ? 'sm' : 'md'} color="gray.600">
                {text}
              </Text>
            )}
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Center py={8} {...props}>
      <VStack space={3} alignItems="center">
        <Spinner size={getSpinnerSize()} color="primary.500" />
        {text && (
          <Text fontSize={size === 'sm' ? 'sm' : 'md'} color="gray.600">
            {text}
          </Text>
        )}
      </VStack>
    </Center>
  );
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  lines = 3,
  avatar = false,
  card = false,
}) => {
  if (card) {
    return (
      <Box bg="white" borderRadius={12} p={4} shadow={2}>
        <VStack space={3}>
          {avatar && (
            <HStack space={3} alignItems="center">
              <Skeleton size={10} rounded="full" />
              <VStack space={1} flex={1}>
                <Skeleton h={3} w="40%" rounded="md" />
                <Skeleton h={2} w="60%" rounded="md" />
              </VStack>
            </HStack>
          )}
          <VStack space={2}>
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton
                key={index}
                h={3}
                w={index === lines - 1 ? '80%' : '100%'}
                rounded="md"
              />
            ))}
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack space={3}>
      {avatar && (
        <HStack space={3} alignItems="center">
          <Skeleton size={10} rounded="full" />
          <VStack space={1} flex={1}>
            <Skeleton h={3} w="40%" rounded="md" />
            <Skeleton h={2} w="60%" rounded="md" />
          </VStack>
        </HStack>
      )}
      <VStack space={2}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            h={3}
            w={index === lines - 1 ? '80%' : '100%'}
            rounded="md"
          />
        ))}
      </VStack>
    </VStack>
  );
};

// List Skeleton Loader
interface ListSkeletonProps {
  count?: number;
  avatar?: boolean;
  showDivider?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  count = 5,
  avatar = true,
  showDivider = true,
}) => {
  return (
    <VStack space={0}>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index}>
          <Box py={3}>
            <HStack space={3} alignItems="center">
              {avatar && <Skeleton size={10} rounded="full" />}
              <VStack space={2} flex={1}>
                <Skeleton h={3} w="70%" rounded="md" />
                <Skeleton h={2} w="50%" rounded="md" />
              </VStack>
              <Skeleton h={6} w={16} rounded="md" />
            </HStack>
          </Box>
          {showDivider && index < count - 1 && (
            <Box h={0.5} bg="gray.100" />
          )}
        </Box>
      ))}
    </VStack>
  );
};

// Card Grid Skeleton
interface CardGridSkeletonProps {
  count?: number;
  columns?: number;
}

export const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({
  count = 6,
  columns = 2,
}) => {
  const rows = Math.ceil(count / columns);

  return (
    <VStack space={4}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <HStack key={rowIndex} space={4} justifyContent="space-between">
          {Array.from({ length: columns }).map((_, colIndex) => {
            const itemIndex = rowIndex * columns + colIndex;
            if (itemIndex >= count) return <Box key={colIndex} flex={1} />;
            
            return (
              <Box key={colIndex} flex={1}>
                <SkeletonLoader card lines={2} />
              </Box>
            );
          })}
        </HStack>
      ))}
    </VStack>
  );
};