import { useState, useEffect, useCallback } from 'react';
import { MessagingService } from '../services/messagingService';
import {
  Conversation,
  ConversationListItem,
  Message,
} from '../types';

export const useMessaging = () => {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Get current user ID
      const userId = 'current-user-id'; // This should come from auth context
      const data = await MessagingService.getConversations(userId);
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [currentConversation]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string, limit = 50, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const data = await MessagingService.getMessages(conversationId, limit, offset);
      if (offset === 0) {
        setMessages(data);
      } else {
        setMessages(prev => [...prev, ...data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    messageType: 'text' | 'image' | 'video' | 'audio' | 'location' | 'program_share' | 'business_share' = 'text'
  ) => {
    try {
      setError(null);
      const message = await MessagingService.sendMessage({
        conversation_id: conversationId,
        recipient_id: '', // TODO: Get recipient ID
        content,
        message_type: messageType,
      });
      setMessages(prev => [message, ...prev]);
      return message;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, []);

  // Start a direct conversation
  const startDirectConversation = useCallback(async (otherUserId: string) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Get current user ID
       const currentUserId = 'current-user-id';
       const conversationId = await MessagingService.getOrCreateDirectConversation(currentUserId, otherUserId);
       const conversation: Conversation = {
         id: conversationId,
         conversation_type: 'direct',
         created_by: currentUserId,
         last_activity_at: new Date().toISOString(),
         metadata: {},
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       };
       setCurrentConversation(conversation);
      await loadMessages(conversation.id);
      return conversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadMessages]);

  // Create a group conversation
  const createGroupConversation = useCallback(async (
    title: string,
    participantIds: string[],
    description?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const conversation = await MessagingService.createConversation({
        conversation_type: 'group',
        title,
        description,
        participant_ids: participantIds,
      });
      setCurrentConversation(conversation);
      await loadConversations();
      return conversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadConversations]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      // TODO: Get current message ID
      const messageId = 'message-id'; // This should be the actual message ID
      await MessagingService.markMessageAsRead(messageId);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
      await loadUnreadCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }, []);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await MessagingService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      throw err;
    }
  }, []);

  // Edit a message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      await MessagingService.editMessage(messageId, newContent);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, content: newContent, edited_at: new Date().toISOString() } : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit message');
      throw err;
    }
  }, []);

  // Leave conversation
  const leaveConversation = useCallback(async (conversationId: string) => {
    try {
      await MessagingService.leaveConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave conversation');
      throw err;
    }
  }, [currentConversation]);

  // Add participants to group
  const addParticipants = useCallback(async (
    conversationId: string,
    userIds: string[]
  ) => {
    try {
      for (const userId of userIds) {
        await MessagingService.addParticipant(conversationId, userId);
      }
      // Refresh conversation data
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add participants');
      throw err;
    }
  }, [loadConversations]);

  // Remove participant from group
  const removeParticipant = useCallback(async (
    conversationId: string,
    userId: string
  ) => {
    try {
      await MessagingService.removeParticipant(conversationId, userId);
      // Refresh conversation data
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove participant');
      throw err;
    }
  }, [loadConversations]);

  // Search messages
  const searchMessages = useCallback(async (
    query: string,
    conversationId?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const results = await MessagingService.searchMessages(query, conversationId);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search messages');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      // TODO: Get current user ID
      const userId = 'current-user-id'; // This should come from auth context
      const count = await MessagingService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, []);

  const loadUnreadCounts = useCallback(async () => {
    try {
      const counts: Record<string, number> = {};
      for (const conversation of conversations) {
        counts[conversation.id] = conversation.unread_count || 0;
      }
      setUnreadCounts(counts);
    } catch (err) {
      console.error('Failed to load unread counts:', err);
    }
  }, [conversations]);

  const muteConversation = useCallback(async (conversationId: string) => {
    try {
      // Implementation would go here
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, is_muted: true }
            : conv
        )
      );
    } catch (err) {
      console.error('Failed to mute conversation:', err);
    }
  }, []);

  const unmuteConversation = useCallback(async (conversationId: string) => {
    try {
      // Implementation would go here
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, is_muted: false }
            : conv
        )
      );
    } catch (err) {
      console.error('Failed to unmute conversation:', err);
    }
  }, []);

  const startGroupConversation = useCallback(async (title: string, participantIds: string[]) => {
    try {
      const conversation = await createGroupConversation(title, participantIds);
      return conversation;
    } catch (err) {
      console.error('Failed to start group conversation:', err);
      throw err;
    }
  }, [createGroupConversation]);

  // Mute/unmute conversation
  const toggleMute = useCallback(async (conversationId: string, mute: boolean) => {
    try {
      await MessagingService.muteConversation(conversationId, mute);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, is_muted: mute }
            : conv
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mute status');
      throw err;
    }
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    let messageSubscription: { unsubscribe: () => void } | null = null;

    const setupSubscriptions = async () => {
      try {
        // Subscribe to new messages for current conversation
        if (currentConversation) {
          messageSubscription = MessagingService.subscribeToConversation(
            currentConversation.id,
            (message: Message) => {
              setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === message.id)) {
                  return prev;
                }
                return [message, ...prev];
              });
            }
          );
        }

        // Note: Real-time conversation updates would need to be implemented
        // in MessagingService if needed
      } catch (err) {
        console.error('Failed to setup subscriptions:', err);
      }
    }

    setupSubscriptions();

    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
      // conversationSubscription is currently null, so no unsubscribe needed
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, [loadConversations, loadUnreadCount]);

  return {
    // State
    conversations,
    currentConversation,
    messages,
    unreadCount,
    unreadCounts,
    loading,
    error,

    // Actions
    loadConversations,
    loadMessages,
    loadUnreadCount,
    loadUnreadCounts,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    startDirectConversation,
    createGroupConversation,
    startGroupConversation,
    addParticipants,
    removeParticipant,
    searchMessages,
    leaveConversation,
    toggleMute,
    muteConversation,
    unmuteConversation,
    setCurrentConversation,
    setError,
  };
};

export default useMessaging;