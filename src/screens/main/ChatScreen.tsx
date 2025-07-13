import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Icon,
  Pressable,
  useColorModeValue,
  Avatar,
  Spinner,
  Center,
  KeyboardAvoidingView,
  useToast,

} from 'native-base';
import { Platform, Keyboard, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'location' | 'system';
  created_at: string;
  read: boolean;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Chat {
  id: string;
  type: 'direct' | 'group' | 'program';
  name?: string;
  description?: string;
  avatar_url?: string;
  participants: string[];
  last_message?: Message;
  created_at: string;
  updated_at: string;
}

interface ChatScreenParams {
  chatId?: string;
  recipientId?: string;
  programId?: string;
}

export const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const toast = useToast();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const params = route.params as ChatScreenParams;
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const myMessageBg = useColorModeValue('primary.500', 'primary.600');
  const otherMessageBg = useColorModeValue('gray.100', 'gray.700');
  const loadingBgColor = useColorModeValue('gray.50', 'gray.900');
  const inputBgColor = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (params.chatId) {
      loadChat(params.chatId);
    } else if (params.recipientId) {
      createOrFindDirectChat(params.recipientId);
    } else if (params.programId) {
      createOrFindProgramChat(params.programId);
    }
  }, [params]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (chat) {
      loadMessages();
      subscribeToMessages();
    }
  }, [chat]);

  const loadChat = async (chatId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) throw error;
      
      setChat(data);
    } catch (error) {
      console.error('Chat yüklenirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Sohbet yüklenemedi.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrFindDirectChat = async (recipientId: string) => {
    try {
      setLoading(true);
      if (!user) return;

      // Check if direct chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .eq('type', 'direct')
        .contains('participants', [user.id, recipientId])
        .single();

      if (existingChat) {
        setChat(existingChat);
        return;
      }

      // Create new direct chat
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          type: 'direct',
          participants: [user.id, recipientId],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;
      
      setChat(newChat);
    } catch (error) {
      console.error('Direct chat oluşturulurken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Sohbet oluşturulamadı.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrFindProgramChat = async (programId: string) => {
    try {
      setLoading(true);
      
      // Check if program chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .eq('type', 'program')
        .eq('program_id', programId)
        .single();

      if (existingChat) {
        setChat(existingChat);
        return;
      }

      // Create new program chat
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          type: 'program',
          program_id: programId,
          name: 'Program Sohbeti',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;
      
      setChat(newChat);
    } catch (error) {
      console.error('Program chat oluşturulurken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Program sohbeti oluşturulamadı.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      if (!chat) return;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      setMessages(data || []);
      
      // Mark messages as read
      markMessagesAsRead();
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!chat) return;

    const subscription = supabase
      .channel(`chat-${chat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Scroll to bottom
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
          
          // Mark as read if not from current user
          if (newMessage.sender_id !== user?.id) {
            markMessageAsRead(newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markMessagesAsRead = async () => {
    try {
      if (!chat || !user) return;

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('chat_id', chat.id)
        .neq('sender_id', user.id)
        .eq('read', false);
    } catch (error) {
      console.error('Mesajlar okundu olarak işaretlenirken hata:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Mesaj okundu olarak işaretlenirken hata:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat || !user) return;

    try {
      setSending(true);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chat.id,
          sender_id: user.id,
          content: newMessage.trim(),
          type: 'text',
          created_at: new Date().toISOString(),
          read: false,
        });

      if (error) throw error;
      
      // Update chat's last message timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chat.id);
      
      setNewMessage('');
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Mesaj gönderilemedi.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const MessageBubble = ({ message, isMyMessage }: { message: Message; isMyMessage: boolean }) => (
    <HStack
      justifyContent={isMyMessage ? 'flex-end' : 'flex-start'}
      mb={3}
      px={4}
    >
      {!isMyMessage && (
        <Avatar
          size="sm"
          source={{ uri: message.sender?.avatar_url }}
          mr={2}
        >
          {message.sender?.full_name?.charAt(0)}
        </Avatar>
      )}
      
      <VStack
        maxW="75%"
        alignItems={isMyMessage ? 'flex-end' : 'flex-start'}
      >
        {!isMyMessage && (
          <Text fontSize="xs" color={mutedColor} mb={1}>
            {message.sender?.full_name}
          </Text>
        )}
        
        <Box
          bg={isMyMessage ? myMessageBg : otherMessageBg}
          px={3}
          py={2}
          borderRadius="lg"
          borderBottomRightRadius={isMyMessage ? 'sm' : 'lg'}
          borderBottomLeftRadius={isMyMessage ? 'lg' : 'sm'}
        >
          <Text
            color={isMyMessage ? 'white' : textColor}
            fontSize="md"
          >
            {message.content}
          </Text>
        </Box>
        
        <Text fontSize="xs" color={mutedColor} mt={1}>
          {formatMessageTime(message.created_at)}
          {isMyMessage && (
            <Text color={message.read ? 'green.500' : mutedColor}>
              {' • '}{message.read ? 'Okundu' : 'Gönderildi'}
            </Text>
          )}
        </Text>
      </VStack>
      
      {isMyMessage && (
        <Avatar
          size="sm"
          source={{ uri: user?.user_metadata?.avatar_url }}
          ml={2}
        >
          {user?.user_metadata?.full_name?.charAt(0)}
        </Avatar>
      )}
    </HStack>
  );

  if (loading) {
    return (
      <Center flex={1} bg={loadingBgColor}>
        <Spinner size="lg" color="primary.500" />
        <Text mt={4} color={mutedColor}>
          Sohbet yükleniyor...
        </Text>
      </Center>
    );
  }

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      bg={loadingBgColor}
    >
      <VStack flex={1}>
        {/* Chat Header */}
        <Box
          bg={bgColor}
          borderBottomWidth={1}
          borderBottomColor={borderColor}
          px={4}
          py={3}
          safeAreaTop
        >
          <HStack alignItems="center" space={3}>
            <Pressable onPress={() => navigation.goBack()}>
              <Icon as={MaterialIcons} name="arrow-back" size={6} color={textColor} />
            </Pressable>
            
            <Avatar
              size="sm"
              source={{ uri: chat?.avatar_url }}
            >
              {chat?.name?.charAt(0) || 'C'}
            </Avatar>
            
            <VStack flex={1}>
              <Text fontSize="md" fontWeight="semibold" color={textColor}>
                {chat?.name || 'Sohbet'}
              </Text>
              <Text fontSize="xs" color={mutedColor}>
                {chat?.type === 'direct' ? 'Direkt mesaj' : 
                 chat?.type === 'group' ? 'Grup sohbeti' : 'Program sohbeti'}
              </Text>
            </VStack>
            
            <Pressable>
              <Icon as={MaterialIcons} name="more-vert" size={6} color={textColor} />
            </Pressable>
          </HStack>
        </Box>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {messages.length === 0 ? (
            <Center flex={1} py={20}>
              <Icon 
                as={MaterialIcons} 
                name="chat-bubble-outline" 
                size={16} 
                color={mutedColor} 
              />
              <Text mt={4} fontSize="lg" color={mutedColor} textAlign="center">
                Henüz mesaj yok
              </Text>
              <Text fontSize="sm" color={mutedColor} textAlign="center" mt={2}>
                İlk mesajı göndererek sohbeti başlatın
              </Text>
            </Center>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMyMessage={message.sender_id === user?.id}
              />
            ))
          )}
        </ScrollView>

        {/* Message Input */}
        <Box
          bg={bgColor}
          borderTopWidth={1}
          borderTopColor={borderColor}
          px={4}
          py={3}
          pb={keyboardHeight > 0 ? 3 : Platform.OS === 'ios' ? 8 : 3}
        >
          <HStack space={3} alignItems="flex-end">
            <Input
              flex={1}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Mesaj yazın..."
              multiline
              maxH={20}
              borderRadius="full"
              bg={inputBgColor}
              borderWidth={0}
              _focus={{
                bg: inputBgColor,
              }}
            />
            
            <Pressable
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
              opacity={!newMessage.trim() || sending ? 0.5 : 1}
            >
              <Box
                bg="primary.500"
                p={3}
                borderRadius="full"
              >
                {sending ? (
                  <Spinner size="sm" color="white" />
                ) : (
                  <Icon
                    as={MaterialIcons}
                    name="send"
                    size={5}
                    color="white"
                  />
                )}
              </Box>
            </Pressable>
          </HStack>
        </Box>
      </VStack>
    </KeyboardAvoidingView>
  );
};