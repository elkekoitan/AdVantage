import React, { useState, useEffect, useRef } from 'react';
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
  Badge,
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
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  const { isOpen: isAddActivityOpen, onOpen: onAddActivityOpen, onClose: onAddActivityClose } = useDisclose();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclose();
  const cancelRef = useRef(null);

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Add Activity Form State
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    category: '',
    target_amount: '',
    due_date: '',
  });

  const { programId } = route.params;

  useEffect(() => {
    if (programId) {
      fetchProgram();
    }
  }, [programId]);

  const fetchProgram = async () => {
    try {
      setLoading(true);

      // Mock program data for now
      const mockProgram: Program = {
        id: programId,
        title: 'Aylık Market Alışverişi',
        description: 'Aylık market harcamalarımı optimize etmek ve tasarruf etmek için oluşturduğum program.',
        total_budget: 1500,
        spent_amount: 850,
        start_date: '2024-03-01',
        end_date: '2024-03-31',
        status: 'active',
        created_at: '2024-03-01T10:00:00Z',
        activities: [
          {
            id: '1',
            title: 'Haftalık Market',
            description: 'Temel gıda maddeleri alışverişi',
            category: 'Gıda',
            target_amount: 400,
            spent_amount: 380,
            due_date: '2024-03-08',
            status: 'completed',
            created_at: '2024-03-01T10:00:00Z',
          },
          {
            id: '2',
            title: 'Temizlik Malzemeleri',
            description: 'Ev temizlik ürünleri',
            category: 'Temizlik',
            target_amount: 200,
            spent_amount: 180,
            due_date: '2024-03-15',
            status: 'completed',
            created_at: '2024-03-05T14:00:00Z',
          },
          {
            id: '3',
            title: 'Kişisel Bakım',
            description: 'Şampuan, sabun, diş macunu vb.',
            category: 'Kişisel Bakım',
            target_amount: 150,
            spent_amount: 120,
            due_date: '2024-03-20',
            status: 'pending',
            created_at: '2024-03-10T09:00:00Z',
          },
          {
            id: '4',
            title: 'Atıştırmalık',
            description: 'Çay, kahve, bisküvi, çikolata',
            category: 'Atıştırmalık',
            target_amount: 100,
            spent_amount: 0,
            due_date: '2024-03-25',
            status: 'pending',
            created_at: '2024-03-12T16:00:00Z',
          },
        ],
      };

      setProgram(mockProgram);
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
  };

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

      // Here we would normally add the activity to Supabase
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
        due_date: '',
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
      // Here we would normally delete the program from Supabase
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'overdue':
        return 'red';
      case 'active':
        return 'blue';
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
                  <Badge colorScheme={getStatusColor(program.status)} variant="solid" rounded="full">
                    {getStatusText(program.status)}
                  </Badge>
                  <Text color="gray.500" fontSize="xs">
                    {new Date(program.start_date).toLocaleDateString('tr-TR')} - {new Date(program.end_date).toLocaleDateString('tr-TR')}
                  </Text>
                </HStack>
              </VStack>
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
                          <Badge colorScheme="gray" variant="outline" size="sm">
                            {activity.category}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            Son tarih: {new Date(activity.due_date).toLocaleDateString('tr-TR')}
                          </Text>
                        </HStack>
                      </VStack>
                      <Badge colorScheme={getStatusColor(activity.status)} variant="solid" rounded="full">
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