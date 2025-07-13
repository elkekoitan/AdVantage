import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Switch,
  Button,
  ScrollView,
  Icon,
  Pressable,
  useColorModeValue,
  useToast,
  // Divider,
  Avatar,
  Badge,
  AlertDialog,
  useDisclose,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

interface UserSettings {
  notifications: {
    push_enabled: boolean;
    email_enabled: boolean;
    program_updates: boolean;
    ai_recommendations: boolean;
    marketing: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private';
    location_sharing: boolean;
    activity_sharing: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    theme: 'light' | 'dark' | 'auto';
    ai_assistance: boolean;
  };
}

export const SettingsScreen = () => {
  // const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclose();
  const cancelRef = React.useRef(null);

  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      push_enabled: true,
      email_enabled: true,
      program_updates: true,
      ai_recommendations: true,
      marketing: false,
    },
    privacy: {
      profile_visibility: 'public',
      location_sharing: true,
      activity_sharing: true,
    },
    preferences: {
      language: 'tr',
      currency: 'TRY',
      theme: 'auto',
      ai_assistance: true,
    },
  });

  // const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // setLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Settings yüklenirken hata:', error);
    } finally {
      // setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      if (!user) return;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.show({
        title: 'Başarılı',
        description: 'Ayarlar kaydedildi.',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Ayarlar kaydedilemedi.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacySetting = (key: keyof UserSettings['privacy'], value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const updatePreferenceSetting = (key: keyof UserSettings['preferences'], value: boolean | string | string[]) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.show({
        title: 'Başarılı',
        description: 'Çıkış yapıldı.',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
    } catch (error) {
      toast.show({
        title: 'Hata',
        description: 'Çıkış yapılırken hata oluştu.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    }
    onClose();
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    children, 
    onPress 
  }: {
    icon: string;
    title: string;
    description?: string;
    children?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <Pressable onPress={onPress} disabled={!onPress}>
      <HStack 
        space={3} 
        alignItems="center" 
        py={4} 
        px={4}
        bg={bgColor}
        borderRadius="lg"
        borderWidth={1}
        borderColor={borderColor}
      >
        <Icon 
          as={MaterialIcons} 
          name={icon} 
          size={6} 
          color="primary.500" 
        />
        <VStack flex={1} space={1}>
          <Text fontSize="md" fontWeight="medium" color={textColor}>
            {title}
          </Text>
          {description && (
            <Text fontSize="sm" color={mutedColor}>
              {description}
            </Text>
          )}
        </VStack>
        {children}
        {onPress && (
          <Icon 
            as={MaterialIcons} 
            name="chevron-right" 
            size={5} 
            color={mutedColor} 
          />
        )}
      </HStack>
    </Pressable>
  );

  return (
    <Box flex={1} bg={useColorModeValue('gray.50', 'gray.900')}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={6} p={4}>
          {/* Header */}
          <VStack space={4}>
            <Heading size="lg" color={textColor}>
              Ayarlar
            </Heading>
            
            {/* Profile Summary */}
            <HStack 
              space={3} 
              alignItems="center" 
              p={4}
              bg={bgColor}
              borderRadius="lg"
              borderWidth={1}
              borderColor={borderColor}
            >
              <Avatar size="md" source={{ uri: user?.user_metadata?.avatar_url }} />
              <VStack flex={1}>
                <Text fontSize="md" fontWeight="medium" color={textColor}>
                  {user?.user_metadata?.full_name || 'Kullanıcı'}
                </Text>
                <Text fontSize="sm" color={mutedColor}>
                  {user?.email}
                </Text>
              </VStack>
              <Badge colorScheme="green" variant="subtle">
                Aktif
              </Badge>
            </HStack>
          </VStack>

          {/* Bildirimler */}
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Bildirimler
            </Text>
            
            <SettingItem
              icon="notifications"
              title="Push Bildirimleri"
              description="Mobil bildirimler"
            >
              <Switch
                isChecked={settings.notifications.push_enabled}
                onToggle={(value) => updateNotificationSetting('push_enabled', value)}
                colorScheme="primary"
              />
            </SettingItem>

            <SettingItem
              icon="email"
              title="E-posta Bildirimleri"
              description="E-posta ile bildirimler"
            >
              <Switch
                isChecked={settings.notifications.email_enabled}
                onToggle={(value) => updateNotificationSetting('email_enabled', value)}
                colorScheme="primary"
              />
            </SettingItem>

            <SettingItem
              icon="update"
              title="Program Güncellemeleri"
              description="Program durumu değişiklikleri"
            >
              <Switch
                isChecked={settings.notifications.program_updates}
                onToggle={(value) => updateNotificationSetting('program_updates', value)}
                colorScheme="primary"
              />
            </SettingItem>

            <SettingItem
              icon="psychology"
              title="AI Önerileri"
              description="Yapay zeka önerileri"
            >
              <Switch
                isChecked={settings.notifications.ai_recommendations}
                onToggle={(value) => updateNotificationSetting('ai_recommendations', value)}
                colorScheme="primary"
              />
            </SettingItem>
          </VStack>

          {/* Gizlilik */}
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Gizlilik
            </Text>
            
            <SettingItem
              icon="visibility"
              title="Profil Görünürlüğü"
              description={`Şu an: ${settings.privacy.profile_visibility === 'public' ? 'Herkese Açık' : 
                settings.privacy.profile_visibility === 'friends' ? 'Sadece Arkadaşlar' : 'Özel'}`}
              onPress={() => {
                // Profile visibility modal açılacak
              }}
            />

            <SettingItem
              icon="location-on"
              title="Konum Paylaşımı"
              description="Konumunuzu diğer kullanıcılarla paylaşın"
            >
              <Switch
                isChecked={settings.privacy.location_sharing}
                onToggle={(value) => updatePrivacySetting('location_sharing', value)}
                colorScheme="primary"
              />
            </SettingItem>

            <SettingItem
              icon="share"
              title="Aktivite Paylaşımı"
              description="Aktivitelerinizi paylaşın"
            >
              <Switch
                isChecked={settings.privacy.activity_sharing}
                onToggle={(value) => updatePrivacySetting('activity_sharing', value)}
                colorScheme="primary"
              />
            </SettingItem>
          </VStack>

          {/* Tercihler */}
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Tercihler
            </Text>
            
            <SettingItem
              icon="language"
              title="Dil"
              description="Türkçe"
              onPress={() => {
                // Dil seçimi modal açılacak
              }}
            />

            <SettingItem
              icon="attach-money"
              title="Para Birimi"
              description="Türk Lirası (₺)"
              onPress={() => {
                // Para birimi seçimi modal açılacak
              }}
            />

            <SettingItem
              icon="palette"
              title="Tema"
              description={`${settings.preferences.theme === 'light' ? 'Açık' : 
                settings.preferences.theme === 'dark' ? 'Koyu' : 'Otomatik'}`}
              onPress={() => {
                // Tema seçimi modal açılacak
              }}
            />

            <SettingItem
              icon="smart-toy"
              title="AI Asistanı"
              description="Yapay zeka desteği"
            >
              <Switch
                isChecked={settings.preferences.ai_assistance}
                onToggle={(value) => updatePreferenceSetting('ai_assistance', value)}
                colorScheme="primary"
              />
            </SettingItem>
          </VStack>

          {/* Diğer */}
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Diğer
            </Text>
            
            <SettingItem
              icon="help"
              title="Yardım ve Destek"
              description="SSS ve iletişim"
              onPress={() => {
                // Yardım ekranına git
              }}
            />

            <SettingItem
              icon="info"
              title="Hakkında"
              description="Uygulama bilgileri"
              onPress={() => {
                // Hakkında ekranına git
              }}
            />

            <SettingItem
              icon="privacy-tip"
              title="Gizlilik Politikası"
              description="Veri kullanım politikası"
              onPress={() => {
                // Gizlilik politikası ekranına git
              }}
            />
          </VStack>

          {/* Actions */}
          <VStack space={3}>
            <Button
              onPress={saveSettings}
              isLoading={saving}
              isLoadingText="Kaydediliyor..."
              colorScheme="primary"
              size="lg"
            >
              Ayarları Kaydet
            </Button>

            <Button
              onPress={onOpen}
              variant="outline"
              colorScheme="red"
              size="lg"
            >
              Çıkış Yap
            </Button>
          </VStack>
        </VStack>
      </ScrollView>

      {/* Logout Confirmation */}
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}
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
                variant="unstyled"
                colorScheme="coolGray"
                onPress={onClose}
                ref={cancelRef}
              >
                İptal
              </Button>
              <Button colorScheme="red" onPress={handleLogout}>
                Çıkış Yap
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};