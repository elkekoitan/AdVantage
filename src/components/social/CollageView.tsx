import React from 'react';
import { Box, VStack, HStack, Text, Heading, Badge } from 'native-base';
import { Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CollageData } from '../../services/collageGenerator';

const { width: screenWidth } = Dimensions.get('window');

interface CollageViewProps {
  data: CollageData;
  width?: number;
  height?: number;
}

const CollageView: React.FC<CollageViewProps> = ({ data, width, height }) => {
  const { program, template, customText, showStats, showDate, showLocation } = data;

  const collageWidth = width || Math.min(screenWidth - 40, 400);
  const collageHeight = height || collageWidth / template.aspectRatio;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatBudget = (budget: number) => {
    return `₺${budget.toLocaleString()}`;
  };

  const getProgressPercentage = () => {
    const totalBudget = Number(program.total_budget || 0);
    const spentAmount = Number(program.spent_amount || 0);
    if (!totalBudget || totalBudget === 0) return 0;
    return Math.round((spentAmount / totalBudget) * 100);
  };

  const renderSingleLayout = () => (
    <VStack space={4} alignItems="center" justifyContent="center" flex={1} p={6}>
      {/* Logo/Brand */}
      <Box bg={template.accentColor} px={4} py={2} rounded="full">
        <Text fontSize="sm" fontWeight="bold" color={template.textColor}>
          AdVantage
        </Text>
      </Box>

      {/* Program Title */}
      <VStack space={2} alignItems="center">
        <Heading 
          size="lg" 
          color={template.textColor} 
          textAlign="center"
          numberOfLines={2}
        >
          {String(program.title || '')}
        </Heading>
        
        {program.description && (
          <Text 
            fontSize="md" 
            color={template.textColor} 
            textAlign="center"
            opacity={0.8}
            numberOfLines={3}
          >
            {String(program.description || '')}
          </Text>
        )}
      </VStack>

      {/* Stats */}
      {showStats && (
        <HStack space={4} flexWrap="wrap" justifyContent="center">
          {program.total_budget && (
            <Badge 
              bg={template.accentColor} 
              _text={{ color: template.textColor, fontSize: 'xs', fontWeight: 'bold' }}
              rounded="full"
              px={3}
              py={1}
            >
              {formatBudget(Number(program.total_budget || 0))}
            </Badge>
          )}
          
          {program.activities_count && (
            <Badge 
              bg={template.accentColor} 
              _text={{ color: template.textColor, fontSize: 'xs', fontWeight: 'bold' }}
              rounded="full"
              px={3}
              py={1}
            >
              {Number(program.activities_count || 0)} aktivite
            </Badge>
          )}
          
          {Number(program.total_budget || 0) > 0 && (
            <Badge 
              bg={template.accentColor} 
              _text={{ color: template.textColor, fontSize: 'xs', fontWeight: 'bold' }}
              rounded="full"
              px={3}
              py={1}
            >
              %{getProgressPercentage()} tamamlandı
            </Badge>
          )}
        </HStack>
      )}

      {/* Date and Location */}
      <VStack space={1} alignItems="center">
        {showDate && program.date && (
          <Text fontSize="sm" color={template.textColor} opacity={0.7}>
            📅 {formatDate(String(program.date || ''))}
          </Text>
        )}
        
        {showLocation && program.location && (
          <Text fontSize="sm" color={template.textColor} opacity={0.7}>
            📍 {String(program.location || '')}
          </Text>
        )}
      </VStack>

      {/* Custom Text */}
      {customText && customText !== program.title && (
        <Text 
          fontSize="sm" 
          color={template.textColor} 
          textAlign="center"
          fontStyle="italic"
          opacity={0.8}
        >
          {customText}
        </Text>
      )}
    </VStack>
  );

  const renderStoryLayout = () => (
    <VStack space={6} alignItems="center" justifyContent="space-between" flex={1} p={8}>
      {/* Header */}
      <VStack space={4} alignItems="center" flex={1} justifyContent="center">
        <Box bg={template.accentColor} px={6} py={3} rounded="full">
          <Text fontSize="lg" fontWeight="bold" color={template.textColor}>
            AdVantage
          </Text>
        </Box>

        <VStack space={3} alignItems="center">
          <Heading 
            size="xl" 
            color={template.textColor} 
            textAlign="center"
            numberOfLines={3}
          >
            {String(program.title || '')}
          </Heading>
          
          {program.description && (
            <Text 
              fontSize="lg" 
              color={template.textColor} 
              textAlign="center"
              opacity={0.9}
              numberOfLines={4}
            >
              {String(program.description || '')}
            </Text>
          )}
        </VStack>
      </VStack>

      {/* Stats Section */}
      {showStats && (
        <VStack space={4} alignItems="center" w="full">
          <VStack space={2} alignItems="center">
            {program.total_budget && (
              <HStack space={2} alignItems="center">
                <Text fontSize="2xl" fontWeight="bold" color={template.accentColor}>
                  {formatBudget(Number(program.total_budget || 0))}
                </Text>
                <Text fontSize="md" color={template.textColor} opacity={0.8}>
                  bütçe
                </Text>
              </HStack>
            )}
            
            {program.activities_count && (
              <HStack space={2} alignItems="center">
                <Text fontSize="xl" fontWeight="bold" color={template.accentColor}>
                  {Number(program.activities_count || 0)}
                </Text>
                <Text fontSize="md" color={template.textColor} opacity={0.8}>
                  aktivite
                </Text>
              </HStack>
            )}
          </VStack>
        </VStack>
      )}

      {/* Footer */}
      <VStack space={2} alignItems="center">
        {showDate && program.date && (
          <Text fontSize="md" color={template.textColor} opacity={0.8}>
            📅 {formatDate(String(program.date || ''))}
          </Text>
        )}
        
        {showLocation && program.location && (
          <Text fontSize="md" color={template.textColor} opacity={0.8}>
            📍 {String(program.location || '')}
          </Text>
        )}
      </VStack>
    </VStack>
  );

  const renderBannerLayout = () => (
    <HStack space={6} alignItems="center" flex={1} p={6}>
      {/* Left Content */}
      <VStack space={3} flex={1}>
        <Box bg={template.accentColor} px={3} py={1} rounded="md" alignSelf="flex-start">
          <Text fontSize="xs" fontWeight="bold" color={template.textColor}>
            AdVantage
          </Text>
        </Box>

        <Heading 
          size="md" 
          color={template.textColor}
          numberOfLines={2}
        >
          {String(program.title || '')}
        </Heading>
        
        {program.description && (
          <Text 
            fontSize="sm" 
            color={template.textColor} 
            opacity={0.8}
            numberOfLines={2}
          >
            {String(program.description || '')}
          </Text>
        )}

        {showDate && program.date && (
          <Text fontSize="xs" color={template.textColor} opacity={0.7}>
            📅 {formatDate(String(program.date || ''))}
          </Text>
        )}
      </VStack>

      {/* Right Stats */}
      {showStats && (
        <VStack space={2} alignItems="center" minW="120px">
          {program.total_budget && (
            <VStack space={1} alignItems="center">
              <Text fontSize="lg" fontWeight="bold" color={template.accentColor}>
                {formatBudget(Number(program.total_budget || 0))}
              </Text>
              <Text fontSize="xs" color={template.textColor} opacity={0.7}>
                bütçe
              </Text>
            </VStack>
          )}
          
          {program.activities_count && (
            <VStack space={1} alignItems="center">
              <Text fontSize="md" fontWeight="bold" color={template.accentColor}>
                {Number(program.activities_count || 0)}
              </Text>
              <Text fontSize="xs" color={template.textColor} opacity={0.7}>
                aktivite
              </Text>
            </VStack>
          )}
        </VStack>
      )}
    </HStack>
  );

  const renderLayout = () => {
    switch (template.layout) {
      case 'story':
        return renderStoryLayout();
      case 'banner':
        return renderBannerLayout();
      case 'single':
      default:
        return renderSingleLayout();
    }
  };

  const getBackgroundComponent = () => {
    if (template.backgroundColor.startsWith('linear-gradient')) {
      // Gradyan için LinearGradient kullan
      return (
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 12
          }}
        />
      );
    }
    
    return null;
  };

  return (
    <Box
      width={collageWidth}
      height={collageHeight}
      bg={template.backgroundColor.startsWith('linear-gradient') ? 'transparent' : template.backgroundColor}
      rounded="xl"
      overflow="hidden"
      position="relative"
      shadow={3}
    >
      {getBackgroundComponent()}
      {renderLayout()}
    </Box>
  );
};

export default CollageView;