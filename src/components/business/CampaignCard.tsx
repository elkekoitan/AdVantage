import React from 'react';
import { VStack, HStack, Text, Pressable, Image, AspectRatio } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Badge, CompanyAvatar } from '../ui';

interface Campaign {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  discount_amount?: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'upcoming';
  category: string;
  company: {
    id: string;
    name: string;
    logo?: string;
    verified?: boolean;
  };
  image_url?: string;
  usage_count: number;
  max_usage?: number;
  location?: string;
  terms?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  onPress?: (campaign: Campaign) => void;
  onCompanyPress?: (companyId: string) => void;
  onFavorite?: (campaign: Campaign) => void;
  isFavorite?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onPress,
  onCompanyPress,
  onFavorite,
  isFavorite = false,
  variant = 'default',
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getRemainingDays = () => {
    const endDate = new Date(campaign.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = () => {
    switch (campaign.status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'danger';
      case 'upcoming':
        return 'warning';
      default:
        return 'gray';
    }
  };

  const getStatusText = () => {
    switch (campaign.status) {
      case 'active':
        return 'Aktif';
      case 'expired':
        return 'Süresi Doldu';
      case 'upcoming':
        return 'Yakında';
      default:
        return 'Bilinmiyor';
    }
  };

  const remainingDays = getRemainingDays();
  const usagePercentage = campaign.max_usage ? (campaign.usage_count / campaign.max_usage) * 100 : 0;

  if (variant === 'compact') {
    return (
      <Card onPress={onPress ? () => onPress(campaign) : undefined} variant="outline">
        <HStack space={3} alignItems="center">
          {campaign.image_url && (
            <AspectRatio w={16} h={16} ratio={1}>
              <Image
                source={{ uri: campaign.image_url }}
                alt={campaign.title}
                borderRadius={8}
                fallbackElement={
                  <MaterialIcons name="image" size={32} color="#9CA3AF" />
                }
              />
            </AspectRatio>
          )}
          
          <VStack flex={1} space={1}>
            <Text fontSize="md" fontWeight="600" color="gray.800" numberOfLines={1}>
              {campaign.title}
            </Text>
            <Text fontSize="sm" color="gray.600" numberOfLines={1}>
              {campaign.company.name}
            </Text>
            <HStack alignItems="center" space={2}>
              <Badge
                label={`%${campaign.discount_percentage} İndirim`}
                colorScheme="primary"
                size="sm"
                variant="solid"
              />
              <Badge
                label={getStatusText()}
                colorScheme={getStatusColor()}
                size="sm"
                variant="subtle"
              />
            </HStack>
          </VStack>
          
          {onFavorite && (
            <Pressable
              onPress={() => onFavorite(campaign)}
              p={2}
              borderRadius="md"
              _pressed={{ bg: 'gray.100' }}
            >
              <MaterialIcons
                name={isFavorite ? 'favorite' : 'favorite-border'}
                size={20}
                color={isFavorite ? '#EF4444' : '#6B7280'}
              />
            </Pressable>
          )}
        </HStack>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card onPress={onPress ? () => onPress(campaign) : undefined} variant="elevated">
        <VStack space={0}>
          {campaign.image_url && (
            <AspectRatio w="100%" ratio={16 / 9}>
              <Image
                source={{ uri: campaign.image_url }}
                alt={campaign.title}
                borderTopRadius={12}
                fallbackElement={
                  <VStack flex={1} justifyContent="center" alignItems="center" bg="gray.100">
                    <MaterialIcons name="image" size={48} color="#9CA3AF" />
                  </VStack>
                }
              />
            </AspectRatio>
          )}
          
          <VStack p={4} space={3}>
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1} space={1}>
                <Text fontSize="lg" fontWeight="700" color="gray.800" numberOfLines={2}>
                  {campaign.title}
                </Text>
                <Text fontSize="sm" color="gray.600" numberOfLines={2}>
                  {campaign.description}
                </Text>
              </VStack>
              
              {onFavorite && (
                <Pressable
                  onPress={() => onFavorite(campaign)}
                  p={2}
                  borderRadius="md"
                  _pressed={{ bg: 'gray.100' }}
                >
                  <MaterialIcons
                    name={isFavorite ? 'favorite' : 'favorite-border'}
                    size={24}
                    color={isFavorite ? '#EF4444' : '#6B7280'}
                  />
                </Pressable>
              )}
            </HStack>
            
            <CompanyAvatar
              company={campaign.company}
              size="sm"
              showDetails
              onPress={onCompanyPress ? () => onCompanyPress(campaign.company.id) : undefined}
            />
            
            <HStack justifyContent="space-between" alignItems="center">
              <Badge
                label={`%${campaign.discount_percentage} İndirim`}
                colorScheme="primary"
                size="lg"
                variant="solid"
                leftIcon="local-offer"
              />
              <Badge
                label={getStatusText()}
                colorScheme={getStatusColor()}
                size="md"
                variant="subtle"
              />
            </HStack>
            
            <VStack space={2}>
              {campaign.location && (
                <HStack alignItems="center" space={2}>
                  <MaterialIcons name="location-on" size={16} color="#6B7280" />
                  <Text fontSize="sm" color="gray.600" flex={1}>
                    {campaign.location}
                  </Text>
                </HStack>
              )}
              
              <HStack justifyContent="space-between" alignItems="center">
                <HStack alignItems="center" space={2}>
                  <MaterialIcons name="schedule" size={16} color="#6B7280" />
                  <Text fontSize="sm" color="gray.600">
                    {remainingDays > 0 ? `${remainingDays} gün kaldı` : 'Süresi doldu'}
                  </Text>
                </HStack>
                
                {campaign.max_usage && (
                  <HStack alignItems="center" space={2}>
                    <MaterialIcons name="people" size={16} color="#6B7280" />
                    <Text fontSize="sm" color="gray.600">
                      {campaign.usage_count}/{campaign.max_usage}
                    </Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
          </VStack>
        </VStack>
      </Card>
    );
  }

  // Default variant
  return (
    <Card onPress={onPress ? () => onPress(campaign) : undefined}>
      <VStack space={3}>
        {campaign.image_url && (
          <AspectRatio w="100%" ratio={16 / 9}>
            <Image
              source={{ uri: campaign.image_url }}
              alt={campaign.title}
              borderRadius={8}
              fallbackElement={
                <VStack flex={1} justifyContent="center" alignItems="center" bg="gray.100" borderRadius={8}>
                  <MaterialIcons name="image" size={32} color="#9CA3AF" />
                </VStack>
              }
            />
          </AspectRatio>
        )}
        
        <VStack space={3}>
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack flex={1} space={1}>
              <Text fontSize="md" fontWeight="600" color="gray.800" numberOfLines={2}>
                {campaign.title}
              </Text>
              <Text fontSize="sm" color="gray.600" numberOfLines={2}>
                {campaign.description}
              </Text>
            </VStack>
            
            {onFavorite && (
              <Pressable
                onPress={() => onFavorite(campaign)}
                p={1}
                borderRadius="md"
                _pressed={{ bg: 'gray.100' }}
              >
                <MaterialIcons
                  name={isFavorite ? 'favorite' : 'favorite-border'}
                  size={20}
                  color={isFavorite ? '#EF4444' : '#6B7280'}
                />
              </Pressable>
            )}
          </HStack>
          
          <CompanyAvatar
            company={campaign.company}
            size="sm"
            showDetails
            onPress={onCompanyPress ? () => onCompanyPress(campaign.company.id) : undefined}
          />
          
          <HStack justifyContent="space-between" alignItems="center">
            <Badge
              label={`%${campaign.discount_percentage} İndirim`}
              colorScheme="primary"
              size="md"
              variant="solid"
              leftIcon="local-offer"
            />
            <Badge
              label={getStatusText()}
              colorScheme={getStatusColor()}
              size="sm"
              variant="subtle"
            />
          </HStack>
          
          <VStack space={2}>
            {campaign.location && (
              <HStack alignItems="center" space={2}>
                <MaterialIcons name="location-on" size={14} color="#6B7280" />
                <Text fontSize="sm" color="gray.600" flex={1} numberOfLines={1}>
                  {campaign.location}
                </Text>
              </HStack>
            )}
            
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="sm" color={remainingDays <= 3 ? 'error.600' : 'gray.600'}>
                {remainingDays > 0 ? `${remainingDays} gün kaldı` : 'Süresi doldu'}
              </Text>
              
              {campaign.max_usage && (
                <Text fontSize="sm" color="gray.600">
                  {campaign.usage_count}/{campaign.max_usage} kullanım
                </Text>
              )}
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    </Card>
  );
};