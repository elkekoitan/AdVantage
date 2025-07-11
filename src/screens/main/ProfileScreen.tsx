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
  Avatar,
  Pressable,
  Badge,
  useToast,
  Skeleton,
  Center,
  Modal,
  FormControl,
  Input,
  TextArea,
  Switch,
  Divider,
  AlertDialog,
  useDisclose,
  Card,
  Progress,
  Circle,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';

import { useAuth } from '../../contexts/AuthContext';

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

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const { isOpen: isLogoutOpen, onOpen: onLogoutOpen, onClose: onLogoutClose } = useDisclose();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclose();
  const cancelRef = useRef(null);

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

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAchievements();
    }
  }, [user]);

  const fetchProfile = async () => {
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
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAchievements = async () => {
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
  };

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
        variant: 'top-accent',
        bgColor: 'orange.500',
      });
      return;
    }

    try {
      setUpdating(true);

      // Here we would normally update the profile in Supabase
      toast.show({
        title: 'Başarılı',
        description: 'Profil başarıyla güncellendi!',
        variant: 'top-accent',
        bgColor: 'green.500',
      });

      onEditClose();
      fetchProfile();
    } catch (error: unknown) {
      let errorMessage = 'Profil güncellenirken bir hata oluştu.';
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

  const handleLogout = async () => {
    try {
      await signOut();
      toast.show({
        title: 'Başarılı',
        description: 'Başarıyla çıkış yapıldı.',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
    } catch (error: unknown) {
      let errorMessage = 'Çıkış yapılırken bir hata oluştu.';
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
    onLogoutClose();
  };

  if (loading) {
    return (
      <Box flex={1} bg="gray.50" safeArea>
        <VStack space={4} p={4}>
          <HStack space={4} alignItems="center">
            <Skeleton size="20" rounded="full" />
            <VStack space={2} flex={1}>
              <Skeleton h="6" w="40" rounded="md" />
              <Skeleton h="4" w="32" rounded="md" />
            </VStack>
          </HStack>
          <Skeleton h="32" rounded="md" />
          <Skeleton h="40" rounded="md" />
        </VStack>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Center flex={1} bg="gray.50">
        <Text color="gray.500">Profil yüklenemedi</Text>
      </Center>
    );
  }

  return (
    <Box flex={1} bg="gray.50" safeArea>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <Box bg="white" px={4} py={6} shadow={1}>
          <VStack space={4}>
            <HStack space={4} alignItems="center">
              <Avatar
                size="xl"
                source={profile.avatar_url ? { uri: profile.avatar_url } : undefined}
                bg="primary.500"
              >
                {profile.full_name.charAt(0).toUpperCase()}
              </Avatar>
              <VStack flex={1} space={1}>
                <Heading size="lg" color="gray.700">
                  {profile.full_name}
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  {profile.email}
                </Text>
                <Text color="gray.500" fontSize="xs">
                  Üye olma: {new Date(profile.stats.member_since).toLocaleDateString('tr-TR')}
                </Text>
              </VStack>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MaterialIcons} name="edit" size={4} />}
                onPress={onEditOpen}
              >
                Düzenle
              </Button>
            </HStack>
            
            {profile.bio && (
              <Text color="gray.600" fontSize="sm">
                {profile.bio}
              </Text>
            )}
            
            {profile.location && (
              <HStack space={2} alignItems="center">
                <Icon as={MaterialIcons} name="location-on" size={4} color="gray.500" />
                <Text color="gray.500" fontSize="sm">
                  {profile.location}
                </Text>
              </HStack>
            )}
          </VStack>
        </Box>

        {/* Stats Cards */}
        <VStack space={4} p={4}>
          <Heading size="md" color="gray.700">
            İstatistikler
          </Heading>
          <HStack space={3}>
            <Card flex={1}>
              <VStack space={2} p={4} alignItems="center">
                <Icon as={MaterialIcons} name="assignment" size={8} color="primary.500" />
                <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  {profile.stats.total_programs}
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Toplam Program
                </Text>
              </VStack>
            </Card>
            <Card flex={1}>
              <VStack space={2} p={4} alignItems="center">
                <Icon as={MaterialIcons} name="check-circle" size={8} color="green.500" />
                <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  {profile.stats.completed_programs}
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Tamamlanan
                </Text>
              </VStack>
            </Card>
          </HStack>
          <HStack space={3}>
            <Card flex={1}>
              <VStack space={2} p={4} alignItems="center">
                <Icon as={MaterialIcons} name="savings" size={8} color="orange.500" />
                <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  ₺{profile.stats.total_savings.toLocaleString()}
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Toplam Tasarruf
                </Text>
              </VStack>
            </Card>
            <Card flex={1}>
              <VStack space={2} p={4} alignItems="center">
                <Icon as={MaterialIcons} name="local-fire-department" size={8} color="red.500" />
                <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  {profile.stats.current_streak}
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Günlük Seri
                </Text>
              </VStack>
            </Card>
          </HStack>
        </VStack>

        {/* Achievements */}
        <VStack space={4} p={4}>
          <Heading size="md" color="gray.700">
            Başarılar
          </Heading>
          <VStack space={3}>
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <HStack space={4} p={4} alignItems="center">
                  <Circle size={12} bg={achievement.earned_date ? 'primary.100' : 'gray.100'}>
                    <Icon
                      as={MaterialIcons}
                      name={achievement.icon as any}
                      size={6}
                      color={achievement.earned_date ? 'primary.500' : 'gray.400'}
                    />
                  </Circle>
                  <VStack flex={1} space={1}>
                    <Text fontSize="md" fontWeight="semibold" color="gray.700">
                      {achievement.title}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {achievement.description}
                    </Text>
                    {achievement.earned_date ? (
                      <Text fontSize="xs" color="green.600">
                        Kazanıldı: {new Date(achievement.earned_date).toLocaleDateString('tr-TR')}
                      </Text>
                    ) : achievement.progress && achievement.target ? (
                      <VStack space={1}>
                        <Progress
                          value={(achievement.progress / achievement.target) * 100}
                          colorScheme="primary"
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
                    <Badge colorScheme="green" variant="solid" rounded="full">
                      ✓
                    </Badge>
                  )}
                </HStack>
              </Card>
            ))}
          </VStack>
        </VStack>

        {/* Settings */}
        <VStack space={4} p={4}>
          <Heading size="md" color="gray.700">
            Ayarlar
          </Heading>
          <Card>
            <VStack space={0}>
              <Pressable
                onPress={() => {
                  toast.show({
                    title: 'Yakında',
                    description: 'Bildirim ayarları yakında gelecek!',
                  });
                }}
              >
                <HStack space={4} p={4} alignItems="center">
                  <Icon as={MaterialIcons} name="notifications" size={6} color="gray.500" />
                  <VStack flex={1}>
                    <Text fontSize="md" color="gray.700">
                      Bildirimler
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Push bildirimleri ve e-posta ayarları
                    </Text>
                  </VStack>
                  <Icon as={MaterialIcons} name="chevron-right" size={6} color="gray.400" />
                </HStack>
              </Pressable>
              <Divider />
              <Pressable
                onPress={() => {
                  toast.show({
                    title: 'Yakında',
                    description: 'Gizlilik ayarları yakında gelecek!',
                  });
                }}
              >
                <HStack space={4} p={4} alignItems="center">
                  <Icon as={MaterialIcons} name="privacy-tip" size={6} color="gray.500" />
                  <VStack flex={1}>
                    <Text fontSize="md" color="gray.700">
                      Gizlilik
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Veri paylaşımı ve gizlilik tercihleri
                    </Text>
                  </VStack>
                  <Icon as={MaterialIcons} name="chevron-right" size={6} color="gray.400" />
                </HStack>
              </Pressable>
              <Divider />
              <Pressable
                onPress={() => {
                  toast.show({
                    title: 'Yakında',
                    description: 'Yardım merkezi yakında gelecek!',
                  });
                }}
              >
                <HStack space={4} p={4} alignItems="center">
                  <Icon as={MaterialIcons} name="help" size={6} color="gray.500" />
                  <VStack flex={1}>
                    <Text fontSize="md" color="gray.700">
                      Yardım
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      SSS, destek ve geri bildirim
                    </Text>
                  </VStack>
                  <Icon as={MaterialIcons} name="chevron-right" size={6} color="gray.400" />
                </HStack>
              </Pressable>
              <Divider />
              <Pressable onPress={onLogoutOpen}>
                <HStack space={4} p={4} alignItems="center">
                  <Icon as={MaterialIcons} name="logout" size={6} color="red.500" />
                  <Text fontSize="md" color="red.500">
                    Çıkış Yap
                  </Text>
                </HStack>
              </Pressable>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Profili Düzenle</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl isRequired>
                <FormControl.Label>Ad Soyad</FormControl.Label>
                <Input
                  placeholder="Ad Soyad"
                  value={editForm.full_name}
                  onChangeText={(text) => setEditForm({...editForm, full_name: text})}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Telefon</FormControl.Label>
                <Input
                  placeholder="+90 555 123 45 67"
                  keyboardType="phone-pad"
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Konum</FormControl.Label>
                <Input
                  placeholder="Şehir, Ülke"
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({...editForm, location: text})}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Hakkımda</FormControl.Label>
                <TextArea
                  placeholder="Kendiniz hakkında kısa bir açıklama..."
                  value={editForm.bio}
                  onChangeText={(text) => setEditForm({...editForm, bio: text})}
                  h={20}
                  autoCompleteType="off"
                />
              </FormControl>

              <Divider />
              
              <Text fontSize="md" fontWeight="semibold" color="gray.700">
                Gizlilik Tercihleri
              </Text>

              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1}>
                  <Text fontSize="sm" color="gray.700">
                    Bildirimler
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Push bildirimleri al
                  </Text>
                </VStack>
                <Switch
                  isChecked={editForm.notifications}
                  onToggle={(value) => setEditForm({...editForm, notifications: value})}
                />
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1}>
                  <Text fontSize="sm" color="gray.700">
                    Pazarlama E-postaları
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Kampanya ve fırsat e-postaları
                  </Text>
                </VStack>
                <Switch
                  isChecked={editForm.marketing_emails}
                  onToggle={(value) => setEditForm({...editForm, marketing_emails: value})}
                />
              </HStack>

              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1}>
                  <Text fontSize="sm" color="gray.700">
                    Konum Takibi
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Yakındaki fırsatları göster
                  </Text>
                </VStack>
                <Switch
                  isChecked={editForm.location_tracking}
                  onToggle={(value) => setEditForm({...editForm, location_tracking: value})}
                />
              </HStack>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={onEditClose}
              >
                İptal
              </Button>
              <Button
                onPress={handleUpdateProfile}
                isLoading={updating}
                isLoadingText="Güncelleniyor..."
              >
                Kaydet
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Logout Confirmation */}
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isLogoutOpen}
        onClose={onLogoutClose}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Çıkış Yap</AlertDialog.Header>
          <AlertDialog.Body>
            Hesabınızdan çıkış yapmak istediğinizden emin misiniz?
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                ref={cancelRef}
                variant="unstyled"
                colorScheme="coolGray"
                onPress={onLogoutClose}
              >
                İptal
              </Button>
              <Button colorScheme="danger" onPress={handleLogout}>
                Çıkış Yap
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};