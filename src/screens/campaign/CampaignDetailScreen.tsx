import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Image } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ScrollView,
  Icon,
  Avatar,
  Badge,
  Progress,
  Divider,
  useToast,
  Skeleton,
  Modal,
  FormControl,
  TextArea,
  Select,
  CheckIcon,
  Pressable,
  Card,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  CampaignDetail: { campaignId: string };
  CompanyDetail: { companyId: string };
};

type CampaignDetailRouteProp = RouteProp<RootStackParamList, 'CampaignDetail'>;
type CampaignDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Campaign {
  id: string;
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
    logo: string;
    rating: number;
    verified: boolean;
  };
  category: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  savings_amount: number;
  image: string;
  start_date: string;
  end_date: string;
  location: {
    address: string;
    city: string;
    district: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  terms_conditions: string[];
  usage_count: number;
  max_usage: number;
  is_active: boolean;
  tags: string[];
  reviews: {
    id: string;
    user_name: string;
    user_avatar: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

interface ReviewForm {
  rating: number;
  comment: string;
}

export const CampaignDetailScreen = () => {
  const navigation = useNavigation<CampaignDetailNavigationProp>();
  const route = useRoute<CampaignDetailRouteProp>();
  const toast = useToast();

  const { campaignId } = route.params;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    rating: 5,
    comment: '',
  });

  // Mock data - In real app, this would come from Supabase
  const mockCampaign: Campaign = useMemo(() => ({
    id: campaignId,
    title: 'Tüm Ürünlerde %30 İndirim',
    description: 'Seçili kategorilerde geçerli olan özel indirim kampanyası. Sınırlı süre için tüm mağazalarımızda geçerli.',
    company: {
      id: 'company-1',
      name: 'Migros',
      logo: 'https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=M',
      rating: 4.5,
      verified: true,
    },
    category: 'Market',
    discount_percentage: 30,
    original_price: 100,
    discounted_price: 70,
    savings_amount: 30,
    image: 'https://via.placeholder.com/400x200/4A90E2/FFFFFF?text=Campaign',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    location: {
      address: 'Atatürk Caddesi No: 123',
      city: 'İstanbul',
      district: 'Kadıköy',
      coordinates: {
        lat: 40.9769,
        lng: 29.0375,
      },
    },
    terms_conditions: [
      'Kampanya 31 Ocak 2024 tarihine kadar geçerlidir.',
      'Tek seferde minimum 50 TL alışveriş yapılması gerekmektedir.',
      'Diğer kampanyalarla birleştirilemez.',
      'Alkollü içecekler kampanya kapsamı dışındadır.',
      'Kampanya stoklarla sınırlıdır.',
    ],
    usage_count: 1250,
    max_usage: 2000,
    is_active: true,
    tags: ['Gıda', 'Market', 'İndirim', 'Tasarruf'],
    reviews: [
      {
        id: '1',
        user_name: 'Ahmet K.',
        user_avatar: 'https://via.placeholder.com/40x40/50C878/FFFFFF?text=A',
        rating: 5,
        comment: 'Harika bir kampanya! Gerçekten çok tasarruf ettim.',
        date: '2024-01-15',
      },
      {
        id: '2',
        user_name: 'Fatma S.',
        user_avatar: 'https://via.placeholder.com/40x40/FF6B6B/FFFFFF?text=F',
        rating: 4,
        comment: 'İyi bir fırsat, ama stoklar çabuk bitiyor.',
        date: '2024-01-14',
      },
      {
        id: '3',
        user_name: 'Mehmet Y.',
        user_avatar: 'https://via.placeholder.com/40x40/4ECDC4/FFFFFF?text=M',
        rating: 5,
        comment: 'Mükemmel! Ailecek alışveriş yaptık, çok memnun kaldık.',
        date: '2024-01-13',
      },
    ],
  }), [campaignId]);

  const loadCampaignDetails = useCallback(async () => {
    try {
      setLoading(true);
      // Here we would normally fetch from Supabase
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCampaign(mockCampaign);
    } catch (error: unknown) {
      let errorMessage = 'Kampanya detayları yüklenirken bir hata oluştu.';
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
  }, [toast, mockCampaign]);

  useEffect(() => {
    loadCampaignDetails();
  }, [loadCampaignDetails]);

  const handleUseCampaign = async () => {
    try {
      setActionLoading(true);
      // Here we would normally update usage count in Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.show({
        title: 'Başarılı',
        description: 'Kampanya başarıyla kullanıldı!',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
    } catch (error: unknown) {
      let errorMessage = 'Kampanya kullanılırken bir hata oluştu.';
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
      // Refresh campaign data to show new review
      loadCampaignDetails();
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

  const getUsagePercentage = () => {
    if (!campaign) return 0;
    return (campaign.usage_count / campaign.max_usage) * 100;
  };

  const getRemainingDays = () => {
    if (!campaign) return 0;
    const endDate = new Date(campaign.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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

  if (!campaign) {
    return (
      <Box flex={1} bg="gray.50" safeArea justifyContent="center" alignItems="center">
        <VStack space={4} alignItems="center">
          <Icon as={MaterialIcons} name="error-outline" size={16} color="gray.400" />
          <Text fontSize="lg" color="gray.600" textAlign="center">
            Kampanya bulunamadı
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
        {/* Campaign Image */}
        <Box position="relative">
          <Image
            source={{ uri: campaign.image }}
            alt={campaign.title}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
          <Box position="absolute" top={2} right={2}>
            <Badge
              colorScheme={campaign.is_active ? 'green' : 'gray'}
              variant="solid"
            >
              {campaign.is_active ? 'Aktif' : 'Pasif'}
            </Badge>
          </Box>
          {getRemainingDays() > 0 && (
            <Box position="absolute" bottom={2} left={2}>
              <Badge colorScheme="red" variant="solid">
                {getRemainingDays()} gün kaldı
              </Badge>
            </Box>
          )}
        </Box>

        <VStack space={6} p={4}>
          {/* Campaign Header */}
          <VStack space={3}>
            <Heading size="lg" color="gray.700">
              {campaign.title}
            </Heading>
            
            {/* Company Info */}
            <Pressable onPress={() => navigation.navigate('CompanyDetail', { companyId: campaign.company.id })}>
              <HStack space={3} alignItems="center">
                <Avatar
                  source={{ uri: campaign.company.logo }}
                  size="sm"
                />
                <VStack flex={1}>
                  <HStack space={2} alignItems="center">
                    <Text fontSize="md" fontWeight="semibold" color="gray.700">
                      {campaign.company.name}
                    </Text>
                    {campaign.company.verified && (
                      <Icon as={MaterialIcons} name="verified" size={4} color="blue.500" />
                    )}
                  </HStack>
                  <HStack space={2} alignItems="center">
                    {renderStars(campaign.company.rating)}
                    <Text fontSize="sm" color="gray.600">
                      ({campaign.company.rating})
                    </Text>
                  </HStack>
                </VStack>
                <Icon as={MaterialIcons} name="chevron-right" size={5} color="gray.400" />
              </HStack>
            </Pressable>

            {/* Tags */}
            <HStack space={2} flexWrap="wrap">
              {campaign.tags.map((tag, index) => (
                <Badge key={index} colorScheme="primary" variant="outline">
                  {tag}
                </Badge>
              ))}
            </HStack>
          </VStack>

          {/* Discount Info */}
          <Card>
            <VStack space={4} p={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    %{campaign.discount_percentage}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    İndirim
                  </Text>
                </VStack>
                <VStack alignItems="flex-end">
                  <HStack space={2} alignItems="center">
                    <Text fontSize="sm" color="gray.500" strikeThrough>
                      ₺{campaign.original_price}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                      ₺{campaign.discounted_price}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="green.500" fontWeight="semibold">
                    ₺{campaign.savings_amount} tasarruf
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>

          {/* Usage Stats */}
          <Card>
            <VStack space={3} p={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="md" fontWeight="semibold" color="gray.700">
                  Kullanım Durumu
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {campaign.usage_count} / {campaign.max_usage}
                </Text>
              </HStack>
              <Progress
                value={getUsagePercentage()}
                colorScheme={getUsagePercentage() > 80 ? 'red' : 'primary'}
                size="sm"
              />
              <Text fontSize="xs" color="gray.500">
                {getUsagePercentage() > 80 ? 'Stoklar azalıyor!' : 'Stoklar mevcut'}
              </Text>
            </VStack>
          </Card>

          {/* Description */}
          <Card>
            <VStack space={3} p={4}>
              <Text fontSize="md" fontWeight="semibold" color="gray.700">
                Açıklama
              </Text>
              <Text fontSize="sm" color="gray.600" lineHeight={5}>
                {campaign.description}
              </Text>
            </VStack>
          </Card>

          {/* Location */}
          <Card>
            <VStack space={3} p={4}>
              <HStack space={2} alignItems="center">
                <Icon as={MaterialIcons} name="location-on" size={5} color="red.500" />
                <Text fontSize="md" fontWeight="semibold" color="gray.700">
                  Konum
                </Text>
              </HStack>
              <VStack space={1}>
                <Text fontSize="sm" color="gray.700">
                  {campaign.location.address}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {campaign.location.district}, {campaign.location.city}
                </Text>
              </VStack>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Icon as={MaterialIcons} name="map" size={4} />}
              >
                Haritada Göster
              </Button>
            </VStack>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <VStack space={3} p={4}>
              <Text fontSize="md" fontWeight="semibold" color="gray.700">
                Şartlar ve Koşullar
              </Text>
              <VStack space={2}>
                {campaign.terms_conditions.map((term, index) => (
                  <HStack key={index} space={2} alignItems="flex-start">
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      •
                    </Text>
                    <Text fontSize="sm" color="gray.600" flex={1}>
                      {term}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Card>

          {/* Reviews */}
          <Card>
            <VStack space={4} p={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="md" fontWeight="semibold" color="gray.700">
                  Yorumlar ({campaign.reviews.length})
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => setShowReviewModal(true)}
                >
                  Yorum Yap
                </Button>
              </HStack>
              
              {campaign.reviews.length > 0 ? (
                <VStack space={4}>
                  {campaign.reviews.map((review, index) => (
                    <VStack key={review.id} space={2}>
                      <HStack space={3} alignItems="center">
                        <Avatar
                          source={{ uri: review.user_avatar }}
                          size="sm"
                        />
                        <VStack flex={1}>
                          <HStack justifyContent="space-between" alignItems="center">
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                              {review.user_name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(review.date).toLocaleDateString('tr-TR')}
                            </Text>
                          </HStack>
                          {renderStars(review.rating)}
                        </VStack>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" ml={12}>
                        {review.comment}
                      </Text>
                      {index < campaign.reviews.length - 1 && <Divider />}
                    </VStack>
                  ))}
                </VStack>
              ) : (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                  Henüz yorum yapılmamış. İlk yorumu siz yapın!
                </Text>
              )}
            </VStack>
          </Card>
        </VStack>
      </ScrollView>

      {/* Action Button */}
      <Box p={4} bg="white" shadow={2}>
        <Button
          size="lg"
          onPress={handleUseCampaign}
          isLoading={actionLoading}
          isLoadingText="Kullanılıyor..."
          isDisabled={!campaign.is_active || getRemainingDays() === 0}
          leftIcon={<Icon as={MaterialIcons} name="local-offer" size={5} />}
        >
          {!campaign.is_active ? 'Kampanya Aktif Değil' : 
           getRemainingDays() === 0 ? 'Kampanya Süresi Doldu' : 
           'Kampanyayı Kullan'}
        </Button>
      </Box>

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Yorum Yap</Modal.Header>
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
                  placeholder="Kampanya hakkındaki düşüncelerinizi paylaşın..."
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