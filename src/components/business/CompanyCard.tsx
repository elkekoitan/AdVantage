import React from 'react';
import { VStack, HStack, Text, Pressable, Image, AspectRatio } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Badge, CompanyAvatar } from '../ui';

interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string;
  cover_image?: string;
  category: string;
  rating: number;
  review_count: number;
  verified: boolean;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  stats: {
    active_campaigns: number;
    total_savings: number;
    customer_count: number;
  };
  working_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}

interface CompanyCardProps {
  company: Company;
  onPress?: (company: Company) => void;
  onFollow?: (company: Company) => void;
  isFollowing?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onPress,
  onFollow,
  isFollowing = false,
  variant = 'default',
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialIcons key={`full-${i}`} name="star" size={14} color="#FFC107" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialIcons key="half" name="star-half" size={14} color="#FFC107" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <MaterialIcons key={`empty-${i}`} name="star-border" size={14} color="#E5E7EB" />
      );
    }

    return stars;
  };

  if (variant === 'compact') {
    return (
      <Card onPress={onPress ? () => onPress(company) : undefined} variant="outline">
        <HStack space={3} alignItems="center">
          <CompanyAvatar company={company} size="md" />
          
          <VStack flex={1} space={1}>
            <HStack alignItems="center" space={1}>
              <Text fontSize="md" fontWeight="600" color="gray.800" numberOfLines={1} flex={1}>
                {company.name}
              </Text>
              {company.verified && (
                <MaterialIcons name="verified" size={16} color="#2196F3" />
              )}
            </HStack>
            
            <Text fontSize="sm" color="gray.600" numberOfLines={1}>
              {company.category}
            </Text>
            
            <HStack alignItems="center" space={2}>
              <HStack alignItems="center" space={1}>
                {renderStars(company.rating)}
                <Text fontSize="xs" color="gray.500">
                  ({company.review_count})
                </Text>
              </HStack>
              
              <Badge
                label={`${company.stats.active_campaigns} kampanya`}
                colorScheme="primary"
                size="sm"
                variant="subtle"
              />
            </HStack>
          </VStack>
          
          {onFollow && (
            <Pressable
              onPress={() => onFollow(company)}
              px={3}
              py={2}
              borderRadius="md"
              bg={isFollowing ? 'gray.100' : 'primary.500'}
              _pressed={{ opacity: 0.8 }}
            >
              <Text
                fontSize="sm"
                fontWeight="600"
                color={isFollowing ? 'gray.700' : 'white'}
              >
                {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
              </Text>
            </Pressable>
          )}
        </HStack>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card onPress={onPress ? () => onPress(company) : undefined} variant="elevated">
        <VStack space={0}>
          {company.cover_image && (
            <AspectRatio w="100%" ratio={16 / 9}>
              <Image
                source={{ uri: company.cover_image }}
                alt={company.name}
                borderTopRadius={12}
                fallbackElement={
                  <VStack flex={1} justifyContent="center" alignItems="center" bg="gray.100">
                    <MaterialIcons name="business" size={48} color="#9CA3AF" />
                  </VStack>
                }
              />
            </AspectRatio>
          )}
          
          <VStack p={4} space={4}>
            <HStack justifyContent="space-between" alignItems="flex-start">
              <HStack space={3} alignItems="center" flex={1}>
                <CompanyAvatar company={company} size="lg" />
                
                <VStack flex={1} space={1}>
                  <HStack alignItems="center" space={1}>
                    <Text fontSize="lg" fontWeight="700" color="gray.800" numberOfLines={1} flex={1}>
                      {company.name}
                    </Text>
                    {company.verified && (
                      <MaterialIcons name="verified" size={20} color="#2196F3" />
                    )}
                  </HStack>
                  
                  <Text fontSize="sm" color="gray.600">
                    {company.category}
                  </Text>
                  
                  <HStack alignItems="center" space={1}>
                    {renderStars(company.rating)}
                    <Text fontSize="sm" color="gray.600" ml={1}>
                      {company.rating} ({company.review_count} değerlendirme)
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
              
              {onFollow && (
                <Pressable
                  onPress={() => onFollow(company)}
                  px={4}
                  py={2}
                  borderRadius="md"
                  bg={isFollowing ? 'gray.100' : 'primary.500'}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color={isFollowing ? 'gray.700' : 'white'}
                  >
                    {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                  </Text>
                </Pressable>
              )}
            </HStack>
            
            <Text fontSize="sm" color="gray.600" numberOfLines={3}>
              {company.description}
            </Text>
            
            <HStack justifyContent="space-around" py={3} borderWidth={1} borderColor="gray.100" borderRadius={8}>
              <VStack alignItems="center">
                <Text fontSize="lg" fontWeight="700" color="primary.600">
                  {company.stats.active_campaigns}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Aktif Kampanya
                </Text>
              </VStack>
              
              <VStack alignItems="center">
                <Text fontSize="lg" fontWeight="700" color="success.600">
                  {formatCurrency(company.stats.total_savings)}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Toplam Tasarruf
                </Text>
              </VStack>
              
              <VStack alignItems="center">
                <Text fontSize="lg" fontWeight="700" color="info.600">
                  {formatNumber(company.stats.customer_count)}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Müşteri
                </Text>
              </VStack>
            </HStack>
            
            {company.location && (
              <HStack alignItems="center" space={2}>
                <MaterialIcons name="location-on" size={16} color="#6B7280" />
                <Text fontSize="sm" color="gray.600" flex={1}>
                  {company.location}
                </Text>
              </HStack>
            )}
          </VStack>
        </VStack>
      </Card>
    );
  }

  // Default variant
  return (
    <Card onPress={onPress ? () => onPress(company) : undefined}>
      <VStack space={3}>
        <HStack justifyContent="space-between" alignItems="flex-start">
          <HStack space={3} alignItems="center" flex={1}>
            <CompanyAvatar company={company} size="md" />
            
            <VStack flex={1} space={1}>
              <HStack alignItems="center" space={1}>
                <Text fontSize="md" fontWeight="600" color="gray.800" numberOfLines={1} flex={1}>
                  {company.name}
                </Text>
                {company.verified && (
                  <MaterialIcons name="verified" size={16} color="#2196F3" />
                )}
              </HStack>
              
              <Text fontSize="sm" color="gray.600">
                {company.category}
              </Text>
              
              <HStack alignItems="center" space={1}>
                {renderStars(company.rating)}
                <Text fontSize="xs" color="gray.500" ml={1}>
                  ({company.review_count})
                </Text>
              </HStack>
            </VStack>
          </HStack>
          
          {onFollow && (
            <Pressable
              onPress={() => onFollow(company)}
              px={3}
              py={2}
              borderRadius="md"
              bg={isFollowing ? 'gray.100' : 'primary.500'}
              _pressed={{ opacity: 0.8 }}
            >
              <Text
                fontSize="sm"
                fontWeight="600"
                color={isFollowing ? 'gray.700' : 'white'}
              >
                {isFollowing ? 'Takipte' : 'Takip Et'}
              </Text>
            </Pressable>
          )}
        </HStack>
        
        <Text fontSize="sm" color="gray.600" numberOfLines={2}>
          {company.description}
        </Text>
        
        <HStack justifyContent="space-between" alignItems="center">
          <Badge
            label={`${company.stats.active_campaigns} kampanya`}
            colorScheme="primary"
            size="sm"
            variant="subtle"
            leftIcon="local-offer"
          />
          
          <Badge
            label={formatCurrency(company.stats.total_savings)}
            colorScheme="success"
            size="sm"
            variant="subtle"
            leftIcon="savings"
          />
        </HStack>
        
        {company.location && (
          <HStack alignItems="center" space={2}>
            <MaterialIcons name="location-on" size={14} color="#6B7280" />
            <Text fontSize="sm" color="gray.600" flex={1} numberOfLines={1}>
              {company.location}
            </Text>
          </HStack>
        )}
      </VStack>
    </Card>
  );
};