import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCollaboration } from '../../hooks/useCollaboration';
import { BusinessCollaboration, CollaborativeEvent, PartnershipRequest, UserConnection } from '../../types';

type TabType = 'collaborations' | 'events' | 'partnerships' | 'connections';

interface CollaborationListProps {
  initialTab?: TabType;
  onItemPress?: (item: BusinessCollaboration | CollaborativeEvent | PartnershipRequest | UserConnection, type: TabType) => void;
}

const CollaborationList: React.FC<CollaborationListProps> = ({
  initialTab = 'collaborations',
  onItemPress,
}) => {
  const {
    collaborations,
    events,
    partnershipRequests,
    connections: userConnections,
    loading,
    loadCollaborations,
    loadEvents,
    loadPartnershipRequests,
    loadConnections: loadUserConnections,
    createCollaboration,
    createEvent,
    joinEvent,
    leaveEvent,
    respondToPartnershipRequest,
    respondToConnectionRequest,
    removeConnection,
  } = useCollaboration();

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'collaboration' | 'event'>('collaboration');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    requirements: '',
    benefits: '',
    location: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    switch (activeTab) {
      case 'collaborations':
        loadCollaborations();
        break;
      case 'events':
        loadEvents();
        break;
      case 'partnerships':
        loadPartnershipRequests('received');
        break;
      case 'connections':
        loadUserConnections('received');
        break;
    }
  };

  const handleCreate = async () => {
    try {
      if (createType === 'collaboration') {
        await createCollaboration(
          'business-id', // TODO: Get actual business ID
          formData.type as 'event' | 'campaign' | 'promotion' | 'partnership',
          formData.title,
          formData.description,
          formData.requirements
        );
      } else {
        await createEvent(
          'collaboration-id', // TODO: Get actual collaboration ID
          formData.title,
          formData.description,
          formData.startDate,
          formData.location,
          parseInt(formData.maxParticipants) || undefined
        );
      }
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err) {
      Alert.alert('Error', 'Failed to create ' + createType);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: '',
      requirements: '',
      benefits: '',
      location: '',
      startDate: '',
      endDate: '',
      maxParticipants: '',
    });
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await joinEvent(eventId);
      loadEvents();
    } catch (err) {
      Alert.alert('Error', 'Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    Alert.alert(
      'Leave Event',
      'Are you sure you want to leave this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveEvent(eventId);
              loadEvents();
            } catch (err) {
              Alert.alert('Error', 'Failed to leave event');
            }
          },
        },
      ]
    );
  };

  const handlePartnershipResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await respondToPartnershipRequest(requestId, status);
      loadPartnershipRequests('received');
    } catch (err) {
      Alert.alert('Error', 'Failed to respond to partnership request');
    }
  };

  const handleConnectionResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await respondToConnectionRequest(requestId, status);
      loadUserConnections('received');
    } catch (err) {
      Alert.alert('Error', 'Failed to respond to connection request');
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    Alert.alert(
      'Remove Connection',
      'Are you sure you want to remove this connection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeConnection(connectionId);
              loadUserConnections('received');
            } catch (err) {
              Alert.alert('Error', 'Failed to remove connection');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'accepted':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
      case 'rejected':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const renderCollaboration = ({ item }: { item: BusinessCollaboration }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => onItemPress?.(item, 'collaborations')}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.itemType}>{item.collaboration_type}</Text>
      <Text style={styles.itemDescription} numberOfLines={2}>
        {item.description}
      </Text>
      {item.requirements && (
        <Text style={styles.itemRequirements} numberOfLines={1}>
          Requirements: {item.requirements}
        </Text>
      )}
      <Text style={styles.itemDate}>
        Created {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const renderEvent = ({ item }: { item: CollaborativeEvent }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => onItemPress?.(item, 'events')}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.itemType}>{item.event_type}</Text>
      <Text style={styles.itemDescription} numberOfLines={2}>
        {item.description}
      </Text>
      {item.location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={14} color="#666" />
          <Text style={styles.locationText}>
            {typeof item.location === 'object' 
              ? `${item.location.lat}, ${item.location.lng}` 
              : item.location}
          </Text>
        </View>
      )}
      <View style={styles.eventDetails}>
        <Text style={styles.eventDate}>
          {new Date(item.start_date).toLocaleDateString()}
        </Text>
        <Text style={styles.participantCount}>
          {item.current_participants}/{item.max_participants || '∞'} participants
        </Text>
      </View>
      <View style={styles.eventActions}>
        {item.is_participant ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.leaveButton]}
            onPress={() => handleLeaveEvent(item.id)}
          >
            <Text style={styles.leaveButtonText}>Leave</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={() => handleJoinEvent(item.id)}
            disabled={item.max_participants ? item.current_participants >= item.max_participants : false}
          >
            <Text style={styles.joinButtonText}>
              {item.max_participants && item.current_participants >= item.max_participants ? 'Full' : 'Join'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPartnership = ({ item }: { item: PartnershipRequest }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => onItemPress?.(item, 'partnerships')}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>
          {item.requester_type === 'user' ? item.requester_name : item.target_name}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.itemType}>
        {item.requester_type === 'user' ? 'Outgoing Request' : 'Incoming Request'}
      </Text>
      {item.message && (
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.message}
        </Text>
      )}
      <Text style={styles.itemDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
      {item.status === 'pending' && item.requester_type !== 'user' && (
        <View style={styles.partnershipActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handlePartnershipResponse(item.id, 'rejected')}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handlePartnershipResponse(item.id, 'accepted')}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderConnection = ({ item }: { item: UserConnection }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => onItemPress?.(item, 'connections')}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>
          {item.requester_id === item.user_id ? item.target_name : item.requester_name}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.itemType}>
        {item.requester_id === item.user_id ? 'Outgoing Request' : 'Incoming Request'}
      </Text>
      {item.message && (
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.message}
        </Text>
      )}
      <Text style={styles.itemDate}>
        {item.status === 'accepted' ? 'Connected' : 'Requested'} {new Date(item.created_at).toLocaleDateString()}
      </Text>
      <View style={styles.connectionActions}>
        {item.status === 'pending' && item.requester_id !== item.user_id && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleConnectionResponse(item.id, 'rejected')}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleConnectionResponse(item.id, 'accepted')}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemoveConnection(item.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const getCurrentData = () => {
    switch (activeTab) {
      case 'collaborations':
        return collaborations;
      case 'events':
        return events;
      case 'partnerships':
        return partnershipRequests;
      case 'connections':
        return userConnections;
      default:
        return [];
    }
  };

  const getCurrentRenderer = () => {
    switch (activeTab) {
      case 'collaborations':
        return renderCollaboration;
      case 'events':
        return renderEvent;
      case 'partnerships':
        return renderPartnership;
      case 'connections':
        return renderConnection;
      default:
        return renderCollaboration;
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'collaborations':
        return 'No collaborations yet';
      case 'events':
        return 'No events yet';
      case 'partnerships':
        return 'No partnership requests';
      case 'connections':
        return 'No connections yet';
      default:
        return 'No items yet';
    }
  };

  const canCreate = activeTab === 'collaborations' || activeTab === 'events';

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'collaborations', label: 'Collaborations', icon: 'people' },
            { key: 'events', label: 'Events', icon: 'calendar' },
            { key: 'partnerships', label: 'Partnerships', icon: 'business' },
            { key: 'connections', label: 'Connections', icon: 'person-add' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.key as TabType)}
            >
              <Ionicons
                name={tab.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={activeTab === tab.key ? '#007AFF' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
          returnKeyType="search"
        />
        {canCreate && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              setCreateType(activeTab === 'events' ? 'event' : 'collaboration');
              setShowCreateModal(true);
            }}
          >
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <FlatList
        data={getCurrentData()}
        renderItem={getCurrentRenderer() as any}
        keyExtractor={(item: any) => item.id ? String(item.id) : Math.random().toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadData}
      />

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Create {createType === 'event' ? 'Event' : 'Collaboration'}
            </Text>
            <TouchableOpacity onPress={handleCreate}>
              <Text style={styles.modalSaveText}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter title"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Enter description"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {createType === 'event' ? 'Event Type' : 'Collaboration Type'} *
              </Text>
              <TextInput
                style={styles.formInput}
                value={formData.type}
                onChangeText={(text) => setFormData({ ...formData, type: text })}
                placeholder={createType === 'event' ? 'e.g., Workshop, Meetup' : 'e.g., Marketing, Development'}
              />
            </View>

            {createType === 'collaboration' && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Requirements</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={formData.requirements}
                    onChangeText={(text) => setFormData({ ...formData, requirements: text })}
                    placeholder="Enter requirements"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Benefits</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={formData.benefits}
                    onChangeText={(text) => setFormData({ ...formData, benefits: text })}
                    placeholder="Enter benefits"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </>
            )}

            {createType === 'event' && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Location</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    placeholder="Enter location"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Start Date *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.startDate}
                    onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                    placeholder="YYYY-MM-DD HH:MM"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>End Date</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.endDate}
                    onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                    placeholder="YYYY-MM-DD HH:MM"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Max Participants</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.maxParticipants}
                    onChangeText={(text) => setFormData({ ...formData, maxParticipants: text })}
                    placeholder="Leave empty for unlimited"
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  createButton: {
    padding: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  itemType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  itemRequirements: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
  },
  participantCount: {
    fontSize: 12,
    color: '#666',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  partnershipActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  connectionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#007AFF',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#f0f0f0',
  },
  leaveButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#f0f0f0',
  },
  rejectButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#F44336',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default CollaborationList;