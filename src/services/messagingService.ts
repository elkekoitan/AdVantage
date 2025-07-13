import { supabase } from './supabase';
import {
  Message,
  Conversation,
  ConversationListItem,
  CreateMessageForm,
  CreateConversationForm,
} from '../types';

export class MessagingService {
  // Conversations
  static async getConversations(userId: string): Promise<ConversationListItem[]> {
    try {
      const { data, error } = await supabase
        .from('user_conversation_list')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  static async createConversation(form: CreateConversationForm): Promise<Conversation> {
    try {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          conversation_type: form.conversation_type,
          title: form.title,
          description: form.description,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const participants = form.participant_ids.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: 'member' as const,
      }));

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  static async getOrCreateDirectConversation(userId1: string, userId2: string): Promise<string> {
    try {
      // Check if direct conversation already exists
      const { data: existing, error: searchError } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_participants!inner(
            user_id
          )
        `)
        .eq('conversation_type', 'direct')
        .eq('conversation_participants.user_id', userId1)
        .eq('conversation_participants.user_id', userId2);

      if (searchError) throw searchError;

      if (existing && existing.length > 0) {
        return existing[0].id;
      }

      // Create new direct conversation
      const conversation = await this.createConversation({
        conversation_type: 'direct',
        participant_ids: [userId1, userId2],
      });

      return conversation.id;
    } catch (error) {
      console.error('Error getting or creating direct conversation:', error);
      throw error;
    }
  }

  // Messages
  static async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data || []).reverse(); // Reverse to show oldest first
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  static async sendMessage(form: CreateMessageForm): Promise<Message> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      let conversationId = form.conversation_id;

      // If no conversation ID provided, create or get direct conversation
      if (!conversationId) {
        conversationId = await this.getOrCreateDirectConversation(
          user.data.user.id,
          form.recipient_id
        );
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.data.user.id,
          recipient_id: form.recipient_id,
          conversation_id: conversationId,
          message_type: form.message_type || 'text',
          content: form.content,
          media_url: form.media_url,
          reply_to_id: form.reply_to_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  static async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      // Get the latest message in the conversation
      const { data: latestMessage, error: messageError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (messageError) throw messageError;

      // Update participant's last read message
      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_message_id: latestMessage.id })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.data.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  static async editMessage(messageId: string, content: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  static subscribeToConversation(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  static subscribeToUserConversations(userId: string, callback: (conversation: ConversationListItem) => void) {
    return supabase
      .channel(`user_conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        async () => {
          // Refresh conversation list
          const conversations = await this.getConversations(userId);
          conversations.forEach(callback);
        }
      )
      .subscribe();
  }

  // Conversation management
  static async leaveConversation(conversationId: string): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('conversation_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.data.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving conversation:', error);
      throw error;
    }
  }

  static async muteConversation(conversationId: string, muted: boolean): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('conversation_participants')
        .update({ muted })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.data.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error muting/unmuting conversation:', error);
      throw error;
    }
  }

  static async addParticipant(conversationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          role: 'member',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  static async removeParticipant(conversationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  // Search
  static async searchMessages(query: string, conversationId?: string): Promise<Message[]> {
    try {
      let queryBuilder = supabase
        .from('messages')
        .select('*')
        .textSearch('content', query)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (conversationId) {
        queryBuilder = queryBuilder.eq('conversation_id', conversationId);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_unread_messages_count', { user_id: userId });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

export default MessagingService;