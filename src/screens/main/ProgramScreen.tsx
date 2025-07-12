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
  Progress,
  useToast,
  Skeleton,
  Center,
  Fab,
  Modal,
  FormControl,
  Input,
  TextArea,
  Select,
  CheckIcon,
  Switch,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';

import { useAuth } from '../../contexts/AuthContext';

interface Program {
  id: string;
  title: string;
  description: string;
  budget: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'paused' | 'draft';
  category: string;
  activities_count: number;
  progress_percentage: number;
  created_at: string;
  user_id: string;
}



export const ProgramScreen = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed' | 'all'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Program Form State
  const [newProgram, setNewProgram] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    start_date: '',
    end_date: '',
    is_recurring: false,
  });

  const categories = [
    { label: 'Yemek & İçecek', value: 'food' },
    { label: 'Alışveriş', value: 'shopping' },
    { label: 'Eğlence', value: 'entertainment' },
    { label: 'Sağlık & Güzellik', value: 'health' },
    { label: 'Ulaşım', value: 'transport' },
    { label: 'Eğitim', value: 'education' },
    { label: 'Diğer', value: 'other' },
  ];

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);

      // Mock data for now since we don't have programs table yet
      const mockPrograms: Program[] = [
        {
          id: '1',
          title: 'Aylık Kahve Bütçesi',
          description: 'Kahve harcamalarımı kontrol altında tutmak için oluşturduğum program',
          budget: 500,
          spent_amount: 320,
          start_date: '2024-12-01',
          end_date: '2024-12-31',
          status: 'active',
          category: 'food',
          activities_count: 12,
          progress_percentage: 64,
          created_at: '2024-12-01T00:00:00Z',
          user_id: user?.id || ''
        },
        {
          id: '2',
          title: 'Yılbaşı Alışverişi',
          description: 'Yılbaşı hediyelerini bütçe dahilinde almak',
          budget: 1500,
          spent_amount: 1200,
          start_date: '2024-12-15',
          end_date: '2024-12-31',
          status: 'active',
          category: 'shopping',
          activities_count: 8,
          progress_percentage: 80,
          created_at: '2024-12-15T00:00:00Z',
          user_id: user?.id || ''
        },
        {
          id: '3',
          title: 'Kasım Eğlence Bütçesi',
          description: 'Sinema, konser ve diğer eğlence aktiviteleri',
          budget: 800,
          spent_amount: 800,
          start_date: '2024-11-01',
          end_date: '2024-11-30',
          status: 'completed',
          category: 'entertainment',
          activities_count: 15,
          progress_percentage: 100,
          created_at: '2024-11-01T00:00:00Z',
          user_id: user?.id || ''
        }
      ];

      // Filter programs based on selected tab
      let filteredPrograms = mockPrograms;
      if (selectedTab === 'active') {
        filteredPrograms = mockPrograms.filter(p => p.status === 'active');
      } else if (selectedTab === 'completed') {
        filteredPrograms = mockPrograms.filter(p => p.status === 'completed');
      }

      setPrograms(filteredPrograms);

    } catch (error: unknown) {
      let errorMessage = 'Programlar yüklenirken bir hata oluştu.';
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
  }, [user, selectedTab, toast]);

  useEffect(() => {
    if (user) {
      fetchPrograms();
    }
  }, [user, fetchPrograms]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrograms();
  };

  const handleCreateProgram = async () => {
    if (!newProgram.title || !newProgram.budget || !newProgram.category) {
      toast.show({
        title: 'Eksik Bilgi',
        description: 'Lütfen tüm zorunlu alanları doldurun.',
        variant: 'top-accent',
        bgColor: 'orange.500',
      });
      return;
    }

    try {
      // Here we would normally save to Supabase
      toast.show({
        title: 'Başarılı',
        description: 'Program başarıyla oluşturuldu!',
        variant: 'top-accent',
        bgColor: 'green.500',
      });

      setShowCreateModal(false);
      setNewProgram({
        title: '',
        description: '',
        budget: '',
        category: '',
        start_date: '',
        end_date: '',
        is_recurring: false,
      });
      fetchPrograms();
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
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'paused': return 'orange';
      case 'draft': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'completed': return 'Tamamlandı';
      case 'paused': return 'Duraklatıldı';
      case 'draft': return 'Taslak';
      default: return 'Bilinmiyor';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return 'restaurant';
      case 'shopping': return 'shopping-bag';
      case 'entertainment': return 'movie';
      case 'health': return 'local-hospital';
      case 'transport': return 'directions-car';
      case 'education': return 'school';
      default: return 'category';
    }
  };

  const getCategoryName = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || 'Diğer';
  };

  if (loading) {
    return (
      <Box flex={1} bg="gray.50" safeArea>
        <VStack space={4} p={4}>
          <Skeleton h="12" rounded="md" />
          <HStack space={3}>
            {[1, 2, 3].map(i => (
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
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="lg" color="gray.700">
                Programlarım
              </Heading>
              <Button
                size="sm"
                leftIcon={<Icon as={MaterialIcons} name="add" size={4} />}
                onPress={() => setShowCreateModal(true)}
              >
                Yeni Program
              </Button>
            </HStack>
            
            {/* Tab Navigation */}
            <HStack space={2}>
              {[
                { key: 'active', label: 'Aktif', count: programs.filter(p => p.status === 'active').length },
                { key: 'completed', label: 'Tamamlanan', count: programs.filter(p => p.status === 'completed').length },
                { key: 'all', label: 'Tümü', count: programs.length }
              ].map((tab) => (
                <Pressable
                  key={tab.key}
                  onPress={() => setSelectedTab(tab.key as 'all' | 'active' | 'completed')}
                  flex={1}
                >
                  <Box
                    bg={selectedTab === tab.key ? 'primary.100' : 'gray.100'}
                    p={3}
                    rounded="md"
                    alignItems="center"
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color={selectedTab === tab.key ? 'primary.600' : 'gray.600'}
                    >
                      {tab.label}
                    </Text>
                    <Text
                      fontSize="xs"
                      color={selectedTab === tab.key ? 'primary.500' : 'gray.500'}
                    >
                      {tab.count}
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </HStack>
          </VStack>
        </Box>

        <VStack space={4} p={4}>
          {programs.length === 0 ? (
            <Center py={20}>
              <Icon
                as={MaterialIcons}
                name="assignment"
                size={20}
                color="gray.400"
              />
              <Text color="gray.500" mt={4} textAlign="center">
                {selectedTab === 'active' ? 'Henüz aktif programınız yok' :
                 selectedTab === 'completed' ? 'Henüz tamamlanmış programınız yok' :
                 'Henüz hiç programınız yok'}
              </Text>
              <Button
                mt={4}
                variant="outline"
                onPress={() => setShowCreateModal(true)}
              >
                İlk Programınızı Oluşturun
              </Button>
            </Center>
          ) : (
            programs.map((program) => (
              <Pressable
                key={program.id}
                onPress={() => {
                  toast.show({
                    title: 'Yakında',
                    description: 'Program detayları yakında gelecek!',
                  });
                }}
              >
                <Card>
                  <VStack space={4} p={4}>
                    {/* Program Header */}
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <VStack flex={1} space={1}>
                        <Text fontSize="lg" fontWeight="bold" color="gray.700">
                          {program.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600" numberOfLines={2}>
                          {program.description}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={getStatusColor(program.status)}
                        variant="solid"
                        rounded="full"
                        ml={2}
                      >
                        {getStatusText(program.status)}
                      </Badge>
                    </HStack>

                    {/* Program Stats */}
                    <HStack space={4} alignItems="center">
                      <HStack space={1} alignItems="center">
                        <Icon
                          as={MaterialIcons}
                          name={getCategoryIcon(program.category)}
                          size={4}
                          color="gray.500"
                        />
                        <Text fontSize="xs" color="gray.500">
                          {getCategoryName(program.category)}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.400">•</Text>
                      <HStack space={1} alignItems="center">
                        <Icon
                          as={MaterialIcons}
                          name="assignment"
                          size={4}
                          color="gray.500"
                        />
                        <Text fontSize="xs" color="gray.500">
                          {program.activities_count} aktivite
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.400">•</Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(program.start_date).toLocaleDateString('tr-TR')} - {new Date(program.end_date).toLocaleDateString('tr-TR')}
                      </Text>
                    </HStack>

                    {/* Budget Progress */}
                    <VStack space={2}>
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="sm" color="gray.600">
                          Bütçe Kullanımı
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                          ₺{program.spent_amount.toLocaleString()} / ₺{program.budget.toLocaleString()}
                        </Text>
                      </HStack>
                      <Progress
                        value={program.progress_percentage}
                        colorScheme={program.progress_percentage > 90 ? 'red' : program.progress_percentage > 70 ? 'orange' : 'green'}
                        size="sm"
                        rounded="full"
                      />
                      <HStack justifyContent="space-between">
                        <Text fontSize="xs" color="gray.500">
                          %{program.progress_percentage} kullanıldı
                        </Text>
                        <Text fontSize="xs" color={program.budget - program.spent_amount > 0 ? 'green.600' : 'red.600'}>
                          ₺{(program.budget - program.spent_amount).toLocaleString()} kaldı
                        </Text>
                      </HStack>
                    </VStack>

                    {/* Quick Actions */}
                    <HStack space={2} justifyContent="flex-end">
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="primary"
                        leftIcon={<Icon as={MaterialIcons} name="add" size={3} />}
                        onPress={() => {
                          toast.show({
                            title: 'Yakında',
                            description: 'Aktivite ekleme özelliği yakında gelecek!',
                          });
                        }}
                      >
                        Aktivite Ekle
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="gray"
                        leftIcon={<Icon as={MaterialIcons} name="edit" size={3} />}
                        onPress={() => {
                          toast.show({
                            title: 'Yakında',
                            description: 'Program düzenleme özelliği yakında gelecek!',
                          });
                        }}
                      >
                        Düzenle
                      </Button>
                    </HStack>
                  </VStack>
                </Card>
              </Pressable>
            ))
          )}
        </VStack>
      </ScrollView>

      {/* Floating Action Button */}
      <Fab
        renderInPortal={false}
        shadow={2}
        size="sm"
        icon={<Icon color="white" as={MaterialIcons} name="add" size={4} />}
        onPress={() => setShowCreateModal(true)}
      />

      {/* Create Program Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Yeni Program Oluştur</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl isRequired>
                <FormControl.Label>Program Adı</FormControl.Label>
                <Input
                  placeholder="Örn: Aylık Kahve Bütçesi"
                  value={newProgram.title}
                  onChangeText={(text) => setNewProgram({...newProgram, title: text})}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Açıklama</FormControl.Label>
                <TextArea
                  placeholder="Program hakkında kısa bir açıklama..."
                  value={newProgram.description}
                  onChangeText={(text) => setNewProgram({...newProgram, description: text})}
                  h={20}
                  autoCompleteType="off"
                />
              </FormControl>

              <FormControl isRequired>
                <FormControl.Label>Bütçe (₺)</FormControl.Label>
                <Input
                  placeholder="0"
                  keyboardType="numeric"
                  value={newProgram.budget}
                  onChangeText={(text) => setNewProgram({...newProgram, budget: text})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormControl.Label>Kategori</FormControl.Label>
                <Select
                  selectedValue={newProgram.category}
                  placeholder="Kategori seçin"
                  onValueChange={(value) => setNewProgram({...newProgram, category: value})}
                  _selectedItem={{
                    bg: 'primary.100',
                    endIcon: <CheckIcon size={5} />
                  }}
                >
                  {categories.map((category) => (
                    <Select.Item
                      key={category.value}
                      label={category.label}
                      value={category.value}
                    />
                  ))}
                </Select>
              </FormControl>

              <HStack space={4}>
                <FormControl flex={1}>
                  <FormControl.Label>Başlangıç Tarihi</FormControl.Label>
                  <Input
                    placeholder="YYYY-MM-DD"
                    value={newProgram.start_date}
                    onChangeText={(text) => setNewProgram({...newProgram, start_date: text})}
                  />
                </FormControl>
                <FormControl flex={1}>
                  <FormControl.Label>Bitiş Tarihi</FormControl.Label>
                  <Input
                    placeholder="YYYY-MM-DD"
                    value={newProgram.end_date}
                    onChangeText={(text) => setNewProgram({...newProgram, end_date: text})}
                  />
                </FormControl>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="md">Tekrarlanan Program</Text>
                <Switch
                  isChecked={newProgram.is_recurring}
                  onToggle={(value) => setNewProgram({...newProgram, is_recurring: value})}
                />
              </HStack>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setShowCreateModal(false)}
              >
                İptal
              </Button>
              <Button onPress={handleCreateProgram}>
                Oluştur
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};