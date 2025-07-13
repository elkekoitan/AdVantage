import { useState, useEffect, useCallback } from 'react';
import { CollaborationService } from '../services/collaborationService';
import {
  BusinessCollaboration,
  CollaborativeEvent,
  EventParticipant,
  PartnershipRequest,
  UserConnection,
} from '../types';

export const useCollaboration = () => {
  const [collaborations, setCollaborations] = useState<BusinessCollaboration[]>([]);
  const [events, setEvents] = useState<CollaborativeEvent[]>([]);
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [partnershipRequests, setPartnershipRequests] = useState<PartnershipRequest[]>([]);
  const [eventParticipants, setEventParticipants] = useState<EventParticipant[]>([]);
  const [stats, setStats] = useState({
    totalCollaborations: 0,
    activeEvents: 0,
    connections: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Business Collaboration Methods
  const loadCollaborations = useCallback(async (
    businessId?: string,
    collaborationType?: 'event' | 'campaign' | 'promotion' | 'partnership',
    status?: 'open' | 'in_progress' | 'completed' | 'cancelled',
    limit = 20,
    offset = 0
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await CollaborationService.getBusinessCollaborations(
        businessId,
        collaborationType,
        status,
        limit,
        offset
      );
      if (offset === 0) {
        setCollaborations(data);
      } else {
        setCollaborations(prev => [...prev, ...data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collaborations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCollaboration = useCallback(async (
    businessId: string,
    collaborationType: 'event' | 'campaign' | 'promotion' | 'partnership',
    title: string,
    description: string,
    requirements?: string,
    budget?: number,
    deadline?: string
  ) => {
    try {
      setError(null);
      const collaboration = await CollaborationService.createBusinessCollaboration(
        businessId,
        collaborationType,
        title,
        description,
        requirements,
        budget,
        deadline
      );
      setCollaborations(prev => [collaboration, ...prev]);
      return collaboration;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collaboration');
      throw err;
    }
  }, []);

  const updateCollaborationStatus = useCallback(async (
    collaborationId: string,
    status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  ) => {
    try {
      setError(null);
      await CollaborationService.updateCollaborationStatus(collaborationId, status);
      setCollaborations(prev =>
        prev.map(collab =>
          collab.id === collaborationId
            ? { ...collab, status: status as 'proposed' | 'negotiating' | 'active' | 'paused' | 'completed' | 'cancelled' }
            : collab
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update collaboration status');
      throw err;
    }
  }, []);

  // Collaborative Events Methods
  const loadEvents = useCallback(async (
    collaborationId?: string,
    status?: 'planned' | 'active' | 'completed' | 'cancelled',
    eventType?: 'workshop' | 'seminar' | 'networking' | 'competition' | 'exhibition' | 'other',
    limit = 20,
    offset = 0
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await CollaborationService.getCollaborativeEvents(
        collaborationId,
        status,
        eventType,
        limit,
        offset
      );
      if (offset === 0) {
        setEvents(data);
      } else {
        setEvents(prev => [...prev, ...data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (
    collaborationId: string,
    title: string,
    description: string,
    eventDate: string,
    location: string,
    maxParticipants?: number,
    registrationDeadline?: string,
    eventType: 'workshop' | 'seminar' | 'networking' | 'competition' | 'exhibition' | 'other' = 'other'
  ) => {
    try {
      setError(null);
      const event = await CollaborationService.createCollaborativeEvent(
        collaborationId,
        title,
        description,
        eventDate,
        location,
        maxParticipants,
        registrationDeadline,
        eventType
      );
      setEvents(prev => [event, ...prev]);
      return event;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    }
  }, []);

  // Event Participation Methods
  const joinEvent = useCallback(async (
    eventId: string,
    participantType: 'individual' | 'business' = 'individual',
    notes?: string
  ) => {
    try {
      setError(null);
      const participant = await CollaborationService.joinEvent(
        eventId,
        participantType,
        notes
      );
      
      // Update event participant count
      setEvents(prev =>
        prev.map(event =>
          event.id === eventId
            ? { ...event, current_participants: (event.current_participants || 0) + 1 }
            : event
        )
      );
      
      return participant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join event');
      throw err;
    }
  }, []);

  const leaveEvent = useCallback(async (eventId: string) => {
    try {
      setError(null);
      await CollaborationService.leaveEvent(eventId);
      
      // Update event participant count
      setEvents(prev =>
        prev.map(event =>
          event.id === eventId
            ? { ...event, current_participants: Math.max((event.current_participants || 1) - 1, 0) }
            : event
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave event');
      throw err;
    }
  }, []);

  const loadEventParticipants = useCallback(async (
    eventId: string,
    status?: 'registered' | 'attended' | 'cancelled'
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await CollaborationService.getEventParticipants(eventId, status);
      setEventParticipants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event participants');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateParticipantStatus = useCallback(async (
    eventId: string,
    participantId: string,
    status: 'registered' | 'attended' | 'cancelled'
  ) => {
    try {
      setError(null);
      await CollaborationService.updateParticipantStatus(eventId, participantId, status);
      setEventParticipants(prev =>
        prev.map(participant =>
          participant.user_id === participantId
            ? { ...participant, status }
            : participant
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update participant status');
      throw err;
    }
  }, []);

  // Partnership Requests Methods
  const sendPartnershipRequest = useCallback(async (
    targetBusinessId: string,
    requestType: 'collaboration' | 'sponsorship' | 'joint_venture' | 'supplier' | 'other',
    message: string,
    proposedTerms?: string
  ) => {
    try {
      setError(null);
      const request = await CollaborationService.sendPartnershipRequest(
        targetBusinessId,
        requestType,
        message,
        proposedTerms
      );
      setPartnershipRequests(prev => [request, ...prev]);
      return request;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send partnership request');
      throw err;
    }
  }, []);

  const respondToPartnershipRequest = useCallback(async (
    requestId: string,
    status: 'accepted' | 'rejected',
    responseMessage?: string
  ) => {
    try {
      setError(null);
      await CollaborationService.respondToPartnershipRequest(
        requestId,
        status,
        responseMessage
      );
      setPartnershipRequests(prev =>
        prev.map(request =>
          request.id === requestId
            ? { ...request, status, response_message: responseMessage }
            : request
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond to partnership request');
      throw err;
    }
  }, []);

  const loadPartnershipRequests = useCallback(async (
    type: 'sent' | 'received',
    status?: 'pending' | 'accepted' | 'rejected',
    limit = 20,
    offset = 0
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await CollaborationService.getPartnershipRequests(
        type,
        status,
        limit,
        offset
      );
      if (offset === 0) {
        setPartnershipRequests(data);
      } else {
        setPartnershipRequests(prev => [...prev, ...data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load partnership requests');
    } finally {
      setLoading(false);
    }
  }, []);

  // User Connections Methods
  const sendConnectionRequest = useCallback(async (
    targetUserId: string,
    message?: string
  ) => {
    try {
      setError(null);
      const connection = await CollaborationService.sendConnectionRequest(
        targetUserId,
        message
      );
      setConnections(prev => [connection, ...prev]);
      return connection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send connection request');
      throw err;
    }
  }, []);

  const respondToConnectionRequest = useCallback(async (
    requestId: string,
    status: 'accepted' | 'rejected'
  ) => {
    try {
      setError(null);
      await CollaborationService.respondToConnectionRequest(requestId, status);
      setConnections(prev =>
        prev.map(connection =>
          connection.id === requestId
            ? { ...connection, status: status === 'accepted' ? 'active' : 'blocked' }
            : connection
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond to connection request');
      throw err;
    }
  }, []);

  const loadConnections = useCallback(async (
    type: 'sent' | 'received' | 'accepted',
    limit = 50,
    offset = 0
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await CollaborationService.getUserConnections(type, limit, offset);
      if (offset === 0) {
        setConnections(data);
      } else {
        setConnections(prev => [...prev, ...data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, []);

  const removeConnection = useCallback(async (connectionId: string) => {
    try {
      setError(null);
      await CollaborationService.removeConnection(connectionId);
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove connection');
      throw err;
    }
  }, []);

  // Search and Discovery Methods
  const searchCollaborationOpportunities = useCallback(async (
    query: string,
    collaborationType?: 'event' | 'campaign' | 'promotion' | 'partnership',

    budget?: { min?: number; max?: number }
  ) => {
    try {
      setLoading(true);
      setError(null);
      const results = await CollaborationService.searchCollaborationOpportunities(
        query,
        collaborationType,
        budget
      );
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search collaboration opportunities');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecommendedCollaborations = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const recommendations = await CollaborationService.getRecommendedCollaborations(limit);
      return recommendations;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Analytics Methods
  const loadStats = useCallback(async () => {
    try {
      const statsData = await CollaborationService.getCollaborationStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load collaboration stats:', err);
    }
  }, []);

  // Helper functions
  const getCollaborationsByType = useCallback((type: string) => {
    return collaborations.filter(collab => collab.collaboration_type === type);
  }, [collaborations]);

  const getEventsByStatus = useCallback((status: string) => {
    return events.filter(event => event.status === status);
  }, [events]);

  const getConnectionsByStatus = useCallback((status: string) => {
    return connections.filter(conn => conn.status === status);
  }, [connections]);

  const getPendingRequests = useCallback(() => {
    return partnershipRequests.filter(req => req.status === 'pending');
  }, [partnershipRequests]);

  const getUpcomingEvents = useCallback(() => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate > now && event.status === 'planning';
    }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  }, [events]);

  // Load initial data
  useEffect(() => {
    loadCollaborations();
    loadEvents();
    loadConnections('accepted');
    loadPartnershipRequests('received', 'pending');
    loadStats();
  }, [loadCollaborations, loadEvents, loadConnections, loadPartnershipRequests, loadStats]);

  return {
    // State
    collaborations,
    events,
    connections,
    partnershipRequests,
    eventParticipants,
    stats,
    loading,
    error,

    // Business Collaboration Actions
    loadCollaborations,
    createCollaboration,
    updateCollaborationStatus,

    // Event Actions
    loadEvents,
    createEvent,
    joinEvent,
    leaveEvent,
    loadEventParticipants,
    updateParticipantStatus,

    // Partnership Actions
    sendPartnershipRequest,
    respondToPartnershipRequest,
    loadPartnershipRequests,

    // Connection Actions
    sendConnectionRequest,
    respondToConnectionRequest,
    loadConnections,
    removeConnection,

    // Search and Discovery
    searchCollaborationOpportunities,
    getRecommendedCollaborations,

    // Analytics
    loadStats,

    // Helpers
    getCollaborationsByType,
    getEventsByStatus,
    getConnectionsByStatus,
    getPendingRequests,
    getUpcomingEvents,
    setError,
  };
};

export default useCollaboration;