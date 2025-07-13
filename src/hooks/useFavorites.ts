import { useState, useEffect, useCallback } from 'react';
import { FavoritesService } from '../services/favoritesService';
import {
  UserFavoriteDetailed,
} from '../types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<UserFavoriteDetailed[]>([]);
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all favorites
  const loadFavorites = useCallback(async (
    favoriteType?: 'program' | 'company' | 'activity' | 'campaign' | 'user',
    limit = 50,
    offset = 0
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await FavoritesService.getUserFavorites(favoriteType, limit, offset);
      if (offset === 0) {
        setFavorites(data);
      } else {
        setFavorites(prev => [...prev, ...data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load favorites count
  const loadFavoriteCounts = useCallback(async () => {
    try {
      const counts = await FavoritesService.getFavoritesCount();
      setFavoriteCounts(counts);
    } catch (err) {
      console.error('Failed to load favorite counts:', err);
    }
  }, []);

  // Add to favorites
  const addToFavorites = useCallback(async (
    favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user',
    favoriteId: string,
    notes?: string,
    tags?: string[]
  ) => {
    try {
      setError(null);
      const favorite = await FavoritesService.addToFavorites(
        favoriteType,
        favoriteId,
        notes,
        tags
      );
      
      // Refresh favorites list
      await loadFavorites();
      await loadFavoriteCounts();
      
      return favorite;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to favorites');
      throw err;
    }
  }, [loadFavorites, loadFavoriteCounts]);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (
    favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user',
    favoriteId: string
  ) => {
    try {
      setError(null);
      await FavoritesService.removeFromFavorites(favoriteType, favoriteId);
      
      // Update local state
      setFavorites(prev => 
        prev.filter(fav => 
          !(fav.favorite_type === favoriteType && fav.favorite_id === favoriteId)
        )
      );
      
      await loadFavoriteCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from favorites');
      throw err;
    }
  }, [loadFavoriteCounts]);

  // Check if item is favorited
  const isFavorited = useCallback(async (
    favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user',
    favoriteId: string
  ) => {
    try {
      return await FavoritesService.isFavorited(favoriteType, favoriteId);
    } catch (err) {
      console.error('Failed to check favorite status:', err);
      return false;
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (
    favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user',
    favoriteId: string,
    notes?: string,
    tags?: string[]
  ) => {
    try {
      const isCurrentlyFavorited = await isFavorited(favoriteType, favoriteId);
      
      if (isCurrentlyFavorited) {
        await removeFromFavorites(favoriteType, favoriteId);
        return false;
      } else {
        await addToFavorites(favoriteType, favoriteId, notes, tags);
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      throw err;
    }
  }, [isFavorited, addToFavorites, removeFromFavorites]);

  // Update favorite notes and tags
  const updateFavorite = useCallback(async (
    favoriteId: string,
    notes?: string,
    tags?: string[]
  ) => {
    try {
      setError(null);
      await FavoritesService.updateFavorite(favoriteId, notes, tags);
      
      // Update local state
      setFavorites(prev =>
        prev.map(fav =>
          fav.id === favoriteId
            ? { ...fav, notes, tags }
            : fav
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
      throw err;
    }
  }, []);

  // Search favorites
  const searchFavorites = useCallback(async (
    query: string,
    favoriteType?: 'program' | 'company' | 'activity' | 'campaign' | 'user'
  ) => {
    try {
      setLoading(true);
      setError(null);
      const results = await FavoritesService.searchFavorites(query, favoriteType);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search favorites');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get favorites by type
  const getFavoritesByType = useCallback(async (
    favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      let data: UserFavoriteDetailed[];
      
      switch (favoriteType) {
        case 'program':
          data = await FavoritesService.getFavoritePrograms();
          break;
        case 'company':
          data = await FavoritesService.getFavoriteCompanies();
          break;
        case 'user':
          data = await FavoritesService.getFavoriteUsers();
          break;
        case 'campaign':
          data = await FavoritesService.getFavoriteCampaigns();
          break;
        default:
          data = await FavoritesService.getUserFavorites(favoriteType);
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites by type');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get popular favorites
  const getPopularFavorites = useCallback(async (
    favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user',
    limit = 10
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await FavoritesService.getPopularFavorites(favoriteType, limit);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load popular favorites');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk operations
  const addMultipleToFavorites = useCallback(async (
    items: Array<{
      favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user';
      favoriteId: string;
      notes?: string;
      tags?: string[];
    }>
  ) => {
    try {
      setError(null);
      const favorites = await FavoritesService.addMultipleToFavorites(items);
      
      // Refresh favorites list
      await loadFavorites();
      await loadFavoriteCounts();
      
      return favorites;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add multiple favorites');
      throw err;
    }
  }, [loadFavorites, loadFavoriteCounts]);

  const removeMultipleFromFavorites = useCallback(async (
    items: Array<{
      favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user';
      favoriteId: string;
    }>
  ) => {
    try {
      setError(null);
      await FavoritesService.removeMultipleFromFavorites(items);
      
      // Update local state
      setFavorites(prev => 
        prev.filter(fav => 
          !items.some(item => 
            fav.favorite_type === item.favoriteType && 
            fav.favorite_id === item.favoriteId
          )
        )
      );
      
      await loadFavoriteCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove multiple favorites');
      throw err;
    }
  }, [loadFavoriteCounts]);

  // Get recommendations based on favorites
  const getFavoriteBasedRecommendations = useCallback(async (
    favoriteType: 'program' | 'company' | 'activity' | 'campaign',
    limit = 10
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await FavoritesService.getFavoriteBasedRecommendations(
        favoriteType,
        limit
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions
  const getFavoriteCount = useCallback((type: string) => {
    return favoriteCounts[type] || 0;
  }, [favoriteCounts]);

  const getTotalFavoriteCount = useCallback(() => {
    return Object.values(favoriteCounts).reduce((sum, count) => sum + count, 0);
  }, [favoriteCounts]);

  const getFavoritesByTag = useCallback((tag: string) => {
    return favorites.filter(fav => fav.tags?.includes(tag));
  }, [favorites]);

  const getAllTags = useCallback(() => {
    const tags = new Set<string>();
    favorites.forEach(fav => {
      fav.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [favorites]);

  // Load initial data
  useEffect(() => {
    loadFavorites();
    loadFavoriteCounts();
  }, [loadFavorites, loadFavoriteCounts]);

  return {
    // State
    favorites,
    favoriteCounts,
    loading,
    error,

    // Actions
    loadFavorites,
    loadFavoriteCounts,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    toggleFavorite,
    updateFavorite,
    searchFavorites,
    getFavoritesByType,
    getPopularFavorites,
    addMultipleToFavorites,
    removeMultipleFromFavorites,
    getFavoriteBasedRecommendations,

    // Helpers
    getFavoriteCount,
    getTotalFavoriteCount,
    getFavoritesByTag,
    getAllTags,
    setError,
  };
};

export default useFavorites;