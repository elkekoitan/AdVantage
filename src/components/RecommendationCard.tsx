import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Button,
  useTheme,
  useColorModeValue,
  Image,
  IconButton,
  Modal,
  ScrollView,
  Divider,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { AIRecommendation } from '../services/aiAssistantService';
import { Card } from './ui/Card';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onAccept?: (recommendation: AIRecommendation) => void;
  onDismiss?: (recommendation: AIRecommendation) => void;
  onViewDetails?: (recommendation: AIRecommendation) => void;
}



export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAccept,
  onDismiss,
  onViewDetails,
}) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Theme colors
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const getTypeIcon = (type: string) => {
    const icons = {
      restaurant: 'restaurant',
      shopping: 'shopping-bag',
      entertainment: 'movie',
      sport: 'fitness-center',
      travel: 'flight',
      health: 'local-hospital',
      education: 'school',
      service: 'build',
      other: 'star',
    };
    return icons[type as keyof typeof icons] || 'star';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      restaurant: 'orange',
      shopping: 'purple',
      entertainment: 'pink',
      sport: 'green',
      travel: 'blue',
      health: 'red',
      education: 'indigo',
      service: 'cyan',
      other: 'gray',
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  const formatCurrency = (amount: number) => {
    return `₺${amount.toLocaleString()}`;
  };

  const handleAccept = () => {
    onAccept?.(recommendation);
  };

  const handleDismiss = () => {
    onDismiss?.(recommendation);
  };

  const handleViewDetails = () => {
    setShowDetails(true);
    onViewDetails?.(recommendation);
  };

  const renderMainCard = () => {
    const typeColor = getTypeColor(recommendation.category);
    
    return (
      <Card variant="elevated" padding={0} overflow="hidden">
        {/* Header with Image/Icon */}
        <Box position="relative">
          {recommendation.image ? (
            <Image
              source={{ uri: recommendation.image }}
              alt={recommendation.title}
              height={48}
              width="100%"
              resizeMode="cover"
            />
          ) : (
            <Box
              height={48}
              bg={typeColor + '.500'}
              justifyContent="center"
              alignItems="center"
            >
              <MaterialIcons
                name={getTypeIcon(recommendation.category) as any}
                size={40}
                color="white"
              />
            </Box>
          )}
          
          {/* Priority Badge */}
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorScheme="blue"
            variant="solid"
            rounded="full"
          >
            {recommendation.category.toUpperCase()}
          </Badge>
          
          {/* Discount Badge */}
          {recommendation.discount && (
            <Badge
              position="absolute"
              bottom={2}
              left={2}
              colorScheme="red"
              variant="solid"
              rounded="full"
            >
              %{recommendation.discount} İNDİRİM
            </Badge>
          )}
        </Box>

        {/* Content */}
        <VStack space={3} p={4}>
          {/* Title and Category */}
          <VStack space={1}>
            <HStack justifyContent="space-between" alignItems="flex-start">
              <Heading size="md" color={textColor} flex={1} numberOfLines={2}>
                {recommendation.title}
              </Heading>
              <IconButton
                icon={<MaterialIcons name="more-vert" size={20} />}
                variant="ghost"
                size="sm"
                onPress={() => setIsExpanded(!isExpanded)}
              />
            </HStack>
            
            <Badge
              colorScheme={typeColor}
              variant="outline"
              rounded="md"
              alignSelf="flex-start"
            >
              {recommendation.category}
            </Badge>
          </VStack>

          {/* Description */}
          <Text
            fontSize="sm"
            color={mutedColor}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {recommendation.description}
          </Text>

          {/* Location and Distance */}
          {recommendation.location && (
            <HStack space={2} alignItems="center">
              <MaterialIcons name="location-on" size={16} color={theme.colors.gray[500]} />
              <VStack flex={1}>
                <Text fontSize="sm" fontWeight="500" color={textColor}>
                  {recommendation.location}
                </Text>
              </VStack>
            </HStack>
          )}

          {/* Price */}
          {recommendation.price && (
            <HStack space={2} alignItems="center">
              <MaterialIcons name="account-balance-wallet" size={16} color={theme.colors.gray[500]} />
              <Text fontSize="sm" color={textColor}>
                {formatCurrency(recommendation.price)}
              </Text>
              {recommendation.discount && recommendation.discount > 0 && (
                <Text fontSize="xs" color="green.500" fontWeight="500">
                  %{recommendation.discount} İndirim
                </Text>
              )}
            </HStack>
          )}

          {/* Rating */}
          {recommendation.rating && (
            <HStack space={2} alignItems="center">
              <MaterialIcons name="star" size={16} color={theme.colors.yellow[500]} />
              <Text fontSize="sm" color={textColor} fontWeight="500">
                {recommendation.rating.toFixed(1)}
              </Text>
              <Text fontSize="xs" color={mutedColor}>

              </Text>
            </HStack>
          )}

          {/* Tags */}
          {recommendation.tags && recommendation.tags.length > 0 && (
            <HStack space={1} flexWrap="wrap">
              {recommendation.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  colorScheme="gray"
                  variant="subtle"
                  rounded="full"
                  size="sm"
                >
                  {tag}
                </Badge>
              ))}
              {recommendation.tags.length > 3 && (
                <Badge
                  colorScheme="gray"
                  variant="subtle"
                  rounded="full"
                  size="sm"
                >
                  +{recommendation.tags.length - 3}
                </Badge>
              )}
            </HStack>
          )}

          {/* Expanded Content */}
          {isExpanded && (
            <VStack space={3} mt={2}>
              <Divider />
              

              

            </VStack>
          )}

          {/* Action Buttons */}
          <HStack space={2} mt={3}>
            <Button
              flex={1}
              colorScheme="primary"
              size="sm"
              leftIcon={<MaterialIcons name="check" size={16} color="white" />}
              onPress={handleAccept}
            >
              Kabul Et
            </Button>
            
            <Button
              flex={1}
              variant="outline"
              colorScheme="gray"
              size="sm"
              leftIcon={<MaterialIcons name="info" size={16} />}
              onPress={handleViewDetails}
            >
              Detaylar
            </Button>
            
            <IconButton
              icon={<MaterialIcons name="close" size={16} />}
              variant="ghost"
              colorScheme="gray"
              size="sm"
              onPress={handleDismiss}
            />
          </HStack>
        </VStack>
      </Card>
    );
  };

  const renderDetailsModal = () => (
    <Modal isOpen={showDetails} onClose={() => setShowDetails(false)} size="lg">
      <Modal.Content>
        <Modal.Header>
          <VStack space={1}>
            <Text fontSize="lg" fontWeight="bold">
              {recommendation.title}
            </Text>
            <Badge
              colorScheme={getTypeColor(recommendation.category)}
              variant="outline"
              rounded="md"
              alignSelf="flex-start"
            >
              {recommendation.category}
            </Badge>
          </VStack>
        </Modal.Header>
        
        <Modal.Body>
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={4}>
              {/* Image */}
              {recommendation.image && (
                <Image
                  source={{ uri: recommendation.image }}
                  alt={recommendation.title}
                  height={48}
                  width="100%"
                  resizeMode="cover"
                  rounded="md"
                />
              )}
              
              {/* Description */}
              <VStack space={2}>
                <Text fontSize="md" fontWeight="500" color={textColor}>
                  📝 Açıklama
                </Text>
                <Text fontSize="sm" color={mutedColor}>
                  {recommendation.description}
                </Text>
              </VStack>
              
              {/* Location Details */}
              {recommendation.location && (
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="500" color={textColor}>
                    📍 Konum Bilgileri
                  </Text>
                  <VStack space={1}>
                    <Text fontSize="sm" color={textColor}>
                      {recommendation.location}
                    </Text>
                  </VStack>
                </VStack>
              )}
              
              {/* Price and Discount */}
              <VStack space={2}>
                <Text fontSize="md" fontWeight="500" color={textColor}>
                  💰 Fiyat Bilgileri
                </Text>
                <HStack space={2} alignItems="center">
                  <Text fontSize="sm" color={textColor}>
                    {formatCurrency(recommendation.price)}
                  </Text>
                  {recommendation.discount && recommendation.discount > 0 && (
                    <Badge colorScheme="red" variant="solid" rounded="full">
                      %{recommendation.discount} İndirim
                    </Badge>
                  )}
                </HStack>
              </VStack>
              
              {/* Rating Details */}
              {recommendation.rating && (
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="500" color={textColor}>
                    ⭐ Değerlendirmeler
                  </Text>
                  <HStack space={2} alignItems="center">
                    <Text fontSize="sm" color={textColor}>
                      {recommendation.rating.toFixed(1)} / 5.0
                    </Text>
                  </HStack>
                </VStack>
              )}
              

              
              {/* All Tags */}
              {recommendation.tags && recommendation.tags.length > 0 && (
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="500" color={textColor}>
                    🏷️ Etiketler
                  </Text>
                  <HStack space={1} flexWrap="wrap">
                    {recommendation.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        colorScheme="gray"
                        variant="subtle"
                        rounded="full"
                        size="sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              )}
            </VStack>
          </ScrollView>
        </Modal.Body>
        
        <Modal.Footer>
          <HStack space={2} flex={1}>
            <Button
              flex={1}
              colorScheme="primary"
              onPress={() => {
                handleAccept();
                setShowDetails(false);
              }}
            >
              Kabul Et
            </Button>
            <Button
              flex={1}
              variant="outline"
              onPress={() => setShowDetails(false)}
            >
              Kapat
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );

  return (
    <>
      {renderMainCard()}
      {renderDetailsModal()}
    </>
  );
};

export default RecommendationCard;