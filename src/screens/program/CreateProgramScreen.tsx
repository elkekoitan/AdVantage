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
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

type RootStackParamList = {
  CreateProgram: undefined;
  ProgramDetail: { programId: string };
};

type CreateProgramNavigationProp = StackNavigationProp<RootStackParamList>;

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
  const { user } = useAuth();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

    try {
      setLoading(true);

      // Here we would normally create the program in Supabase
      const mockProgramId = 'new-program-' + Date.now();

      toast.show({
        title: 'Başarılı',
        description: 'Program başarıyla oluşturuldu!',
        variant: 'top-accent',
        bgColor: 'green.500',
      });

      // Navigate to program detail
      navigation.navigate('ProgramDetail', { programId: mockProgramId });
    } catch (error: unknown) {
      let errorMessage = 'Program oluşturulurken bir hata oluştu.';
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

  const renderStep1 = () => (
    <VStack space={6} p={4}>
      <VStack space={2}>
        <Heading size="lg" color="gray.700" textAlign="center">
          Program Türü Seçin
        </Heading>
        <Text color="gray.600" textAlign="center" fontSize="sm">
          Hazır şablonlardan birini seçin veya sıfırdan oluşturun
        </Text>
      </VStack>

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
      {renderStepIndicator()}
      
      <ScrollView flex={1}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>
    </Box>
  );
};