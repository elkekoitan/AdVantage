import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  ScrollView,
  Icon,
  Card,
  Pressable,
  Badge,
  useToast,
  KeyboardAvoidingView,
  FormControl,
  WarningOutlineIcon,
  Select,
  Slider,
  Switch,
  TextArea,
} from 'native-base';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { RootStackParamList } from '../../types';

type CreateProgramScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateProgram'>;

interface ProgramFormData {
  title: string;
  description: string;
  date: string;
  budget: number;
  duration: number; // in hours
  category: string;
  location: string;
  participants: number;
  preferences: {
    cuisine_type?: string;
    activity_level?: 'low' | 'medium' | 'high';
    indoor_outdoor?: 'indoor' | 'outdoor' | 'both';
    time_preference?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  };
  ai_assistance: boolean;
}

interface AIRecommendation {
  id: string;
  type: 'restaurant' | 'activity' | 'shopping' | 'entertainment';
  name: string;
  description: string;
  estimated_cost: number;
  duration: number;
  location: string;
  rating: number;
  reason: string;
}

interface FormErrors {
  title?: string;
  date?: string;
  budget?: string;
  location?: string;
}

export const CreateProgramScreen = () => {
  const navigation = useNavigation<CreateProgramScreenNavigationProp>();
  const { user } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState<ProgramFormData>({
    title: '',
    description: '',
    date: '',
    budget: 500,
    duration: 4,
    category: '',
    location: '',
    participants: 1,
    preferences: {
      activity_level: 'medium',
      indoor_outdoor: 'both',
      time_preference: 'flexible',
    },
    ai_assistance: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [showAiRecommendations, setShowAiRecommendations] = useState(false);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);

  const categories = [
    { label: 'Yemek & İçecek', value: 'food_drink' },
    { label: 'Eğlence', value: 'entertainment' },
    { label: 'Spor & Aktivite', value: 'sports_activity' },
    { label: 'Kültür & Sanat', value: 'culture_art' },
    { label: 'Alışveriş', value: 'shopping' },
    { label: 'Doğa & Açık Hava', value: 'nature_outdoor' },
    { label: 'Eğitim & Gelişim', value: 'education' },
    { label: 'Sağlık & Wellness', value: 'health_wellness' },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Program başlığı gereklidir';
    }

    if (!formData.date) {
      newErrors.date = 'Tarih seçimi gereklidir';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Geçmiş bir tarih seçemezsiniz';
      }
    }

    if (formData.budget < 50) {
      newErrors.budget = 'Minimum bütçe 50 TL olmalıdır';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Konum bilgisi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateAIRecommendations = async () => {
    if (!validateForm()) return;

    setAiLoading(true);
    try {
      // Simulate AI recommendation generation
      // In real implementation, this would call Google Gemini API
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));

      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          type: 'restaurant',
          name: 'Lokanta Maya',
          description: 'Modern Türk mutfağı deneyimi',
          estimated_cost: 150,
          duration: 2,
          location: formData.location,
          rating: 4.5,
          reason: 'Bütçenize uygun ve kaliteli yemek deneyimi',
        },
        {
          id: '2',
          type: 'activity',
          name: 'Şehir Turu',
          description: 'Rehberli şehir keşif turu',
          estimated_cost: 80,
          duration: 3,
          location: formData.location,
          rating: 4.2,
          reason: 'Seçtiğiniz süreye uygun aktivite',
        },
        {
          id: '3',
          type: 'entertainment',
          name: 'Sinema',
          description: 'En yeni filmleri izleyin',
          estimated_cost: 60,
          duration: 2.5,
          location: formData.location,
          rating: 4.0,
          reason: 'Rahatlatıcı eğlence seçeneği',
        },
        {
          id: '4',
          type: 'shopping',
          name: 'AVM Gezisi',
          description: 'Alışveriş ve kafeler',
          estimated_cost: 200,
          duration: 4,
          location: formData.location,
          rating: 3.8,
          reason: 'Çeşitli aktivite seçenekleri',
        },
      ];

      setAiRecommendations(mockRecommendations);
      setShowAiRecommendations(true);

      toast.show({
        title: 'AI Önerileri Hazır!',
        description: 'Size özel öneriler oluşturuldu.',
        colorScheme: 'success',
      });
    } catch (error) {
      toast.show({
        title: 'Hata',
        description: 'AI önerileri oluşturulurken bir hata oluştu.',
        colorScheme: 'error',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const toggleRecommendation = (id: string) => {
    setSelectedRecommendations(prev => 
      prev.includes(id) 
        ? prev.filter(recId => recId !== id)
        : [...prev, id]
    );
  };

  const createProgram = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const selectedRecs = aiRecommendations.filter(rec => 
        selectedRecommendations.includes(rec.id)
      );

      const totalEstimatedCost = selectedRecs.reduce((sum, rec) => sum + rec.estimated_cost, 0);

      const { data, error } = await supabase
        .from('programs')
        .insert({
          user_id: user?.id,
          title: formData.title,
          description: formData.description,
          date: formData.date,
          total_budget: formData.budget,
          estimated_cost: totalEstimatedCost,
          duration_hours: formData.duration,
          category: formData.category,
          location: formData.location,
          participants_count: formData.participants,
          preferences: formData.preferences,
          ai_generated: formData.ai_assistance,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      // Add selected recommendations as program activities
      if (selectedRecs.length > 0) {
        const activities = selectedRecs.map(rec => ({
          program_id: data.id,
          type: rec.type,
          title: rec.name,
          description: rec.description,
          estimated_cost: rec.estimated_cost,
          duration_hours: rec.duration,
          location: rec.location,
          status: 'planned',
        }));

        const { error: activitiesError } = await supabase
          .from('program_activities')
          .insert(activities);

        if (activitiesError) throw activitiesError;
      }

      toast.show({
        title: 'Program Oluşturuldu!',
        description: 'Programınız başarıyla oluşturuldu.',
        colorScheme: 'success',
      });

      navigation.goBack();
    } catch (error: unknown) {
      let errorMessage = 'Program oluşturulurken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Hata',
        description: errorMessage,
        colorScheme: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: keyof ProgramFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return 'restaurant';
      case 'activity': return 'local-activity';
      case 'shopping': return 'shopping-bag';
      case 'entertainment': return 'movie';
      default: return 'star';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      flex={1}
    >
      <Box flex={1} bg="gray.50" safeArea>
        <ScrollView keyboardShouldPersistTaps="handled">
          <VStack space={4} p={4}>
            {/* Header */}
            <HStack justifyContent="space-between" alignItems="center">
              <Pressable onPress={() => navigation.goBack()}>
                <Icon as={MaterialIcons} name="arrow-back" size={6} color="gray.600" />
              </Pressable>
              <Heading size="lg" color="gray.700">
                Yeni Program Oluştur
              </Heading>
              <Box w={6} />
            </HStack>

            {/* Basic Information */}
            <Card>
              <VStack space={4} p={4}>
                <Heading size="md" color="gray.700">
                  Temel Bilgiler
                </Heading>

                <FormControl isRequired isInvalid={!!errors.title}>
                  <FormControl.Label>Program Başlığı</FormControl.Label>
                  <Input
                    placeholder="Örn: İstanbul'da Harika Bir Gün"
                    value={formData.title}
                    onChangeText={(text) => updateFormData('title', text)}
                  />
                  <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                    {errors.title}
                  </FormControl.ErrorMessage>
                </FormControl>

                <FormControl>
                  <FormControl.Label>Açıklama (Opsiyonel)</FormControl.Label>
                  <TextArea
                    placeholder="Programınız hakkında kısa bir açıklama..."
                    value={formData.description}
                    onChangeText={(text) => updateFormData('description', text)}
                    h={20}
                    autoCompleteType="off"
                  />
                </FormControl>

                <HStack space={4}>
                  <FormControl flex={1} isRequired isInvalid={!!errors.date}>
                    <FormControl.Label>Tarih</FormControl.Label>
                    <Input
                      placeholder="YYYY-MM-DD"
                      value={formData.date}
                      onChangeText={(text) => updateFormData('date', text)}
                    />
                    <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                      {errors.date}
                    </FormControl.ErrorMessage>
                  </FormControl>

                  <FormControl flex={1}>
                    <FormControl.Label>Katılımcı Sayısı</FormControl.Label>
                    <Select
                      selectedValue={formData.participants.toString()}
                      onValueChange={(value) => updateFormData('participants', parseInt(value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <Select.Item key={num} label={`${num} kişi`} value={num.toString()} />
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                <FormControl isRequired isInvalid={!!errors.location}>
                  <FormControl.Label>Konum</FormControl.Label>
                  <Input
                    placeholder="Şehir veya bölge adı"
                    value={formData.location}
                    onChangeText={(text) => updateFormData('location', text)}
                  />
                  <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                    {errors.location}
                  </FormControl.ErrorMessage>
                </FormControl>

                <FormControl>
                  <FormControl.Label>Kategori</FormControl.Label>
                  <Select
                    selectedValue={formData.category}
                    placeholder="Kategori seçiniz"
                    onValueChange={(value) => updateFormData('category', value)}
                  >
                    {categories.map(cat => (
                      <Select.Item key={cat.value} label={cat.label} value={cat.value} />
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </Card>

            {/* Budget & Duration */}
            <Card>
              <VStack space={4} p={4}>
                <Heading size="md" color="gray.700">
                  Bütçe & Süre
                </Heading>

                <FormControl isInvalid={!!errors.budget}>
                  <FormControl.Label>
                    Bütçe: ₺{formData.budget.toLocaleString()}
                  </FormControl.Label>
                  <Slider
                    value={formData.budget}
                    minValue={50}
                    maxValue={5000}
                    step={50}
                    onChange={(value) => updateFormData('budget', value)}
                    colorScheme="primary"
                  >
                    <Slider.Track>
                      <Slider.FilledTrack />
                    </Slider.Track>
                    <Slider.Thumb />
                  </Slider>
                  <HStack justifyContent="space-between" mt={1}>
                    <Text fontSize="xs" color="gray.500">₺50</Text>
                    <Text fontSize="xs" color="gray.500">₺5.000</Text>
                  </HStack>
                  <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                    {errors.budget}
                  </FormControl.ErrorMessage>
                </FormControl>

                <FormControl>
                  <FormControl.Label>
                    Süre: {formData.duration} saat
                  </FormControl.Label>
                  <Slider
                    value={formData.duration}
                    minValue={1}
                    maxValue={12}
                    step={0.5}
                    onChange={(value) => updateFormData('duration', value)}
                    colorScheme="primary"
                  >
                    <Slider.Track>
                      <Slider.FilledTrack />
                    </Slider.Track>
                    <Slider.Thumb />
                  </Slider>
                  <HStack justifyContent="space-between" mt={1}>
                    <Text fontSize="xs" color="gray.500">1 saat</Text>
                    <Text fontSize="xs" color="gray.500">12 saat</Text>
                  </HStack>
                </FormControl>
              </VStack>
            </Card>

            {/* Preferences */}
            <Card>
              <VStack space={4} p={4}>
                <Heading size="md" color="gray.700">
                  Tercihler
                </Heading>

                <FormControl>
                  <FormControl.Label>Aktivite Seviyesi</FormControl.Label>
                  <Select
                    selectedValue={formData.preferences.activity_level}
                    onValueChange={(value) => updateFormData('preferences', {
                      ...formData.preferences,
                      activity_level: value as 'low' | 'medium' | 'high'
                    })}
                  >
                    <Select.Item label="Düşük (Rahat)" value="low" />
                    <Select.Item label="Orta (Dengeli)" value="medium" />
                    <Select.Item label="Yüksek (Aktif)" value="high" />
                  </Select>
                </FormControl>

                <FormControl>
                  <FormControl.Label>Mekan Tercihi</FormControl.Label>
                  <Select
                    selectedValue={formData.preferences.indoor_outdoor}
                    onValueChange={(value) => updateFormData('preferences', {
                      ...formData.preferences,
                      indoor_outdoor: value as 'indoor' | 'outdoor' | 'both'
                    })}
                  >
                    <Select.Item label="İç Mekan" value="indoor" />
                    <Select.Item label="Açık Hava" value="outdoor" />
                    <Select.Item label="Her İkisi" value="both" />
                  </Select>
                </FormControl>

                <FormControl>
                  <FormControl.Label>Zaman Tercihi</FormControl.Label>
                  <Select
                    selectedValue={formData.preferences.time_preference}
                    onValueChange={(value) => updateFormData('preferences', {
                      ...formData.preferences,
                      time_preference: value as 'morning' | 'afternoon' | 'evening' | 'flexible'
                    })}
                  >
                    <Select.Item label="Sabah" value="morning" />
                    <Select.Item label="Öğleden Sonra" value="afternoon" />
                    <Select.Item label="Akşam" value="evening" />
                    <Select.Item label="Esnek" value="flexible" />
                  </Select>
                </FormControl>

                {formData.category === 'food_drink' && (
                  <FormControl>
                    <FormControl.Label>Mutfak Tercihi</FormControl.Label>
                    <Select
                      selectedValue={formData.preferences.cuisine_type}
                      placeholder="Mutfak türü seçiniz"
                      onValueChange={(value) => updateFormData('preferences', {
                        ...formData.preferences,
                        cuisine_type: value
                      })}
                    >
                      <Select.Item label="Türk Mutfağı" value="turkish" />
                      <Select.Item label="İtalyan" value="italian" />
                      <Select.Item label="Uzak Doğu" value="asian" />
                      <Select.Item label="Fast Food" value="fast_food" />
                      <Select.Item label="Vejetaryen" value="vegetarian" />
                      <Select.Item label="Karışık" value="mixed" />
                    </Select>
                  </FormControl>
                )}
              </VStack>
            </Card>

            {/* AI Assistant */}
            <Card>
              <VStack space={4} p={4}>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Heading size="md" color="gray.700">
                      AI Asistan
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      Size özel öneriler oluşturmak için AI kullanın
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={formData.ai_assistance}
                    onToggle={(value) => updateFormData('ai_assistance', value)}
                    colorScheme="primary"
                  />
                </HStack>

                {formData.ai_assistance && (
                  <Button
                    leftIcon={<Icon as={MaterialIcons} name="auto-awesome" size={5} />}
                    colorScheme="purple"
                    variant="outline"
                    onPress={generateAIRecommendations}
                    isLoading={aiLoading}
                    isLoadingText="AI önerileri oluşturuluyor..."
                  >
                    AI Önerileri Oluştur
                  </Button>
                )}
              </VStack>
            </Card>

            {/* AI Recommendations */}
            {showAiRecommendations && aiRecommendations.length > 0 && (
              <Card>
                <VStack space={4} p={4}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Heading size="md" color="gray.700">
                      AI Önerileri
                    </Heading>
                    <Badge colorScheme="purple" variant="solid">
                      {selectedRecommendations.length} seçili
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    Programınıza eklemek istediğiniz aktiviteleri seçin
                  </Text>

                  <VStack space={3}>
                    {aiRecommendations.map((recommendation) => {
                      const isSelected = selectedRecommendations.includes(recommendation.id);
                      return (
                        <Pressable
                          key={recommendation.id}
                          onPress={() => toggleRecommendation(recommendation.id)}
                        >
                          <Box
                            bg={isSelected ? 'primary.50' : 'white'}
                            p={4}
                            rounded="md"
                            borderWidth={2}
                            borderColor={isSelected ? 'primary.500' : 'gray.200'}
                          >
                            <HStack space={3} alignItems="center">
                              <Icon
                                as={MaterialIcons}
                                name={getRecommendationIcon(recommendation.type)}
                                size={8}
                                color={isSelected ? 'primary.600' : 'gray.600'}
                              />
                              <VStack flex={1} space={1}>
                                <Text fontSize="md" fontWeight="semibold">
                                  {recommendation.name}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {recommendation.description}
                                </Text>
                                <HStack space={4} alignItems="center">
                                  <Text fontSize="xs" color="green.600" fontWeight="medium">
                                    ₺{recommendation.estimated_cost}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {recommendation.duration} saat
                                  </Text>
                                  <HStack space={1} alignItems="center">
                                    <Icon as={MaterialIcons} name="star" size={3} color="yellow.500" />
                                    <Text fontSize="xs" color="gray.500">
                                      {recommendation.rating}
                                    </Text>
                                  </HStack>
                                </HStack>
                                <Text fontSize="xs" color="purple.600" italic>
                                  {recommendation.reason}
                                </Text>
                              </VStack>
                              {isSelected && (
                                <Icon
                                  as={MaterialIcons}
                                  name="check-circle"
                                  size={6}
                                  color="primary.600"
                                />
                              )}
                            </HStack>
                          </Box>
                        </Pressable>
                      );
                    })}
                  </VStack>

                  {selectedRecommendations.length > 0 && (
                    <Box bg="gray.100" p={3} rounded="md">
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="sm" fontWeight="medium">
                          Tahmini Toplam Maliyet:
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="primary.600">
                          ₺{aiRecommendations
                            .filter(rec => selectedRecommendations.includes(rec.id))
                            .reduce((sum, rec) => sum + rec.estimated_cost, 0)
                            .toLocaleString()}
                        </Text>
                      </HStack>
                      {formData.budget < aiRecommendations
                        .filter(rec => selectedRecommendations.includes(rec.id))
                        .reduce((sum, rec) => sum + rec.estimated_cost, 0) && (
                        <Text fontSize="xs" color="red.500" mt={1}>
                          ⚠️ Seçilen aktiviteler bütçenizi aşıyor
                        </Text>
                      )}
                    </Box>
                  )}
                </VStack>
              </Card>
            )}

            {/* Create Button */}
            <Button
              size="lg"
              colorScheme="primary"
              onPress={createProgram}
              isLoading={loading}
              isLoadingText="Program oluşturuluyor..."
              leftIcon={<Icon as={MaterialIcons} name="add" size={5} />}
            >
              Program Oluştur
            </Button>
          </VStack>
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
};