import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Colors and Typography
const colors = {
  primary: '#007AFF',
  primaryLight: '#E3F2FD',
  secondary: '#FF6B35',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
};



import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  location?: string;
  bio?: string;
  preferences: {
    notifications: boolean;
    marketing_emails: boolean;
    location_tracking: boolean;
    data_sharing: boolean;
  };
  stats: {
    total_programs: number;
    completed_programs: number;
    total_savings: number;
    current_streak: number;
    member_since: string;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_date?: string;
  progress?: number;
  target?: number;
}

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    notifications: true,
    marketing_emails: false,
    location_tracking: true,
    data_sharing: false,
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      // Mock profile data for now
      const mockProfile: UserProfile = {
        id: user?.id || '',
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || 'Kullanıcı',
        avatar_url: user?.user_metadata?.avatar_url,
        phone: '+90 555 123 45 67',
        date_of_birth: '1990-01-01',
        location: 'İstanbul, Türkiye',
        bio: 'Tasarruf etmeyi seven, akıllı harcama yapan bir kullanıcı.',
        preferences: {
          notifications: true,
          marketing_emails: false,
          location_tracking: true,
          data_sharing: false,
        },
        stats: {
          total_programs: 12,
          completed_programs: 8,
          total_savings: 2450,
          current_streak: 15,
          member_since: '2024-01-15',
        },
      };

      setProfile(mockProfile);
      setEditForm({
        full_name: mockProfile.full_name,
        phone: mockProfile.phone || '',
        location: mockProfile.location || '',
        bio: mockProfile.bio || '',
        notifications: mockProfile.preferences.notifications,
        marketing_emails: mockProfile.preferences.marketing_emails,
        location_tracking: mockProfile.preferences.location_tracking,
        data_sharing: mockProfile.preferences.data_sharing,
      });

    } catch (error: unknown) {
      let errorMessage = 'Profil yüklenirken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const fetchAchievements = useCallback(async () => {
    try {
      // Mock achievements data
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'İlk Program',
          description: 'İlk tasarruf programınızı oluşturdunuz!',
          icon: 'star',
          earned_date: '2024-01-20',
        },
        {
          id: '2',
          title: 'Tasarruf Ustası',
          description: '1000₺ tasarruf ettiniz!',
          icon: 'savings',
          earned_date: '2024-02-15',
        },
        {
          id: '3',
          title: 'Süreklilik',
          description: '7 gün üst üste program takibi',
          icon: 'trending-up',
          earned_date: '2024-03-01',
        },
        {
          id: '4',
          title: 'Büyük Hedef',
          description: '5000₺ tasarruf hedefine ulaşın',
          icon: 'emoji-events',
          progress: 2450,
          target: 5000,
        },
      ];

      setAchievements(mockAchievements);
    } catch (error: unknown) {
      console.error('Achievements fetch error:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAchievements();
    }
  }, [user, fetchProfile, fetchAchievements]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
    fetchAchievements();
  };

  const handleUpdateProfile = async () => {
    if (!editForm.full_name.trim()) {
      Alert.alert('Eksik Bilgi', 'Ad soyad alanı zorunludur.');
      return;
    }

    try {
      setUpdating(true);

      // Here we would normally update the profile in Supabase
      Alert.alert('Başarılı', 'Profil başarıyla güncellendi!');

      setIsEditModalVisible(false);
      fetchProfile();
    } catch (error: unknown) {
      let errorMessage = 'Profil güncellenirken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Hata', errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      Alert.alert('Başarılı', 'Başarıyla çıkış yapıldı.');
    } catch (error: unknown) {
      let errorMessage = 'Çıkış yapılırken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Hata', errorMessage);
    }
    setIsLogoutModalVisible(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Profil yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Profil yüklenemedi</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.profileRow}>
              <View style={styles.avatarContainer}>
                {profile.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {profile.full_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {profile.full_name}
                </Text>
                <Text style={styles.userEmail}>
                  {profile.email}
                </Text>
                <Text style={styles.memberSince}>
                  Üye olma: {new Date(profile.stats.member_since).toLocaleDateString('tr-TR')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditModalVisible(true)}
              >
                <Ionicons name="pencil" size={16} color={colors.primary} />
                <Text style={styles.editButtonText}>Düzenle</Text>
              </TouchableOpacity>
            </View>
            
            {profile.bio && (
              <Text style={styles.bio}>
                {profile.bio}
              </Text>
            )}
            
            {profile.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text style={styles.locationText}>
                  {profile.location}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>
            İstatistikler
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="document-text" size={32} color={colors.primary} />
              <Text style={styles.statValue}>
                {profile.stats.total_programs}
              </Text>
              <Text style={styles.statLabel}>
                Toplam Program
              </Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
              <Text style={styles.statValue}>
                {profile.stats.completed_programs}
              </Text>
              <Text style={styles.statLabel}>
                Tamamlanan
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="wallet" size={32} color={colors.warning} />
              <Text style={styles.statValue}>
                ₺{profile.stats.total_savings.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>
                Toplam Tasarruf
              </Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={32} color={colors.error} />
              <Text style={styles.statValue}>
                {profile.stats.current_streak}
              </Text>
              <Text style={styles.statLabel}>
                Günlük Seri
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Başarılar
          </Text>
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementContent}>
                  <View style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.earned_date ? colors.primary + '20' : '#f5f5f5' }
                  ]}>
                    <Ionicons
                      name={achievement.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={achievement.earned_date ? colors.primary : '#9ca3af'}
                    />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>
                      {achievement.title}
                    </Text>
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                    {achievement.earned_date ? (
                      <Text style={styles.achievementEarned}>
                        Kazanıldı: {new Date(achievement.earned_date).toLocaleDateString('tr-TR')}
                      </Text>
                    ) : achievement.progress && achievement.target ? (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill,
                              { width: `${(achievement.progress / achievement.target) * 100}%` }
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {achievement.progress} / {achievement.target}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.achievementNotEarned}>
                        Henüz kazanılmadı
                      </Text>
                    )}
                  </View>
                  {achievement.earned_date && (
                    <View style={styles.achievementBadge}>
                      <Text style={styles.achievementBadgeText}>✓</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Ayarlar
          </Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'Yakında',
                  'Bildirim ayarları yakında gelecek!'
                );
              }}
            >
              <View style={styles.settingContent}>
                <Ionicons name="notifications" size={24} color="#6b7280" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>
                    Bildirimler
                  </Text>
                  <Text style={styles.settingDescription}>
                    Push bildirimleri ve e-posta ayarları
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'Yakında',
                  'Gizlilik ayarları yakında gelecek!'
                );
              }}
            >
              <View style={styles.settingContent}>
                <Ionicons name="shield-checkmark" size={24} color="#6b7280" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>
                    Gizlilik
                  </Text>
                  <Text style={styles.settingDescription}>
                    Veri paylaşımı ve gizlilik tercihleri
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'Yakında',
                  'Yardım merkezi yakında gelecek!'
                );
              }}
            >
              <View style={styles.settingContent}>
                <Ionicons name="help-circle" size={24} color="#6b7280" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>
                    Yardım
                  </Text>
                  <Text style={styles.settingDescription}>
                    SSS, destek ve geri bildirim
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setIsLogoutModalVisible(true)}
            >
              <View style={styles.settingContent}>
                <Ionicons name="log-out" size={24} color="#ef4444" />
                <Text style={[styles.settingTitle, { color: '#ef4444' }]}>
                  Çıkış Yap
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Profili Düzenle</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ad Soyad *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ad Soyad"
                  value={editForm.full_name}
                  onChangeText={(text) => setEditForm({...editForm, full_name: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Telefon</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="+90 555 123 45 67"
                  keyboardType="phone-pad"
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Konum</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Şehir, Ülke"
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({...editForm, location: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Hakkımda</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Kendiniz hakkında kısa bir açıklama..."
                  value={editForm.bio}
                  onChangeText={(text) => setEditForm({...editForm, bio: text})}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.divider} />
              
              <Text style={styles.sectionTitle}>
                Gizlilik Tercihleri
              </Text>

              <View style={styles.switchContainer}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchTitle}>
                    Bildirimler
                  </Text>
                  <Text style={styles.switchDescription}>
                    Push bildirimleri al
                  </Text>
                </View>
                <Switch
                  value={editForm.notifications}
                  onValueChange={(value) => setEditForm({...editForm, notifications: value})}
                  trackColor={{ false: '#e5e7eb', true: colors.primary + '40' }}
                  thumbColor={editForm.notifications ? colors.primary : '#f3f4f6'}
                />
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchTitle}>
                    Pazarlama E-postaları
                  </Text>
                  <Text style={styles.switchDescription}>
                    Kampanya ve fırsat e-postaları
                  </Text>
                </View>
                <Switch
                  value={editForm.marketing_emails}
                  onValueChange={(value) => setEditForm({...editForm, marketing_emails: value})}
                  trackColor={{ false: '#e5e7eb', true: colors.primary + '40' }}
                  thumbColor={editForm.marketing_emails ? colors.primary : '#f3f4f6'}
                />
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchTitle}>
                    Konum Takibi
                  </Text>
                  <Text style={styles.switchDescription}>
                    Yakındaki fırsatları göster
                  </Text>
                </View>
                <Switch
                  value={editForm.location_tracking}
                  onValueChange={(value) => setEditForm({...editForm, location_tracking: value})}
                  trackColor={{ false: '#e5e7eb', true: colors.primary + '40' }}
                  thumbColor={editForm.location_tracking ? colors.primary : '#f3f4f6'}
                />
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleUpdateProfile}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Logout Confirmation */}
      <Modal
        visible={isLogoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>Çıkış Yap</Text>
            </View>
            <View style={styles.alertBody}>
              <Text style={styles.alertMessage}>
                Hesabınızdan çıkış yapmak istediğinizden emin misiniz?
              </Text>
            </View>
            <View style={styles.alertFooter}>
              <TouchableOpacity
                style={[styles.alertButton, styles.cancelAlertButton]}
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.cancelAlertButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertButton, styles.dangerButton]}
                onPress={handleLogout}
              >
                <Text style={styles.dangerButtonText}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  achievementEarned: {
    fontSize: 12,
    color: '#10b981',
  },
  achievementNotEarned: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  achievementBadge: {
    backgroundColor: '#10b981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    padding: 16,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalBody: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchInfo: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
  },
  alertHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  alertBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  alertMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  alertFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  alertButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelAlertButton: {
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  cancelAlertButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: 'transparent',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  memberSince: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  bio: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginTop: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  profileInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default ProfileScreen;