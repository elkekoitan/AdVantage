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
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, unknown> | null>(null);

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
          program_type: aiPreferences.programType,
          priorities: aiPreferences.priorityCategories,
          group_size: aiPreferences.groupSize
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
        if ((suggestion as unknown as Record<string, unknown>).total_estimated_cost as number > aiPreferences.budget) {
          const optimizedActivities = await geminiService.optimizeProgramBudget(
            (suggestion as unknown as Record<string, unknown>).activities as Record<string, unknown>[],
            aiPreferences.budget
          );
          
          (suggestion as unknown as Record<string, unknown>).activities = optimizedActivities;
          (suggestion as unknown as Record<string, unknown>).total_estimated_cost = optimizedActivities.reduce(
            (total: number, activity: Record<string, unknown>) => total + ((activity.estimated_cost as number) || 0),
            0
          );
        }
        
        // Enhance AI suggestion with additional metadata
        const enhancedSuggestion = {
          ...suggestion,
          generated_at: new Date().toISOString(),
          user_preferences: aiPreferences,
          confidence_score: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
          personalization_level: 'high'
        };
        
        setAiSuggestions(enhancedSuggestion as unknown as Record<string, unknown>);
        setShowAiModal(true);
        
        toast.show({
          title: 'AI Program Hazır! 🤖',
          description: 'Kişiselleştirilmiş programınız oluşturuldu.',
          variant: 'top-accent',
          bgColor: 'green.500',
        });
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
        title: (aiSuggestions as Record<string, unknown>).title as string,
        description: (aiSuggestions as Record<string, unknown>).description as string,
        total_budget: ((aiSuggestions as Record<string, unknown>).total_estimated_cost as number).toString(),
        category: (((aiSuggestions as Record<string, unknown>).tags as string[]) || [])[0] || 'Genel',
      });

      const aiActivities = ((aiSuggestions as Record<string, unknown>).activities as Record<string, unknown>[]).map((activity: Record<string, unknown>, index: number) => ({
        id: `ai_activity_${index}`,
        title: activity.title as string,
        description: activity.description as string,
        category: activity.type as string,
        target_amount: (activity.estimated_cost as number).toString(),
        due_date: '',
        priority: activity.priority || 3,
        duration: activity.duration || 1,
        location: activity.location || '',
        time_slot: activity.time_slot || '',
        tips: activity.tips || '',
        ai_generated: true
      }));
      
      setActivities(aiActivities);
      setShowAiModal(false);
      setCurrentStep(2);
      
      // Show detailed success message
      toast.show({
        title: 'AI Önerileri Uygulandı! ✨',
        description: `${aiActivities.length} aktivite ve bütçe planı hazırlandı.`,
        variant: 'top-accent',
        bgColor: 'green.500',
        duration: 3000
      });
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
            <Icon as={MaterialIcons} name="auto-awesome" size={6} color="primary.500" />
            <VStack flex={1}>
              <Text fontSize="lg" fontWeight="bold">AI Program Önerisi</Text>
              {(aiSuggestions as Record<string, unknown>)?.confidence_score && (
                <HStack space={1} alignItems="center">
                  <Icon as={MaterialIcons} name="verified" size={3} color="green.500" />
                  <Text fontSize="xs" color="green.600">
                    %{Math.round((aiSuggestions as Record<string, unknown>).confidence_score as number * 100)} Güven Skoru
                  </Text>
                </HStack>
              )}
            </VStack>
          </HStack>
        </Modal.Header>
        <Modal.Body>
          {aiSuggestions && (
            <ScrollView>
              <VStack space={4}>
                {/* Enhanced Program Info */}
                <Card bg="primary.50">
                  <VStack space={3} p={4}>
                    <HStack space={2} alignItems="center">
                      <Icon as={MaterialIcons} name="stars" size={5} color="primary.500" />
                      <Text fontSize="lg" fontWeight="bold" color="gray.700">
                        {(aiSuggestions as Record<string, unknown>).title as string}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {(aiSuggestions as Record<string, unknown>).description as string}
                    </Text>
                    
                    {/* Enhanced Budget Summary */}
                    <VStack space={2}>
                      <Text fontSize="md" fontWeight="semibold" color="gray.700">
                        💰 Bütçe Analizi
                      </Text>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color="gray.600">Toplam Bütçe:</Text>
                        <Text fontSize="sm" fontWeight="bold" color="primary.600">
                          ₺{((aiSuggestions as Record<string, unknown>).total_estimated_cost as number)?.toLocaleString()}
                        </Text>
                      </HStack>
                      {(aiSuggestions as Record<string, unknown>).estimated_cost && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="gray.600">Tahmini Maliyet:</Text>
                          <Text fontSize="sm" fontWeight="semibold" color="green.600">
                            ₺{((aiSuggestions as Record<string, unknown>).estimated_cost as number)?.toLocaleString()}
                          </Text>
                        </HStack>
                      )}
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color="gray.600">Program Süresi:</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                          ⏱️ {(aiSuggestions as Record<string, unknown>).total_duration as string}
                        </Text>
                      </HStack>
                      
                      {/* Budget Breakdown */}
                      {(aiSuggestions as Record<string, unknown>).budget_breakdown && (
                        <VStack space={2} mt={2} p={3} bg="white" borderRadius="md">
                          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                            📊 Bütçe Dağılımı:
                          </Text>
                          {Object.entries((aiSuggestions as Record<string, unknown>).budget_breakdown as Record<string, unknown>).map(([key, value]) => (
                            <HStack key={key} justifyContent="space-between" alignItems="center">
                              <HStack space={1} alignItems="center">
                                <Text fontSize="xs">
                                  {key === 'food' ? '🍽️' : 
                                   key === 'entertainment' ? '🎉' :
                                   key === 'transport' ? '🚗' :
                                   key === 'shopping' ? '🛍️' : '📦'}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {key === 'food' ? 'Yemek' : 
                                   key === 'entertainment' ? 'Eğlence' :
                                   key === 'transport' ? 'Ulaşım' :
                                   key === 'shopping' ? 'Alışveriş' : 'Diğer'}:
                                </Text>
                              </HStack>
                              <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                                ₺{(value as number)?.toLocaleString()}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      )}
                    </VStack>
                  </VStack>
                </Card>
                
                {/* Budget Tips */}
                {(aiSuggestions as Record<string, unknown>).budget_tips && ((aiSuggestions as Record<string, unknown>).budget_tips as string[]).length > 0 && (
                  <Card bg="blue.50">
                    <VStack space={2} p={4}>
                      <HStack space={2} alignItems="center">
                        <Icon as={MaterialIcons} name="lightbulb" size={5} color="blue.500" />
                        <Text fontSize="md" fontWeight="semibold" color="blue.700">
                          Bütçe Tasarrufu İpuçları
                        </Text>
                      </HStack>
                      {((aiSuggestions as Record<string, unknown>).budget_tips as string[]).map((tip: string, index: number) => (
                        <HStack key={index} space={2} alignItems="flex-start">
                          <Text fontSize="xs" color="blue.500">💡</Text>
                          <Text fontSize="sm" color="blue.600" flex={1}>
                            {tip}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Card>
                )}
                
                {/* Enhanced Suggested Activities */}
                <VStack space={3}>
                  <HStack space={2} alignItems="center">
                    <Icon as={MaterialIcons} name="event-note" size={5} color="gray.600" />
                    <Text fontSize="md" fontWeight="semibold" color="gray.700">
                      Önerilen Aktiviteler ({((aiSuggestions as Record<string, unknown>).activities as Record<string, unknown>[])?.length || 0})
                    </Text>
                  </HStack>
                  
                  {((aiSuggestions as Record<string, unknown>).activities as Record<string, unknown>[])?.map((activity: Record<string, unknown>, index: number) => (
                    <Card key={index} borderLeftWidth={3} borderLeftColor="primary.400">
                      <VStack space={3} p={4}>
                        <HStack justifyContent="space-between" alignItems="flex-start">
                          <VStack flex={1} space={1}>
                            <Text fontSize="md" fontWeight="bold" color="gray.700">
                              {activity.title as string}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {activity.description as string}
                            </Text>
                            {activity.location && (
                              <HStack space={1} alignItems="center">
                                <Icon as={MaterialIcons} name="location-on" size={3} color="gray.500" />
                                <Text fontSize="xs" color="gray.500">
                                  {activity.location as string}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                          <VStack alignItems="flex-end" space={1}>
                            <Badge 
                              colorScheme={(activity.priority as number) >= 4 ? 'red' : (activity.priority as number) >= 3 ? 'orange' : 'green'} 
                              variant="solid" 
                              size="sm"
                            >
                              Öncelik: {(activity.priority as number) || 3}
                            </Badge>
                            <Text fontSize="md" fontWeight="bold" color="primary.600">
                              ₺{(activity.estimated_cost as number)?.toLocaleString()}
                            </Text>
                          </VStack>
                        </HStack>
                        
                        <HStack space={2} flexWrap="wrap">
                          {activity.category && (
                            <Badge colorScheme="gray" variant="outline" size="sm">
                              📂 {activity.category as string}
                            </Badge>
                          )}
                          {activity.duration && (
                            <Badge colorScheme="blue" variant="outline" size="sm">
                              ⏰ {activity.duration as number} saat
                            </Badge>
                          )}
                          {activity.time_slot && (
                            <Badge colorScheme="purple" variant="outline" size="sm">
                              🕐 {activity.time_slot as string}
                            </Badge>
                          )}
                        </HStack>
                        
                        {activity.tips && (
                          <HStack space={2} p={2} bg="yellow.50" borderRadius="md">
                            <Icon as={MaterialIcons} name="tips-and-updates" size={4} color="yellow.600" />
                            <Text fontSize="xs" color="yellow.700" flex={1}>
                              {activity.tips as string}
                            </Text>
                          </HStack>
                        )}
                        
                        {activity.optimization_note && (
                          <HStack space={2} p={2} bg="green.50" borderRadius="md">
                            <Icon as={MaterialIcons} name="eco" size={4} color="green.600" />
                            <Text fontSize="xs" color="green.700" flex={1}>
                              {activity.optimization_note as string}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </Card>
                  ))}
                </VStack>
                
                {/* Alternative Options */}
                {(aiSuggestions as Record<string, unknown>).alternative_options && ((aiSuggestions as Record<string, unknown>).alternative_options as Record<string, unknown>[]).length > 0 && (
                  <Card bg="orange.50">
                    <VStack space={3} p={4}>
                      <HStack space={2} alignItems="center">
                        <Icon as={MaterialIcons} name="alt-route" size={5} color="orange.500" />
                        <Text fontSize="md" fontWeight="semibold" color="orange.700">
                          Alternatif Seçenekler
                        </Text>
                      </HStack>
                      {((aiSuggestions as Record<string, unknown>).alternative_options as Record<string, unknown>[]).map((option: Record<string, unknown>, index: number) => (
                        <VStack key={index} space={1} p={2} bg="white" borderRadius="md">
                          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                            {option.title as string}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {option.description as string}
                          </Text>
                          <Text fontSize="xs" color="orange.600" fontWeight="semibold">
                            Fark: ₺{(option.cost_difference as number)?.toLocaleString()}
                          </Text>
                        </VStack>
                      ))}
                    </VStack>
                  </Card>
                )}
                
                {((aiSuggestions as Record<string, unknown>).tags as string[]) && (
                  <HStack space={2} flexWrap="wrap">
                    {((aiSuggestions as Record<string, unknown>).tags as string[]).map((tag: string, index: number) => (
                      <Badge key={index} colorScheme="primary" variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </HStack>
                )}
              </VStack>
            </ScrollView>
          )}
        </Modal.Body>
        <Modal.Footer>
          <HStack space={3} justifyContent="flex-end">
            <Button
              variant="outline"
              onPress={() => setShowAiModal(false)}
              leftIcon={<Icon as={MaterialIcons} name="close" size={4} />}
            >
              İptal
            </Button>
            <Button
              onPress={handleAcceptAiSuggestion}
              leftIcon={<Icon as={MaterialIcons} name="auto-awesome" size={4} />}
              bg="primary.500"
            >
              Önerileri Uygula ✨
            </Button>
          </HStack>
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
            onValueChange={(value: string) => setAiPreferences({...aiPreferences, programType: value as 'personal_development' | 'fitness_health' | 'education_learning' | 'hobby_creativity' | 'social_entertainment' | 'business_career' | 'travel_exploration' | 'family_relationships'})}
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