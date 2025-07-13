import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  Icon,
  Pressable,
  useColorModeValue,
  Badge,
  // Avatar,
  Spinner,
  Center,
  // RefreshControl,
  Button,
  useToast,
  Divider,
  Actionsheet,
  useDisclose,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
// import { formatDistanceToNow } from 'date-fns';
// import { tr } from 'date-fns/locale';

interface Notification {
  id: string;
  user_id: string;
  type: 'program_update' | 'ai_recommendation' | 'friend_request' | 'activity_reminder' | 'system' | 'achievement';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
  action_url?: string;
}

interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

export const NotificationsScreen = () => {
  // const navigation = useNavigation();
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclose();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  // const [refreshing, _setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const unreadBg = useColorModeValue('blue.50', 'blue.900');
  const loadingBgColor = useColorModeValue('gray.50', 'gray.900');
  const mainBgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    groupNotificationsByDate();
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Bildirimler yüklenemedi.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setLoading(false);
    }
  };

  // const _onRefresh = useCallback(() => {
  //   _setRefreshing(true);
  //   loadNotifications().finally(() => _setRefreshing(false));
  // }, []);

  const groupNotificationsByDate = () => {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });

    const groupedArray = Object.entries(groups).map(([date, notifs]) => ({
      date,
      notifications: notifs,
    }));

    setGroupedNotifications(groupedArray);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );

      toast.show({
        title: 'Başarılı',
        description: 'Tüm bildirimler okundu olarak işaretlendi.',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
    } catch (error) {
      console.error('Tüm bildirimler okundu olarak işaretlenirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'İşlem tamamlanamadı.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );

      toast.show({
        title: 'Başarılı',
        description: 'Bildirim silindi.',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
    } catch (error) {
      console.error('Bildirim silinirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Bildirim silinemedi.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    }
    onClose();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'program_update':
        return 'update';
      case 'ai_recommendation':
        return 'psychology';
      case 'friend_request':
        return 'person-add';
      case 'activity_reminder':
        return 'alarm';
      case 'achievement':
        return 'emoji-events';
      case 'system':
      default:
        return 'info';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'program_update':
        return 'blue.500';
      case 'ai_recommendation':
        return 'purple.500';
      case 'friend_request':
        return 'green.500';
      case 'activity_reminder':
        return 'orange.500';
      case 'achievement':
        return 'yellow.500';
      case 'system':
      default:
        return 'gray.500';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.action_url) {
      // Handle navigation to specific screen
      // navigation.navigate(notification.action_url, notification.data);
    }
  };

  const handleNotificationLongPress = (notification: Notification) => {
    setSelectedNotification(notification);
    onOpen();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Center flex={1} bg={loadingBgColor}>
        <Spinner size="lg" color="primary.500" />
        <Text mt={4} color={mutedColor}>
          Bildirimler yükleniyor...
        </Text>
      </Center>
    );
  }

  return (
    <Box flex={1} bg={mainBgColor}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        // }
      >
        <VStack space={4} p={4}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Heading size="lg" color={textColor}>
                Bildirimler
              </Heading>
              {unreadCount > 0 && (
                <Text fontSize="sm" color={mutedColor}>
                  {unreadCount} okunmamış bildirim
                </Text>
              )}
            </VStack>
            
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onPress={markAllAsRead}
                _text={{ fontSize: 'sm' }}
              >
                Tümünü Okundu İşaretle
              </Button>
            )}
          </HStack>

          {/* Notifications */}
          {groupedNotifications.length === 0 ? (
            <Center py={20}>
              <Icon 
                as={MaterialIcons} 
                name="notifications-none" 
                size={16} 
                color={mutedColor} 
              />
              <Text mt={4} fontSize="lg" color={mutedColor} textAlign="center">
                Henüz bildiriminiz yok
              </Text>
              <Text fontSize="sm" color={mutedColor} textAlign="center" mt={2}>
                Yeni bildirimler burada görünecek
              </Text>
            </Center>
          ) : (
            groupedNotifications.map((group, groupIndex) => (
              <VStack key={groupIndex} space={3}>
                <Text fontSize="sm" fontWeight="semibold" color={mutedColor}>
                  {formatDate(group.date)}
                </Text>
                
                {group.notifications.map((notification) => (
                  <Pressable
                    key={notification.id}
                    onPress={() => handleNotificationPress(notification)}
                    onLongPress={() => handleNotificationLongPress(notification)}
                  >
                    <HStack
                      space={3}
                      p={4}
                      bg={notification.read ? bgColor : unreadBg}
                      borderRadius="lg"
                      borderWidth={1}
                      borderColor={borderColor}
                      alignItems="flex-start"
                    >
                      <Box
                        p={2}
                        bg={getNotificationColor(notification.type)}
                        borderRadius="full"
                      >
                        <Icon
                          as={MaterialIcons}
                          name={getNotificationIcon(notification.type)}
                          size={5}
                          color="white"
                        />
                      </Box>
                      
                      <VStack flex={1} space={1}>
                        <HStack justifyContent="space-between" alignItems="flex-start">
                          <Text
                            fontSize="md"
                            fontWeight={notification.read ? 'normal' : 'semibold'}
                            color={textColor}
                            flex={1}
                            mr={2}
                          >
                            {notification.title}
                          </Text>
                          <Text fontSize="xs" color={mutedColor}>
                            {new Date(notification.created_at).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </HStack>
                        
                        <Text
                          fontSize="sm"
                          color={mutedColor}
                          numberOfLines={2}
                        >
                          {notification.message}
                        </Text>
                        
                        {!notification.read && (
                          <HStack mt={1}>
                            <Badge
                              colorScheme="blue"
                              variant="solid"
                              size="sm"
                            >
                              Yeni
                            </Badge>
                          </HStack>
                        )}
                      </VStack>
                    </HStack>
                  </Pressable>
                ))}
                
                {groupIndex < groupedNotifications.length - 1 && (
                  <Divider my={2} />
                )}
              </VStack>
            ))
          )}
        </VStack>
      </ScrollView>

      {/* Action Sheet */}
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          <Actionsheet.Item
            onPress={() => {
              if (selectedNotification && !selectedNotification.read) {
                markAsRead(selectedNotification.id);
              }
              onClose();
            }}
            startIcon={
              <Icon as={MaterialIcons} name="mark-email-read" size={6} />
            }
          >
            {selectedNotification?.read ? 'Okunmamış İşaretle' : 'Okundu İşaretle'}
          </Actionsheet.Item>
          
          <Actionsheet.Item
            onPress={() => {
              if (selectedNotification) {
                deleteNotification(selectedNotification.id);
              }
            }}
            startIcon={
              <Icon as={MaterialIcons} name="delete" size={6} color="red.500" />
            }
            _text={{ color: 'red.500' }}
          >
            Sil
          </Actionsheet.Item>
          
          <Actionsheet.Item onPress={onClose}>
            İptal
          </Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>
    </Box>
  );
};