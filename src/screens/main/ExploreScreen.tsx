import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ScrollView,
  Icon,
  Input,
  Card,
  Pressable,
  Badge,
  useToast,
  Skeleton,
  Center,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';

interface Company {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url?: string;
  rating: number;
  location: string;
  is_featured: boolean;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  company_name: string;
  discount_percentage: number;
  valid_until: string;
  image_url?: string;
  category: string;
}

interface PopularLocation {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  companies_count: number;
  category: string;
}

export const ExploreScreen = () => {
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [popularLocations, setPopularLocations] = useState<PopularLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Tümü', icon: 'apps' },
    { id: 'restaurant', name: 'Restoran', icon: 'restaurant' },
    { id: 'shopping', name: 'Alışveriş', icon: 'shopping-bag' },
    { id: 'entertainment', name: 'Eğlence', icon: 'movie' },
    { id: 'health', name: 'Sağlık', icon: 'local-hospital' },
    { id: 'beauty', name: 'Güzellik', icon: 'face' },
    { id: 'travel', name: 'Seyahat', icon: 'flight' },
  ];

  useEffect(() => {
    fetchExploreData();
  }, [selectedCategory]);

  const fetchExploreData = async () => {
    try {
      setLoading(true);

      // Mock data for now since we don't have companies table yet
      const mockCompanies: Company[] = [
        {
          id: '1',
          name: 'Starbucks Kadıköy',
          description: 'Premium kahve deneyimi ve rahat atmosfer',
          category: 'restaurant',
          rating: 4.5,
          location: 'Kadıköy',
          is_featured: true
        },
        {
          id: '2',
          name: 'Zara Bağdat Caddesi',
          description: 'En yeni moda trendleri ve kaliteli giyim',
          category: 'shopping',
          rating: 4.3,
          location: 'Bağdat Caddesi',
          is_featured: false
        },
        {
          id: '3',
          name: 'Cinemaximum',
          description: 'En yeni filmler ve premium sinema deneyimi',
          category: 'entertainment',
          rating: 4.2,
          location: 'Zorlu Center',
          is_featured: true
        }
      ];

      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          title: 'Kahve Tutkunları İçin Özel İndirim',
          description: 'Tüm kahve çeşitlerinde geçerli',
          company_name: 'Starbucks',
          discount_percentage: 25,
          valid_until: '2024-12-31',
          category: 'restaurant'
        },
        {
          id: '2',
          title: 'Yaz Koleksiyonu İndirimi',
          description: 'Seçili ürünlerde büyük indirim',
          company_name: 'Zara',
          discount_percentage: 40,
          valid_until: '2024-12-25',
          category: 'shopping'
        }
      ];

      const mockLocations: PopularLocation[] = [
        {
          id: '1',
          name: 'Kadıköy',
          description: 'Trendy kafeler ve restoranlar',
          companies_count: 45,
          category: 'district'
        },
        {
          id: '2',
          name: 'Beyoğlu',
          description: 'Sanat ve kültür merkezi',
          companies_count: 38,
          category: 'district'
        },
        {
          id: '3',
          name: 'Beşiktaş',
          description: 'Alışveriş ve eğlence',
          companies_count: 32,
          category: 'district'
        }
      ];

      // Filter by category if not 'all'
      const filteredCompanies = selectedCategory === 'all' 
        ? mockCompanies 
        : mockCompanies.filter(c => c.category === selectedCategory);
      
      const filteredCampaigns = selectedCategory === 'all'
        ? mockCampaigns
        : mockCampaigns.filter(c => c.category === selectedCategory);

      setCompanies(filteredCompanies);
      setCampaigns(filteredCampaigns);
      setPopularLocations(mockLocations);

    } catch (error: unknown) {
      let errorMessage = 'Veriler yüklenirken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Hata',
        description: errorMessage,
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExploreData();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast.show({
        title: 'Yakında',
        description: 'Arama özelliği yakında gelecek!',
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.icon || 'store';
  };

  if (loading) {
    return (
      <Box flex={1} bg="gray.50" safeArea>
        <VStack space={4} p={4}>
          <Skeleton h="12" rounded="md" />
          <HStack space={3}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} flex={1} h="10" rounded="md" />
            ))}
          </HStack>
          <Skeleton h="40" rounded="md" />
          <Skeleton h="32" rounded="md" />
        </VStack>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="gray.50" safeArea>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Box bg="white" px={4} py={4} shadow={1}>
          <VStack space={4}>
            <Heading size="lg" color="gray.700">
              Keşfet
            </Heading>
            
            {/* Search Bar */}
            <Input
              placeholder="İşletme, kampanya veya konum ara..."
              size="lg"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              InputLeftElement={
                <Icon
                  as={MaterialIcons}
                  name="search"
                  size={5}
                  ml={3}
                  color="gray.400"
                />
              }
              InputRightElement={
                searchQuery ? (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Icon
                      as={MaterialIcons}
                      name="clear"
                      size={5}
                      mr={3}
                      color="gray.400"
                    />
                  </Pressable>
                ) : undefined
              }
            />
          </VStack>
        </Box>

        <VStack space={4} p={4}>
          {/* Categories */}
          <Card>
            <VStack space={4} p={4}>
              <Heading size="md" color="gray.700">
                Kategoriler
              </Heading>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space={3}>
                  {categories.map((category) => (
                    <Pressable
                      key={category.id}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <VStack
                        alignItems="center"
                        space={2}
                        p={3}
                        bg={selectedCategory === category.id ? 'primary.100' : 'gray.100'}
                        rounded="lg"
                        minW="20"
                      >
                        <Icon
                          as={MaterialIcons}
                          name={category.icon}
                          size={6}
                          color={selectedCategory === category.id ? 'primary.600' : 'gray.600'}
                        />
                        <Text
                          fontSize="xs"
                          color={selectedCategory === category.id ? 'primary.600' : 'gray.600'}
                          textAlign="center"
                        >
                          {category.name}
                        </Text>
                      </VStack>
                    </Pressable>
                  ))}
                </HStack>
              </ScrollView>
            </VStack>
          </Card>

          {/* Featured Campaigns */}
          <Card>
            <VStack space={4} p={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Heading size="md" color="gray.700">
                  Öne Çıkan Kampanyalar
                </Heading>
                <Icon
                  as={MaterialIcons}
                  name="local-offer"
                  size={6}
                  color="orange.500"
                />
              </HStack>

              {campaigns.length === 0 ? (
                <Center py={8}>
                  <Icon
                    as={MaterialIcons}
                    name="local-offer"
                    size={12}
                    color="gray.400"
                  />
                  <Text color="gray.500" mt={2}>
                    Bu kategoride kampanya bulunamadı
                  </Text>
                </Center>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack space={3}>
                    {campaigns.map((campaign) => (
                      <Pressable
                        key={campaign.id}
                        onPress={() => {
                          toast.show({
                            title: 'Yakında',
                            description: 'Kampanya detayları yakında gelecek!',
                          });
                        }}
                      >
                        <Box
                          bg="white"
                          rounded="lg"
                          shadow={2}
                          w="64"
                          overflow="hidden"
                        >
                          <VStack space={2} p={3}>
                            <Badge
                              colorScheme="orange"
                              variant="solid"
                              rounded="full"
                              alignSelf="flex-start"
                            >
                              %{campaign.discount_percentage} İndirim
                            </Badge>
                            <Text fontSize="md" fontWeight="semibold" numberOfLines={2}>
                              {campaign.title}
                            </Text>
                            <Text fontSize="sm" color="gray.600" numberOfLines={1}>
                              {campaign.company_name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(campaign.valid_until).toLocaleDateString('tr-TR')} tarihine kadar
                            </Text>
                          </VStack>
                        </Box>
                      </Pressable>
                    ))}
                  </HStack>
                </ScrollView>
              )}
            </VStack>
          </Card>

          {/* Popular Companies */}
          <Card>
            <VStack space={4} p={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Heading size="md" color="gray.700">
                  Popüler İşletmeler
                </Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="primary"
                  onPress={() => {
                    toast.show({
                      title: 'Yakında',
                      description: 'Tüm işletmeler sayfası yakında gelecek!',
                    });
                  }}
                >
                  Tümünü Gör
                </Button>
              </HStack>

              {companies.length === 0 ? (
                <Center py={8}>
                  <Icon
                    as={MaterialIcons}
                    name="store"
                    size={12}
                    color="gray.400"
                  />
                  <Text color="gray.500" mt={2}>
                    Bu kategoride işletme bulunamadı
                  </Text>
                </Center>
              ) : (
                <VStack space={3}>
                  {companies.slice(0, 5).map((company) => (
                    <Pressable
                      key={company.id}
                      onPress={() => {
                        toast.show({
                          title: 'Yakında',
                          description: 'İşletme detayları yakında gelecek!',
                        });
                      }}
                    >
                      <Box
                        bg="white"
                        p={4}
                        rounded="md"
                        borderWidth={1}
                        borderColor="gray.200"
                      >
                        <HStack space={3} alignItems="center">
                          <Center
                            size="12"
                            bg="gray.200"
                            rounded="md"
                          >
                            <Icon
                              as={MaterialIcons}
                              name={getCategoryIcon(company.category)}
                              size={6}
                              color="gray.500"
                            />
                          </Center>
                          <VStack flex={1} space={1}>
                            <HStack justifyContent="space-between" alignItems="center">
                              <Text fontSize="md" fontWeight="semibold" flex={1}>
                                {company.name}
                              </Text>
                              {company.is_featured && (
                                <Badge colorScheme="yellow" variant="solid" rounded="full">
                                  Öne Çıkan
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color="gray.600" numberOfLines={2}>
                              {company.description}
                            </Text>
                            <HStack space={2} alignItems="center">
                              <HStack space={1} alignItems="center">
                                <Icon
                                  as={MaterialIcons}
                                  name="star"
                                  size={4}
                                  color="yellow.500"
                                />
                                <Text fontSize="sm" color="gray.600">
                                  {company.rating.toFixed(1)}
                                </Text>
                              </HStack>
                              <Text fontSize="sm" color="gray.500">
                                •
                              </Text>
                              <HStack space={1} alignItems="center">
                                <Icon
                                  as={MaterialIcons}
                                  name="location-on"
                                  size={4}
                                  color="gray.500"
                                />
                                <Text fontSize="sm" color="gray.500">
                                  {company.location}
                                </Text>
                              </HStack>
                            </HStack>
                          </VStack>
                        </HStack>
                      </Box>
                    </Pressable>
                  ))}
                </VStack>
              )}
            </VStack>
          </Card>

          {/* Popular Locations */}
          <Card>
            <VStack space={4} p={4}>
              <Heading size="md" color="gray.700">
                Popüler Lokasyonlar
              </Heading>
              <VStack space={3}>
                {popularLocations.map((location) => (
                  <Pressable
                    key={location.id}
                    onPress={() => {
                      toast.show({
                        title: 'Yakında',
                        description: 'Lokasyon detayları yakında gelecek!',
                      });
                    }}
                  >
                    <Box
                      bg="white"
                      p={4}
                      rounded="md"
                      borderWidth={1}
                      borderColor="gray.200"
                    >
                      <HStack space={3} alignItems="center">
                        <Center
                          size="12"
                          bg="primary.100"
                          rounded="md"
                        >
                          <Icon
                            as={MaterialIcons}
                            name="location-city"
                            size={6}
                            color="primary.600"
                          />
                        </Center>
                        <VStack flex={1} space={1}>
                          <Text fontSize="md" fontWeight="semibold">
                            {location.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {location.description}
                          </Text>
                          <Text fontSize="xs" color="primary.600">
                            {location.companies_count} işletme
                          </Text>
                        </VStack>
                        <Icon
                          as={MaterialIcons}
                          name="chevron-right"
                          size={6}
                          color="gray.400"
                        />
                      </HStack>
                    </Box>
                  </Pressable>
                ))}
              </VStack>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>
    </Box>
  );
};