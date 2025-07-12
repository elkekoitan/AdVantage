import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  RefreshControl,
} from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Pressable,
  Input,
  Switch,
  Modal,
  Spinner,
  Icon,
  useToast,
  Progress,
  Avatar,
  Badge,
  Divider,
  Button,
  FormControl,
  TextArea,
  AlertDialog,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

// Colors and Typography
const colors = {
  primary: '#007AFF',
  primaryLight: '#E3F2FD',
  secondary: '#FF6B35',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
};



import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/MainNavigator';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  location?: string;
  bio?: string;
  preferences: {
    notifications: boolean;
    marketing_emails: boolean;
    location_tracking: boolean;
    data_sharing: boolean;
  };
  stats: {
    total_programs: number;
    completed_programs: number;
    total_savings: number;
    current_streak: number;
    member_since: string;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_date?: string;
  progress?: number;
  target?: number;
}

type ProfileScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const toast = useToast();
  const cancelRef = useRef(null);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    notifications: true,
    marketing_emails: false,
    location_tracking: true,
    data_sharing: false,
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      // Mock profile data for now
      const mockProfile: UserProfile = {
        id: user?.id || '',
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || 'Kullanıcı',
        avatar_url: user?.user_metadata?.avatar_url,
        phone: '+90 555 123 45 67',
        date_of_birth: '1990-01-01',
        location: 'İstanbul, Türkiye',
        bio: 'Tasarruf etmeyi seven, akıllı harcama yapan bir kullanıcı.',
        preferences: {
          notifications: true,
          marketing_emails: false,
          location_tracking: true,
          data_sharing: false,
        },
        stats: {
          total_programs: 12,
          completed_programs: 8,
          total_savings: 2450,
          current_streak: 15,
          member_since: '2024-01-15',
        },
      };

      setProfile(mockProfile);
      setEditForm({
        full_name: mockProfile.full_name,
        phone: mockProfile.phone || '',
        location: mockProfile.location || '',
        bio: mockProfile.bio || '',
        notifications: mockProfile.preferences.notifications,
        marketing_emails: mockProfile.preferences.marketing_emails,
        location_tracking: mockProfile.preferences.location_tracking,
        data_sharing: mockProfile.preferences.data_sharing,
      });

    } catch (error: unknown) {
      let errorMessage = 'Profil yüklenirken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Hata',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const fetchAchievements = useCallback(async () => {
    try {
      // Mock achievements data
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'İlk Program',
          description: 'İlk tasarruf programınızı oluşturdunuz!',
          icon: 'star',
          earned_date: '2024-01-20',
        },
        {
          id: '2',
          title: 'Tasarruf Ustası',
          description: '1000₺ tasarruf ettiniz!',
          icon: 'savings',
          earned_date: '2024-02-15',
        },
        {
          id: '3',
          title: 'Süreklilik',
          description: '7 gün üst üste program takibi',
          icon: 'trending-up',
          earned_date: '2024-03-01',
        },
        {
          id: '4',
          title: 'Büyük Hedef',
          description: '5000₺ tasarruf hedefine ulaşın',
          icon: 'emoji-events',
          progress: 2450,
          target: 5000,
        },
      ];

      setAchievements(mockAchievements);
    } catch (error: unknown) {
      console.error('Achievements fetch error:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAchievements();
    }
  }, [user, fetchProfile, fetchAchievements]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
    fetchAchievements();
  };

  const handleUpdateProfile = async () => {
    if (!editForm.full_name.trim()) {
      toast.show({
        title: 'Eksik Bilgi',
        description: 'Ad soyad alanı zorunludur.',
      });
      return;
    }

    try {
      setUpdating(true);

      // Here we would normally update the profile in Supabase
      toast.show({
        title: 'Başarılı',
        description: 'Profil başarıyla güncellendi!',
      });

      setIsEditModalVisible(false);
      fetchProfile();
    } catch (error: unknown) {
      let errorMessage = 'Profil güncellenirken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Hata',
        description: errorMessage,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.show({
        title: 'Başarılı',
        description: 'Başarıyla çıkış yapıldı.',
      });
    } catch (error: unknown) {
      let errorMessage = 'Çıkış yapılırken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Hata',
        description: errorMessage,
      });
    }
    setIsLogoutModalVisible(false);
  };

  if (loading) {
    return (
      <Box flex={1} bg="#f9fafb" justifyContent="center" alignItems="center">
        <Spinner size="lg" color={colors.primary} />
        <Text mt={3} fontSize="md" color={colors.textSecondary}>Profil yükleniyor...</Text>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box flex={1} bg="#f9fafb" justifyContent="center" alignItems="center">
        <Text fontSize="md" color="gray.500">Profil yüklenemedi</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="#f9fafb">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <Box p={4}>
          <Box bg={colors.surface} borderRadius={12} p={5} mb={5}>
            <HStack alignItems="center" mb={4}>
              <Box mr={4}>
                {profile.avatar_url ? (
                  <Avatar size="lg" source={{ uri: profile.avatar_url }} />
                ) : (
                  <Avatar size="lg" bg={colors.primary}>
                    <Text color="white" fontSize="xl" fontWeight="bold">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </Text>
                  </Avatar>
                )}
              </Box>
              <VStack flex={1}>
                <Text fontSize="lg" fontWeight="600" color={colors.text}>
                  {profile.full_name}
                </Text>
                <Text fontSize="md" color="gray.500">
                  {profile.email}
                </Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Üye olma: {new Date(profile.stats.member_since).toLocaleDateString('tr-TR')}
                </Text>
              </VStack>
              <Pressable
                bg={colors.primary}
                px={4}
                py={2}
                borderRadius={20}
                onPress={() => setIsEditModalVisible(true)}
              >
                <HStack alignItems="center">
                  <Icon as={MaterialIcons} name="edit" size={4} color="white" mr={1} />
                  <Text color="white" fontSize="sm" fontWeight="600">Düzenle</Text>
                </HStack>
              </Pressable>
            </HStack>
            
            {profile.bio && (
              <Text fontSize="md" color={colors.text} lineHeight={22} mt={2}>
                {profile.bio}
              </Text>
            )}
            
            {profile.location && (
              <HStack alignItems="center" mt={2}>
                <Icon as={MaterialIcons} name="location-on" size={4} color={colors.textSecondary} mr={1} />
                <Text fontSize="sm" color="gray.500">
                  {profile.location}
                </Text>
              </HStack>
            )}
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box px={4} mb={6}>
          <Text fontSize="lg" fontWeight="600" color={colors.text} mb={4}>
            İstatistikler
          </Text>
          <HStack mb={3}>
            <Box bg="white" borderRadius={12} p={4} alignItems="center" flex={1} mx={1.5} shadow={1}>
              <Icon as={MaterialIcons} name="description" size={8} color={colors.primary} mb={2} />
              <Text fontSize="xl" fontWeight="bold" color={colors.primary} mb={1}>
                {profile.stats.total_programs}
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Toplam Program
              </Text>
            </Box>
            <Box bg="white" borderRadius={12} p={4} alignItems="center" flex={1} mx={1.5} shadow={1}>
              <Icon as={MaterialIcons} name="check-circle" size={8} color={colors.success} mb={2} />
              <Text fontSize="xl" fontWeight="bold" color={colors.primary} mb={1}>
                {profile.stats.completed_programs}
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Tamamlanan
              </Text>
            </Box>
          </HStack>
          <HStack>
            <Box bg="white" borderRadius={12} p={4} alignItems="center" flex={1} mx={1.5} shadow={1}>
              <Icon as={MaterialIcons} name="account-balance-wallet" size={8} color={colors.warning} mb={2} />
              <Text fontSize="xl" fontWeight="bold" color={colors.primary} mb={1}>
                ₺{profile.stats.total_savings.toLocaleString()}
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Toplam Tasarruf
              </Text>
            </Box>
            <Box bg="white" borderRadius={12} p={4} alignItems="center" flex={1} mx={1.5} shadow={1}>
              <Icon as={MaterialIcons} name="local-fire-department" size={8} color={colors.error} mb={2} />
              <Text fontSize="xl" fontWeight="bold" color={colors.primary} mb={1}>
                {profile.stats.current_streak}
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Günlük Seri
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Achievements */}
        <Box px={4} mb={6}>
          <Text fontSize="lg" fontWeight="600" color={colors.text} mb={4}>
            Başarılar
          </Text>
          <VStack space={3}>
            {achievements.map((achievement) => (
              <Box key={achievement.id} bg="white" borderRadius={12} p={4} shadow={1}>
                <HStack alignItems="center">
                  <Box
                    w={12}
                    h={12}
                    borderRadius={24}
                    bg={achievement.earned_date ? colors.primary + '20' : '#f5f5f5'}
                    justifyContent="center"
                    alignItems="center"
                    mr={3}
                  >
                    <Icon
                      as={MaterialIcons}
                      name={achievement.icon === 'star' ? 'star' : 
                            achievement.icon === 'savings' ? 'savings' :
                            achievement.icon === 'trending-up' ? 'trending-up' :
                            achievement.icon === 'emoji-events' ? 'emoji-events' : 'star'}
                      size={6}
                      color={achievement.earned_date ? colors.primary : '#9ca3af'}
                    />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="md" fontWeight="600" color={colors.text} mb={1}>
                      {achievement.title}
                    </Text>
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      {achievement.description}
                    </Text>
                    {achievement.earned_date ? (
                      <Text fontSize="xs" color="green.500">
                        Kazanıldı: {new Date(achievement.earned_date).toLocaleDateString('tr-TR')}
                      </Text>
                    ) : achievement.progress && achievement.target ? (
                      <VStack space={1}>
                        <Progress
                          value={(achievement.progress / achievement.target) * 100}
                          colorScheme="blue"
                          size="sm"
                        />
                        <Text fontSize="xs" color="gray.500">
                          {achievement.progress} / {achievement.target}
                        </Text>
                      </VStack>
                    ) : (
                      <Text fontSize="xs" color="gray.500">
                        Henüz kazanılmadı
                      </Text>
                    )}
                  </VStack>
                  {achievement.earned_date && (
                    <Badge bg="green.500" borderRadius={12} w={6} h={6} justifyContent="center" alignItems="center">
                      <Text color="white" fontSize="xs" fontWeight="bold">✓</Text>
                    </Badge>
                  )}
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Settings */}
        <Box px={4} mb={6}>
          <Text fontSize="lg" fontWeight="600" color={colors.text} mb={4}>
            Ayarlar
          </Text>
          <Box bg="white" borderRadius={12} overflow="hidden" shadow={1}>
            <Pressable
              p={4}
              onPress={() => navigation.navigate('Notifications')}
            >
              <HStack alignItems="center">
                <Icon as={MaterialIcons} name="notifications" size={6} color="gray.500" />
                <VStack flex={1} ml={3}>
                  <Text fontSize="md" fontWeight="600" color={colors.text} mb={0.5}>
                    Bildirimler
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Push bildirimleri ve e-posta ayarları
                  </Text>
                </VStack>
                <Icon as={MaterialIcons} name="chevron-right" size={5} color="gray.400" />
              </HStack>
            </Pressable>
            <Divider />
            <Pressable
              p={4}
              onPress={() => navigation.navigate('Settings')}
            >
              <HStack alignItems="center">
                <Icon as={MaterialIcons} name="security" size={6} color="gray.500" />
                <VStack flex={1} ml={3}>
                  <Text fontSize="md" fontWeight="600" color={colors.text} mb={0.5}>
                    Ayarlar
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Gizlilik, güvenlik ve uygulama ayarları
                  </Text>
                </VStack>
                <Icon as={MaterialIcons} name="chevron-right" size={5} color="gray.400" />
              </HStack>
            </Pressable>
            <Divider />
            <Pressable
              p={4}
              onPress={() => {
                toast.show({
                  title: 'Yakında',
                  description: 'Yardım merkezi yakında gelecek!',
                });
              }}
            >
              <HStack alignItems="center">
                <Icon as={MaterialIcons} name="help" size={6} color="gray.500" />
                <VStack flex={1} ml={3}>
                  <Text fontSize="md" fontWeight="600" color={colors.text} mb={0.5}>
                    Yardım
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    SSS, destek ve geri bildirim
                  </Text>
                </VStack>
                <Icon as={MaterialIcons} name="chevron-right" size={5} color="gray.400" />
              </HStack>
            </Pressable>
            <Divider />
            <Pressable
              p={4}
              onPress={() => setIsLogoutModalVisible(true)}
            >
              <HStack alignItems="center">
                <Icon as={MaterialIcons} name="logout" size={6} color="red.500" />
                <Text fontSize="md" fontWeight="600" color="red.500" ml={3}>
                  Çıkış Yap
                </Text>
              </HStack>
            </Pressable>
          </Box>
        </Box>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalVisible} onClose={() => setIsEditModalVisible(false)} size="full">
        <Modal.Content maxWidth="400px" bg="white">
          <Modal.CloseButton />
          <Modal.Header>
            <Text fontSize="lg" fontWeight="600" color={colors.text}>
              Profili Düzenle
            </Text>
          </Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl>
                <FormControl.Label>
                  <Text fontSize="sm" fontWeight="500" color={colors.text}>
                    Ad Soyad *
                  </Text>
                </FormControl.Label>
                <Input
                  value={editForm.full_name}
                  onChangeText={(text) => setEditForm({...editForm, full_name: text})}
                  placeholder="Ad Soyad"
                  bg="gray.50"
                  borderColor="gray.200"
                  _focus={{ borderColor: colors.primary, bg: 'white' }}
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>
                  <Text fontSize="sm" fontWeight="500" color={colors.text}>
                    Telefon
                  </Text>
                </FormControl.Label>
                <Input
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                  placeholder="+90 555 123 45 67"
                  keyboardType="phone-pad"
                  bg="gray.50"
                  borderColor="gray.200"
                  _focus={{ borderColor: colors.primary, bg: 'white' }}
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>
                  <Text fontSize="sm" fontWeight="500" color={colors.text}>
                    Konum
                  </Text>
                </FormControl.Label>
                <Input
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({...editForm, location: text})}
                  placeholder="Şehir, Ülke"
                  bg="gray.50"
                  borderColor="gray.200"
                  _focus={{ borderColor: colors.primary, bg: 'white' }}
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>
                  <Text fontSize="sm" fontWeight="500" color={colors.text}>
                    Hakkımda
                  </Text>
                </FormControl.Label>
                <TextArea
                  value={editForm.bio}
                  onChangeText={(text) => setEditForm({...editForm, bio: text})}
                  placeholder="Kendiniz hakkında kısa bir açıklama..."
                  numberOfLines={4}
                  bg="gray.50"
                  borderColor="gray.200"
                  _focus={{ borderColor: colors.primary, bg: 'white' }}
                  autoCompleteType="off"
                />
              </FormControl>
              
              <Divider my={2} />
              
              <Text fontSize="md" fontWeight="600" color={colors.text} mb={3}>
                Gizlilik Tercihleri
              </Text>
              
              <HStack justifyContent="space-between" alignItems="center" mb={3}>
                <VStack flex={1}>
                  <Text fontSize="sm" fontWeight="500" color={colors.text}>
                    Bildirimler
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Push bildirimleri al
                  </Text>
                </VStack>
                <Switch
                  isChecked={editForm.notifications}
                  onToggle={(value) => setEditForm({...editForm, notifications: value})}
                  colorScheme="blue"
                />
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center" mb={3}>
                <VStack flex={1}>
                  <Text fontSize="sm" fontWeight="500" color={colors.text}>
                    Pazarlama E-postaları
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Kampanya ve fırsat e-postaları
                  </Text>
                </VStack>
                <Switch
                  isChecked={editForm.marketing_emails}
                  onToggle={(value) => setEditForm({...editForm, marketing_emails: value})}
                  colorScheme="blue"
                />
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1}>
                  <Text fontSize="sm" fontWeight="500" color={colors.text}>
                    Konum Takibi
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Yakındaki fırsatları göster
                  </Text>
                </VStack>
                <Switch
                  isChecked={editForm.location_tracking}
                  onToggle={(value) => setEditForm({...editForm, location_tracking: value})}
                  colorScheme="blue"
                />
              </HStack>
            </VStack>
          </Modal.Body>
          
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setIsEditModalVisible(false)}
                flex={1}
              >
                İptal
              </Button>
              <Button
                bg={colors.primary}
                onPress={handleUpdateProfile}
                isLoading={updating}
                isLoadingText="Kaydediliyor..."
                flex={1}
              >
                Kaydet
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Logout Confirmation */}
      <AlertDialog
        isOpen={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>
            <Text fontSize="lg" fontWeight="600" color={colors.text}>
              Çıkış Yap
            </Text>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <Text fontSize="md" color="gray.600">
              Hesabınızdan çıkış yapmak istediğinizden emin misiniz?
            </Text>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="coolGray"
                onPress={() => setIsLogoutModalVisible(false)}
                flex={1}
              >
                İptal
              </Button>
              <Button
                colorScheme="red"
                onPress={handleLogout}
                flex={1}
              >
                Çıkış Yap
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};



export default ProfileScreen;