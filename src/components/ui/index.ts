// UI Components Export
export { Button } from './Button';
export { Card } from './Card';
export { Input, PasswordInput } from './Input';
export { Modal, ConfirmationModal } from './Modal';
export { Loading, SkeletonLoader, ListSkeleton, CardGridSkeleton } from './Loading';
export { Badge, StatusBadge } from './Badge';
export { Avatar, AvatarGroup, UserAvatar, CompanyAvatar } from './Avatar';

// Re-export commonly used Native Base components with custom styling
export {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  FlatList,
  SectionList,
  Pressable,
  Icon,
  Image,
  AspectRatio,
  Divider,
  Spacer,
  Center,
  Flex,
  Stack,
  Wrap,
  SimpleGrid,
} from 'native-base';

// Export types for TypeScript support
export type {
  IBoxProps,
  ITextProps,
  IHeadingProps,
  IScrollViewProps,
  IPressableProps,
  IIconProps,
  IImageProps,
} from 'native-base';