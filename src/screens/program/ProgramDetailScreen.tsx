import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ScrollView,
  Icon,
  Progress,
  useToast,
  Skeleton,
  Center,
  Modal,
  FormControl,
  Input,
  Select,
  CheckIcon,
  useDisclose,
  Card,
  AlertDialog,
  Spinner,
  TextArea,
} from 'native-base';
import { Badge } from '../../components/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { geminiService } from '../../services/gemini';
import { supabase } from '../../services/supabase';

type RootStackParamList = {
  ProgramDetail: { programId: string };
};

type ProgramDetailRouteProp = RouteProp<RootStackParamList, 'ProgramDetail'>;
type ProgramDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  spent_amount: number;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  created_at: string;
}

interface Program {
  id: string;
  title: string;
  description: string;
  total_budget: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'paused';
  activities: Activity[];
  created_at: string;
}

export const ProgramDetailScreen = () => {
  const route = useRoute<ProgramDetailRouteProp>();
  const navigation = useNavigation<ProgramDetailNavigationProp>();
  const toast = useToast();
  const { user } = useAuth();
  const { isOpen: isAddActivityOpen, onOpen: onAddActivityOpen, onClose: onAddActivityClose } = useDisclose();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclose();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclose();
  const { isOpen: isAiSuggestionsOpen, onOpen: onAiSuggestionsOpen, onClose: onAiSuggestionsClose } = useDisclose();
  const cancelRef = useRef(null);

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  interface AISuggestion {
    id: string;
    title: string;
    description: string;
    category: string;
    estimatedCost: number;
    priority: number;
    potentialSavings: number;
  }

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  // Add Activity Form State
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    category: '',
    target_amount: '',
    due_date: new Date().toISOString().split('T')[0],
  });

  // Edit Program Form State
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    total_budget: '',
    end_date: '',
  });

  // Expense tracking state
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const { programId } = route.params;

  const fetchProgram = useCallback(async () => {
    try {
      setLoading(true);

      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı.');
      }

      // Fetch program with activities
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .select(`
          *,
          activities (
            id,
            title,
            description,
            category,
            target_amount,
            spent_amount,
            status,
            due_date,
            created_at
          )
        `)
        .eq('id', programId)
        .eq('user_id', user.id)
        .single();

      if (programError) {
        if (programError.code === 'PGRST116') {
          throw new Error('Program bulunamadı.');
        }
        throw programError;
      }

      if (!programData) {
        throw new Error('Program bulunamadı.');
      }

      setProgram(programData as Program);
    } catch (error: unknown) {
      let errorMessage = 'Program yüklenirken bir hata oluştu.';
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
  }, [programId, toast, user]);

  useEffect(() => {
    if (programId) {
      fetchProgram();
    }
  }, [programId, fetchProgram]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProgram();
  };

  const handleAddActivity = async () => {
    if (!activityForm.title.trim() || !activityForm.target_amount) {
      toast.show({
        title: 'Eksik Bilgi',
        description: 'Başlık ve hedef tutar alanları zorunludur.',
        variant: 'top-accent',
        bgColor: 'orange.500',
      });
      return;
    }

    try {
      setUpdating(true);

      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı.');
      }

      const { error } = await supabase
        .from('activities')
        .insert({
          title: activityForm.title,
          description: activityForm.description,
          category: activityForm.category,
          target_amount: parseFloat(activityForm.target_amount),
          spent_amount: 0,
          status: 'pending',
          due_date: activityForm.due_date,
          program_id: programId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.show({
        title: 'Başarılı',
        description: 'Aktivite başarıyla eklendi!',
        variant: 'top-accent',
        bgColor: 'green.500',
      });

      setActivityForm({
        title: '',
        description: '',
        category: '',
        target_amount: '',
        due_date: new Date().toISOString().split('T')[0],
      });
      onAddActivityClose();
      fetchProgram();
    } catch (error: unknown) {
      let errorMessage = 'Aktivite eklenirken bir hata oluştu.';
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
      setUpdating(false);
    }
  };

  const handleDeleteProgram = async () => {
    try {
      if (!user) {
        toast.show({
          title: 'Hata',
          description: 'Kullanıcı oturumu bulunamadı.',
          variant: 'top-accent',
          bgColor: 'red.500',
        });
        return;
      }

      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', programId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.show({
        title: 'Başarılı',
        description: 'Program başarıyla silindi!',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
      navigation.goBack();
    } catch (error: unknown) {
      let errorMessage = 'Program silinirken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Hata',
        description: errorMessage,
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    }
    onDeleteClose();
  };

  const handleEditProgram = async () => {
    if (!editForm.title.trim() || !editForm.total_budget) {
      toast.show({
        title: 'Eksik Bilgi',
        description: 'Başlık ve bütçe alanları zorunludur.',
        variant: 'top-accent',
        bgColor: 'orange.500',
      });
      return;
    }

    try {
      setUpdating(true);

      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı.');
      }

      const { error } = await supabase
        .from('programs')
        .update({
          title: editForm.title,
          description: editForm.description,
          total_budget: parseFloat(editForm.total_budget),
          end_date: editForm.end_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', programId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.show({
        title: 'Başarılı',
        description: 'Program başarıyla güncellendi!',
        variant: 'top-accent',
        bgColor: 'green.500',
      });

      onEditClose();
      fetchProgram();
    } catch (error: unknown) {
      let errorMessage = 'Program güncellenirken bir hata oluştu.';
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
      setUpdating(false);
    }
  };

  const handleAddExpense = async () => {
    if (!selectedActivity || !expenseAmount) {
      toast.show({
        title: 'Eksik Bilgi',
        description: 'Tutar alanı zorunludur.',
        variant: 'top-accent',
        bgColor: 'orange.500',
      });
      return;
    }

    try {
      setUpdating(true);

      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı.');
      }

      const amount = parseFloat(expenseAmount);
      const newSpentAmount = selectedActivity.spent_amount + amount;

      const { error } = await supabase
        .from('activities')
        .update({
          spent_amount: newSpentAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedActivity.id);

      if (error) throw error;

      // Also create an expense record
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert({
          activity_id: selectedActivity.id,
          amount: amount,
          description: expenseDescription,
          user_id: user.id,
          created_at: new Date().toISOString(),
        });

      if (expenseError) throw expenseError;

      toast.show({
        title: 'Başarılı',
        description: 'Harcama başarıyla eklendi!',
        variant: 'top-accent',
        bgColor: 'green.500',
      });

      setShowExpenseModal(false);
      setExpenseAmount('');
      setExpenseDescription('');
      setSelectedActivity(null);
      fetchProgram();
    } catch (error: unknown) {
      let errorMessage = 'Harcama eklenirken bir hata oluştu.';
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
      setUpdating(false);
    }
  };

  const handleGetAiSuggestions = async () => {
    if (!program || !user) {
      toast.show({
        title: 'Hata',
        description: 'Program bilgileri bulunamadı.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
      return;
    }

    try {
      setAiLoading(true);

      const userPreferences = {
        budget: program.total_budget - program.spent_amount,
        interests: ['Tasarruf', 'Bütçe Yönetimi'],
        location: { lat: 41.0082, lng: 28.9784 }, // İstanbul coordinates
        previousActivities: program.activities.map(a => a.category),
      };

      const suggestions = await geminiService.generatePersonalizedRecommendations({
        type: 'program',
        user_preferences: userPreferences,
        context: 'Program optimization suggestions',
        location: typeof userPreferences.location === 'object' ? `${userPreferences.location.lat},${userPreferences.location.lng}` : userPreferences.location || 'İstanbul',
        budget: userPreferences.budget,
      });

      setAiSuggestions((suggestions || []) as unknown as AISuggestion[]);
      onAiSuggestionsOpen();
    } catch (error: unknown) {
      let errorMessage = 'AI önerileri alınırken bir hata oluştu.';
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
      setAiLoading(false);
    }
  };

  const openEditModal = () => {
    if (program) {
      setEditForm({
        title: program.title,
        description: program.description,
        total_budget: program.total_budget.toString(),
        end_date: program.end_date,
      });
      onEditOpen();
    }
  };

  const openExpenseModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowExpenseModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'danger';
      case 'active':
        return 'primary';
      case 'paused':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'pending':
        return 'Bekliyor';
      case 'overdue':
        return 'Gecikmiş';
      case 'active':
        return 'Aktif';
      case 'paused':
        return 'Duraklatıldı';
      default:
        return 'Bilinmiyor';
    }
  };

  const renderEditModal = () => (
    <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>Program Düzenle</Modal.Header>
        <Modal.Body>
          <VStack space={4}>
            <FormControl>
              <FormControl.Label>Program Başlığı</FormControl.Label>
              <Input
                value={editForm.title}
                onChangeText={(text) => setEditForm({ ...editForm, title: text })}
                placeholder="Program başlığını girin"
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Açıklama</FormControl.Label>
              <TextArea
                value={editForm.description}
                onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                placeholder="Program açıklamasını girin"
                h={20}
                autoCompleteType="off"
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Toplam Bütçe (₺)</FormControl.Label>
              <Input
                value={editForm.total_budget}
                onChangeText={(text) => setEditForm({ ...editForm, total_budget: text })}
                placeholder="Toplam bütçeyi girin"
                keyboardType="numeric"
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Bitiş Tarihi</FormControl.Label>
              <Input
                value={editForm.end_date}
                onChangeText={(text) => setEditForm({ ...editForm, end_date: text })}
                placeholder="YYYY-MM-DD"
              />
            </FormControl>
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <HStack space={2} justifyContent="flex-end">
            <Button variant="ghost" colorScheme="blueGray" onPress={onEditClose}>
              İptal
            </Button>
            <Button onPress={handleEditProgram} isLoading={updating}>
              Güncelle
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );

  const renderExpenseModal = () => (
    <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} size="lg">
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>Harcama Ekle</Modal.Header>
        <Modal.Body>
          <VStack space={4}>
            <Text fontSize="md" fontWeight="medium">
              {selectedActivity?.title} - Harcama Ekle
            </Text>
            <FormControl>
              <FormControl.Label>Tutar (₺)</FormControl.Label>
              <Input
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                placeholder="Harcama tutarını girin"
                keyboardType="numeric"
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Açıklama (Opsiyonel)</FormControl.Label>
              <TextArea
              value={expenseDescription}
              onChangeText={setExpenseDescription}
              placeholder="Harcama açıklamasını girin"
              h={16}
              autoCompleteType="off"
            />
            </FormControl>
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <HStack space={2} justifyContent="flex-end">
            <Button variant="ghost" colorScheme="blueGray" onPress={() => setShowExpenseModal(false)}>
              İptal
            </Button>
            <Button onPress={handleAddExpense} isLoading={updating}>
              Harcama Ekle
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );

  const renderAiSuggestionsModal = () => (
    <Modal isOpen={isAiSuggestionsOpen} onClose={onAiSuggestionsClose} size="lg">
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>AI Önerileri</Modal.Header>
        <Modal.Body>
          {aiLoading ? (
            <HStack space={3} justifyContent="center" alignItems="center" py={8}>
              <Spinner size="lg" color="blue.500" />
              <Text fontSize="md" color="gray.600">
                AI önerileri hazırlanıyor...
              </Text>
            </HStack>
          ) : (
            <ScrollView maxH={400}>
              <VStack space={4}>
                {aiSuggestions.map((suggestion, index) => (
                  <Box key={index} p={4} bg="gray.50" rounded="lg">
                    <Text fontSize="md" fontWeight="bold" mb={2}>
                      {suggestion.title}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      {suggestion.description}
                    </Text>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm" color="blue.600">
                        Tahmini: ₺{suggestion.estimatedCost}
                      </Text>
                      <Text fontSize="sm" color="green.600">
                        Tasarruf: ₺{suggestion.potentialSavings}
                      </Text>
                    </HStack>
                  </Box>
                ))}
                {aiSuggestions.length === 0 && (
                  <Text textAlign="center" color="gray.500">
                    Henüz öneri bulunamadı.
                  </Text>
                )}
              </VStack>
            </ScrollView>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onPress={onAiSuggestionsClose}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );

  if (loading) {
    return (
      <Box flex={1} bg="gray.50" safeArea>
        <VStack space={4} p={4}>
          <Skeleton h="8" rounded="md" />
          <Skeleton h="32" rounded="md" />
          <Skeleton h="40" rounded="md" />
          <Skeleton h="40" rounded="md" />
        </VStack>
      </Box>
    );
  }

  if (!program) {
    return (
      <Center flex={1} bg="gray.50">
        <Text color="gray.500">Program bulunamadı</Text>
      </Center>
    );
  }

  const progressPercentage = (program.spent_amount / program.total_budget) * 100;
  const remainingBudget = program.total_budget - program.spent_amount;

  return (
    <Box flex={1} bg="gray.50" safeArea>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Box bg="white" px={4} py={6} shadow={1}>
          <VStack space={4}>
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1} space={2}>
                <Heading size="lg" color="gray.700">
                  {program.title}
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  {program.description}
                </Text>
                <HStack space={2} alignItems="center">
                  <Badge colorScheme={getStatusColor(program.status)} variant="solid" rounded={true} label={getStatusText(program.status)}>
                    {getStatusText(program.status)}
                  </Badge>
                  <Text color="gray.500" fontSize="xs">
                    {new Date(program.start_date).toLocaleDateString('tr-TR')} - {new Date(program.end_date).toLocaleDateString('tr-TR')}
                  </Text>
                </HStack>
              </VStack>
              <HStack space={2}>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  leftIcon={<Icon as={MaterialIcons} name="edit" size={4} />}
                  onPress={openEditModal}
                >
                  Düzenle
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="green"
                  leftIcon={<Icon as={MaterialIcons} name="lightbulb" size={4} />}
                  onPress={handleGetAiSuggestions}
                  isLoading={aiLoading}
                >
                  AI Önerileri
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  leftIcon={<Icon as={MaterialIcons} name="delete" size={4} />}
                  onPress={onDeleteOpen}
                >
                  Sil
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        {/* Budget Overview */}
        <VStack space={4} p={4}>
          <Card>
            <VStack space={4} p={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="md" fontWeight="semibold" color="gray.700">
                  Bütçe Durumu
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={progressPercentage > 100 ? 'red.500' : 'primary.500'}>
                  ₺{program.spent_amount.toLocaleString()} / ₺{program.total_budget.toLocaleString()}
                </Text>
              </HStack>
              <Progress
                value={Math.min(progressPercentage, 100)}
                colorScheme={progressPercentage > 100 ? 'red' : progressPercentage > 80 ? 'orange' : 'green'}
                size="lg"
              />
              <HStack justifyContent="space-between">
                <VStack alignItems="center">
                  <Text fontSize="xs" color="gray.500">
                    Kalan Bütçe
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color={remainingBudget < 0 ? 'red.500' : 'green.500'}>
                    ₺{remainingBudget.toLocaleString()}
                  </Text>
                </VStack>
                <VStack alignItems="center">
                  <Text fontSize="xs" color="gray.500">
                    İlerleme
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.700">
                    %{progressPercentage.toFixed(1)}
                  </Text>
                </VStack>
                <VStack alignItems="center">
                  <Text fontSize="xs" color="gray.500">
                    Aktivite
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="gray.700">
                    {program.activities.length}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>
        </VStack>

        {/* Activities */}
        <VStack space={4} p={4}>
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="md" color="gray.700">
              Aktiviteler
            </Heading>
            <Button
              size="sm"
              leftIcon={<Icon as={MaterialIcons} name="add" size={4} />}
              onPress={onAddActivityOpen}
            >
              Ekle
            </Button>
          </HStack>

          <VStack space={3}>
            {program.activities.map((activity) => {
              const activityProgress = (activity.spent_amount / activity.target_amount) * 100;
              return (
                <Card key={activity.id}>
                  <VStack space={3} p={4}>
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <VStack flex={1} space={1}>
                        <Text fontSize="md" fontWeight="semibold" color="gray.700">
                          {activity.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {activity.description}
                        </Text>
                        <HStack space={2} alignItems="center">
                          <Badge colorScheme="gray" variant="outline" size="sm" label={activity.category}>
                            {activity.category}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            Son tarih: {new Date(activity.due_date).toLocaleDateString('tr-TR')}
                          </Text>
                        </HStack>
                      </VStack>
                      <Badge colorScheme={getStatusColor(activity.status)} variant="solid" rounded={true} label={getStatusText(activity.status)}>
                        {getStatusText(activity.status)}
                      </Badge>
                    </HStack>

                    <VStack space={2}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color="gray.600">
                          ₺{activity.spent_amount.toLocaleString()} / ₺{activity.target_amount.toLocaleString()}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          %{activityProgress.toFixed(1)}
                        </Text>
                      </HStack>
                      <Progress
                        value={Math.min(activityProgress, 100)}
                        colorScheme={activityProgress > 100 ? 'red' : activityProgress === 100 ? 'green' : 'blue'}
                        size="sm"
                      />
                    </VStack>

                    <HStack space={2} justifyContent="flex-end">
                      <Button
                        size="xs"
                        variant="outline"
                        leftIcon={<Icon as={MaterialIcons} name="add" size={3} />}
                        onPress={() => openExpenseModal(activity)}
                      >
                        Harcama Ekle
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        leftIcon={<Icon as={MaterialIcons} name="edit" size={3} />}
                        onPress={() => {
                          toast.show({
                            title: 'Yakında',
                            description: 'Aktivite düzenleme özelliği yakında gelecek!',
                          });
                        }}
                      >
                        Düzenle
                      </Button>
                      {activity.status === 'pending' && (
                        <Button
                          size="xs"
                          colorScheme="green"
                          leftIcon={<Icon as={MaterialIcons} name="check" size={3} />}
                          onPress={() => {
                            toast.show({
                              title: 'Yakında',
                              description: 'Aktivite tamamlama özelliği yakında gelecek!',
                            });
                          }}
                        >
                          Tamamla
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                </Card>
              );
            })}
          </VStack>
        </VStack>
      </ScrollView>

      {/* Add Activity Modal */}
      <Modal isOpen={isAddActivityOpen} onClose={onAddActivityClose} size="lg">
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Yeni Aktivite Ekle</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl isRequired>
                <FormControl.Label>Başlık</FormControl.Label>
                <Input
                  placeholder="Aktivite başlığı"
                  value={activityForm.title}
                  onChangeText={(text) => setActivityForm({...activityForm, title: text})}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Açıklama</FormControl.Label>
                <Input
                  placeholder="Aktivite açıklaması"
                  value={activityForm.description}
                  onChangeText={(text) => setActivityForm({...activityForm, description: text})}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Kategori</FormControl.Label>
                <Select
                  selectedValue={activityForm.category}
                  placeholder="Kategori seçin"
                  _selectedItem={{
                    bg: 'primary.100',
                    endIcon: <CheckIcon size="5" />,
                  }}
                  onValueChange={(value) => setActivityForm({...activityForm, category: value})}
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

              <FormControl isRequired>
                <FormControl.Label>Hedef Tutar (₺)</FormControl.Label>
                <Input
                  placeholder="0"
                  keyboardType="numeric"
                  value={activityForm.target_amount}
                  onChangeText={(text) => setActivityForm({...activityForm, target_amount: text})}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Son Tarih</FormControl.Label>
                <Input
                  placeholder="YYYY-MM-DD"
                  value={activityForm.due_date}
                  onChangeText={(text) => setActivityForm({...activityForm, due_date: text})}
                />
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={onAddActivityClose}
              >
                İptal
              </Button>
              <Button
                onPress={handleAddActivity}
                isLoading={updating}
                isLoadingText="Ekleniyor..."
              >
                Ekle
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Edit Program Modal */}
      {renderEditModal()}

      {/* Expense Modal */}
      {renderExpenseModal()}

      {/* AI Suggestions Modal */}
      {renderAiSuggestionsModal()}

      {/* Delete Confirmation */}
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Programı Sil</AlertDialog.Header>
          <AlertDialog.Body>
            Bu programı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                ref={cancelRef}
                variant="unstyled"
                colorScheme="coolGray"
                onPress={onDeleteClose}
              >
                İptal
              </Button>
              <Button colorScheme="danger" onPress={handleDeleteProgram}>
                Sil
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};