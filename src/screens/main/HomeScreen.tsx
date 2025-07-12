import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import type { MainStackParamList, MainTabParamList } from '../../navigation/MainNavigator';

// Design system
const colors = {
  primary: '#007AFF',
  primaryLight: '#E3F2FD',
  secondary: '#FF6B35',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#17A2B8',
};



interface Program {
  id: string;
  title: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  activities_count: number;
  total_budget: number;
  spent_amount: number;
}

interface Recommendation {
  id: string;
  type: 'restaurant' | 'activity' | 'product' | 'event';
  title: string;
  description: string;
  image_url?: string;
  score: number;
  reason: string;
}

interface UserStats {
  total_programs: number;
  completed_programs: number;
  total_savings: number;
  referral_earnings: number;
  current_streak: number;
}

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList> & NativeStackNavigationProp<MainStackParamList>;

interface SupabaseProgramData {
  id: string;
  title: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total_budget: number;
  spent_amount: number;
  program_activities: { count: number }[];
}

export const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total_programs: 0,
    completed_programs: 0,
    total_savings: 0,
    referral_earnings: 0,
    current_streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user programs
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select(`
            id,
            title,
            date,
            status,
            total_budget,
            spent_amount,
            program_activities(count)
          `)
          .eq('user_id', user?.id)
          .order('date', { ascending: false })
          .limit(5);
  
        if (programsError) throw programsError;
  
        // Transform programs data
        const transformedPrograms = (programsData as SupabaseProgramData[])?.map((program) => ({
          ...program,
          activities_count: program.program_activities?.length || 0,
        })) || [];
  
        setPrograms(transformedPrograms);
  
        // Fetch recommendations
        const { data: recommendationsData, error: recommendationsError } = await supabase
          .from('recommendations')
          .select('*')
          .eq('user_id', user?.id)
          .order('score', { ascending: false })
          .limit(6);
  
        if (recommendationsError) throw recommendationsError;
        setRecommendations(recommendationsData || []);
  
        // Calculate user stats
        const totalPrograms = programsData?.length || 0;
        const completedPrograms = (programsData as SupabaseProgramData[])?.filter((p) => p.status === 'completed').length || 0;
        const totalSavings = (programsData as SupabaseProgramData[])?.reduce((sum: number, p) => sum + (p.total_budget - p.spent_amount), 0) || 0;
  
        setUserStats({
          total_programs: totalPrograms,
          completed_programs: completedPrograms,
          total_savings: totalSavings,
          referral_earnings: 0, // This would come from transactions table
          current_streak: 5, // This would be calculated based on consecutive days
        });
  
      } catch (error: unknown) {
        let errorMessage = 'Veriler yüklenirken bir hata oluştu.';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        Alert.alert('Hata', errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    fetchUserData();
  }, [user?.id]);

  const onRefresh = () => {
    // Burada refresh işlemi yapılabilir
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal';
      default:
        return 'Taslak';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'restaurant-outline' as const;
      case 'activity':
        return 'fitness-outline' as const;
      case 'product':
        return 'bag-outline' as const;
      case 'event':
        return 'calendar-outline' as const;
      default:
        return 'star-outline' as const;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.welcomeText}>
                  Merhaba, {user?.user_metadata?.full_name || 'Kullanıcı'}!
                </Text>
                <Text style={styles.subtitleText}>
                  Bugün hangi deneyimi yaşamak istiyorsunuz?
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>
                Hızlı İşlemler
              </Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateProgram', {})}
                  style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="add-circle" size={32} color={colors.surface} />
                  <Text style={styles.quickActionText}>
                    Yeni Program
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Explore')}
                  style={[styles.quickActionButton, { backgroundColor: colors.secondary }]}
                >
                  <Ionicons name="compass" size={32} color={colors.surface} />
                  <Text style={styles.quickActionText}>
                    Keşfet
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Program')}
                  style={[styles.quickActionButton, { backgroundColor: colors.warning }]}
                >
                  <Ionicons name="list" size={32} color={colors.surface} />
                  <Text style={styles.quickActionText}>
                    Programlarım
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile')}
                  style={[styles.quickActionButton, { backgroundColor: colors.success }]}
                >
                  <Ionicons name="person" size={32} color={colors.surface} />
                  <Text style={styles.quickActionText}>
                    Profil
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* User Stats */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>
                İstatistiklerim
              </Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="albums-outline" size={24} color={colors.primary} />
                  <Text style={[styles.statNumber, { color: colors.primary }]}>
                    {userStats.total_programs}
                  </Text>
                  <Text style={styles.statLabel}>
                    Toplam Program
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-done-outline" size={24} color={colors.success} />
                  <Text style={[styles.statNumber, { color: colors.success }]}>
                    {userStats.completed_programs}
                  </Text>
                  <Text style={styles.statLabel}>
                    Tamamlanan
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="wallet-outline" size={24} color={colors.warning} />
                  <Text style={[styles.statNumber, { color: colors.warning }]}>
                    ₺{userStats.total_savings.toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>
                    Toplam Tasarruf
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="flame-outline" size={24} color={colors.secondary} />
                  <Text style={[styles.statNumber, { color: colors.secondary }]}>
                    {userStats.current_streak}
                  </Text>
                  <Text style={styles.statLabel}>
                    Günlük Seri
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recent Programs */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Son Programlarım
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Yakında', 'Tüm programlar özelliği yakında gelecek!');
                  }}
                >
                  <Text style={styles.seeAllText}>
                    Tümünü Gör
                  </Text>
                </TouchableOpacity>
              </View>

              {programs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyStateText}>
                    Henüz program oluşturmadınız
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    İlk programınızı oluşturmak için yukarıdaki butonu kullanın
                  </Text>
                </View>
              ) : (
                <View style={styles.programsList}>
                  {programs.slice(0, 3).map((program) => (
                    <TouchableOpacity
                      key={program.id}
                      onPress={() => {
                        Alert.alert('Yakında', 'Program detayları özelliği yakında gelecek!');
                      }}
                      style={styles.programItem}
                    >
                      <View style={styles.programHeader}>
                        <View style={styles.programInfo}>
                          <Text style={styles.programTitle}>
                            {program.title}
                          </Text>
                          <Text style={styles.programDate}>
                            {new Date(program.date).toLocaleDateString('tr-TR')}
                          </Text>
                          <View style={styles.programMeta}>
                            <Text style={styles.programMetaText}>
                              {program.activities_count} aktivite
                            </Text>
                            <Text style={styles.programMetaText}>
                              •
                            </Text>
                            <Text style={styles.programMetaText}>
                              ₺{program.total_budget?.toLocaleString() || 0} bütçe
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(program.status) }]}>
                          <Text style={styles.statusText}>
                            {getStatusText(program.status)}
                          </Text>
                        </View>
                      </View>
                      {program.total_budget > 0 && (
                        <View style={styles.progressSection}>
                          <View style={styles.progressHeader}>
                            <Text style={styles.progressText}>
                              Harcanan: ₺{program.spent_amount?.toLocaleString() || 0}
                            </Text>
                            <Text style={styles.progressText}>
                              {Math.round(((program.spent_amount || 0) / program.total_budget) * 100)}%
                            </Text>
                          </View>
                          <View style={styles.progressBar}>
                            <View 
                              style={[
                                styles.progressFill, 
                                { 
                                  width: `${Math.min(((program.spent_amount || 0) / program.total_budget) * 100, 100)}%`,
                                  backgroundColor: colors.primary
                                }
                              ]} 
                            />
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* AI Recommendations */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Size Özel Öneriler
                </Text>
                <Ionicons name="sparkles" size={24} color={colors.primary} />
              </View>

              {recommendations.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="bulb-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyStateText}>
                    AI önerileriniz hazırlanıyor...
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    Daha fazla program oluşturun ve kişiselleştirilmiş öneriler alın
                  </Text>
                </View>
              ) : (
                <View style={styles.recommendationsList}>
                  {recommendations.slice(0, 3).map((recommendation) => (
                    <TouchableOpacity
                      key={recommendation.id}
                      onPress={() => {
                        Alert.alert('Yakında', 'Öneri detayları özelliği yakında gelecek!');
                      }}
                      style={styles.recommendationItem}
                    >
                      <View style={styles.recommendationContent}>
                        <Ionicons 
                          name={getRecommendationIcon(recommendation.type)} 
                          size={32} 
                          color={colors.primary} 
                        />
                        <View style={styles.recommendationText}>
                          <Text style={styles.recommendationTitle}>
                            {recommendation.title}
                          </Text>
                          <Text style={styles.recommendationDescription}>
                            {recommendation.description}
                          </Text>
                          <Text style={styles.recommendationReason}>
                            {recommendation.reason}
                          </Text>
                        </View>
                        <View style={styles.recommendationScore}>
                          <Text style={styles.scoreLabel}>
                            Match
                          </Text>
                          <Text style={styles.scoreValue}>
                            {Math.round(recommendation.score * 100)}%
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Coming Soon Features */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>
                Yakında Gelecek Özellikler
              </Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="map" size={24} color={colors.info} />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>
                      Harita Entegrasyonu
                    </Text>
                    <Text style={styles.featureDescription}>
                      Yakındaki mekanları keşfedin
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.featureItem}>
                  <Ionicons name="share-social" size={24} color={colors.success} />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>
                      Sosyal Paylaşım
                    </Text>
                    <Text style={styles.featureDescription}>
                      Programlarınızı sosyal medyada paylaşın
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.featureItem}>
                  <Ionicons name="business" size={24} color={colors.secondary} />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>
                      İşletme Paneli
                    </Text>
                    <Text style={styles.featureDescription}>
                      İşletmenizi kaydedin ve müşterilerinize ulaşın
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.surface,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: colors.surface + '80',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary + '80',
    textAlign: 'center',
  },
  programsList: {
    gap: 12,
  },
  programItem: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  programInfo: {
    flex: 1,
    gap: 4,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  programDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  programMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },
  progressSection: {
    marginTop: 12,
    gap: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recommendationText: {
    flex: 1,
    gap: 4,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  recommendationDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recommendationReason: {
    fontSize: 12,
    color: colors.primary,
  },
  recommendationScore: {
    alignItems: 'center',
    gap: 2,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default HomeScreen;