import { supabase } from './supabase';
import {
  BusinessCollaboration,
  CollaborativeEvent,
  EventParticipant,
  PartnershipRequest,
  UserConnection,
} from '../types';

export class CollaborationService {
  // Business Collaboration Methods
  static async createBusinessCollaboration(
    businessId: string,
    collaborationType: 'event' | 'campaign' | 'promotion' | 'partnership',
    title: string,
    description: string,
    requirements?: string,
    budget?: number,
    deadline?: string
  ): Promise<BusinessCollaboration> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('business_collaborations')
        .insert({
          business_id: businessId,
          collaboration_type: collaborationType,
          title,
          description,
          requirements,
          budget,
          deadline,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating business collaboration:', error);
      throw error;
    }
  }

  static async getBusinessCollaborations(
    businessId?: string,
    collaborationType?: 'event' | 'campaign' | 'promotion' | 'partnership',
    status?: 'open' | 'in_progress' | 'completed' | 'cancelled',
    limit = 20,
    offset = 0
  ): Promise<BusinessCollaboration[]> {
    try {
      let query = supabase
        .from('business_collaborations')
        .select(`
          *,
          companies!business_id(
            id,
            name,
            logo_url,
            industry,
            rating
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      if (collaborationType) {
        query = query.eq('collaboration_type', collaborationType);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching business collaborations:', error);
      throw error;
    }
  }

  static async updateCollaborationStatus(
    collaborationId: string,
    status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('business_collaborations')
        .update({ status })
        .eq('id', collaborationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating collaboration status:', error);
      throw error;
    }
  }

  // Collaborative Events Methods
  static async createCollaborativeEvent(
    collaborationId: string,
    title: string,
    description: string,
    eventDate: string,
    location: string,
    maxParticipants?: number,
    registrationDeadline?: string,
    eventType: 'workshop' | 'seminar' | 'networking' | 'competition' | 'exhibition' | 'other' = 'other'
  ): Promise<CollaborativeEvent> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('collaborative_events')
        .insert({
          collaboration_id: collaborationId,
          title,
          description,
          event_date: eventDate,
          location,
          max_participants: maxParticipants,
          registration_deadline: registrationDeadline,
          event_type: eventType,
          status: 'planned',
          created_by: user.data.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating collaborative event:', error);
      throw error;
    }
  }

  static async getCollaborativeEvents(
    collaborationId?: string,
    status?: 'planned' | 'active' | 'completed' | 'cancelled',
    eventType?: 'workshop' | 'seminar' | 'networking' | 'competition' | 'exhibition' | 'other',
    limit = 20,
    offset = 0
  ): Promise<CollaborativeEvent[]> {
    try {
      let query = supabase
        .from('collaborative_events')
        .select(`
          *,
          business_collaborations!collaboration_id(
            id,
            title,
            collaboration_type,
            companies!business_id(
              id,
              name,
              logo_url
            )
          ),
          profiles!created_by(
            id,
            full_name,
            avatar_url
          )
        `)
        .order('event_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (collaborationId) {
        query = query.eq('collaboration_id', collaborationId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching collaborative events:', error);
      throw error;
    }
  }

  // Event Participation Methods
  static async joinEvent(
    eventId: string,
    participantType: 'individual' | 'business' = 'individual',
    notes?: string
  ): Promise<EventParticipant> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      // Check if event has space
      const { data: event, error: eventError } = await supabase
        .from('collaborative_events')
        .select('max_participants, participant_count')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (event.max_participants && event.participant_count >= event.max_participants) {
        throw new Error('Event is full');
      }

      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.data.user.id,
          participant_type: participantType,
          notes,
          status: 'registered',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Already registered for this event');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  }

  static async leaveEvent(eventId: string): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.data.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving event:', error);
      throw error;
    }
  }

  static async getEventParticipants(
    eventId: string,
    status?: 'registered' | 'attended' | 'cancelled'
  ): Promise<EventParticipant[]> {
    try {
      let query = supabase
        .from('event_participants')
        .select(`
          *,
          profiles!user_id(
            id,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching event participants:', error);
      throw error;
    }
  }

  static async updateParticipantStatus(
    eventId: string,
    participantId: string,
    status: 'registered' | 'attended' | 'cancelled'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('event_participants')
        .update({ status })
        .eq('event_id', eventId)
        .eq('user_id', participantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating participant status:', error);
      throw error;
    }
  }

  // Partnership Requests Methods
  static async sendPartnershipRequest(
    targetBusinessId: string,
    requestType: 'collaboration' | 'sponsorship' | 'joint_venture' | 'supplier' | 'other',
    message: string,
    proposedTerms?: string
  ): Promise<PartnershipRequest> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('partnership_requests')
        .insert({
          requester_id: user.data.user.id,
          target_business_id: targetBusinessId,
          request_type: requestType,
          message,
          proposed_terms: proposedTerms,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending partnership request:', error);
      throw error;
    }
  }

  static async respondToPartnershipRequest(
    requestId: string,
    status: 'accepted' | 'rejected',
    responseMessage?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('partnership_requests')
        .update({
          status,
          response_message: responseMessage,
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error responding to partnership request:', error);
      throw error;
    }
  }

  static async getPartnershipRequests(
    type: 'sent' | 'received',
    status?: 'pending' | 'accepted' | 'rejected',
    limit = 20,
    offset = 0
  ): Promise<PartnershipRequest[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      let query = supabase
        .from('partnership_requests')
        .select(`
          *,
          requester:profiles!requester_id(
            id,
            full_name,
            avatar_url
          ),
          target_business:companies!target_business_id(
            id,
            name,
            logo_url,
            industry
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type === 'sent') {
        query = query.eq('requester_id', user.data.user.id);
      } else {
        // For received requests, we need to check if user owns the target business
        // This would require additional logic to determine business ownership
        query = query.eq('target_business_id', user.data.user.id); // Simplified
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching partnership requests:', error);
      throw error;
    }
  }

  // User Connections Methods
  static async sendConnectionRequest(
    targetUserId: string,
    message?: string
  ): Promise<UserConnection> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      if (user.data.user.id === targetUserId) {
        throw new Error('Cannot connect to yourself');
      }

      const { data, error } = await supabase
        .from('user_connections')
        .insert({
          requester_id: user.data.user.id,
          target_user_id: targetUserId,
          message,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Connection request already exists');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  }

  static async respondToConnectionRequest(
    requestId: string,
    status: 'accepted' | 'rejected'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_connections')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error responding to connection request:', error);
      throw error;
    }
  }

  static async getUserConnections(
    type: 'sent' | 'received' | 'accepted',
    limit = 50,
    offset = 0
  ): Promise<UserConnection[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      let query = supabase
        .from('user_connections')
        .select(`
          *,
          requester:profiles!requester_id(
            id,
            full_name,
            avatar_url,
            bio
          ),
          target_user:profiles!target_user_id(
            id,
            full_name,
            avatar_url,
            bio
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type === 'sent') {
        query = query.eq('requester_id', user.data.user.id);
      } else if (type === 'received') {
        query = query.eq('target_user_id', user.data.user.id).eq('status', 'pending');
      } else if (type === 'accepted') {
        query = query
          .or(`requester_id.eq.${user.data.user.id},target_user_id.eq.${user.data.user.id}`)
          .eq('status', 'accepted');
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user connections:', error);
      throw error;
    }
  }

  static async removeConnection(connectionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  }

  // Search and Discovery Methods
  static async searchCollaborationOpportunities(
    query: string,
    collaborationType?: 'event' | 'campaign' | 'promotion' | 'partnership',
    budget?: { min?: number; max?: number }
  ): Promise<BusinessCollaboration[]> {
    try {
      let queryBuilder = supabase
        .from('business_collaborations')
        .select(`
          *,
          companies!business_id(
            id,
            name,
            logo_url,
            industry,
            location,
            rating
          )
        `)
        .eq('status', 'open')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,requirements.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (collaborationType) {
        queryBuilder = queryBuilder.eq('collaboration_type', collaborationType);
      }

      if (budget?.min) {
        queryBuilder = queryBuilder.gte('budget', budget.min);
      }

      if (budget?.max) {
        queryBuilder = queryBuilder.lte('budget', budget.max);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching collaboration opportunities:', error);
      throw error;
    }
  }

  static async getRecommendedCollaborations(
    limit = 10
  ): Promise<BusinessCollaboration[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('get_recommended_collaborations', {
          user_id: user.data.user.id,
          result_limit: limit
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recommended collaborations:', error);
      return [];
    }
  }

  // Analytics Methods
  static async getCollaborationStats(): Promise<{
    totalCollaborations: number;
    activeEvents: number;
    connections: number;
    pendingRequests: number;
  }> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const [collaborations, events, connections, requests] = await Promise.all([
        supabase
          .from('business_collaborations')
          .select('id', { count: 'exact' })
          .eq('business_id', user.data.user.id),
        supabase
          .from('collaborative_events')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),
        supabase
          .from('user_connections')
          .select('id', { count: 'exact' })
          .or(`requester_id.eq.${user.data.user.id},target_user_id.eq.${user.data.user.id}`)
          .eq('status', 'accepted'),
        supabase
          .from('partnership_requests')
          .select('id', { count: 'exact' })
          .eq('target_business_id', user.data.user.id)
          .eq('status', 'pending')
      ]);

      return {
        totalCollaborations: collaborations.count || 0,
        activeEvents: events.count || 0,
        connections: connections.count || 0,
        pendingRequests: requests.count || 0,
      };
    } catch (error) {
      console.error('Error getting collaboration stats:', error);
      return {
        totalCollaborations: 0,
        activeEvents: 0,
        connections: 0,
        pendingRequests: 0,
      };
    }
  }
}

export default CollaborationService;