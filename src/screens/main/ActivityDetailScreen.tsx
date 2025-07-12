import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  ScrollView,
  Icon,
  // Progress,
  Badge,
  useToast,
  Skeleton,
  Center,
  Pressable,
  useColorModeValue,
  Avatar,
  // Divider,
  Input,
  TextArea,
  Modal,
  useDisclose,
  AlertDialog,
  Image,
  FlatList,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
// import { formatDistanceToNow } from 'date-fns';
// import { tr } from 'date-fns/locale';

interface Activity {
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
  updated_at: string;
  program?: {
    id: string;
    title: string;
    creator_id: string;
  };
  participants?: ActivityParticipant[];
  expenses?: ActivityExpense[];
  photos?: ActivityPhoto[];
}

interface ActivityParticipant {
  id: string;
  activity_id: string;
  user_id: string;
  status: 'invited' | 'accepted' | 'declined' | 'attended';
  joined_at?: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ActivityExpense {
  id: string;
  activity_id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  receipt_url?: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
  };
}

interface ActivityPhoto {
  id: string;
  activity_id: string;
  user_id: string;
  photo_url: string;
  caption?: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ActivityDetailScreenParams {
  activityId: string;
}

export const ActivityDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const route = useRoute();
  const { user } = useAuth();
  const toast = useToast();
  const cancelRef = useRef(null);
  
  const { activityId } = route.params as ActivityDetailScreenParams;
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'participants' | 'expenses' | 'photos'>('details');
  
  // Modals
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclose();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclose();
  const { isOpen: isExpenseOpen, onOpen: onExpenseOpen, onClose: onExpenseClose } = useDisclose();
  const { isOpen: isRatingOpen, onOpen: onRatingOpen, onClose: onRatingClose } = useDisclose();
  
  // Form states
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    notes: '',
  });
  
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    category: 'food',
  });
  
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  // const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('program_activities')
        .select(`
          *,
          program:programs(
            id,
            title,
            creator_id
          ),
          participants:activity_participants(
            *,
            user:profiles(
              id,
              full_name,
              avatar_url
            )
          ),
          expenses:activity_expenses(
            *,
            user:profiles(
              id,
              full_name
            )
          ),
          photos:activity_photos(
            *,
            user:profiles(
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', activityId)
        .single();

      if (error) throw error;
      
      setActivity(data);
      setEditForm({
        title: data.title,
        description: data.description,
        location: data.location,
        notes: data.notes || '',
      });
      setRating(data.rating || 0);
    } catch (error) {
      console.error('Aktivite yüklenirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Aktivite yüklenemedi.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateActivityStatus = async (newStatus: Activity['status']) => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('program_activities')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activityId);

      if (error) throw error;
      
      setActivity(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast.show({
        title: 'Başarılı',
        description: 'Aktivite durumu güncellendi.',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
    } catch (error) {
      console.error('Aktivite durumu güncellenirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Durum güncellenemedi.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateActivity = async () => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('program_activities')
        .update({
          title: editForm.title,
          description: editForm.description,
          location: editForm.location,
          notes: editForm.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activityId);

      if (error) throw error;
      
      setActivity(prev => prev ? {
        ...prev,
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        notes: editForm.notes,
      } : null);
      
      toast.show({
        title: 'Başarılı',
        description: 'Aktivite güncellendi.',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
      
      onEditClose();
    } catch (error) {
      console.error('Aktivite güncellenirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Aktivite güncellenemedi.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setUpdating(false);
    }
  };

  const deleteActivity = async () => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('program_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;
      
      toast.show({
        title: 'Başarılı',
        description: 'Aktivite silindi.',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
      
      navigation.goBack();
    } catch (error) {
      console.error('Aktivite silinirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Aktivite silinemedi.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setUpdating(false);
      onDeleteClose();
    }
  };

  const addExpense = async () => {
    try {
      if (!expenseForm.amount || !expenseForm.description) {
        toast.show({
          title: 'Eksik Bilgi',
          description: 'Tutar ve açıklama alanları zorunludur.',
          variant: 'top-accent',
        bgColor: 'yellow.500',
        });
        return;
      }

      setUpdating(true);
      
      const { error } = await supabase
        .from('activity_expenses')
        .insert({
          activity_id: activityId,
          user_id: user?.id,
          amount: parseFloat(expenseForm.amount),
          description: expenseForm.description,
          category: expenseForm.category,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.show({
        title: 'Başarılı',
        description: 'Harcama eklendi.',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
      
      setExpenseForm({ amount: '', description: '', category: 'food' });
      onExpenseClose();
      loadActivity(); // Reload to get updated expenses
    } catch (error) {
      console.error('Harcama eklenirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Harcama eklenemedi.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setUpdating(false);
    }
  };

  const submitRating = async () => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('program_activities')
        .update({
          rating: rating,
          notes: ratingComment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activityId);

      if (error) throw error;
      
      setActivity(prev => prev ? {
        ...prev,
        rating: rating,
        notes: ratingComment,
      } : null);
      
      toast.show({
        title: 'Başarılı',
        description: 'Değerlendirme kaydedildi.',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
      
      onRatingClose();
    } catch (error) {
      console.error('Değerlendirme kaydedilirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Değerlendirme kaydedilemedi.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'planned': return 'blue';
      case 'in_progress': return 'orange';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: Activity['status']) => {
    switch (status) {
      case 'planned': return 'Planlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return 'restaurant';
      case 'activity': return 'local-activity';
      case 'shopping': return 'shopping-bag';
      case 'entertainment': return 'movie';
      case 'transport': return 'directions-car';
      case 'accommodation': return 'hotel';
      default: return 'star';
    }
  };

  const totalExpenses = activity?.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const isCreator = activity?.program?.creator_id === user?.id;
  const canEdit = isCreator || activity?.status === 'planned';

  if (loading) {
    return (
      <Box flex={1} bg={useColorModeValue('gray.50', 'gray.900')} p={4}>
        <VStack space={4}>
          <Skeleton h={8} />
          <Skeleton h={32} />
          <Skeleton h={6} />
          <Skeleton h={6} />
          <Skeleton h={20} />
        </VStack>
      </Box>
    );
  }

  if (!activity) {
    return (
      <Center flex={1} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Text color={mutedColor}>Aktivite bulunamadı.</Text>
      </Center>
    );
  }

  return (
    <Box flex={1} bg={useColorModeValue('gray.50', 'gray.900')}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={6} p={4}>
          {/* Header */}
          <VStack space={4}>
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1} space={2}>
                <HStack alignItems="center" space={2}>
                  <Icon
                    as={MaterialIcons}
                    name={getActivityIcon(activity.type)}
                    size={6}
                    color="primary.500"
                  />
                  <Heading size="lg" color={textColor} flex={1}>
                    {activity.title}
                  </Heading>
                </HStack>
                
                <Badge
                  colorScheme={getStatusColor(activity.status)}
                  variant="solid"
                  alignSelf="flex-start"
                >
                  {getStatusText(activity.status)}
                </Badge>
              </VStack>
              
              {canEdit && (
                <HStack space={2}>
                  <Pressable onPress={onEditOpen}>
                    <Icon as={MaterialIcons} name="edit" size={6} color={textColor} />
                  </Pressable>
                  {isCreator && (
                    <Pressable onPress={onDeleteOpen}>
                      <Icon as={MaterialIcons} name="delete" size={6} color="red.500" />
                    </Pressable>
                  )}
                </HStack>
              )}
            </HStack>
            
            <Text fontSize="md" color={mutedColor}>
              {activity.description}
            </Text>
          </VStack>

          {/* Quick Stats */}
          <HStack space={4} justifyContent="space-around">
            <VStack alignItems="center" space={1}>
              <Icon as={MaterialIcons} name="location-on" size={6} color="primary.500" />
              <Text fontSize="sm" color={textColor} textAlign="center">
                {activity.location}
              </Text>
            </VStack>
            
            <VStack alignItems="center" space={1}>
              <Icon as={MaterialIcons} name="schedule" size={6} color="primary.500" />
              <Text fontSize="sm" color={textColor}>
                {activity.duration_hours}h
              </Text>
            </VStack>
            
            <VStack alignItems="center" space={1}>
              <Icon as={MaterialIcons} name="attach-money" size={6} color="primary.500" />
              <Text fontSize="sm" color={textColor}>
                ₺{activity.estimated_cost}
              </Text>
            </VStack>
            
            <VStack alignItems="center" space={1}>
              <Icon as={MaterialIcons} name="people" size={6} color="primary.500" />
              <Text fontSize="sm" color={textColor}>
                {activity.participants?.length || 0}
              </Text>
            </VStack>
          </HStack>

          {/* Action Buttons */}
          {activity.status === 'planned' && (
            <HStack space={3}>
              <Button
                flex={1}
                colorScheme="orange"
                onPress={() => updateActivityStatus('in_progress')}
                isLoading={updating}
              >
                Başlat
              </Button>
              <Button
                flex={1}
                variant="outline"
                colorScheme="red"
                onPress={() => updateActivityStatus('cancelled')}
                isLoading={updating}
              >
                İptal Et
              </Button>
            </HStack>
          )}
          
          {activity.status === 'in_progress' && (
            <Button
              colorScheme="green"
              onPress={() => updateActivityStatus('completed')}
              isLoading={updating}
            >
              Tamamla
            </Button>
          )}
          
          {activity.status === 'completed' && !activity.rating && (
            <Button
              colorScheme="yellow"
              onPress={onRatingOpen}
              leftIcon={<Icon as={MaterialIcons} name="star" size={5} />}
            >
              Değerlendir
            </Button>
          )}

          {/* Tabs */}
          <HStack space={1} bg={bgColor} borderRadius="lg" p={1}>
            {[
              { key: 'details', label: 'Detaylar', icon: 'info' },
              { key: 'participants', label: 'Katılımcılar', icon: 'people' },
              { key: 'expenses', label: 'Harcamalar', icon: 'receipt' },
              { key: 'photos', label: 'Fotoğraflar', icon: 'photo' },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                flex={1}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <VStack
                  alignItems="center"
                  space={1}
                  py={2}
                  px={3}
                  bg={activeTab === tab.key ? 'primary.500' : 'transparent'}
                  borderRadius="md"
                >
                  <Icon
                    as={MaterialIcons}
                    name={tab.icon}
                    size={5}
                    color={activeTab === tab.key ? 'white' : textColor}
                  />
                  <Text
                    fontSize="xs"
                    color={activeTab === tab.key ? 'white' : textColor}
                    textAlign="center"
                  >
                    {tab.label}
                  </Text>
                </VStack>
              </Pressable>
            ))}
          </HStack>

          {/* Tab Content */}
          <Box bg={bgColor} borderRadius="lg" p={4}>
            {activeTab === 'details' && (
              <VStack space={4}>
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="semibold" color={textColor}>
                    Program
                  </Text>
                  <Text fontSize="sm" color={mutedColor}>
                    {activity.program?.title}
                  </Text>
                </VStack>
                
                {activity.start_time && (
                  <VStack space={2}>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      Başlangıç Zamanı
                    </Text>
                    <Text fontSize="sm" color={mutedColor}>
                      {new Date(activity.start_time).toLocaleString('tr-TR')}
                    </Text>
                  </VStack>
                )}
                
                {activity.end_time && (
                  <VStack space={2}>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      Bitiş Zamanı
                    </Text>
                    <Text fontSize="sm" color={mutedColor}>
                      {new Date(activity.end_time).toLocaleString('tr-TR')}
                    </Text>
                  </VStack>
                )}
                
                {activity.notes && (
                  <VStack space={2}>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      Notlar
                    </Text>
                    <Text fontSize="sm" color={mutedColor}>
                      {activity.notes}
                    </Text>
                  </VStack>
                )}
                
                {activity.rating && (
                  <VStack space={2}>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      Değerlendirme
                    </Text>
                    <HStack alignItems="center" space={1}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          as={MaterialIcons}
                          name={star <= activity.rating! ? 'star' : 'star-border'}
                          size={5}
                          color="yellow.400"
                        />
                      ))}
                      <Text fontSize="sm" color={mutedColor} ml={2}>
                        ({activity.rating}/5)
                      </Text>
                    </HStack>
                  </VStack>
                )}
              </VStack>
            )}
            
            {activeTab === 'participants' && (
              <VStack space={4}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="md" fontWeight="semibold" color={textColor}>
                    Katılımcılar ({activity.participants?.length || 0})
                  </Text>
                  <Button size="sm" variant="ghost">
                    Davet Et
                  </Button>
                </HStack>
                
                {activity.participants?.map((participant) => (
                  <HStack key={participant.id} space={3} alignItems="center">
                    <Avatar
                      size="sm"
                      source={{ uri: participant.user?.avatar_url }}
                    >
                      {participant.user?.full_name?.charAt(0)}
                    </Avatar>
                    <VStack flex={1}>
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        {participant.user?.full_name}
                      </Text>
                      <Text fontSize="xs" color={mutedColor}>
                        {participant.status === 'accepted' ? 'Katılıyor' :
                         participant.status === 'declined' ? 'Katılmıyor' :
                         participant.status === 'attended' ? 'Katıldı' : 'Davet Edildi'}
                      </Text>
                    </VStack>
                    <Badge
                      colorScheme={
                        participant.status === 'accepted' || participant.status === 'attended' ? 'green' :
                        participant.status === 'declined' ? 'red' : 'orange'
                      }
                      variant="subtle"
                    >
                      {participant.status === 'accepted' ? '✓' :
                       participant.status === 'declined' ? '✗' :
                       participant.status === 'attended' ? '★' : '?'}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            )}
            
            {activeTab === 'expenses' && (
              <VStack space={4}>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      Harcamalar
                    </Text>
                    <Text fontSize="sm" color={mutedColor}>
                      Toplam: ₺{totalExpenses.toFixed(2)}
                    </Text>
                  </VStack>
                  <Button size="sm" onPress={onExpenseOpen}>
                    Harcama Ekle
                  </Button>
                </HStack>
                
                {activity.expenses?.map((expense) => (
                  <HStack key={expense.id} space={3} alignItems="center">
                    <VStack flex={1}>
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        {expense.description}
                      </Text>
                      <Text fontSize="xs" color={mutedColor}>
                        {expense.user?.full_name} • {expense.category}
                      </Text>
                    </VStack>
                    <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                      ₺{expense.amount.toFixed(2)}
                    </Text>
                  </HStack>
                ))}
                
                {(!activity.expenses || activity.expenses.length === 0) && (
                  <Center py={8}>
                    <Text color={mutedColor}>Henüz harcama eklenmemiş</Text>
                  </Center>
                )}
              </VStack>
            )}
            
            {activeTab === 'photos' && (
              <VStack space={4}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="md" fontWeight="semibold" color={textColor}>
                    Fotoğraflar ({activity.photos?.length || 0})
                  </Text>
                  <Button size="sm">
                    Fotoğraf Ekle
                  </Button>
                </HStack>
                
                {activity.photos && activity.photos.length > 0 ? (
                  <FlatList
                    data={activity.photos}
                    numColumns={2}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <Box flex={1} m={1}>
                        <Image
                          source={{ uri: item.photo_url }}
                          alt={item.caption || 'Activity photo'}
                          size="xl"
                          borderRadius="md"
                        />
                        {item.caption && (
                          <Text fontSize="xs" color={mutedColor} mt={1}>
                            {item.caption}
                          </Text>
                        )}
                      </Box>
                    )}
                  />
                ) : (
                  <Center py={8}>
                    <Text color={mutedColor}>Henüz fotoğraf eklenmemiş</Text>
                  </Center>
                )}
              </VStack>
            )}
          </Box>
        </VStack>
      </ScrollView>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Aktiviteyi Düzenle</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="medium">Başlık</Text>
                <Input
                  value={editForm.title}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, title: text }))}
                  placeholder="Aktivite başlığı"
                />
              </VStack>
              
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="medium">Açıklama</Text>
                <TextArea
                  value={editForm.description}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, description: text }))}
                  placeholder="Aktivite açıklaması"
                  h={20}
                  autoCompleteType="off"
                />
              </VStack>
              
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="medium">Konum</Text>
                <Input
                  value={editForm.location}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, location: text }))}
                  placeholder="Aktivite konumu"
                />
              </VStack>
              
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="medium">Notlar</Text>
                <TextArea
                  value={editForm.notes}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, notes: text }))}
                  placeholder="Ek notlar"
                  h={16}
                  autoCompleteType="off"
                />
              </VStack>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onEditClose}>
                İptal
              </Button>
              <Button onPress={updateActivity} isLoading={updating}>
                Kaydet
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={isExpenseOpen} onClose={onExpenseClose}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Harcama Ekle</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="medium">Tutar (₺)</Text>
                <Input
                  value={expenseForm.amount}
                  onChangeText={(text) => setExpenseForm(prev => ({ ...prev, amount: text }))}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </VStack>
              
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="medium">Açıklama</Text>
                <Input
                  value={expenseForm.description}
                  onChangeText={(text) => setExpenseForm(prev => ({ ...prev, description: text }))}
                  placeholder="Harcama açıklaması"
                />
              </VStack>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onExpenseClose}>
                İptal
              </Button>
              <Button onPress={addExpense} isLoading={updating}>
                Ekle
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Rating Modal */}
      <Modal isOpen={isRatingOpen} onClose={onRatingClose}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Aktiviteyi Değerlendir</Modal.Header>
          <Modal.Body>
            <VStack space={4} alignItems="center">
              <Text fontSize="md" textAlign="center">
                Bu aktiviteyi nasıl değerlendiriyorsunuz?
              </Text>
              
              <HStack space={2}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setRating(star)}>
                    <Icon
                      as={MaterialIcons}
                      name={star <= rating ? 'star' : 'star-border'}
                      size={8}
                      color={star <= rating ? 'yellow.400' : 'gray.300'}
                    />
                  </Pressable>
                ))}
              </HStack>
              
              <TextArea
                value={ratingComment}
                onChangeText={setRatingComment}
                placeholder="Yorumunuz (isteğe bağlı)"
                h={20}
                w="100%"
                autoCompleteType="off"
              />
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onRatingClose}>
                İptal
              </Button>
              <Button onPress={submitRating} isLoading={updating} isDisabled={rating === 0}>
                Kaydet
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
          <AlertDialog.Header>Aktiviteyi Sil</AlertDialog.Header>
          <AlertDialog.Body>
            Bu aktiviteyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={onDeleteClose}
                ref={cancelRef}
              >
                İptal
              </Button>
              <Button colorScheme="red" onPress={deleteActivity} isLoading={updating}>
                Sil
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};