import { supabase } from './supabase';
import { Program, Activity } from '../types';

type ProgramInsert = Omit<Program, 'id' | 'created_at' | 'updated_at'>;
type ProgramUpdate = Partial<ProgramInsert>;
type ActivityInsert = Omit<Activity, 'id' | 'created_at' | 'completed_at'>;
type ActivityUpdate = Partial<ActivityInsert>;

export interface ProgramWithActivities extends Program {
  activities: Activity[];
}

export interface ProgramFilters {
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  budgetMin?: number;
  budgetMax?: number;
  search?: string;
}

export interface ProgramStats {
  totalPrograms: number;
  activePrograms: number;
  completedPrograms: number;
  totalBudget: number;
  totalSpent: number;
  averageCompletion: number;
}

class ProgramService {
  /**
   * Create a new program
   */
  async createProgram(programData: ProgramInsert): Promise<Program> {
    try {
      const { data, error } = await supabase
        .from('programs')
        .insert(programData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create program error:', error);
      throw new Error('Program oluşturulamadı');
    }
  }

  /**
   * Get program by ID with activities
   */
  async getProgramById(id: string): Promise<ProgramWithActivities | null> {
    try {
      const { data: program, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();

      if (programError) throw programError;
      if (!program) return null;

      const { data: activities, error: activitiesError } = await supabase
        .from('program_activities')
        .select('*')
        .eq('program_id', id)
        .order('start_time', { ascending: true });

      if (activitiesError) throw activitiesError;

      return {
        ...program,
        activities: activities || []
      };
    } catch (error) {
      console.error('Get program by ID error:', error);
      throw new Error('Program bulunamadı');
    }
  }

  /**
   * Get user programs with filters
   */
  async getUserPrograms(
    userId: string,
    filters: ProgramFilters = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<Program[]> {
    try {
      let query = supabase
        .from('programs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }

      if (filters.budgetMin) {
        query = query.gte('total_budget', filters.budgetMin);
      }

      if (filters.budgetMax) {
        query = query.lte('total_budget', filters.budgetMax);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user programs error:', error);
      throw new Error('Programlar yüklenemedi');
    }
  }

  /**
   * Update program
   */
  async updateProgram(id: string, updates: ProgramUpdate): Promise<Program> {
    try {
      const { data, error } = await supabase
        .from('programs')
        .update({
          ...updates,
          // updated_at will be handled by database
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update program error:', error);
      throw new Error('Program güncellenemedi');
    }
  }

  /**
   * Delete program
   */
  async deleteProgram(id: string): Promise<void> {
    try {
      // First delete all activities
      const { error: activitiesError } = await supabase
        .from('program_activities')
        .delete()
        .eq('program_id', id);

      if (activitiesError) throw activitiesError;

      // Then delete the program
      const { error: programError } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);

      if (programError) throw programError;
    } catch (error) {
      console.error('Delete program error:', error);
      throw new Error('Program silinemedi');
    }
  }

  /**
   * Duplicate program
   */
  async duplicateProgram(id: string, _userId: string): Promise<Program> {
    try {
      const originalProgram = await this.getProgramById(id);
      if (!originalProgram) {
        throw new Error('Kopyalanacak program bulunamadı');
      }

      // Create new program
      const newProgramData: ProgramInsert = {
        user_id: _userId,
        title: (originalProgram as any).title,
        description: (originalProgram as any).description,
        category: (originalProgram as any).category,
        budget: (originalProgram as any).budget,
        priority: 'medium',
        activities: [],
        current_amount: 0,
        target_amount: (originalProgram as any).budget || 0,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'draft',
        auto_tracking: false,
        notifications_enabled: true
      };

      const newProgram = await this.createProgram(newProgramData);

      // Copy activities
      if (originalProgram.activities.length > 0) {
        const newActivities: ActivityInsert[] = originalProgram.activities.map(activity => ({
          program_id: newProgram.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          category: activity.category,
          estimated_cost: activity.estimated_cost,
          duration_hours: activity.duration_hours,
          location: activity.location,
          target_amount: activity.target_amount,
          current_amount: 0,
          priority: activity.priority,
          status: 'pending' as const,
        }));

        await this.createActivities(newActivities);
      }

      return newProgram;
    } catch (error) {
      console.error('Duplicate program error:', error);
      throw new Error('Program kopyalanamadı');
    }
  }

  /**
   * Get program statistics for user
   */
  async getUserProgramStats(userId: string): Promise<ProgramStats> {
    try {
      const { data: programs, error } = await supabase
        .from('programs')
        .select('status, total_budget, spent_amount')
        .eq('user_id', userId);

      if (error) throw error;

      const stats: ProgramStats = {
        totalPrograms: programs?.length || 0,
        activePrograms: programs?.filter((p: any) => p.status === 'active').length || 0,
        completedPrograms: programs?.filter((p: any) => p.status === 'completed').length || 0,
        totalBudget: programs?.reduce((sum: number, p: any) => sum + (p.total_budget || 0), 0) || 0,
        totalSpent: programs?.reduce((sum: number, p: any) => sum + (p.spent_amount || 0), 0) || 0,
        averageCompletion: 0
      };

      // Calculate average completion rate
      if (stats.totalPrograms > 0) {
        const completionRate = (stats.completedPrograms / stats.totalPrograms) * 100;
        stats.averageCompletion = Math.round(completionRate);
      }

      return stats;
    } catch (error) {
      console.error('Get user program stats error:', error);
      throw new Error('İstatistikler yüklenemedi');
    }
  }

  // Activity Management Methods

  /**
   * Create activities for a program
   */
  async createActivities(activities: ActivityInsert[]): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('program_activities')
        .insert(activities)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Create activities error:', error);
      throw new Error('Aktiviteler oluşturulamadı');
    }
  }

  /**
   * Update activity
   */
  async updateActivity(id: string, updates: ActivityUpdate): Promise<Activity> {
    try {
      const { data, error } = await supabase
        .from('program_activities')
        .update({
          ...updates,
          // updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update activity error:', error);
      throw new Error('Aktivite güncellenemedi');
    }
  }

  /**
   * Delete activity
   */
  async deleteActivity(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('program_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Delete activity error:', error);
      throw new Error('Aktivite silinemedi');
    }
  }

  /**
   * Get activities for a program
   */
  async getProgramActivities(programId: string): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('program_activities')
        .select('*')
        .eq('program_id', programId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get program activities error:', error);
      throw new Error('Aktiviteler yüklenemedi');
    }
  }

  /**
   * Update program status
   */
  async updateProgramStatus(
    id: string,
    status: 'draft' | 'active' | 'completed' | 'cancelled'
  ): Promise<Program> {
    try {
      const updates: ProgramUpdate = {
        status,
        // updated_at: new Date().toISOString()
      };

      // If completing the program, update completion date
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      return await this.updateProgram(id, updates);
    } catch (error) {
      console.error('Update program status error:', error);
      throw new Error('Program durumu güncellenemedi');
    }
  }

  /**
   * Search programs across all users (for admin/discovery)
   */
  async searchPublicPrograms(
    query: string,
    filters: Omit<ProgramFilters, 'status'> = {},
    limit: number = 20
  ): Promise<Program[]> {
    try {
      let dbQuery = supabase
        .from('programs')
        .select('*')
        .eq('status', 'completed') // Only show completed programs publicly
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (filters.category) {
        dbQuery = dbQuery.eq('category', filters.category);
      }

      if (filters.budgetMin) {
        dbQuery = dbQuery.gte('total_budget', filters.budgetMin);
      }

      if (filters.budgetMax) {
        dbQuery = dbQuery.lte('total_budget', filters.budgetMax);
      }

      const { data, error } = await dbQuery;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Search public programs error:', error);
      throw new Error('Program arama başarısız');
    }
  }

  /**
   * Get trending/popular programs
   */
  async getTrendingPrograms(limit: number = 10): Promise<Program[]> {
    try {
      // This would typically use analytics data
      // For now, we'll return recently completed programs with high ratings
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('status', 'completed')
        .not('rating', 'is', null)
        .gte('rating', 4.0)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get trending programs error:', error);
      throw new Error('Popüler programlar yüklenemedi');
    }
  }
}

export const programService = new ProgramService();
export default programService;