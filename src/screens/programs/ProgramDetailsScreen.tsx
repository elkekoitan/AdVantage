import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ScrollView,
  Icon,
  Card,
  Pressable,
  Badge,
  useToast,
  Progress,
  Divider,
  Center,
  Spinner,
  AlertDialog,
  useDisclose,
  Modal,
  FormControl,
  Input,
  TextArea,
  Select,
} from 'native-base';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';

// Remove unused import
import { supabase } from '../../services/supabase';
import { MainStackParamList } from '../../navigation/MainNavigator';

type ProgramDetailsScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'ProgramDetails'>;
type ProgramDetailsScreenRouteProp = RouteProp<{ ProgramDetails: { programId: string } }, 'ProgramDetails'>;

interface Program {
  id: string;
  title: string;
  description: string;
  date: string;
  total_budget: number;
  estimated_cost: number;
  spent_amount: number;
  duration_hours: number;
  category: string;
  location: string;
  participants_count: number;
  preferences: Record<string, unknown>;
  ai_generated: boolean;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  user_id: string;
}

interface ProgramActivity {
  id: string;
  program_id: string;
  type: string;
  title: string;
  description: string;
  estimated_cost: number;
  actual_cost?: number;
  duration_hours: number;
  location: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  notes?: string;
  rating?: number;
  created_at: string;
}

interface Expense {
  id: string;
  program_id: string;
  activity_id?: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  receipt_url?: string;
  created_at: string;
}

export const ProgramDetailsScreen = () => {
  const navigation = useNavigation<ProgramDetailsScreenNavigationProp>();
  const route = useRoute<ProgramDetailsScreenRouteProp>();

  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclose();
  const { isOpen: isExpenseOpen, onOpen: onExpenseOpen, onClose: onExpenseClose } = useDisclose();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclose();

  const { programId } = route.params;

  const [program, setProgram] = useState<Program | null>(null);
  const [activities, setActivities] = useState<ProgramActivity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'activities' | 'expenses'>('overview');

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    activity_id: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
  });

  const expenseCategories = [
    { label: 'Yemek & İçecek', value: 'food_drink' },
    { label: 'Ulaşım', value: 'transportation' },
    { label: 'Eğlence', value: 'entertainment' },
    { label: 'Alışveriş', value: 'shopping' },
    { label: 'Konaklama', value: 'accommodation' },
    { label: 'Diğer', value: 'other' },
  ];

  const fetchProgramDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch program details
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (programError) throw programError;
      setProgram(programData);
      setEditForm({
        title: programData.title,
        description: programData.description || '',
        status: programData.status,
      });

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('program_activities')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: true });

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('program_expenses')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);

    } catch (error: unknown) {
      let errorMessage = 'Program detayları yüklenirken bir hata oluştu.';
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
  }, [programId, toast]);

  useEffect(() => {
    fetchProgramDetails();
  }, [programId, fetchProgramDetails]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgramDetails();
    setRefreshing(false);
  };

  const updateProgramStatus = async (newStatus: string) => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('programs')
        .update({ status: newStatus })
        .eq('id', programId);

      if (error) throw error;

      setProgram(prev => prev ? { ...prev, status: newStatus as Program['status'] } : null);
      toast.show({
        title: 'Başarılı',
        description: 'Program durumu güncellendi.',
        colorScheme: 'success',
      });
    } catch (error: unknown) {
      let errorMessage = 'Program durumu güncellenirken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Hata',
        description: errorMessage,
        colorScheme: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateActivityStatus = async (activityId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('program_activities')
        .update({ status: newStatus })
        .eq('id', activityId);

      if (error) throw error;

      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: newStatus as ProgramActivity['status'] }
          : activity
      ));

      toast.show({
        title: 'Başarılı',
        description: 'Aktivite durumu güncellendi.',
        colorScheme: 'success',
      });
    } catch (error: unknown) {
      let errorMessage = 'Aktivite durumu güncellenirken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Hata',
        description: errorMessage,
        colorScheme: 'error',
      });
    }
  };

  const addExpense = async () => {
    try {
      if (!expenseForm.title || !expenseForm.amount || !expenseForm.category) {
        toast.show({
          title: 'Hata',
          description: 'Lütfen gerekli alanları doldurun.',
          colorScheme: 'error',
        });
        return;
      }

      const { data, error } = await supabase
        .from('program_expenses')
        .insert({
          program_id: programId,
          activity_id: expenseForm.activity_id || null,
          title: expenseForm.title,
          amount: parseFloat(expenseForm.amount),
          category: expenseForm.category,
          description: expenseForm.description,
        })
        .select()
        .single();

      if (error) throw error;

      setExpenses(prev => [data, ...prev]);
      setExpenseForm({
        title: '',
        amount: '',
        category: '',
        description: '',
        activity_id: '',
      });
      onExpenseClose();

      toast.show({
        title: 'Başarılı',
        description: 'Harcama eklendi.',
        colorScheme: 'success',
      });
    } catch (error: unknown) {
      let errorMessage = 'Harcama eklenirken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Hata',
        description: errorMessage,
        colorScheme: 'error',
      });
    }
  };

  const updateProgram = async () => {
    try {
      const { error } = await supabase
        .from('programs')
        .update({
          title: editForm.title,
          description: editForm.description,
          status: editForm.status,
        })
        .eq('id', programId);

      if (error) throw error;

      setProgram(prev => prev ? {
        ...prev,
        title: editForm.title,
        description: editForm.description,
        status: editForm.status as Program['status'],
      } : null);
      onEditClose();

      toast.show({
        title: 'Başarılı',
        description: 'Program güncellendi.',
        colorScheme: 'success',
      });
    } catch (error: unknown) {
      let errorMessage = 'Program güncellenirken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Hata',
        description: errorMessage,
        colorScheme: 'error',
      });
    }
  };

  const deleteProgram = async () => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', programId);

      if (error) throw error;

      toast.show({
        title: 'Başarılı',
        description: 'Program silindi.',
        colorScheme: 'success',
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
        colorScheme: 'error',
      });
    } finally {
      setActionLoading(false);
      onDeleteClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'active': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Taslak';
      case 'active': return 'Aktif';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return 'restaurant';
      case 'activity': return 'local-activity';
      case 'shopping': return 'shopping-bag';
      case 'entertainment': return 'movie';
      default: return 'star';
    }
  };

  const calculateProgress = () => {
    if (!activities.length) return 0;
    const completedActivities = activities.filter(a => a.status === 'completed').length;
    return (completedActivities / activities.length) * 100;
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetUsagePercentage = program ? (totalExpenses / program.total_budget) * 100 : 0;

  if (loading) {
    return (
      <Box flex={1} bg="gray.50" safeArea>
        <Center flex={1}>
          <Spinner size="lg" color="primary.500" />
          <Text mt={4} color="gray.500">Program yükleniyor...</Text>
        </Center>
      </Box>
    );
  }

  if (!program) {
    return (
      <Box flex={1} bg="gray.50" safeArea>
        <Center flex={1}>
          <Icon as={MaterialIcons} name="error-outline" size={16} color="gray.400" />
          <Text mt={4} color="gray.500">Program bulunamadı</Text>
          <Button mt={4} onPress={() => navigation.goBack()}>
            Geri Dön
          </Button>
        </Center>
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
        <VStack space={4} p={4}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <Pressable onPress={() => navigation.goBack()}>
              <Icon as={MaterialIcons} name="arrow-back" size={6} color="gray.600" />
            </Pressable>
            <HStack space={2}>
              <Pressable onPress={onEditOpen}>
                <Icon as={MaterialIcons} name="edit" size={6} color="gray.600" />
              </Pressable>
              <Pressable onPress={onDeleteOpen}>
                <Icon as={MaterialIcons} name="delete" size={6} color="red.500" />
              </Pressable>
            </HStack>
          </HStack>

          {/* Program Info */}
          <Card>
            <VStack space={4} p={4}>
              <HStack justifyContent="space-between" alignItems="flex-start">
                <VStack flex={1} space={2}>
                  <Heading size="lg" color="gray.700">
                    {program.title}
                  </Heading>
                  {program.description && (
                    <Text color="gray.600">
                      {program.description}
                    </Text>
                  )}
                </VStack>
                <Badge colorScheme={getStatusColor(program.status)} variant="solid">
                  {getStatusText(program.status)}
                </Badge>
              </HStack>

              <Divider />

              <VStack space={3}>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Tarih:</Text>
                  <Text fontWeight="medium">
                    {new Date(program.date).toLocaleDateString('tr-TR')}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Konum:</Text>
                  <Text fontWeight="medium">{program.location}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Katılımcı:</Text>
                  <Text fontWeight="medium">{program.participants_count} kişi</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="gray.500">Süre:</Text>
                  <Text fontWeight="medium">{program.duration_hours} saat</Text>
                </HStack>
              </VStack>

              {/* Progress */}
              <VStack space={2}>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.500">İlerleme</Text>
                  <Text fontSize="sm" color="gray.500">
                    {Math.round(calculateProgress())}%
                  </Text>
                </HStack>
                <Progress value={calculateProgress()} colorScheme="primary" />
              </VStack>

              {/* Budget */}
              <VStack space={2}>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.500">Bütçe Kullanımı</Text>
                  <Text fontSize="sm" color="gray.500">
                    ₺{totalExpenses.toLocaleString()} / ₺{program.total_budget.toLocaleString()}
                  </Text>
                </HStack>
                <Progress 
                  value={budgetUsagePercentage} 
                  colorScheme={budgetUsagePercentage > 100 ? 'red' : 'green'} 
                />
                {budgetUsagePercentage > 100 && (
                  <Text fontSize="xs" color="red.500">
                    ⚠️ Bütçe aşıldı!
                  </Text>
                )}
              </VStack>

              {/* Status Actions */}
              {program.status === 'draft' && (
                <Button
                  colorScheme="blue"
                  onPress={() => updateProgramStatus('active')}
                  isLoading={actionLoading}
                >
                  Programı Başlat
                </Button>
              )}
              {program.status === 'active' && (
                <HStack space={2}>
                  <Button
                    flex={1}
                    colorScheme="green"
                    onPress={() => updateProgramStatus('completed')}
                    isLoading={actionLoading}
                  >
                    Tamamla
                  </Button>
                  <Button
                    flex={1}
                    colorScheme="red"
                    variant="outline"
                    onPress={() => updateProgramStatus('cancelled')}
                    isLoading={actionLoading}
                  >
                    İptal Et
                  </Button>
                </HStack>
              )}
            </VStack>
          </Card>

          {/* Tabs */}
          <HStack bg="white" rounded="md" p={1}>
            {[
              { key: 'overview', label: 'Genel' },
              { key: 'activities', label: 'Aktiviteler' },
              { key: 'expenses', label: 'Harcamalar' },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                flex={1}
                onPress={() => setSelectedTab(tab.key as 'overview' | 'activities' | 'expenses')}
              >
                <Box
                  bg={selectedTab === tab.key ? 'primary.500' : 'transparent'}
                  py={2}
                  px={4}
                  rounded="md"
                >
                  <Text
                    textAlign="center"
                    color={selectedTab === tab.key ? 'white' : 'gray.600'}
                    fontWeight={selectedTab === tab.key ? 'bold' : 'normal'}
                  >
                    {tab.label}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </HStack>

          {/* Tab Content */}
          {selectedTab === 'overview' && (
            <VStack space={4}>
              {program.ai_generated && (
                <Card>
                  <HStack space={3} p={4} alignItems="center">
                    <Icon as={MaterialIcons} name="auto-awesome" size={6} color="purple.500" />
                    <VStack flex={1}>
                      <Text fontWeight="semibold" color="purple.600">
                        AI Destekli Program
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Bu program AI önerileri ile oluşturulmuştur
                      </Text>
                    </VStack>
                  </HStack>
                </Card>
              )}

              <Card>
                <VStack space={3} p={4}>
                  <Heading size="md" color="gray.700">
                    Tercihler
                  </Heading>
                  {program.preferences && (
                    <VStack space={2}>
                      {program.preferences.activity_level && (
                        <HStack justifyContent="space-between">
                          <Text color="gray.500">Aktivite Seviyesi:</Text>
                          <Text fontWeight="medium">
                            {program.preferences.activity_level === 'low' ? 'Düşük' :
                             program.preferences.activity_level === 'medium' ? 'Orta' : 'Yüksek'}
                          </Text>
                        </HStack>
                      )}
                      {program.preferences.indoor_outdoor && (
                        <HStack justifyContent="space-between">
                          <Text color="gray.500">Mekan Tercihi:</Text>
                          <Text fontWeight="medium">
                            {program.preferences.indoor_outdoor === 'indoor' ? 'İç Mekan' :
                             program.preferences.indoor_outdoor === 'outdoor' ? 'Açık Hava' : 'Her İkisi'}
                          </Text>
                        </HStack>
                      )}
                      {program.preferences.time_preference && (
                        <HStack justifyContent="space-between">
                          <Text color="gray.500">Zaman Tercihi:</Text>
                          <Text fontWeight="medium">
                            {program.preferences.time_preference === 'morning' ? 'Sabah' :
                             program.preferences.time_preference === 'afternoon' ? 'Öğleden Sonra' :
                             program.preferences.time_preference === 'evening' ? 'Akşam' : 'Esnek'}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  )}
                </VStack>
              </Card>
            </VStack>
          )}

          {selectedTab === 'activities' && (
            <VStack space={4}>
              {activities.length === 0 ? (
                <Card>
                  <Center p={8}>
                    <Icon as={MaterialIcons} name="event-note" size={12} color="gray.400" />
                    <Text mt={4} color="gray.500" textAlign="center">
                      Henüz aktivite eklenmemiş
                    </Text>
                  </Center>
                </Card>
              ) : (
                activities.map((activity) => (
                  <Pressable
                    key={activity.id}
                    onPress={() => navigation.navigate('ActivityDetail', { activityId: activity.id })}
                  >
                    <Card>
                      <VStack space={3} p={4}>
                        <HStack justifyContent="space-between" alignItems="flex-start">
                          <HStack space={3} flex={1}>
                            <Icon
                              as={MaterialIcons}
                              name={getActivityIcon(activity.type)}
                              size={6}
                              color="primary.500"
                            />
                            <VStack flex={1} space={1}>
                              <Text fontSize="md" fontWeight="semibold">
                                {activity.title}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {activity.description}
                              </Text>
                              <HStack space={4} alignItems="center">
                                <Text fontSize="xs" color="green.600" fontWeight="medium">
                                  ₺{activity.estimated_cost.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {activity.duration_hours} saat
                                </Text>
                              </HStack>
                            </VStack>
                          </HStack>
                          <Badge colorScheme={getStatusColor(activity.status)} variant="solid">
                            {getStatusText(activity.status)}
                          </Badge>
                        </HStack>

                      {activity.status === 'planned' && program.status === 'active' && (
                        <HStack space={2}>
                          <Button
                            flex={1}
                            size="sm"
                            colorScheme="blue"
                            onPress={() => updateActivityStatus(activity.id, 'in_progress')}
                          >
                            Başlat
                          </Button>
                          <Button
                            flex={1}
                            size="sm"
                            colorScheme="green"
                            onPress={() => updateActivityStatus(activity.id, 'completed')}
                          >
                            Tamamla
                          </Button>
                        </HStack>
                      )}

                      {activity.status === 'in_progress' && (
                        <Button
                          size="sm"
                          colorScheme="green"
                          onPress={() => updateActivityStatus(activity.id, 'completed')}
                        >
                          Tamamla
                        </Button>
                      )}                    </VStack>
                    </Card>
                  </Pressable>
                ))
              )}
            </VStack>
          )}

          {selectedTab === 'expenses' && (
            <VStack space={4}>
              <Button
                leftIcon={<Icon as={MaterialIcons} name="add" size={5} />}
                colorScheme="primary"
                onPress={onExpenseOpen}
              >
                Harcama Ekle
              </Button>

              {expenses.length === 0 ? (
                <Card>
                  <Center p={8}>
                    <Icon as={MaterialIcons} name="receipt" size={12} color="gray.400" />
                    <Text mt={4} color="gray.500" textAlign="center">
                      Henüz harcama eklenmemiş
                    </Text>
                  </Center>
                </Card>
              ) : (
                expenses.map((expense) => (
                  <Card key={expense.id}>
                    <HStack space={3} p={4} alignItems="center">
                      <Icon as={MaterialIcons} name="receipt" size={6} color="green.500" />
                      <VStack flex={1} space={1}>
                        <Text fontSize="md" fontWeight="semibold">
                          {expense.title}
                        </Text>
                        {expense.description && (
                          <Text fontSize="sm" color="gray.600">
                            {expense.description}
                          </Text>
                        )}
                        <Text fontSize="xs" color="gray.500">
                          {new Date(expense.created_at).toLocaleDateString('tr-TR')}
                        </Text>
                      </VStack>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        ₺{expense.amount.toLocaleString()}
                      </Text>
                    </HStack>
                  </Card>
                ))
              )}
            </VStack>
          )}
        </VStack>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose} leastDestructiveRef={React.createRef()}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Programı Sil</AlertDialog.Header>
          <AlertDialog.Body>
            Bu programı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onDeleteClose}>
                İptal
              </Button>
              <Button colorScheme="danger" onPress={deleteProgram} isLoading={actionLoading}>
                Sil
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>

      {/* Add Expense Modal */}
      <Modal isOpen={isExpenseOpen} onClose={onExpenseClose}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Harcama Ekle</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl isRequired>
                <FormControl.Label>Başlık</FormControl.Label>
                <Input
                  placeholder="Harcama başlığı"
                  value={expenseForm.title}
                  onChangeText={(text) => setExpenseForm(prev => ({ ...prev, title: text }))}
                />
              </FormControl>

              <FormControl isRequired>
                <FormControl.Label>Tutar (₺)</FormControl.Label>
                <Input
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={expenseForm.amount}
                  onChangeText={(text) => setExpenseForm(prev => ({ ...prev, amount: text }))}
                />
              </FormControl>

              <FormControl isRequired>
                <FormControl.Label>Kategori</FormControl.Label>
                <Select
                  selectedValue={expenseForm.category}
                  placeholder="Kategori seçiniz"
                  onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category: value }))}
                >
                  {expenseCategories.map(cat => (
                    <Select.Item key={cat.value} label={cat.label} value={cat.value} />
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormControl.Label>Aktivite</FormControl.Label>
                <Select
                  selectedValue={expenseForm.activity_id}
                  placeholder="Aktivite seçiniz (opsiyonel)"
                  onValueChange={(value) => setExpenseForm(prev => ({ ...prev, activity_id: value }))}
                >
                  {activities.map(activity => (
                    <Select.Item key={activity.id} label={activity.title} value={activity.id} />
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormControl.Label>Açıklama</FormControl.Label>
                <TextArea
                  placeholder="Harcama açıklaması (opsiyonel)"
                  value={expenseForm.description}
                  onChangeText={(text) => setExpenseForm(prev => ({ ...prev, description: text }))}
                  h={20}
                  autoCompleteType="off"
                />
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onExpenseClose}>
                İptal
              </Button>
              <Button onPress={addExpense}>
                Ekle
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Edit Program Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Programı Düzenle</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl isRequired>
                <FormControl.Label>Başlık</FormControl.Label>
                <Input
                  placeholder="Program başlığı"
                  value={editForm.title}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, title: text }))}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Açıklama</FormControl.Label>
                <TextArea
                  placeholder="Program açıklaması"
                  value={editForm.description}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, description: text }))}
                  h={20}
                  autoCompleteType="off"
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Durum</FormControl.Label>
                <Select
                  selectedValue={editForm.status}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                >
                  <Select.Item label="Taslak" value="draft" />
                  <Select.Item label="Aktif" value="active" />
                  <Select.Item label="Tamamlandı" value="completed" />
                  <Select.Item label="İptal Edildi" value="cancelled" />
                </Select>
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onEditClose}>
                İptal
              </Button>
              <Button onPress={updateProgram}>
                Güncelle
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};