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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMessaging } from '../../hooks/useMessaging';
import { ConversationListItem } from '../../types';

interface ConversationsListProps {
  onConversationPress?: (conversation: ConversationListItem) => void;
  onNewConversation?: () => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  onConversationPress,
  onNewConversation,
}) => {
  const {
    conversations,
    unreadCounts,
    loading,
    error,
    loadConversations,
    loadUnreadCounts,
    startDirectConversation,
    startGroupConversation,
    leaveConversation,
    muteConversation,
    unmuteConversation,
  } = useMessaging();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newConversationType, setNewConversationType] = useState<'direct' | 'group'>('direct');
  const [newConversationData, setNewConversationData] = useState({
    participantId: '',
    participantIds: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    loadConversations();
    loadUnreadCounts();
  }, []);

  const filteredConversations = conversations.filter(conversation =>
    (conversation.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewConversation = async () => {
    try {
      if (newConversationType === 'direct') {
        if (!newConversationData.participantId.trim()) {
          Alert.alert('Error', 'Please enter a participant ID');
          return;
        }
        await startDirectConversation(newConversationData.participantId.trim());
      } else {
        if (!newConversationData.title.trim() || !newConversationData.participantIds.trim()) {
          Alert.alert('Error', 'Please enter a title and participant IDs');
          return;
        }
        const participantIds = newConversationData.participantIds
          .split(',')
          .map(id => id.trim())
          .filter(id => id.length > 0);
        
        await startGroupConversation(
          newConversationData.title.trim(),
          participantIds
        );
      }
      
      setShowNewConversationModal(false);
      resetNewConversationForm();
      loadConversations();
    } catch (err) {
      Alert.alert('Error', 'Failed to create conversation');
    }
  };

  const resetNewConversationForm = () => {
    setNewConversationData({
      participantId: '',
      participantIds: '',
      title: '',
      description: '',
    });
  };

  const handleLeaveConversation = (conversation: ConversationListItem) => {
    Alert.alert(
      'Leave Conversation',
      `Are you sure you want to leave "${conversation.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveConversation(conversation.id);
              loadConversations();
            } catch (err) {
              Alert.alert('Error', 'Failed to leave conversation');
            }
          },
        },
      ]
    );
  };

  const handleMuteToggle = async (conversation: ConversationListItem) => {
    try {
      if (conversation.is_muted) {
        await unmuteConversation(conversation.id);
      } else {
        await muteConversation(conversation.id);
      }
      loadConversations();
    } catch (err) {
      Alert.alert('Error', 'Failed to update mute status');
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getConversationIcon = (conversation: ConversationListItem) => {
    if (conversation.type === 'group') {
      return 'people';
    }
    return 'person';
  };

  const renderConversationItem = ({ item }: { item: ConversationListItem }) => {
    const unreadCount = unreadCounts[item.id] || 0;
    const hasUnread = unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, hasUnread && styles.unreadConversation]}
        onPress={() => onConversationPress?.(item)}
        onLongPress={() => {
          Alert.alert(
            'Conversation Options',
            item.title,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: item.is_muted ? 'Unmute' : 'Mute',
                onPress: () => handleMuteToggle(item),
              },
              {
                text: 'Leave',
                style: 'destructive',
                onPress: () => handleLeaveConversation(item),
              },
            ]
          );
        }}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: item.type === 'group' ? '#4CAF50' : '#2196F3' }]}>
            <Ionicons 
              name={getConversationIcon(item) as any} 
              size={24} 
              color="#fff" 
            />
          </View>
          {item.is_muted && (
            <View style={styles.muteIndicator}>
              <Ionicons name="volume-mute" size={12} color="#666" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationTitle, hasUnread && styles.unreadTitle]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.timeAndBadge}>
              {item.last_message_at && (
                <Text style={styles.timeText}>
                  {formatLastMessageTime(item.last_message_at)}
                </Text>
              )}
              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.lastMessageContainer}>
            <Text style={[styles.lastMessage, hasUnread && styles.unreadLastMessage]} numberOfLines={1}>
              {item.last_message || 'No messages yet'}
            </Text>
            {item.type === 'group' && (
              <Text style={styles.participantCount}>
                {item.participant_count} members
              </Text>
            )}
          </View>
        </View>

        {/* Status Indicators */}
        <View style={styles.statusIndicators}>
          {item.type === 'group' && (
            <Ionicons name="people" size={12} color="#666" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search conversations..."
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.newConversationButton}
          onPress={() => {
            if (onNewConversation) {
              onNewConversation();
            } else {
              setShowNewConversationModal(true);
            }
          }}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{conversations.length}</Text>
          <Text style={styles.statLabel}>Conversations</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Object.values(unreadCounts).reduce((sum: number, count: unknown) => sum + (typeof count === 'number' ? count : 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {conversations.filter(c => c.conversation_type === 'group').length}
          </Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadConversations} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() 
                ? 'No conversations found' 
                : 'No conversations yet'
              }
            </Text>
            {!searchQuery.trim() && (
              <TouchableOpacity 
                style={styles.startConversationButton}
                onPress={() => setShowNewConversationModal(true)}
              >
                <Text style={styles.startConversationButtonText}>
                  Start a conversation
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => {
          loadConversations();
          loadUnreadCounts();
        }}
      />

      {/* New Conversation Modal */}
      <Modal
        visible={showNewConversationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewConversationModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Conversation</Text>
            <TouchableOpacity onPress={handleNewConversation}>
              <Text style={styles.modalSaveText}>Create</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Type Selection */}
            <View style={styles.typeSelection}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newConversationType === 'direct' && styles.activeTypeButton,
                ]}
                onPress={() => setNewConversationType('direct')}
              >
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={newConversationType === 'direct' ? '#007AFF' : '#666'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  newConversationType === 'direct' && styles.activeTypeButtonText,
                ]}>
                  Direct
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newConversationType === 'group' && styles.activeTypeButton,
                ]}
                onPress={() => setNewConversationType('group')}
              >
                <Ionicons 
                  name="people" 
                  size={20} 
                  color={newConversationType === 'group' ? '#007AFF' : '#666'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  newConversationType === 'group' && styles.activeTypeButtonText,
                ]}>
                  Group
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            {newConversationType === 'direct' ? (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Participant ID *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newConversationData.participantId}
                  onChangeText={(text) => 
                    setNewConversationData({ ...newConversationData, participantId: text })
                  }
                  placeholder="Enter user ID"
                  autoCapitalize="none"
                />
              </View>
            ) : (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Group Title *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newConversationData.title}
                    onChangeText={(text) => 
                      setNewConversationData({ ...newConversationData, title: text })
                    }
                    placeholder="Enter group title"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={newConversationData.description}
                    onChangeText={(text) => 
                      setNewConversationData({ ...newConversationData, description: text })
                    }
                    placeholder="Enter group description"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Participant IDs *</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={newConversationData.participantIds}
                    onChangeText={(text) => 
                      setNewConversationData({ ...newConversationData, participantIds: text })
                    }
                    placeholder="Enter user IDs separated by commas"
                    multiline
                    numberOfLines={2}
                    autoCapitalize="none"
                  />
                  <Text style={styles.formHint}>
                    Example: user1, user2, user3
                  </Text>
                </View>
              </>
            )}
          </View>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  newConversationButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadConversation: {
    backgroundColor: '#f8f9ff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  timeAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  unreadLastMessage: {
    color: '#333',
    fontWeight: '500',
  },
  participantCount: {
    fontSize: 12,
    color: '#999',
  },
  statusIndicators: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  startConversationButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startConversationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3333',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  typeSelection: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    gap: 8,
  },
  activeTypeButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTypeButtonText: {
    color: '#007AFF',
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
  formHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default ConversationsList;