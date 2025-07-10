import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  Input,
  Icon,
  Pressable,
  Avatar,
  Badge,
  FlatList,
  Skeleton,
  useToast,
} from 'native-base';
import { RefreshControl } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../contexts/AuthContext';
import { MainStackParamList } from '../../navigation/MainNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'MainTabs'>;

interface Campaign {
  id: string;
  company: {
    id: string;
    name: string;
    logo_url: string;
    category: string;
  };
  title: string;
  description: string;
  discount_value: number;
  discount_type: 'percentage' | 'fixed';
  media_urls: string[];
}

interface Activity {
  id: string;
  type: 'restaurant' | 'activity' | 'event' | 'music' | 'movie';
  title: string;
  description: string;
  image_url: string;
  rating: number;
  price_range: string;
  distance: string;
}

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const toast = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recommendations, setRecommendations] = useState<Activity[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data
      setCampaigns([
        {
          id: '1',
          company: {
            id: 'c1',
            name: 'Starbucks',
            logo_url: 'https://via.placeholder.com/50',
            category: 'restaurant',
          },
          title: '%20 İndirim',
          description: 'Tüm içeceklerde geçerli',
          discount_value: 20,
          discount_type: 'percentage',
          media_urls: ['https://via.placeholder.com/300'],
        },
        {
          id: '2',
          company: {
            id: 'c2',
            name: 'Cinemaximum',
            logo_url: 'https://via.placeholder.com/50',
            category: 'entertainment',
          },
          title: '2 Bilet Al 1 Öde',
          description: 'Hafta içi seansları için geçerli',
          discount_value: 50,
          discount_type: 'percentage',
          media_urls: ['https://via.placeholder.com/300'],
        },
      ]);

      setRecommendations([
        {
          id: 'r1',
          type: 'restaurant',
          title: 'The House Café',
          description: 'Modern Avrupa Mutfağı',
          image_url: 'https://via.placeholder.com/150',
          rating: 4.5,
          price_range: '₺₺₺',
          distance: '1.2 km',
        },
        {
          id: 'r2',
          type: 'activity',
          title: 'Yoga Studio',
          description: 'Hatha Yoga Dersi',
          image_url: 'https://via.placeholder.com/150',
          rating: 4.8,
          price_range: '₺₺',
          distance: '0.8 km',
        },
      ]);
    } catch (error) {
      toast.show({
        title: 'Hata',
        description: 'Veriler yüklenirken bir hata oluştu',
        status: 'error',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderCampaign = ({ item }: { item: Campaign }) => (
    <Pressable
      onPress={() => navigation.navigate('CampaignDetails', { campaignId: item.id })}
      mr={3}
    >
      <Box
        bg="white"
        rounded="xl"
        shadow={2}
        width={250}
        height={150}
        overflow="hidden"
      >
        <Box position="absolute" top={2} right={2} zIndex={1}>
          <Badge colorScheme="danger" rounded="full" px={2}>
            {item.discount_type === 'percentage' ? `%${item.discount_value}` : `₺${item.discount_value}`}
          </Badge>
        </Box>
        <HStack flex={1} p={3} space={3}>
          <Avatar
            size="md"
            source={{ uri: item.company.logo_url }}
            bg="gray.200"
          />
          <VStack flex={1} space={1}>
            <Text fontSize="xs" color="gray.500">{item.company.name}</Text>
            <Heading size="sm" numberOfLines={2}>{item.title}</Heading>
            <Text fontSize="xs" color="gray.600" numberOfLines={2}>
              {item.description}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  const renderRecommendation = ({ item }: { item: Activity }) => (
    <Pressable
      onPress={() => {
        // Handle recommendation press
      }}
      mb={3}
    >
      <Box bg="white" rounded="xl" shadow={1} overflow="hidden">
        <HStack space={3}>
          <Box
            width={100}
            height={100}
            bg="gray.200"
            style={{
              backgroundImage: `url(${item.image_url})`,
              backgroundSize: 'cover',
            }}
          />
          <VStack flex={1} p={3} space={1}>
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="sm">{item.title}</Heading>
              <HStack alignItems="center" space={1}>
                <Icon as={MaterialIcons} name="star" size={4} color="warning.500" />
                <Text fontSize="xs" fontWeight="bold">{item.rating}</Text>
              </HStack>
            </HStack>
            <Text fontSize="xs" color="gray.600">{item.description}</Text>
            <HStack justifyContent="space-between" mt={1}>
              <Text fontSize="xs" color="gray.500">{item.price_range}</Text>
              <HStack alignItems="center" space={1}>
                <Icon as={MaterialIcons} name="place" size={3} color="gray.400" />
                <Text fontSize="xs" color="gray.500">{item.distance}</Text>
              </HStack>
            </HStack>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  return (
    <Box flex={1} bg="gray.50" safeArea>
      <VStack flex={1}>
        {/* Header */}
        <HStack px={4} py={3} alignItems="center" bg="white" shadow={1}>
          <VStack flex={1}>
            <Text fontSize="sm" color="gray.500">Merhaba,</Text>
            <Heading size="md">{user?.user_metadata?.full_name || 'Kullanıcı'}</Heading>
          </VStack>
          <HStack space={3}>
            <Pressable
              onPress={() => {
                // Handle notifications
              }}
            >
              <Icon as={MaterialIcons} name="notifications" size={6} color="gray.700" />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('CreateProgram', {})}
            >
              <Icon as={MaterialCommunityIcons} name="calendar-plus" size={6} color="primary.600" />
            </Pressable>
          </HStack>
        </HStack>

        {/* Search Bar */}
        <Box px={4} py={3} bg="white">
          <Input
            placeholder="Restoran, aktivite veya yer ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            InputLeftElement={
              <Icon as={MaterialIcons} name="search" size={5} ml={3} color="gray.400" />
            }
            InputRightElement={
              searchQuery ? (
                <Pressable onPress={() => setSearchQuery('')} pr={3}>
                  <Icon as={MaterialIcons} name="clear" size={5} color="gray.400" />
                </Pressable>
              ) : undefined
            }
          />
        </Box>

        {/* Content */}
        <ScrollView
          flex={1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Campaigns Section */}
          <VStack space={3} mt={4}>
            <HStack px={4} justifyContent="space-between" alignItems="center">
              <Heading size="md">Özel Kampanyalar</Heading>
              <Pressable>
                <Text fontSize="sm" color="primary.600" fontWeight="medium">
                  Tümünü Gör
                </Text>
              </Pressable>
            </HStack>
            
            {loading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} px={4}>
                <HStack space={3}>
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} width={250} height={150} rounded="xl" />
                  ))}
                </HStack>
              </ScrollView>
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                data={campaigns}
                renderItem={renderCampaign}
                keyExtractor={item => item.id}
              />
            )}
          </VStack>

          {/* Recommendations Section */}
          <VStack space={3} mt={6} px={4} pb={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="md">Sizin İçin Öneriler</Heading>
              <Pressable>
                <Icon as={MaterialIcons} name="tune" size={5} color="gray.600" />
              </Pressable>
            </HStack>

            {loading ? (
              <VStack space={3}>
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} height={100} rounded="xl" />
                ))}
              </VStack>
            ) : (
              <FlatList
                data={recommendations}
                renderItem={renderRecommendation}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            )}
          </VStack>
        </ScrollView>
      </VStack>
    </Box>
  );
}; 