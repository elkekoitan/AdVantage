import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Pressable,
  useColorModeValue,
} from 'native-base';
import { Dimensions, Animated } from 'react-native';

interface MenuItem {
  image: string;
  link: string;
  title: string;
  description: string;
  id?: string;
}

interface InfiniteMenuProps {
  items: MenuItem[];
  onItemSelect?: (item: MenuItem) => void;
  height?: number;
  autoExpire?: boolean;
  expireDuration?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const InfiniteMenu: React.FC<InfiniteMenuProps> = ({
  items,
  onItemSelect,
  height = 600,
  autoExpire = false,
  expireDuration = 5000,
}) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [fadeAnims] = useState(() => 
    items.map(() => new Animated.Value(1))
  );
  const [scaleAnims] = useState(() => 
    items.map(() => new Animated.Value(1))
  );
  const [isExpired, setIsExpired] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBorderColor = useColorModeValue('primary.500', 'primary.400');

  useEffect(() => {
    if (selectedItem && autoExpire) {
      const timer = setTimeout(() => {
        // Explosion animation
        Animated.parallel([
          Animated.timing(scaleAnims[items.findIndex(item => item === selectedItem)], {
            toValue: 2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnims[items.findIndex(item => item === selectedItem)], {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsExpired(true);
        });
      }, expireDuration);

      return () => clearTimeout(timer);
    }
  }, [selectedItem, autoExpire, expireDuration]);

  const handleItemPress = (item: MenuItem, index: number) => {
    if (selectedItem === item || isExpired) return;

    setSelectedItem(item);
    onItemSelect?.(item);

    // Fade out other items
    items.forEach((_, i) => {
      if (i !== index) {
        Animated.timing(fadeAnims[i], {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });

    // Highlight selected item
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetSelection = () => {
    setSelectedItem(null);
    setIsExpired(false);
    
    // Reset all animations
    items.forEach((_, i) => {
      Animated.parallel([
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[i], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  if (isExpired) {
    return (
      <Box 
        height={height} 
        justifyContent="center" 
        alignItems="center"
        bg={bgColor}
        borderRadius="lg"
      >
        <VStack space={4} alignItems="center">
          <Text fontSize="lg" color="gray.500">
            Seçim süresi doldu
          </Text>
          <Pressable
            onPress={resetSelection}
            bg="primary.500"
            px={6}
            py={3}
            borderRadius="lg"
          >
            <Text color="white" fontWeight="bold">
              Yeniden Seç
            </Text>
          </Pressable>
        </VStack>
      </Box>
    );
  }

  return (
    <Box height={height} position="relative" bg={bgColor} borderRadius="lg" overflow="hidden">
      <VStack space={4} p={4} flex={1}>
        {items.map((item, index) => {
          const isSelected = selectedItem === item;
          const itemWidth = screenWidth / 2 - 32; // Responsive width
          
          return (
            <Animated.View
              key={item.id || index}
              style={{
                opacity: fadeAnims[index],
                transform: [{ scale: scaleAnims[index] }],
              }}
            >
              <Pressable
                onPress={() => handleItemPress(item, index)}
                disabled={selectedItem !== null && !isSelected}
              >
                <Box
                  bg={bgColor}
                  borderWidth={2}
                  borderColor={isSelected ? selectedBorderColor : borderColor}
                  borderRadius="xl"
                  overflow="hidden"
                  shadow={isSelected ? 6 : 2}
                  width={itemWidth}
                  alignSelf={index % 2 === 0 ? 'flex-start' : 'flex-end'}
                >
                  <Image
                    source={{ uri: item.image }}
                    alt={item.title}
                    height={120}
                    width="100%"
                    resizeMode="cover"
                  />
                  <VStack p={4} space={2}>
                    <Text
                      fontSize="md"
                      fontWeight="bold"
                      color={isSelected ? 'primary.500' : 'gray.800'}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  </VStack>
                  
                  {isSelected && (
                    <Box
                      position="absolute"
                      top={2}
                      right={2}
                      bg="primary.500"
                      borderRadius="full"
                      size={6}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text color="white" fontSize="xs" fontWeight="bold">
                        ✓
                      </Text>
                    </Box>
                  )}
                </Box>
              </Pressable>
            </Animated.View>
          );
        })}
      </VStack>
      
      {selectedItem && (
        <Box
          position="absolute"
          bottom={4}
          left={4}
          right={4}
          bg="primary.500"
          borderRadius="lg"
          p={3}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1}>
              <Text color="white" fontWeight="bold" fontSize="sm">
                Seçilen: {selectedItem.title}
              </Text>
              {autoExpire && (
                <Text color="primary.100" fontSize="xs">
                  {expireDuration / 1000} saniye sonra otomatik kapanacak
                </Text>
              )}
            </VStack>
            <Pressable onPress={resetSelection}>
              <Text color="white" fontSize="xs" textDecorationLine="underline">
                İptal
              </Text>
            </Pressable>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default InfiniteMenu;