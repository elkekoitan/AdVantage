import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../hooks/useFavorites';
import { UserFavorite } from '../../types';

interface UserFavoriteDetailed extends UserFavorite {
  favorite_name: string;
}

interface FavoritesListProps {
  favoriteType?: 'program' | 'company' | 'activity' | 'campaign' | 'user';
  onItemPress?: (item: UserFavoriteDetailed) => void;
  showSearch?: boolean;
}

const FavoritesList: React.FC<FavoritesListProps> = ({
  favoriteType,
  onItemPress,
  showSearch = true,
}) => {
  const {
    favorites,
    favoriteCounts,
    loading,
    error,
    loadFavorites,
    removeFromFavorites,
    searchFavorites,
    updateFavorite,

  } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserFavoriteDetailed[]>([]);

  const [editingFavorite, setEditingFavorite] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    if (favoriteType) {
      loadFavorites(favoriteType);
    } else {
      loadFavorites();
    }
  }, [favoriteType, loadFavorites]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await searchFavorites(query, favoriteType);
        setSearchResults(results.map(result => ({
          ...result,
          favorite_name: result.favorite_name || 'Unnamed Favorite'
        })));
      } catch (err) {
        console.error('Search failed:', err);
      }
    } else {
      setSearchResults([]);

    }
  };

  const handleRemoveFavorite = (item: UserFavoriteDetailed) => {
    Alert.alert(
      'Remove Favorite',
      `Are you sure you want to remove "${item.favorite_name}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromFavorites(item.favorite_type, item.favorite_id),
        },
      ]
    );
  };

  const startEditing = (item: UserFavoriteDetailed) => {
    setEditingFavorite(item.id);
    setEditNotes(item.notes || '');
    setEditTags(item.tags?.join(', ') || '');
  };

  const saveEdit = async () => {
    if (!editingFavorite) return;

    try {
      const tags = editTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      await updateFavorite(editingFavorite, editNotes, tags);
      setEditingFavorite(null);
      setEditNotes('');
      setEditTags('');
    } catch (err) {
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  const cancelEdit = () => {
    setEditingFavorite(null);
    setEditNotes('');
    setEditTags('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'program':
        return 'calendar';
      case 'company':
        return 'business';
      case 'activity':
        return 'fitness';
      case 'campaign':
        return 'megaphone';
      case 'user':
        return 'person';
      default:
        return 'heart';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'program':
        return '#4CAF50';
      case 'company':
        return '#2196F3';
      case 'activity':
        return '#FF9800';
      case 'campaign':
        return '#9C27B0';
      case 'user':
        return '#607D8B';
      default:
        return '#F44336';
    }
  };

  const renderFavoriteItem = ({ item }: { item: UserFavoriteDetailed }) => {
    const isEditing = editingFavorite === item.id;

    return (
      <View style={styles.favoriteItem}>
        <TouchableOpacity
          style={styles.favoriteContent}
          onPress={() => !isEditing && onItemPress?.(item)}
          disabled={isEditing}
        >
          {/* Type Icon */}
          <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.favorite_type) }]}>
            <Ionicons 
              name={getTypeIcon(item.favorite_type) as any} 
              size={20} 
              color="#fff" 
            />
          </View>

          {/* Content */}
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{item.favorite_name}</Text>
            <Text style={styles.itemType}>{item.favorite_type.toUpperCase()}</Text>
            
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Add notes..."
                  multiline
                />
                <TextInput
                  style={styles.editInput}
                  value={editTags}
                  onChangeText={setEditTags}
                  placeholder="Tags (comma separated)"
                />
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={cancelEdit} style={styles.editButton}>
                    <Text style={styles.editButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveEdit} style={[styles.editButton, styles.saveButton]}>
                    <Text style={[styles.editButtonText, styles.saveButtonText]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {item.notes && (
                  <Text style={styles.itemNotes} numberOfLines={2}>
                    {item.notes}
                  </Text>
                )}
                {item.tags && item.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                    {item.tags.length > 3 && (
                      <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
                    )}
                  </View>
                )}
                <Text style={styles.dateText}>
                  Added {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Actions */}
        {!isEditing && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => startEditing(item)} style={styles.actionButton}>
              <Ionicons name="pencil" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveFavorite(item)} style={styles.actionButton}>
              <Ionicons name="trash" size={20} color="#ff3333" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderHeader = () => {
    if (!showSearch && !favoriteType) return null;

    return (
      <View style={styles.header}>
        {!favoriteType && (
          <View style={styles.countsContainer}>
            {Object.entries(favoriteCounts).map(([type, count]) => (
              <View key={type} style={styles.countItem}>
                <Ionicons 
                  name={getTypeIcon(type) as any} 
                  size={16} 
                  color={getTypeColor(type)} 
                />
                <Text style={styles.countText}>{count}</Text>
              </View>
            ))}
          </View>
        )}
        
        {showSearch && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search favorites..."
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const dataToShow = searchQuery.trim() ? searchResults : favorites.map(fav => ({
    ...fav,
    favorite_name: fav.favorite_name || 'Unnamed Favorite'
  }));

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => loadFavorites(favoriteType)} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={dataToShow}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() 
                ? 'No favorites found matching your search' 
                : 'No favorites yet'
              }
            </Text>
            {!searchQuery.trim() && (
              <Text style={styles.emptySubtext}>
                Start adding items to your favorites to see them here
              </Text>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => loadFavorites(favoriteType)}
      />
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
  countsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  countItem: {
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    flexGrow: 1,
  },
  favoriteItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  editButtonText: {
    fontSize: 14,
    color: '#333',
  },
  saveButtonText: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  actionButton: {
    padding: 8,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
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
});

export default FavoritesList;