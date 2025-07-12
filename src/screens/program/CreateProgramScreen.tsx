import React, { useState } from 'react';
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
  FormControl,
  Input,
  TextArea,
  Select,
  CheckIcon,
  Card,
  Pressable,
  Badge,
  Divider,
  Switch,
  Modal,
  Slider,
  Checkbox,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { geminiService } from '../../services/gemini';
import { supabase } from '../../services/supabase';



type RootStackParamList = {
  CreateProgram: undefined;
  ProgramDetail: { programId: string };
};

type CreateProgramNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProgramTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  estimated_budget: number;
  duration_days: number;
  activities: {
    title: string;
    description: string;
    category: string;
    estimated_amount: number;
  }[];
}

interface ActivityForm {
  title: string;
  description: string;
  category: string;
  target_amount: string;
  due_date: string;
}

export const CreateProgramScreen = () => {
  const navigation = useNavigation<CreateProgramNavigationProp>();
  const toast = useToast();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  // Program Form State
  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    category: '',
    total_budget: '',
    start_date: '',
    end_date: '',
    auto_tracking: true,
    notifications: true,
  });

  // Activities State
  const [activities, setActivities] = useState<ActivityForm[]>([]);
  const [currentActivity, setCurrentActivity] = useState<ActivityForm>({
    title: '',
    description: '',
    category: '',
    target_amount: '',
    due_date: '',
  });

  // AI Preferences State
  const [aiPreferences, setAiPreferences] = useState({
    budget: 1000,
    duration: '1 gün',
    location: 'İstanbul',
    interests: [] as string[],
    occasion: '',
    groupSize: 1,
    activityTypes: [] as string[],
    programType: 'personal_development' as 'personal_development' | 'fitness_health' | 'education_learning' | 'hobby_creativity' | 'social_entertainment' | 'business_career' | 'travel_exploration' | 'family_relationships',
    priorityCategories: [] as string[],
  });

  // Templates
  const templates: ProgramTemplate[] = [
    {
      id: '1',
      title: 'Aylık Market Alışverişi',
      description: 'Aylık market harcamalarınızı optimize edin',
      category: 'Gıda',
      estimated_budget: 1500,
      duration_days: 30,
      activities: [
        {
          title: 'Haftalık Market',
          description: 'Temel gıda maddeleri',
          category: 'Gıda',
          estimated_amount: 400,
        },
        {
          title: 'Temizlik Malzemeleri',
          description: 'Ev temizlik ürünleri',
          category: 'Temizlik',
          estimated_amount: 200,
        },
        {
          title: 'Kişisel Bakım',
          description: 'Hijyen ürünleri',
          category: 'Kişisel Bakım',
          estimated_amount: 150,
        },
      ],
    },
    {
      id: '2',
      title: 'Haftalık Yemek Planı',
      description: 'Haftalık yemek harcamalarınızı planlayın',
      category: 'Gıda',
      estimated_budget: 800,
      duration_days: 7,
      activities: [
        {
          title: 'Kahvaltı Malzemeleri',
          description: 'Ekmek, süt, peynir, yumurta',
          category: 'Gıda',
          estimated_amount: 150,
        },
        {
          title: 'Öğle Yemeği',
          description: 'Ana yemek malzemeleri',
          category: 'Gıda',
          estimated_amount: 300,
        },
        {
          title: 'Akşam Yemeği',
          description: 'Akşam yemeği malzemeleri',
          category: 'Gıda',
          estimated_amount: 250,
        },
      ],
    },
    {
      id: '3',
      title: 'Kişisel Bakım Rutini',
      description: 'Aylık kişisel bakım harcamalarınız',
      category: 'Kişisel Bakım',
      estimated_budget: 500,
      duration_days: 30,
      activities: [
        {
          title: 'Saç Bakımı',
          description: 'Şampuan, saç kremi, maske',
          category: 'Kişisel Bakım',
          estimated_amount: 150,
        },
        {
          title: 'Cilt Bakımı',
          description: 'Temizleyici, nemlendirici, güneş kremi',
          category: 'Kişisel Bakım',
          estimated_amount: 200,
        },
        {
          title: 'Diğer',
          description: 'Diş macunu, sabun, deodorant',
          category: 'Kişisel Bakım',
          estimated_amount: 100,
        },
      ],
    },
  ];

  const handleTemplateSelect = (template: ProgramTemplate) => {
    setProgramForm({
      ...programForm,
      title: template.title,
      description: template.description,
      category: template.category,
      total_budget: template.estimated_budget.toString(),
    });

    const templateActivities = template.activities.map(activity => ({
      ...activity,
      target_amount: activity.estimated_amount.toString(),
      due_date: '',
    }));
    setActivities(templateActivities);
    setCurrentStep(2);
  };

  const handleAddActivity = () => {
    if (!currentActivity.title.trim() || !currentActivity.target_amount) {
      toast.show({
        title: 'Eksik Bilgi',
        description: 'Başlık ve hedef tutar alanları zorunludur.',
        variant: 'top-accent',
        bgColor: 'orange.500',
      });
      return;
    }

    setActivities([...activities, currentActivity]);
    setCurrentActivity({
      title: '',
      description: '',
      category: '',
      target_amount: '',
      due_date: '',
    });
  };

  const handleRemoveActivity = (index: number) => {
    const newActivities = activities.filter((_, i) => i !== index);
    setActivities(newActivities);
  };

  const handleGenerateAiProgram = async () => {
    if (!user) {
      toast.show({
        title: 'Hata',
        description: 'Giriş yapmanız gerekiyor.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
      return;
    }

    try {
      setAiLoading(true);
      
      const userPreferences = await geminiService.getUserPreferences(user.id);
      
      // Determine program type based on duration
      let programType: 'daily' | 'weekly' | 'monthly' = 'daily';
      if (aiPreferences.duration.includes('hafta')) {
        programType = 'weekly';
      } else if (aiPreferences.duration.includes('ay')) {
        programType = 'monthly';
      }
      
      const aiRequest = {
        user_preferences: {
          ...userPreferences,
          interests: aiPreferences.interests.length > 0 ? aiPreferences.interests : userPreferences.interests,
          activity_types: aiPreferences.activityTypes.length > 0 ? aiPreferences.activityTypes : ['restoran', 'eğlence', 'alışveriş'],
        },
        budget: aiPreferences.budget,
        duration: aiPreferences.duration,
        location: aiPreferences.location || 'İstanbul',
        occasion: aiPreferences.occasion,
        group_size: aiPreferences.groupSize,
        program_type: programType,
        categories: aiPreferences.interests,
      };

      // Use the new budget-focused program generator
      const suggestion = await geminiService.generateBudgetProgram(aiRequest);
      
      if (suggestion) {
        // Advanced budget optimization if needed
        if (suggestion.total_estimated_cost > aiPreferences.budget) {
          const optimizedActivities = await geminiService.optimizeProgramBudget(
            suggestion.activities,
            aiPreferences.budget
          );
          
          suggestion.activities = optimizedActivities;
          suggestion.total_estimated_cost = optimizedActivities.reduce(
            (total: number, activity: any) => total + (activity.estimated_cost || 0),
            0
          );
        }
        
        setAiSuggestions(suggestion);
        setShowAiModal(true);
      } else {
        toast.show({
          title: 'Hata',
          description: 'AI önerisi oluşturulamadı. Lütfen tekrar deneyin.',
          variant: 'top-accent',
          bgColor: 'orange.500',
        });
      }
    } catch (error) {
      console.error('AI program generation error:', error);
      toast.show({
        title: 'Hata',
        description: 'AI önerisi oluşturulurken bir hata oluştu.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAiSuggestion = () => {
    if (aiSuggestions) {
      setProgramForm({
        ...programForm,
        title: aiSuggestions.title,
        description: aiSuggestions.description,
        total_budget: aiSuggestions.total_estimated_cost.toString(),
        category: aiSuggestions.tags?.[0] || 'Genel',
      });

      const aiActivities = aiSuggestions.activities.map((activity: any) => ({
        title: activity.title,
        description: activity.description,
        category: activity.type,
        target_amount: activity.estimated_cost.toString(),
        due_date: '',
      }));
      
      setActivities(aiActivities);
      setShowAiModal(false);
      setCurrentStep(2);
    }
  };

  const handleCreateProgram = async () => {
    if (!programForm.title.trim() || !programForm.total_budget || activities.length === 0) {
      toast.show({
        title: 'Eksik Bilgi',
        description: 'Program başlığı, bütçe ve en az bir aktivite gereklidir.',
        variant: 'top-accent',
        bgColor: 'orange.500',
      });
      return;
    }

    if (!user) {
      toast.show({
        title: 'Hata',
        description: 'Giriş yapmanız gerekiyor.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
      return;
    }

    try {
      setLoading(true);

      // Create program in Supabase
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .insert({
          user_id: user.id,
          title: programForm.title,
          description: programForm.description,
          category: programForm.category,
          total_budget: parseFloat(programForm.total_budget),
          start_date: programForm.start_date || new Date().toISOString(),
          end_date: programForm.end_date,
          auto_tracking: programForm.auto_tracking,
          notifications: programForm.notifications,
          status: 'active',
        })
        .select()
        .single();

      if (programError) throw programError;

      // Create activities
      const activitiesData = activities.map(activity => ({
        program_id: programData.id,
        title: activity.title,
        description: activity.description,
        category: activity.category,
        target_amount: parseFloat(activity.target_amount),
        due_date: activity.due_date || null,
        status: 'pending',
      }));

      const { error: activitiesError } = await supabase
        .from('activities')
        .insert(activitiesData);

      if (activitiesError) throw activitiesError;

      toast.show({
        title: 'Başarılı',
        description: 'Program başarıyla oluşturuldu!',
        variant: 'top-accent',
        bgColor: 'green.500',
      });

      // Navigate to program detail
      navigation.navigate('ProgramDetail', { programId: programData.id });
    } catch (error: unknown) {
      let errorMessage = 'Program oluşturulurken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Create program error:', error);
      toast.show({
        title: 'Hata',
        description: errorMessage,
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalEstimatedAmount = () => {
    return activities.reduce((total, activity) => {
      return total + (parseFloat(activity.target_amount) || 0);
    }, 0);
  };

  const renderStepIndicator = () => {
    return (
      <HStack space={4} justifyContent="center" alignItems="center" py={4}>
        {[1, 2, 3].map((step) => (
          <HStack key={step} alignItems="center">
            <Box
              w={8}
              h={8}
              rounded="full"
              bg={currentStep >= step ? 'primary.500' : 'gray.300'}
              alignItems="center"
              justifyContent="center"
            >
              <Text
                color={currentStep >= step ? 'white' : 'gray.600'}
                fontSize="sm"
                fontWeight="bold"
              >
                {step}
              </Text>
            </Box>
            {step < 3 && (
              <Box
                w={8}
                h={0.5}
                bg={currentStep > step ? 'primary.500' : 'gray.300'}
                mx={2}
              />
            )}
          </HStack>
        ))}
      </HStack>
    );
  };

  const renderAiModal = () => (
    <Modal isOpen={showAiModal} onClose={() => setShowAiModal(false)} size="full">
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>
          <HStack space={2} alignItems="center">
            <Icon as={MaterialIcons} name="auto-awesome" size={5} color="primary.500" />
            <Text fontSize="lg" fontWeight="bold">AI Program Önerisi</Text>
          </HStack>
        </Modal.Header>
        <Modal.Body>
          {aiSuggestions && (
            <VStack space={4}>
              <VStack space={2}>
                <Text fontSize="lg" fontWeight="bold" color="gray.700">
                  {aiSuggestions.title}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {aiSuggestions.description}
                </Text>
              </VStack>
              
              {/* Budget Summary Card */}
              <Card bg="primary.50" borderColor="primary.200" borderWidth={1}>
                <VStack space={3} p={4}>
                  <Text fontSize="md" fontWeight="semibold" color="primary.700">
                    Bütçe Özeti
                  </Text>
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Toplam Bütçe:
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color="primary.600">
                      ₺{aiSuggestions.total_estimated_cost?.toLocaleString()}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Program Süresi:
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                      {aiSuggestions.total_duration}
                    </Text>
                  </HStack>
                  
                  {/* Budget Breakdown */}
                  {aiSuggestions.budget_breakdown && (
                    <VStack space={2}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        Bütçe Dağılımı:
                      </Text>
                      {Object.entries(aiSuggestions.budget_breakdown).map(([category, percentage]: [string, any]) => (
                        <HStack key={category} justifyContent="space-between" alignItems="center">
                          <Text fontSize="xs" color="gray.600" textTransform="capitalize">
                            {category}:
                          </Text>
                          <Text fontSize="xs" color="primary.600">
                            %{percentage}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </Card>
              
              <VStack space={3}>
                <Text fontSize="md" fontWeight="semibold" color="gray.700">
                  Önerilen Aktiviteler ({aiSuggestions.activities?.length || 0}):
                </Text>
                {aiSuggestions.activities?.map((activity: any, index: number) => (
                  <Card key={index} borderLeftWidth={3} borderLeftColor={activity.priority === 'high' ? 'red.400' : activity.priority === 'medium' ? 'orange.400' : 'green.400'}>
                    <VStack space={2} p={3}>
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <VStack flex={1} space={1}>
                          <Text fontSize="md" fontWeight="semibold">
                            {activity.title}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {activity.description}
                          </Text>
                        </VStack>
                        {activity.priority && (
                          <Badge 
                            colorScheme={activity.priority === 'high' ? 'red' : activity.priority === 'medium' ? 'orange' : 'green'}
                            variant="subtle"
                            size="sm"
                          >
                            {activity.priority === 'high' ? 'Yüksek' : activity.priority === 'medium' ? 'Orta' : 'Düşük'}
                          </Badge>
                        )}
                      </HStack>
                      
                      <HStack justifyContent="space-between" alignItems="center">
                        <HStack space={2} alignItems="center">
                          {activity.category && (
                            <Badge colorScheme="gray" variant="outline" size="sm">
                              {activity.category}
                            </Badge>
                          )}
                          <Text fontSize="xs" color="gray.500">
                            {activity.estimated_duration}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" fontWeight="bold" color="primary.500">
                          ₺{activity.estimated_cost?.toLocaleString()}
                        </Text>
                      </HStack>
                      
                      {activity.optimization_note && (
                        <Text fontSize="xs" color="blue.600" italic>
                          💡 {activity.optimization_note}
                        </Text>
                      )}
                    </VStack>
                  </Card>
                ))}
              </VStack>
              
              {/* Savings Tips */}
              {aiSuggestions.savings_tips && aiSuggestions.savings_tips.length > 0 && (
                <Card bg="green.50" borderColor="green.200" borderWidth={1}>
                  <VStack space={2} p={3}>
                    <Text fontSize="sm" fontWeight="semibold" color="green.700">
                      💰 Tasarruf İpuçları:
                    </Text>
                    {aiSuggestions.savings_tips.map((tip: string, index: number) => (
                      <Text key={index} fontSize="xs" color="green.600">
                        • {tip}
                      </Text>
                    ))}
                  </VStack>
                </Card>
              )}
              
              {aiSuggestions.tags && (
                <HStack space={2} flexWrap="wrap">
                  {aiSuggestions.tags.map((tag: string, index: number) => (
                    <Badge key={index} colorScheme="primary" variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              )}
            </VStack>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={() => setShowAiModal(false)}>
              İptal
            </Button>
            <Button 
              onPress={handleAcceptAiSuggestion}
              leftIcon={<Icon as={MaterialIcons} name="check" size={4} />}
            >
              Bu Öneriye Kabul Et
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );

  const renderAiPreferences = () => (
    <VStack space={6} p={4}>
      <VStack space={2}>
        <Heading size="lg" color="gray.700" textAlign="center">
          AI Program Oluşturucu
        </Heading>
        <Text color="gray.600" textAlign="center" fontSize="sm">
          Tercihlerinizi belirtin, AI size özel program önerisi oluştursun
        </Text>
      </VStack>

      <VStack space={4}>
        <FormControl>
          <FormControl.Label>Bütçe (₺)</FormControl.Label>
          <VStack space={2}>
            <Slider
              value={aiPreferences.budget}
              onChange={(value) => setAiPreferences({...aiPreferences, budget: value})}
              minValue={100}
              maxValue={10000}
              step={100}
            >
              <Slider.Track>
                <Slider.FilledTrack />
              </Slider.Track>
              <Slider.Thumb />
            </Slider>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              ₺{aiPreferences.budget.toLocaleString()}
            </Text>
          </VStack>
        </FormControl>

        <FormControl>
          <FormControl.Label>Süre</FormControl.Label>
          <Select
            selectedValue={aiPreferences.duration}
            onValueChange={(value) => setAiPreferences({...aiPreferences, duration: value})}
            placeholder="Süre seçin"
          >
            <Select.Item label="Yarım gün" value="4 saat" />
            <Select.Item label="1 gün" value="1 gün" />
            <Select.Item label="2 gün" value="2 gün" />
            <Select.Item label="3 gün" value="3 gün" />
            <Select.Item label="1 hafta" value="1 hafta" />
          </Select>
        </FormControl>

        <FormControl>
          <FormControl.Label>Lokasyon</FormControl.Label>
          <Input
            value={aiPreferences.location}
            onChangeText={(text) => setAiPreferences({...aiPreferences, location: text})}
            placeholder="Şehir veya bölge"
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>Özel Durum (İsteğe bağlı)</FormControl.Label>
          <Input
            value={aiPreferences.occasion}
            onChangeText={(text) => setAiPreferences({...aiPreferences, occasion: text})}
            placeholder="Örn: Doğum günü, romantik akşam"
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>Grup Büyüklüğü</FormControl.Label>
          <VStack space={2}>
            <Slider
              value={aiPreferences.groupSize}
              onChange={(value) => setAiPreferences({...aiPreferences, groupSize: Math.round(value)})}
              minValue={1}
              maxValue={10}
              step={1}
            >
              <Slider.Track>
                <Slider.FilledTrack />
              </Slider.Track>
              <Slider.Thumb />
            </Slider>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              {aiPreferences.groupSize} kişi
            </Text>
          </VStack>
        </FormControl>

        <FormControl>
          <FormControl.Label>Program Türü</FormControl.Label>
          <Select
            selectedValue={aiPreferences.programType}
            onValueChange={(value: string) => setAiPreferences({...aiPreferences, programType: value as any})}
            placeholder="Program türü seçin"
          >
            <Select.Item label="Kişisel Gelişim" value="personal_development" />
            <Select.Item label="Fitness & Sağlık" value="fitness_health" />
            <Select.Item label="Eğitim & Öğrenme" value="education_learning" />
            <Select.Item label="Hobi & Yaratıcılık" value="hobby_creativity" />
            <Select.Item label="Sosyal & Eğlence" value="social_entertainment" />
            <Select.Item label="İş & Kariyer" value="business_career" />
            <Select.Item label="Seyahat & Keşif" value="travel_exploration" />
            <Select.Item label="Aile & İlişkiler" value="family_relationships" />
          </Select>
        </FormControl>

        <FormControl>
          <FormControl.Label>Öncelik Kategorileri (En fazla 3 seçin)</FormControl.Label>
          <VStack space={2}>
            {[
              { label: 'Maliyet Optimizasyonu', value: 'cost_optimization' },
              { label: 'Zaman Verimliliği', value: 'time_efficiency' },
              { label: 'Kalite & Etki', value: 'quality_impact' },
              { label: 'Esneklik', value: 'flexibility' },
              { label: 'Sosyal Etkileşim', value: 'social_interaction' },
              { label: 'Kişisel Büyüme', value: 'personal_growth' }
            ].map((category) => (
              <Checkbox
                key={category.value}
                value={category.value}
                isChecked={aiPreferences.priorityCategories.includes(category.value)}
                onChange={(isChecked: boolean) => {
                  if (isChecked && aiPreferences.priorityCategories.length < 3) {
                    setAiPreferences({
                      ...aiPreferences,
                      priorityCategories: [...aiPreferences.priorityCategories, category.value]
                    });
                  } else if (!isChecked) {
                    setAiPreferences({
                      ...aiPreferences,
                      priorityCategories: aiPreferences.priorityCategories.filter(c => c !== category.value)
                    });
                  }
                }}
                isDisabled={!aiPreferences.priorityCategories.includes(category.value) && aiPreferences.priorityCategories.length >= 3}
              >
                <Text fontSize="sm" color="gray.700">
                  {category.label}
                </Text>
              </Checkbox>
            ))}
          </VStack>
        </FormControl>

        <FormControl>
          <FormControl.Label>İlgi Alanları</FormControl.Label>
          <VStack space={2}>
            {['Yemek', 'Kültür', 'Spor', 'Doğa', 'Alışveriş', 'Eğlence', 'Sanat', 'Tarih'].map((interest) => (
              <Checkbox
                key={interest}
                value={interest}
                isChecked={aiPreferences.interests.includes(interest)}
                onChange={(isChecked: boolean) => {
                  if (isChecked) {
                    setAiPreferences({
                      ...aiPreferences,
                      interests: [...aiPreferences.interests, interest]
                    });
                  } else {
                    setAiPreferences({
                      ...aiPreferences,
                      interests: aiPreferences.interests.filter(i => i !== interest)
                    });
                  }
                }}
              >
                {interest}
              </Checkbox>
            ))}
          </VStack>
        </FormControl>

        <FormControl>
          <FormControl.Label>Aktivite Türleri</FormControl.Label>
          <VStack space={2}>
            {['Restoran', 'Kafe', 'Sinema', 'Müze', 'Park', 'Alışveriş Merkezi', 'Spor Salonu', 'Konsert'].map((activityType) => (
              <Checkbox
                key={activityType}
                value={activityType}
                isChecked={aiPreferences.activityTypes.includes(activityType)}
                onChange={(isChecked: boolean) => {
                  if (isChecked) {
                    setAiPreferences({
                      ...aiPreferences,
                      activityTypes: [...aiPreferences.activityTypes, activityType]
                    });
                  } else {
                    setAiPreferences({
                      ...aiPreferences,
                      activityTypes: aiPreferences.activityTypes.filter(t => t !== activityType)
                    });
                  }
                }}
              >
                {activityType}
              </Checkbox>
            ))}
          </VStack>
        </FormControl>
      </VStack>

      <Button
        onPress={handleGenerateAiProgram}
        isLoading={aiLoading}
        isLoadingText="AI Önerisi Oluşturuluyor..."
        leftIcon={<Icon as={MaterialIcons} name="auto-awesome" size={5} />}
        size="lg"
        bg="gradient.primary"
        _pressed={{ bg: "primary.600" }}
        shadow={3}
      >
        <VStack space={1} alignItems="center">
          <Text fontSize="md" fontWeight="bold" color="white">
            AI ile Akıllı Program Oluştur
          </Text>
          <Text fontSize="xs" color="primary.100">
            Bütçe optimizasyonu ve kişiselleştirilmiş öneriler
          </Text>
        </VStack>
      </Button>
    </VStack>
  );

  const renderStep1 = () => (
    <VStack space={6} p={4}>
      <VStack space={2}>
        <Heading size="lg" color="gray.700" textAlign="center">
          Program Türü Seçin
        </Heading>
        <Text color="gray.600" textAlign="center" fontSize="sm">
          Hazır şablonlardan birini seçin, AI ile oluşturun veya sıfırdan başlayın
        </Text>
      </VStack>

      {/* AI Program Oluşturucu */}
      <Card bg="gradient.500" p={4}>
        <VStack space={3}>
          <HStack alignItems="center" space={2}>
            <Icon as={MaterialIcons} name="auto-awesome" size={6} color="white" />
            <Text fontSize="lg" fontWeight="bold" color="white">
              AI Program Oluşturucu
            </Text>
          </HStack>
          <Text fontSize="sm" color="white" opacity={0.9}>
            Yapay zeka ile kişiselleştirilmiş program önerisi alın
          </Text>
          <Button
            variant="outline"
            _text={{ color: 'white' }}
            borderColor="white"
            onPress={() => setCurrentStep(0)} // AI preferences step
          >
            AI ile Oluştur
          </Button>
        </VStack>
      </Card>

      <VStack space={4}>
        <Text fontSize="md" fontWeight="semibold" color="gray.700">
          Hazır Şablonlar
        </Text>
        {templates.map((template) => (
          <Pressable key={template.id} onPress={() => handleTemplateSelect(template)}>
            <Card>
              <VStack space={3} p={4}>
                <HStack justifyContent="space-between" alignItems="flex-start">
                  <VStack flex={1} space={1}>
                    <Text fontSize="md" fontWeight="semibold" color="gray.700">
                      {template.title}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {template.description}
                    </Text>
                  </VStack>
                  <Badge colorScheme="primary" variant="outline">
                    {template.category}
                  </Badge>
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color="gray.500">
                    Tahmini Bütçe: ₺{template.estimated_budget.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {template.duration_days} gün
                  </Text>
                </HStack>
                <Text fontSize="xs" color="primary.500">
                  {template.activities.length} aktivite içerir
                </Text>
              </VStack>
            </Card>
          </Pressable>
        ))}
      </VStack>

      <Divider />

      <Button
        variant="outline"
        leftIcon={<Icon as={MaterialIcons} name="add" size={5} />}
        onPress={() => setCurrentStep(2)}
      >
        Sıfırdan Oluştur
      </Button>
    </VStack>
  );

  const renderStep2 = () => (
    <VStack space={6} p={4}>
      <VStack space={2}>
        <Heading size="lg" color="gray.700" textAlign="center">
          Program Detayları
        </Heading>
        <Text color="gray.600" textAlign="center" fontSize="sm">
          Programınızın temel bilgilerini girin
        </Text>
      </VStack>

      <VStack space={4}>
        <FormControl isRequired>
          <FormControl.Label>Program Başlığı</FormControl.Label>
          <Input
            placeholder="Örn: Aylık Market Alışverişi"
            value={programForm.title}
            onChangeText={(text) => setProgramForm({...programForm, title: text})}
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>Açıklama</FormControl.Label>
          <TextArea
            placeholder="Program hakkında kısa bir açıklama..."
            value={programForm.description}
            onChangeText={(text) => setProgramForm({...programForm, description: text})}
            h={20}
            autoCompleteType="off"
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>Kategori</FormControl.Label>
          <Select
            selectedValue={programForm.category}
            placeholder="Kategori seçin"
            _selectedItem={{
              bg: 'primary.100',
              endIcon: <CheckIcon size="5" />,
            }}
            onValueChange={(value) => setProgramForm({...programForm, category: value})}
          >
            <Select.Item label="Gıda" value="Gıda" />
            <Select.Item label="Temizlik" value="Temizlik" />
            <Select.Item label="Kişisel Bakım" value="Kişisel Bakım" />
            <Select.Item label="Giyim" value="Giyim" />
            <Select.Item label="Elektronik" value="Elektronik" />
            <Select.Item label="Eğlence" value="Eğlence" />
            <Select.Item label="Ulaşım" value="Ulaşım" />
            <Select.Item label="Diğer" value="Diğer" />
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormControl.Label>Toplam Bütçe (₺)</FormControl.Label>
          <Input
            placeholder="0"
            keyboardType="numeric"
            value={programForm.total_budget}
            onChangeText={(text) => setProgramForm({...programForm, total_budget: text})}
          />
        </FormControl>

        <HStack space={4}>
          <FormControl flex={1}>
            <FormControl.Label>Başlangıç Tarihi</FormControl.Label>
            <Input
              placeholder="YYYY-MM-DD"
              value={programForm.start_date}
              onChangeText={(text) => setProgramForm({...programForm, start_date: text})}
            />
          </FormControl>
          <FormControl flex={1}>
            <FormControl.Label>Bitiş Tarihi</FormControl.Label>
            <Input
              placeholder="YYYY-MM-DD"
              value={programForm.end_date}
              onChangeText={(text) => setProgramForm({...programForm, end_date: text})}
            />
          </FormControl>
        </HStack>

        <VStack space={3}>
          <Text fontSize="md" fontWeight="semibold" color="gray.700">
            Ayarlar
          </Text>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1}>
              <Text fontSize="sm" color="gray.700">
                Otomatik Takip
              </Text>
              <Text fontSize="xs" color="gray.500">
                Harcamalarınızı otomatik olarak takip et
              </Text>
            </VStack>
            <Switch
              isChecked={programForm.auto_tracking}
              onToggle={(value) => setProgramForm({...programForm, auto_tracking: value})}
            />
          </HStack>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1}>
              <Text fontSize="sm" color="gray.700">
                Bildirimler
              </Text>
              <Text fontSize="xs" color="gray.500">
                Program güncellemeleri için bildirim al
              </Text>
            </VStack>
            <Switch
              isChecked={programForm.notifications}
              onToggle={(value) => setProgramForm({...programForm, notifications: value})}
            />
          </HStack>
        </VStack>
      </VStack>

      <HStack space={3} justifyContent="flex-end">
        <Button
          variant="outline"
          onPress={() => setCurrentStep(1)}
        >
          Geri
        </Button>
        <Button
          onPress={() => setCurrentStep(3)}
          isDisabled={!programForm.title.trim() || !programForm.total_budget}
        >
          İleri
        </Button>
      </HStack>
    </VStack>
  );

  const renderStep3 = () => (
    <VStack space={6} p={4}>
      <VStack space={2}>
        <Heading size="lg" color="gray.700" textAlign="center">
          Aktiviteler
        </Heading>
        <Text color="gray.600" textAlign="center" fontSize="sm">
          Programınıza aktiviteler ekleyin
        </Text>
      </VStack>

      {/* Add Activity Form */}
      <Card>
        <VStack space={4} p={4}>
          <Text fontSize="md" fontWeight="semibold" color="gray.700">
            Yeni Aktivite Ekle
          </Text>
          
          <FormControl isRequired>
            <FormControl.Label>Başlık</FormControl.Label>
            <Input
              placeholder="Aktivite başlığı"
              value={currentActivity.title}
              onChangeText={(text) => setCurrentActivity({...currentActivity, title: text})}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Açıklama</FormControl.Label>
            <Input
              placeholder="Aktivite açıklaması"
              value={currentActivity.description}
              onChangeText={(text) => setCurrentActivity({...currentActivity, description: text})}
            />
          </FormControl>

          <HStack space={3}>
            <FormControl flex={1}>
              <FormControl.Label>Kategori</FormControl.Label>
              <Select
                selectedValue={currentActivity.category}
                placeholder="Seçin"
                _selectedItem={{
                  bg: 'primary.100',
                  endIcon: <CheckIcon size="4" />,
                }}
                onValueChange={(value) => setCurrentActivity({...currentActivity, category: value})}
              >
                <Select.Item label="Gıda" value="Gıda" />
                <Select.Item label="Temizlik" value="Temizlik" />
                <Select.Item label="Kişisel Bakım" value="Kişisel Bakım" />
                <Select.Item label="Atıştırmalık" value="Atıştırmalık" />
                <Select.Item label="Giyim" value="Giyim" />
                <Select.Item label="Elektronik" value="Elektronik" />
                <Select.Item label="Diğer" value="Diğer" />
              </Select>
            </FormControl>
            <FormControl flex={1} isRequired>
              <FormControl.Label>Hedef Tutar (₺)</FormControl.Label>
              <Input
                placeholder="0"
                keyboardType="numeric"
                value={currentActivity.target_amount}
                onChangeText={(text) => setCurrentActivity({...currentActivity, target_amount: text})}
              />
            </FormControl>
          </HStack>

          <Button
            leftIcon={<Icon as={MaterialIcons} name="add" size={4} />}
            onPress={handleAddActivity}
            size="sm"
          >
            Aktivite Ekle
          </Button>
        </VStack>
      </Card>

      {/* Activities List */}
      {activities.length > 0 && (
        <VStack space={4}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              Eklenen Aktiviteler ({activities.length})
            </Text>
            <Text fontSize="sm" color="primary.500" fontWeight="semibold">
              Toplam: ₺{getTotalEstimatedAmount().toLocaleString()}
            </Text>
          </HStack>
          
          {activities.map((activity, index) => (
            <Card key={index}>
              <HStack space={4} p={4} alignItems="center">
                <VStack flex={1} space={1}>
                  <Text fontSize="md" fontWeight="semibold" color="gray.700">
                    {activity.title}
                  </Text>
                  {activity.description && (
                    <Text fontSize="sm" color="gray.600">
                      {activity.description}
                    </Text>
                  )}
                  <HStack space={2} alignItems="center">
                    {activity.category && (
                      <Badge colorScheme="gray" variant="outline" size="sm">
                        {activity.category}
                      </Badge>
                    )}
                    <Text fontSize="sm" color="primary.500" fontWeight="semibold">
                      ₺{parseFloat(activity.target_amount || '0').toLocaleString()}
                    </Text>
                  </HStack>
                </VStack>
                <Pressable onPress={() => handleRemoveActivity(index)}>
                  <Icon as={MaterialIcons} name="delete" size={5} color="red.500" />
                </Pressable>
              </HStack>
            </Card>
          ))}
        </VStack>
      )}

      {/* Budget Summary */}
      {activities.length > 0 && (
        <Card bg="primary.50">
          <VStack space={2} p={4}>
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              Bütçe Özeti
            </Text>
            <HStack justifyContent="space-between">
              <Text fontSize="sm" color="gray.600">
                Planlanan Bütçe:
              </Text>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                ₺{parseFloat(programForm.total_budget || '0').toLocaleString()}
              </Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="sm" color="gray.600">
                Aktivite Toplamı:
              </Text>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                ₺{getTotalEstimatedAmount().toLocaleString()}
              </Text>
            </HStack>
            <Divider />
            <HStack justifyContent="space-between">
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Kalan Bütçe:
              </Text>
              <Text 
                fontSize="sm" 
                fontWeight="bold" 
                color={parseFloat(programForm.total_budget || '0') - getTotalEstimatedAmount() >= 0 ? 'green.500' : 'red.500'}
              >
                ₺{(parseFloat(programForm.total_budget || '0') - getTotalEstimatedAmount()).toLocaleString()}
              </Text>
            </HStack>
          </VStack>
        </Card>
      )}

      <HStack space={3} justifyContent="flex-end">
        <Button
          variant="outline"
          onPress={() => setCurrentStep(2)}
        >
          Geri
        </Button>
        <Button
          onPress={handleCreateProgram}
          isLoading={loading}
          isLoadingText="Oluşturuluyor..."
          isDisabled={activities.length === 0}
          leftIcon={<Icon as={MaterialIcons} name="check" size={4} />}
        >
          Programı Oluştur
        </Button>
      </HStack>
    </VStack>
  );

  return (
    <Box flex={1} bg="gray.50" safeArea>
      {currentStep > 0 && renderStepIndicator()}
      
      <ScrollView flex={1}>
        {currentStep === 0 && renderAiPreferences()}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>

      {/* AI Modal */}
      {renderAiModal()}
    </Box>
  );
};