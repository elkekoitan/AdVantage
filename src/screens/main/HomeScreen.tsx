import React, { useState, useEffect } from 'react';
import {
  Box,
  ScrollView,
  VStack,
  HStack,
  Text,
  Heading,
  Avatar,
  IconButton,
  useColorModeValue,
  Spinner,
  Center,
  Pressable,
  useTheme,
  Fab,
  Button,
  Icon,
} from 'native-base';
import { Badge } from '../../components/ui';
import { RefreshControl, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import type { MainStackParamList, MainTabParamList } from '../../navigation/MainNavigator';
import { Card } from '../../components/ui/Card';
import { VoiceAgent } from '../../components/VoiceAgent';
import { TimelineView } from '../../components/TimelineView';
import { RecommendationCard } from '../../components/RecommendationCard';
import { aiAssistantService, DailyTimeline, AIRecommendation } from '../../services/aiAssistantService';



interface Program {
  id: string;
  title: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  activities_count: number;
  total_budget: number;
  spent_amount: number;
  description?: string;
  activities?: Array<{ id: string; title: string; }>;
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
  const theme = useTheme();
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
  
  // AI Assistant states
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [currentTimeline, setCurrentTimeline] = useState<DailyTimeline | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [hasNewRecommendations, setHasNewRecommendations] = useState(false);
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  useEffect(() => {
    // Generate initial timeline on app start
    if (user?.id && !currentTimeline) {
      handleGenerateTimeline();
    }
  }, [user?.id, currentTimeline]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  // AI Assistant Functions
  const handleGenerateTimeline = async () => {
    try {
      setIsGeneratingTimeline(true);
      const timeline = await aiAssistantService.generateDailyTimeline(
        user?.id || '',
        {
          wakeUpTime: '07:00',
          sleepTime: '23:00',
          budgetRange: { min: 100, max: 500 },
          interests: ['food', 'shopping'],
          dietaryRestrictions: [],
          fitnessLevel: 'intermediate' as const,
          socialPreference: 'extrovert' as const,
          preferredActivities: ['yürüyüş', 'müze gezisi', 'restoran'],
          location: {
            city: 'İstanbul',
            latitude: 41.0082,
            longitude: 28.9784
          }
        },
        'neutral'
      );
      setCurrentTimeline(timeline);
      setShowTimeline(true);
    } catch (error) {
      Alert.alert('Hata', 'Timeline oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingTimeline(false);
    }
  };

  const handleGetRecommendations = async () => {
    try {
      const recs = await aiAssistantService.generateRecommendations(
        user?.id || '',
        'genel',
        'neutral'
      );
      setAiRecommendations(recs as unknown as AIRecommendation[]);
      setHasNewRecommendations(true);
    } catch (error) {
      Alert.alert('Hata', 'Öneriler alınırken bir hata oluştu.');
    }
  };

  const handleAcceptRecommendation = (recommendation: AIRecommendation) => {
    Alert.alert(
      'Öneri Kabul Edildi',
      `${recommendation.title} öneriniz kabul edildi ve programınıza eklendi.`,
      [{ text: 'Tamam' }]
    );
  };

  const handleDismissRecommendation = (recommendation: AIRecommendation) => {
    setAiRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
  };

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
        activities_count: Array.isArray(program.program_activities) ? program.program_activities.length : 0,
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

      // Load AI recommendations on startup
      await handleGetRecommendations();

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
        return 'restaurant' as const;
      case 'activity':
        return 'fitness-center' as const;
      case 'product':
        return 'shopping-bag' as const;
      case 'event':
        return 'calendar-today' as const;
      default:
        return 'star' as const;
    }
  };

  if (loading) {
    return (
      <Box flex={1} bg={bgColor}>
        <SafeAreaView style={{ flex: 1 }}>
          <Center flex={1}>
            <VStack space={4} alignItems="center">
              <Spinner size="lg" color="primary.500" />
              <Text color={textColor} fontSize="md">Yükleniyor...</Text>
            </VStack>
          </Center>
        </SafeAreaView>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={bgColor}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          flex={1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <Box px={6} pt={4} pb={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space={3} alignItems="center">
                <Avatar
                  size="md"
                  bg="primary.500"
                  _text={{ color: 'white', fontWeight: 'bold' }}
                >
                  {String(user?.user_metadata?.full_name || 'U').charAt(0)}
                </Avatar>
                <VStack>
                  <Text color={mutedColor} fontSize="sm">Merhaba,</Text>
                  <Heading size="md" color={textColor}>
                    {user?.user_metadata?.full_name || 'Kullanıcı'}
                  </Heading>
                  <Text color={mutedColor} fontSize="xs">
                    Bugün hangi deneyimi yaşamak istiyorsunuz?
                  </Text>
                </VStack>
              </HStack>
              <HStack space={2}>
                <IconButton
                  icon={<MaterialIcons name="chat" size={24} />}
                  onPress={() => navigation.navigate('Chat', {})}
                  variant="ghost"
                  rounded="full"
                  colorScheme="primary"
                />
                <Box position="relative">
                  <IconButton
                    icon={<MaterialIcons name="notifications" size={24} />}
                    onPress={() => navigation.navigate('Notifications')}
                    variant="ghost"
                    rounded="full"
                    colorScheme="primary"
                  />
                  <Badge
                    label="3"
                    position="absolute"
                    top={0}
                    right={0}
                    bg="red.500"
                    rounded={true}
                    minW={4}
                    h={4}
                    _text={{ fontSize: 'xs', color: 'white' }}
                  />
                </Box>
                <IconButton
                  icon={<MaterialIcons name="logout" size={24} />}
                  onPress={signOut}
                  variant="ghost"
                  rounded="full"
                  colorScheme="primary"
                />
              </HStack>
            </HStack>
          </Box>

          {/* Quick Actions */}
          <Box px={6} py={4}>
            <Heading size="md" color={textColor} mb={4}>Hızlı İşlemler</Heading>
            <VStack space={4}>
              <HStack space={3} justifyContent="space-between">
                <Pressable
                  flex={1}
                  onPress={() => navigation.navigate('CreateProgram', {})}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Card variant="glass" padding={4}>
                    <VStack space={2} alignItems="center">
                      <Box bg="primary.100" p={3} rounded="full">
                        <MaterialIcons name="add-circle" size={24} color={theme.colors.primary[500]} />
                      </Box>
                      <Text fontSize="xs" color={textColor} textAlign="center" fontWeight="500">
                        Yeni Program
                      </Text>
                    </VStack>
                  </Card>
                </Pressable>
                
                <Pressable
                  flex={1}
                  onPress={() => navigation.navigate('Explore')}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Card variant="glass" padding={4}>
                    <VStack space={2} alignItems="center">
                      <Box bg="secondary.100" p={3} rounded="full">
                        <MaterialIcons name="explore" size={24} color={theme.colors.secondary[500]} />
                      </Box>
                      <Text fontSize="xs" color={textColor} textAlign="center" fontWeight="500">
                        Keşfet
                      </Text>
                    </VStack>
                  </Card>
                </Pressable>
                
                <Pressable
                  flex={1}
                  onPress={() => navigation.navigate('Program')}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Card variant="glass" padding={4}>
                    <VStack space={2} alignItems="center">
                      <Box bg="warning.100" p={3} rounded="full">
                        <MaterialIcons name="list" size={24} color={theme.colors.warning[500]} />
                      </Box>
                      <Text fontSize="xs" color={textColor} textAlign="center" fontWeight="500">
                        Programlarım
                      </Text>
                    </VStack>
                  </Card>
                </Pressable>
                
                <Pressable
                  flex={1}
                  onPress={() => navigation.navigate('Profile')}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Card variant="glass" padding={4}>
                    <VStack space={2} alignItems="center">
                      <Box bg="success.100" p={3} rounded="full">
                        <MaterialIcons name="person" size={24} color={theme.colors.success[500]} />
                      </Box>
                      <Text fontSize="xs" color={textColor} textAlign="center" fontWeight="500">
                        Profil
                      </Text>
                    </VStack>
                  </Card>
                </Pressable>
              </HStack>
              
              {/* AI Assistant Quick Actions */}
              <HStack space={3} justifyContent="space-between">
                <Pressable
                  flex={1}
                  onPress={() => setShowVoiceAgent(true)}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Card variant="elevated" padding={4}>
                    <VStack space={2} alignItems="center">
                      <Box bg="primary.100" p={3} rounded="full">
                        <MaterialIcons name="mic" size={24} color={theme.colors.primary[500]} />
                      </Box>
                      <Text fontSize="xs" color={textColor} textAlign="center" fontWeight="500">
                        AI Asistan
                      </Text>
                      {hasNewRecommendations && (
                        <Badge colorScheme="danger" rounded={true} variant="solid" label="Yeni">
                          Yeni
                        </Badge>
                      )}
                    </VStack>
                  </Card>
                </Pressable>
                
                <Pressable
                  flex={1}
                  onPress={handleGenerateTimeline}
                  _pressed={{ opacity: 0.8 }}
                  disabled={isGeneratingTimeline}
                >
                  <Card variant="elevated" padding={4}>
                    <VStack space={2} alignItems="center">
                      <Box bg="secondary.100" p={3} rounded="full">
                        {isGeneratingTimeline ? (
                          <Spinner size="sm" color={theme.colors.secondary[500]} />
                        ) : (
                          <MaterialIcons name="calendar-today" size={24} color={theme.colors.secondary[500]} />
                        )}
                      </Box>
                      <Text fontSize="xs" color={textColor} textAlign="center" fontWeight="500">
                        {isGeneratingTimeline ? 'Hazırlanıyor...' : 'Günlük Plan'}
                      </Text>
                    </VStack>
                  </Card>
                </Pressable>
                
                <Pressable
                  flex={1}
                  onPress={handleGetRecommendations}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Card variant="elevated" padding={4}>
                    <VStack space={2} alignItems="center">
                      <Box bg="warning.100" p={3} rounded="full">
                        <MaterialIcons name="auto-awesome" size={24} color={theme.colors.warning[500]} />
                      </Box>
                      <Text fontSize="xs" color={textColor} textAlign="center" fontWeight="500">
                        AI Öneriler
                      </Text>
                    </VStack>
                  </Card>
                </Pressable>
                
                <Pressable
                  flex={1}
                  onPress={() => setShowTimeline(true)}
                  _pressed={{ opacity: 0.8 }}
                  disabled={!currentTimeline}
                >
                  <Card variant="elevated" padding={4} opacity={!currentTimeline ? 0.5 : 1}>
                    <VStack space={2} alignItems="center">
                      <Box bg="success.100" p={3} rounded="full">
                        <MaterialIcons name="timeline" size={24} color={theme.colors.success[500]} />
                      </Box>
                      <Text fontSize="xs" color={textColor} textAlign="center" fontWeight="500">
                        Timeline
                      </Text>
                    </VStack>
                  </Card>
                </Pressable>
              </HStack>
            </VStack>
          </Box>

          {/* User Stats */}
          <Box px={6} py={4}>
            <Heading size="md" color={textColor} mb={4}>İstatistiklerim</Heading>
            <HStack space={4} justifyContent="space-between">
              <Card variant="elevated" flex={1} padding={4}>
                <VStack space={2} alignItems="center">
                  <Box bg="primary.100" p={2} rounded="full">
                    <MaterialIcons name="folder" size={20} color={theme.colors.primary[500]} />
                  </Box>
                  <Heading size="lg" color="primary.500">{userStats.total_programs}</Heading>
                  <Text fontSize="xs" color={mutedColor} textAlign="center">Toplam Program</Text>
                </VStack>
              </Card>
              <Card variant="elevated" flex={1} padding={4}>
                <VStack space={2} alignItems="center">
                  <Box bg="success.100" p={2} rounded="full">
                    <MaterialIcons name="check-circle" size={20} color={theme.colors.success[500]} />
                  </Box>
                  <Heading size="lg" color="success.500">{userStats.completed_programs}</Heading>
                  <Text fontSize="xs" color={mutedColor} textAlign="center">Tamamlanan</Text>
                </VStack>
              </Card>
              <Card variant="elevated" flex={1} padding={4}>
                <VStack space={2} alignItems="center">
                  <Box bg="warning.100" p={2} rounded="full">
                    <MaterialIcons name="savings" size={20} color={theme.colors.warning[500]} />
                  </Box>
                  <Heading size="lg" color="warning.500">₺{userStats.total_savings.toLocaleString()}</Heading>
                  <Text fontSize="xs" color={mutedColor} textAlign="center">Toplam Tasarruf</Text>
                </VStack>
              </Card>
              <Card variant="elevated" flex={1} padding={4}>
                <VStack space={2} alignItems="center">
                  <Box bg="secondary.100" p={2} rounded="full">
                    <MaterialIcons name="local-fire-department" size={20} color={theme.colors.secondary[500]} />
                  </Box>
                  <Heading size="lg" color="secondary.500">{userStats.current_streak}</Heading>
                  <Text fontSize="xs" color={mutedColor} textAlign="center">Günlük Seri</Text>
                </VStack>
              </Card>
            </HStack>
          </Box>

          {/* Recent Programs */}
          <Box px={6} py={4}>
            <HStack justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md" color={textColor}>Son Programlarım</Heading>
              <Pressable
                onPress={() => {
                  Alert.alert('Yakında', 'Tüm programlar özelliği yakında gelecek!');
                }}
              >
                <Text color="primary.500" fontSize="sm" fontWeight="500">
                  Tümünü Gör
                </Text>
              </Pressable>
            </HStack>

            {programs.length === 0 ? (
              <Card variant="glass" padding={8}>
                <VStack space={4} alignItems="center">
                  <MaterialIcons name="description" size={48} color={theme.colors.gray[400]} />
                  <VStack space={2} alignItems="center">
                    <Text fontSize="md" color={textColor} textAlign="center" fontWeight="500">
                      Henüz program oluşturmadınız
                    </Text>
                    <Text fontSize="sm" color={mutedColor} textAlign="center">
                      İlk programınızı oluşturmak için yukarıdaki butonu kullanın
                    </Text>
                  </VStack>
                </VStack>
              </Card>
            ) : (
              <VStack space={3}>
                {programs.slice(0, 3).map((program) => (
                  <Pressable
                    key={program.id}
                    onPress={() => {
                      Alert.alert('Yakında', 'Program detayları özelliği yakında gelecek!');
                    }}
                    _pressed={{ opacity: 0.8 }}
                  >
                    <Card variant="elevated" padding={4}>
                      <VStack space={3}>
                        <HStack justifyContent="space-between" alignItems="flex-start">
                          <VStack space={1} flex={1}>
                            <Heading size="sm" color={textColor}>
                              {program.title}
                            </Heading>
                            <Text fontSize="sm" color={mutedColor}>
                              {new Date(program.date).toLocaleDateString('tr-TR')}
                            </Text>
                            <HStack space={2} alignItems="center">
                              <Text fontSize="xs" color={mutedColor}>
                                {program.activities_count} aktivite
                              </Text>
                              <Text fontSize="xs" color={mutedColor}>•</Text>
                              <Text fontSize="xs" color={mutedColor}>
                                ₺{program.total_budget?.toLocaleString() || 0} bütçe
                              </Text>
                            </HStack>
                          </VStack>
                          <HStack space={2} alignItems="center">
                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation();
                                navigation.navigate('SocialShare', { 
                                  program: {
                                    id: program.id,
                                    title: program.title,
                                    description: program.description || '',
                                    activities: program.activities?.map((activity: any) => ({
                                      id: activity.id,
                                      title: activity.title
                                    })) || []
                                  }
                                });
                              }}
                              _pressed={{ opacity: 0.6 }}
                              p={2}
                            >
                              <MaterialIcons name="share" size={20} color={theme.colors.primary[500]} />
                            </Pressable>
                            <Box
                              bg={`${getStatusColor(program.status)}.500`}
                              px={3}
                              py={1}
                              rounded="md"
                            >
                              <Text fontSize="xs" color="white" fontWeight="500">
                                {getStatusText(program.status)}
                              </Text>
                            </Box>
                          </HStack>
                        </HStack>
                        {program.total_budget > 0 && (
                          <VStack space={2}>
                            <HStack justifyContent="space-between">
                              <Text fontSize="xs" color={mutedColor}>
                                Harcanan: ₺{program.spent_amount?.toLocaleString() || 0}
                              </Text>
                              <Text fontSize="xs" color={mutedColor}>
                                {Math.round(((program.spent_amount || 0) / program.total_budget) * 100)}%
                              </Text>
                            </HStack>
                            <Box bg="gray.200" height={2} rounded="full" overflow="hidden">
                              <Box
                                bg="primary.500"
                                height="100%"
                                width={`${Math.min(((program.spent_amount || 0) / program.total_budget) * 100, 100)}%`}
                                rounded="full"
                              />
                            </Box>
                          </VStack>
                        )}
                      </VStack>
                    </Card>
                  </Pressable>
                ))}
              </VStack>
            )}
          </Box>

          {/* AI Recommendations */}
          <Box px={6} py={4}>
            <HStack justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md" color={textColor}>Size Özel Öneriler</Heading>
              <MaterialIcons name="auto-awesome" size={24} color={theme.colors.primary[500]} />
            </HStack>

            {/* AI Recommendations */}
            {aiRecommendations.length > 0 ? (
              <VStack space={3}>
                {aiRecommendations.slice(0, 3).map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onAccept={() => handleAcceptRecommendation(recommendation)}
                    onDismiss={() => handleDismissRecommendation(recommendation)}
                  />
                ))}
                {aiRecommendations.length > 3 && (
                  <Button
                    variant="ghost"
                    onPress={() => {
                      Alert.alert('Tüm Öneriler', 'Tüm öneriler sayfası yakında gelecek!');
                    }}
                  >
                    <Text color="primary.500">Tüm Önerileri Gör ({aiRecommendations.length})</Text>
                  </Button>
                )}
              </VStack>
            ) : recommendations.length === 0 ? (
              <Card variant="glass" padding={8}>
                <VStack space={4} alignItems="center">
                  <MaterialIcons name="lightbulb-outline" size={48} color={theme.colors.gray[400]} />
                  <VStack space={2} alignItems="center">
                    <Text fontSize="md" color={textColor} textAlign="center" fontWeight="500">
                      AI önerileriniz hazırlanıyor...
                    </Text>
                    <Text fontSize="sm" color={mutedColor} textAlign="center">
                      Sesli asistanla konuşarak kişiselleştirilmiş öneriler alın
                    </Text>
                    <Button
                      mt={3}
                      size="sm"
                      variant="outline"
                      onPress={() => setShowVoiceAgent(true)}
                      leftIcon={<Icon as={Ionicons} name="mic" size="sm" />}
                    >
                      Sesli Asistanla Konuş
                    </Button>
                  </VStack>
                </VStack>
              </Card>
            ) : (
              <VStack space={3}>
                {recommendations.slice(0, 3).map((recommendation) => (
                  <Pressable
                    key={recommendation.id}
                    onPress={() => {
                      Alert.alert('Yakında', 'Öneri detayları özelliği yakında gelecek!');
                    }}
                    _pressed={{ opacity: 0.8 }}
                  >
                    <Card variant="elevated" padding={4}>
                      <HStack space={4} alignItems="center">
                        <Box bg="primary.100" p={3} rounded="full">
                          <MaterialIcons 
                            name={getRecommendationIcon(recommendation.type)} 
                            size={24} 
                            color={theme.colors.primary[500]} 
                          />
                        </Box>
                        <VStack space={1} flex={1}>
                          <Text fontSize="md" color={textColor} fontWeight="600">
                            {recommendation.title}
                          </Text>
                          <Text fontSize="sm" color={mutedColor} numberOfLines={2}>
                            {recommendation.description}
                          </Text>
                          <Text fontSize="xs" color="primary.500" fontWeight="500">
                            {recommendation.reason}
                          </Text>
                        </VStack>
                        <VStack space={1} alignItems="center">
                          <Text fontSize="xs" color={mutedColor}>
                            Match
                          </Text>
                          <Text fontSize="sm" color="primary.500" fontWeight="bold">
                            {Math.round(recommendation.score * 100)}%
                          </Text>
                        </VStack>
                      </HStack>
                    </Card>
                  </Pressable>
                ))}
              </VStack>
            )}
          </Box>

          {/* Coming Soon Features */}
          <Box px={6} py={4} pb={8}>
            <Heading size="md" color={textColor} mb={4}>Yakında Gelecek Özellikler</Heading>
            <VStack space={3}>
              <Card variant="glass" padding={4}>
                <HStack space={4} alignItems="center">
                  <Box bg="info.100" p={3} rounded="full">
                    <MaterialIcons name="map" size={24} color={theme.colors.info[500]} />
                  </Box>
                  <VStack space={1} flex={1}>
                    <Text fontSize="md" color={textColor} fontWeight="600">
                      Harita Entegrasyonu
                    </Text>
                    <Text fontSize="sm" color={mutedColor}>
                      Yakındaki mekanları keşfedin
                    </Text>
                  </VStack>
                </HStack>
              </Card>
              <Pressable onPress={() => {
                if (programs.length > 0) {
                  const program = programs[0];
                  navigation.navigate('SocialShare', { 
                    program: {
                      id: program.id,
                      title: program.title,
                      description: program.description || '',
                      activities: program.activities?.map((activity: any) => ({
                        id: activity.id,
                        title: activity.title
                      })) || []
                    }
                  });
                } else {
                  Alert.alert('Bilgi', 'Paylaşmak için önce bir program oluşturun!');
                }
              }}>
                <Card variant="glass" padding={4}>
                  <HStack space={4} alignItems="center">
                    <Box bg="success.100" p={3} rounded="full">
                      <MaterialIcons name="share" size={24} color={theme.colors.success[500]} />
                    </Box>
                    <VStack space={1} flex={1}>
                      <Text fontSize="md" color={textColor} fontWeight="600">
                        Sosyal Paylaşım
                      </Text>
                      <Text fontSize="sm" color={mutedColor}>
                        Programlarınızı sosyal medyada paylaşın
                      </Text>
                    </VStack>
                    <Icon as={Ionicons} name="chevron-forward" size="sm" color={mutedColor} />
                  </HStack>
                </Card>
              </Pressable>
              <Card variant="glass" padding={4}>
                <HStack space={4} alignItems="center">
                  <Box bg="secondary.100" p={3} rounded="full">
                    <MaterialIcons name="business" size={24} color={theme.colors.secondary[500]} />
                  </Box>
                  <VStack space={1} flex={1}>
                    <Text fontSize="md" color={textColor} fontWeight="600">
                      İşletme Paneli
                    </Text>
                    <Text fontSize="sm" color={mutedColor}>
                      İşletmenizi kaydedin ve müşterilerinize ulaşın
                    </Text>
                  </VStack>
                </HStack>
              </Card>
            </VStack>
          </Box>
        </ScrollView>
        
        {/* AI Voice Assistant FAB */}
        <Fab
          renderInPortal={false}
          shadow={2}
          size="lg"
          icon={<Icon color="white" as={Ionicons} name="mic" size="lg" />}
          onPress={() => setShowVoiceAgent(true)}
          bg="primary.500"
          position="absolute"
          bottom={4}
          right={4}
        />
        
        {/* Timeline FAB */}
        <Fab
          renderInPortal={false}
          shadow={2}
          size="md"
          icon={<Icon color="white" as={Ionicons} name="calendar" size="md" />}
          onPress={() => setShowTimeline(true)}
          bg="secondary.500"
          position="absolute"
          bottom={20}
          right={20}
          isLoading={isGeneratingTimeline}
        >
          {hasNewRecommendations && (
            <Badge
              colorScheme="danger"
              rounded={true}
              mb={-1}
              mr={-1}
              zIndex={1}
              variant="solid"
              alignSelf="flex-end"
              label="!"
              _text={{
                fontSize: 12,
              }}
            >
              !
            </Badge>
          )}
        </Fab>
        
        {/* Voice Agent Modal */}
        <VoiceAgent
          isVisible={showVoiceAgent}
          onClose={() => setShowVoiceAgent(false)}
          onTimelineGenerated={(timeline) => {
            setCurrentTimeline(timeline as unknown as DailyTimeline);
            setShowTimeline(true);
          }}
          onRecommendationsGenerated={(recs: any[]) => {
            setAiRecommendations(recs as unknown as AIRecommendation[]);
            setHasNewRecommendations(true);
          }}
        />
        
        {/* Timeline Modal */}
        {currentTimeline && (
          <TimelineView
            isVisible={showTimeline}
            timeline={currentTimeline}
            onClose={() => setShowTimeline(false)}
            onActivitySelect={(activity) => {
              Alert.alert(
                'Aktivite Seçildi',
                `${activity.title} aktivitesi seçildi ve programınıza eklendi.`,
                [{ text: 'Tamam' }]
              );
            }}
          />
        )}
        
      </SafeAreaView>
    </Box>
  );
};

// HomeScreen component now uses Native Base components with the new design system
// All styles are handled through Native Base's theme system

export default HomeScreen;