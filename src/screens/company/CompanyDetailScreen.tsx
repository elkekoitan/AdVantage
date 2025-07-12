import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ScrollView,
  Icon,
  useToast,
  Image,
  Badge,
  Card,
  Pressable,
  Avatar,
  Divider,
  FlatList,
  Skeleton,
  Modal,
  FormControl,
  TextArea,
  Select,
  CheckIcon,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';



type RootStackParamList = {
  CompanyDetail: { companyId: string };
  CampaignDetail: { campaignId: string };
};

type CompanyDetailRouteProp = RouteProp<RootStackParamList, 'CompanyDetail'>;
type CompanyDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Company {
  id: string;
  name: string;
  description: string;
  logo: string;
  cover_image: string;
  category: string;
  rating: number;
  review_count: number;
  verified: boolean;
  founded_year: number;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  social_media: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  stats: {
    total_campaigns: number;
    active_campaigns: number;
    total_savings: number;
    customer_count: number;
  };
  tags: string[];
  working_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  image: string;
  end_date: string;
  is_active: boolean;
  category: string;
}

interface Review {
  id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewForm {
  rating: number;
  comment: string;
}

export const CompanyDetailScreen = () => {
  const navigation = useNavigation<CompanyDetailNavigationProp>();
  const route = useRoute<CompanyDetailRouteProp>();
  const toast = useToast();

  const { companyId } = route.params;

  const [company, setCompany] = useState<Company | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'about' | 'reviews'>('campaigns');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    rating: 5,
    comment: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Mock data - In real app, this would come from Supabase
  const mockCompany: Company = useMemo(() => ({
    id: companyId,
    name: 'Migros',
    description: 'Türkiye\'nin önde gelen perakende zincirlerinden biri olan Migros, 1954 yılından bu yana müşterilerine kaliteli ürünler ve hizmetler sunmaktadır. Geniş ürün yelpazesi ve uygun fiyatlarıyla ailelerin vazgeçilmez alışveriş noktasıdır.',
    logo: 'https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=M',
    cover_image: 'https://via.placeholder.com/400x200/4A90E2/FFFFFF?text=Migros',
    category: 'Market',
    rating: 4.5,
    review_count: 1250,
    verified: true,
    founded_year: 1954,
    website: 'https://www.migros.com.tr',
    phone: '+90 212 123 45 67',
    email: 'info@migros.com.tr',
    address: 'Atatürk Caddesi No: 123',
    city: 'İstanbul',
    district: 'Kadıköy',
    social_media: {
      instagram: '@migros',
      facebook: 'MigrosOfficial',
      twitter: '@migros',
      linkedin: 'migros-turkey',
    },
    stats: {
      total_campaigns: 45,
      active_campaigns: 12,
      total_savings: 2500000,
      customer_count: 50000,
    },
    tags: ['Market', 'Gıda', 'Temizlik', 'Kişisel Bakım', 'Ev & Yaşam'],
    working_hours: {
      monday: '08:00 - 22:00',
      tuesday: '08:00 - 22:00',
      wednesday: '08:00 - 22:00',
      thursday: '08:00 - 22:00',
      friday: '08:00 - 22:00',
      saturday: '08:00 - 22:00',
      sunday: '09:00 - 21:00',
    },
  }), [companyId]);

  const mockCampaigns: Campaign[] = useMemo(() => [
    {
      id: '1',
      title: 'Tüm Ürünlerde %30 İndirim',
      description: 'Seçili kategorilerde geçerli olan özel indirim kampanyası.',
      discount_percentage: 30,
      original_price: 100,
      discounted_price: 70,
      image: 'https://via.placeholder.com/150x100/4A90E2/FFFFFF?text=30%',
      end_date: '2024-01-31',
      is_active: true,
      category: 'Gıda',
    },
    {
      id: '2',
      title: 'Temizlik Ürünlerinde %25 İndirim',
      description: 'Ev temizlik ürünlerinde özel fırsat.',
      discount_percentage: 25,
      original_price: 80,
      discounted_price: 60,
      image: 'https://via.placeholder.com/150x100/50C878/FFFFFF?text=25%',
      end_date: '2024-02-15',
      is_active: true,
      category: 'Temizlik',
    },
    {
      id: '3',
      title: 'Kişisel Bakım %20 İndirim',
      description: 'Kişisel bakım ürünlerinde indirim fırsatı.',
      discount_percentage: 20,
      original_price: 60,
      discounted_price: 48,
      image: 'https://via.placeholder.com/150x100/FF6B6B/FFFFFF?text=20%',
      end_date: '2024-02-28',
      is_active: true,
      category: 'Kişisel Bakım',
    },
  ], []);

  const mockReviews: Review[] = useMemo(() => [
    {
      id: '1',
      user_name: 'Ahmet K.',
      user_avatar: 'https://via.placeholder.com/40x40/50C878/FFFFFF?text=A',
      rating: 5,
      comment: 'Harika bir mağaza! Ürün çeşitliliği çok iyi ve personel çok yardımcı.',
      date: '2024-01-15',
    },
    {
      id: '2',
      user_name: 'Fatma S.',
      user_avatar: 'https://via.placeholder.com/40x40/FF6B6B/FFFFFF?text=F',
      rating: 4,
      comment: 'Kaliteli ürünler ve uygun fiyatlar. Kampanyaları çok başarılı.',
      date: '2024-01-14',
    },
    {
      id: '3',
      user_name: 'Mehmet Y.',
      user_avatar: 'https://via.placeholder.com/40x40/4ECDC4/FFFFFF?text=M',
      rating: 5,
      comment: 'Yıllardır müşterisiyim, hep memnun kaldım. Tavsiye ederim.',
      date: '2024-01-13',
    },
  ], []);

  const loadCompanyDetails = useCallback(async () => {
    try {
      setLoading(true);
      // Here we would normally fetch from Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCompany(mockCompany);
    } catch (error: unknown) {
      let errorMessage = 'Şirket detayları yüklenirken bir hata oluştu.';
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
    }
  }, [toast, mockCompany]);

  const loadCampaigns = useCallback(async () => {
    try {
      setCampaignsLoading(true);
      // Here we would normally fetch from Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      setCampaigns(mockCampaigns);
    } catch (error: unknown) {
      let errorMessage = 'Kampanyalar yüklenirken bir hata oluştu.';
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
      setCampaignsLoading(false);
    }
  }, [toast, mockCampaigns]);

  const loadReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      // Here we would normally fetch from Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      setReviews(mockReviews);
    } catch (error: unknown) {
      let errorMessage = 'Yorumlar yüklenirken bir hata oluştu.';
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
      setReviewsLoading(false);
    }
  }, [toast, mockReviews]);

  useEffect(() => {
    loadCompanyDetails();
  }, [loadCompanyDetails]);

  useEffect(() => {
    if (activeTab === 'campaigns') {
      loadCampaigns();
    } else if (activeTab === 'reviews') {
      loadReviews();
    }
  }, [activeTab, loadCampaigns, loadReviews]);

  const handleAddReview = async () => {
    if (!reviewForm.comment.trim()) {
      toast.show({
        title: 'Eksik Bilgi',
        description: 'Lütfen yorumunuzu yazın.',
        variant: 'top-accent',
        bgColor: 'orange.500',
      });
      return;
    }

    try {
      setActionLoading(true);
      // Here we would normally add review to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.show({
        title: 'Başarılı',
        description: 'Yorumunuz başarıyla eklendi!',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
      
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      // Refresh reviews
      loadReviews();
    } catch (error: unknown) {
      let errorMessage = 'Yorum eklenirken bir hata oluştu.';
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
      setActionLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <HStack space={1}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={MaterialIcons}
            name={star <= rating ? 'star' : 'star-border'}
            size={4}
            color={star <= rating ? 'yellow.400' : 'gray.300'}
          />
        ))}
      </HStack>
    );
  };

  const renderCampaignItem = ({ item }: { item: Campaign }) => (
    <Pressable
      onPress={() => navigation.navigate('CampaignDetail', { campaignId: item.id })}
      mb={3}
    >
      <Card>
        <HStack space={4} p={4} alignItems="center">
          <Image
            source={{ uri: item.image }}
            alt={item.title}
            w={16}
            h={12}
            rounded="md"
            resizeMode="cover"
          />
          <VStack flex={1} space={2}>
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1} space={1}>
                <Text fontSize="md" fontWeight="semibold" color="gray.700">
                  {item.title}
                </Text>
                <Text fontSize="sm" color="gray.600" numberOfLines={2}>
                  {item.description}
                </Text>
              </VStack>
              <Badge colorScheme="green" variant="solid">
                %{item.discount_percentage}
              </Badge>
            </HStack>
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space={2} alignItems="center">
                <Text fontSize="sm" color="gray.500" strikeThrough>
                  ₺{item.original_price}
                </Text>
                <Text fontSize="md" fontWeight="bold" color="green.500">
                  ₺{item.discounted_price}
                </Text>
              </HStack>
              <Badge colorScheme={item.is_active ? 'green' : 'gray'} variant="outline">
                {item.is_active ? 'Aktif' : 'Pasif'}
              </Badge>
            </HStack>
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );

  const renderReviewItem = ({ item }: { item: Review }) => (
    <VStack space={3} mb={4}>
      <HStack space={3} alignItems="center">
        <Avatar
          source={{ uri: item.user_avatar }}
          size="sm"
        />
        <VStack flex={1}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              {item.user_name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {new Date(item.date).toLocaleDateString('tr-TR')}
            </Text>
          </HStack>
          {renderStars(item.rating)}
        </VStack>
      </HStack>
      <Text fontSize="sm" color="gray.600" ml={12}>
        {item.comment}
      </Text>
      <Divider />
    </VStack>
  );

  if (loading) {
    return (
      <Box flex={1} bg="gray.50" safeArea>
        <ScrollView p={4}>
          <VStack space={4}>
            <Skeleton h={200} rounded="lg" />
            <VStack space={2}>
              <Skeleton.Text lines={2} />
              <Skeleton h={4} w={20} />
            </VStack>
            <Skeleton h={100} rounded="lg" />
            <Skeleton h={150} rounded="lg" />
          </VStack>
        </ScrollView>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box flex={1} bg="gray.50" safeArea justifyContent="center" alignItems="center">
        <VStack space={4} alignItems="center">
          <Icon as={MaterialIcons} name="error-outline" size={16} color="gray.400" />
          <Text fontSize="lg" color="gray.600" textAlign="center">
            Şirket bulunamadı
          </Text>
          <Button onPress={() => navigation.goBack()}>
            Geri Dön
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="gray.50" safeArea>
      <ScrollView>
        {/* Cover Image */}
        <Box position="relative">
          <Image
            source={{ uri: company.cover_image }}
            alt={company.name}
            w="full"
            h={200}
            resizeMode="cover"
          />
          <Box position="absolute" top={2} right={2}>
            {company.verified && (
              <Badge colorScheme="blue" variant="solid">
                Doğrulanmış
              </Badge>
            )}
          </Box>
        </Box>

        <VStack space={6} p={4}>
          {/* Company Header */}
          <VStack space={4}>
            <HStack space={4} alignItems="center">
              <Avatar
                source={{ uri: company.logo }}
                size="lg"
              />
              <VStack flex={1} space={1}>
                <HStack space={2} alignItems="center">
                  <Heading size="lg" color="gray.700">
                    {company.name}
                  </Heading>
                  {company.verified && (
                    <Icon as={MaterialIcons} name="verified" size={5} color="blue.500" />
                  )}
                </HStack>
                <HStack space={2} alignItems="center">
                  {renderStars(company.rating)}
                  <Text fontSize="sm" color="gray.600">
                    ({company.rating}) • {company.review_count} yorum
                  </Text>
                </HStack>
                <Badge colorScheme="primary" variant="outline" alignSelf="flex-start">
                  {company.category}
                </Badge>
              </VStack>
            </HStack>

            {/* Tags */}
            <HStack space={2} flexWrap="wrap">
              {company.tags.map((tag, index) => (
                <Badge key={index} colorScheme="gray" variant="outline">
                  {tag}
                </Badge>
              ))}
            </HStack>
          </VStack>

          {/* Stats */}
          <Card>
            <VStack space={4} p={4}>
              <Text fontSize="md" fontWeight="semibold" color="gray.700">
                İstatistikler
              </Text>
              <HStack space={4} justifyContent="space-around">
                <VStack alignItems="center" space={1}>
                  <Text fontSize="xl" fontWeight="bold" color="primary.500">
                    {company.stats.active_campaigns}
                  </Text>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    Aktif Kampanya
                  </Text>
                </VStack>
                <VStack alignItems="center" space={1}>
                  <Text fontSize="xl" fontWeight="bold" color="green.500">
                    ₺{(company.stats.total_savings / 1000).toFixed(0)}K
                  </Text>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    Toplam Tasarruf
                  </Text>
                </VStack>
                <VStack alignItems="center" space={1}>
                  <Text fontSize="xl" fontWeight="bold" color="blue.500">
                    {(company.stats.customer_count / 1000).toFixed(0)}K
                  </Text>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    Müşteri
                  </Text>
                </VStack>
                <VStack alignItems="center" space={1}>
                  <Text fontSize="xl" fontWeight="bold" color="orange.500">
                    {company.stats.total_campaigns}
                  </Text>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    Toplam Kampanya
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>

          {/* Tabs */}
          <HStack space={0} bg="white" rounded="lg" p={1}>
            {[
              { key: 'campaigns', label: 'Kampanyalar' },
              { key: 'about', label: 'Hakkında' },
              { key: 'reviews', label: 'Yorumlar' },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                flex={1}
                onPress={() => setActiveTab(tab.key as 'campaigns' | 'about' | 'reviews')}
              >
                <Box
                  py={3}
                  px={4}
                  bg={activeTab === tab.key ? 'primary.500' : 'transparent'}
                  rounded="md"
                >
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={activeTab === tab.key ? 'white' : 'gray.600'}
                    textAlign="center"
                  >
                    {tab.label}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </HStack>

          {/* Tab Content */}
          {activeTab === 'campaigns' && (
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="md" fontWeight="semibold" color="gray.700">
                  Aktif Kampanyalar ({campaigns.length})
                </Text>
              </HStack>
              
              {campaignsLoading ? (
                <VStack space={3}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} h={20} rounded="lg" />
                  ))}
                </VStack>
              ) : campaigns.length > 0 ? (
                <FlatList
                  data={campaigns}
                  renderItem={renderCampaignItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <Card>
                  <VStack space={2} p={8} alignItems="center">
                    <Icon as={MaterialIcons} name="campaign" size={12} color="gray.400" />
                    <Text fontSize="md" color="gray.600" textAlign="center">
                      Henüz aktif kampanya bulunmuyor
                    </Text>
                  </VStack>
                </Card>
              )}
            </VStack>
          )}

          {activeTab === 'about' && (
            <VStack space={4}>
              {/* Description */}
              <Card>
                <VStack space={3} p={4}>
                  <Text fontSize="md" fontWeight="semibold" color="gray.700">
                    Hakkında
                  </Text>
                  <Text fontSize="sm" color="gray.600" lineHeight={5}>
                    {company.description}
                  </Text>
                </VStack>
              </Card>

              {/* Contact Info */}
              <Card>
                <VStack space={4} p={4}>
                  <Text fontSize="md" fontWeight="semibold" color="gray.700">
                    İletişim Bilgileri
                  </Text>
                  
                  <VStack space={3}>
                    <HStack space={3} alignItems="center">
                      <Icon as={MaterialIcons} name="location-on" size={5} color="red.500" />
                      <VStack flex={1}>
                        <Text fontSize="sm" color="gray.700">
                          {company.address}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {company.district}, {company.city}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack space={3} alignItems="center">
                      <Icon as={MaterialIcons} name="phone" size={5} color="green.500" />
                      <Text fontSize="sm" color="gray.700">
                        {company.phone}
                      </Text>
                    </HStack>
                    
                    <HStack space={3} alignItems="center">
                      <Icon as={MaterialIcons} name="email" size={5} color="blue.500" />
                      <Text fontSize="sm" color="gray.700">
                        {company.email}
                      </Text>
                    </HStack>
                    
                    <HStack space={3} alignItems="center">
                      <Icon as={MaterialIcons} name="language" size={5} color="purple.500" />
                      <Text fontSize="sm" color="gray.700">
                        {company.website}
                      </Text>
                    </HStack>
                    
                    <HStack space={3} alignItems="center">
                      <Icon as={MaterialIcons} name="calendar-today" size={5} color="orange.500" />
                      <Text fontSize="sm" color="gray.700">
                        {company.founded_year} yılında kuruldu
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </Card>

              {/* Working Hours */}
              <Card>
                <VStack space={3} p={4}>
                  <Text fontSize="md" fontWeight="semibold" color="gray.700">
                    Çalışma Saatleri
                  </Text>
                  <VStack space={2}>
                    {Object.entries(company.working_hours).map(([day, hours]) => {
                      const dayNames: { [key: string]: string } = {
                        monday: 'Pazartesi',
                        tuesday: 'Salı',
                        wednesday: 'Çarşamba',
                        thursday: 'Perşembe',
                        friday: 'Cuma',
                        saturday: 'Cumartesi',
                        sunday: 'Pazar',
                      };
                      return (
                        <HStack key={day} justifyContent="space-between">
                          <Text fontSize="sm" color="gray.700">
                            {dayNames[day]}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {hours}
                          </Text>
                        </HStack>
                      );
                    })}
                  </VStack>
                </VStack>
              </Card>

              {/* Social Media */}
              <Card>
                <VStack space={3} p={4}>
                  <Text fontSize="md" fontWeight="semibold" color="gray.700">
                    Sosyal Medya
                  </Text>
                  <HStack space={4} justifyContent="center">
                    {company.social_media.instagram && (
                      <Pressable>
                        <VStack alignItems="center" space={1}>
                          <Icon as={MaterialIcons} name="camera-alt" size={6} color="pink.500" />
                          <Text fontSize="xs" color="gray.600">
                            Instagram
                          </Text>
                        </VStack>
                      </Pressable>
                    )}
                    {company.social_media.facebook && (
                      <Pressable>
                        <VStack alignItems="center" space={1}>
                          <Icon as={MaterialIcons} name="facebook" size={6} color="blue.600" />
                          <Text fontSize="xs" color="gray.600">
                            Facebook
                          </Text>
                        </VStack>
                      </Pressable>
                    )}
                    {company.social_media.twitter && (
                      <Pressable>
                        <VStack alignItems="center" space={1}>
                          <Icon as={MaterialIcons} name="alternate-email" size={6} color="blue.400" />
                          <Text fontSize="xs" color="gray.600">
                            Twitter
                          </Text>
                        </VStack>
                      </Pressable>
                    )}
                    {company.social_media.linkedin && (
                      <Pressable>
                        <VStack alignItems="center" space={1}>
                          <Icon as={MaterialIcons} name="business" size={6} color="blue.700" />
                          <Text fontSize="xs" color="gray.600">
                            LinkedIn
                          </Text>
                        </VStack>
                      </Pressable>
                    )}
                  </HStack>
                </VStack>
              </Card>
            </VStack>
          )}

          {activeTab === 'reviews' && (
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="md" fontWeight="semibold" color="gray.700">
                  Yorumlar ({reviews.length})
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => setShowReviewModal(true)}
                >
                  Yorum Yap
                </Button>
              </HStack>
              
              {reviewsLoading ? (
                <VStack space={3}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} h={20} rounded="lg" />
                  ))}
                </VStack>
              ) : reviews.length > 0 ? (
                <Card>
                  <VStack space={0} p={4}>
                    <FlatList
                      data={reviews}
                      renderItem={renderReviewItem}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                    />
                  </VStack>
                </Card>
              ) : (
                <Card>
                  <VStack space={2} p={8} alignItems="center">
                    <Icon as={MaterialIcons} name="rate-review" size={12} color="gray.400" />
                    <Text fontSize="md" color="gray.600" textAlign="center">
                      Henüz yorum yapılmamış
                    </Text>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      İlk yorumu siz yapın!
                    </Text>
                  </VStack>
                </Card>
              )}
            </VStack>
          )}
        </VStack>
      </ScrollView>

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Şirket Hakkında Yorum Yap</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl>
                <FormControl.Label>Puan</FormControl.Label>
                <Select
                  selectedValue={reviewForm.rating.toString()}
                  onValueChange={(value) => setReviewForm({...reviewForm, rating: parseInt(value)})}
                  _selectedItem={{
                    bg: 'primary.100',
                    endIcon: <CheckIcon size="5" />,
                  }}
                >
                  <Select.Item label="⭐⭐⭐⭐⭐ (5)" value="5" />
                  <Select.Item label="⭐⭐⭐⭐ (4)" value="4" />
                  <Select.Item label="⭐⭐⭐ (3)" value="3" />
                  <Select.Item label="⭐⭐ (2)" value="2" />
                  <Select.Item label="⭐ (1)" value="1" />
                </Select>
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Yorumunuz</FormControl.Label>
                <TextArea
                  placeholder="Şirket hakkındaki düşüncelerinizi paylaşın..."
                  value={reviewForm.comment}
                  onChangeText={(text) => setReviewForm({...reviewForm, comment: text})}
                  h={20}
                  autoCompleteType="off"
                />
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setShowReviewModal(false)}
              >
                İptal
              </Button>
              <Button
                onPress={handleAddReview}
                isLoading={actionLoading}
                isLoadingText="Gönderiliyor..."
              >
                Gönder
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};