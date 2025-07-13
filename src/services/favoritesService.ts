import { supabase } from './supabase';
import {
  UserFavorite,
  UserFavoriteDetailed,
} from '../types';

export class FavoritesService {
  // Add to favorites
  static async addToFavorites(
    favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user',
    favoriteId: string,
    notes?: string,
    tags?: string[]
  ): Promise<UserFavorite> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.data.user.id,
          favorite_type: favoriteType,
          favorite_id: favoriteId,
          notes,
          tags,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Item is already in favorites');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  // Remove from favorites
  static async removeFromFavorites(
    favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user',
    favoriteId: string
  ): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.data.user.id)
        .eq('favorite_type', favoriteType)
        .eq('favorite_id', favoriteId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  // Check if item is favorited
  static async isFavorited(
    favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user',
    favoriteId: string
  ): Promise<boolean> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return false;

      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.data.user.id)
        .eq('favorite_type', favoriteType)
        .eq('favorite_id', favoriteId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  // Get user's favorites
  static async getUserFavorites(
    favoriteType?: 'program' | 'company' | 'activity' | 'campaign' | 'user',
    limit = 50,
    offset = 0
  ): Promise<UserFavoriteDetailed[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      let query = supabase
        .from('user_favorites_detailed')
        .select('*')
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (favoriteType) {
        query = query.eq('favorite_type', favoriteType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      throw error;
    }
  }

  // Get favorites by type with detailed info
  static async getFavoritePrograms(): Promise<UserFavoriteDetailed[]> {
    return this.getUserFavorites('program');
  }

  static async getFavoriteCompanies(): Promise<UserFavoriteDetailed[]> {
    return this.getUserFavorites('company');
  }

  static async getFavoriteUsers(): Promise<UserFavoriteDetailed[]> {
    return this.getUserFavorites('user');
  }

  static async getFavoriteCampaigns(): Promise<UserFavoriteDetailed[]> {
    return this.getUserFavorites('campaign');
  }

  // Update favorite notes and tags
  static async updateFavorite(
    favoriteId: string,
    notes?: string,
    tags?: string[]
  ): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .update({ notes, tags })
        .eq('id', favoriteId)
        .eq('user_id', user.data.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating favorite:', error);
      throw error;
    }
  }

  // Search favorites
  static async searchFavorites(
    query: string,
    favoriteType?: 'program' | 'company' | 'activity' | 'campaign' | 'user'
  ): Promise<UserFavoriteDetailed[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      let queryBuilder = supabase
        .from('user_favorites_detailed')
        .select('*')
        .eq('user_id', user.data.user.id)
        .or(`favorite_name.ilike.%${query}%,notes.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (favoriteType) {
        queryBuilder = queryBuilder.eq('favorite_type', favoriteType);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching favorites:', error);
      throw error;
    }
  }

  // Get favorites count by type
  static async getFavoritesCount(): Promise<Record<string, number>> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_favorites')
        .select('favorite_type')
        .eq('user_id', user.data.user.id);

      if (error) throw error;

      const counts: Record<string, number> = {
        program: 0,
        company: 0,
        activity: 0,
        campaign: 0,
        user: 0,
      };

      data?.forEach(item => {
        counts[item.favorite_type] = (counts[item.favorite_type] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Error getting favorites count:', error);
      return {};
    }
  }

  // Get popular favorites (most favorited items)
  static async getPopularFavorites(
    favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user',
    limit = 10
  ): Promise<Array<{ favorite_id: string; count: number; favorite_name?: string }>> {
    try {
      const { data, error } = await supabase
        .rpc('get_popular_favorites', {
          fav_type: favoriteType,
          result_limit: limit
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting popular favorites:', error);
      return [];
    }
  }

  // Bulk operations
  static async addMultipleToFavorites(
    items: Array<{
      favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user';
      favoriteId: string;
      notes?: string;
      tags?: string[];
    }>
  ): Promise<UserFavorite[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const favorites = items.map(item => ({
        user_id: user.data.user!.id,
        favorite_type: item.favoriteType,
        favorite_id: item.favoriteId,
        notes: item.notes,
        tags: item.tags,
      }));

      const { data, error } = await supabase
        .from('user_favorites')
        .insert(favorites)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error adding multiple favorites:', error);
      throw error;
    }
  }

  static async removeMultipleFromFavorites(
    items: Array<{
      favoriteType: 'program' | 'company' | 'activity' | 'campaign' | 'user';
      favoriteId: string;
    }>
  ): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      for (const item of items) {
        await this.removeFromFavorites(item.favoriteType, item.favoriteId);
      }
    } catch (error) {
      console.error('Error removing multiple favorites:', error);
      throw error;
    }
  }

  // Get recommendations based on favorites
  static async getFavoriteBasedRecommendations(
    favoriteType: 'program' | 'company' | 'activity' | 'campaign',
    limit = 10
  ): Promise<any[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('get_favorite_based_recommendations', {
          user_id: user.data.user.id,
          fav_type: favoriteType,
          result_limit: limit
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting favorite-based recommendations:', error);
      return [];
    }
  }
}

export default FavoritesService;