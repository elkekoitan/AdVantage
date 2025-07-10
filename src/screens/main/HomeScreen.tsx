import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ScrollView,
  Icon,
  Avatar,
  Card,
  Pressable,
  Badge,
  Progress,
  useToast,
  Skeleton,
  Divider,
  Center,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RefreshControl } from 'react-native';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

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

export const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  const toast = useToast();

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
      const transformedPrograms = programsData?.map((program: any) => ({
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
      const completedPrograms = programsData?.filter(p => p.status === 'completed').length || 0;
      const totalSavings = programsData?.reduce((sum, p) => sum + (p.total_budget - p.spent_amount), 0) || 0;

      setUserStats({
        total_programs: totalPrograms,
        completed_programs: completedPrograms,
        total_savings: totalSavings,
        referral_earnings: 0, // This would come from transactions table
        current_streak: 5, // This would be calculated based on consecutive days
      });

    } catch (error: any) {
      toast.show({
        title: 'Hata',
        description: 'Veriler yüklenirken bir hata oluştu.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

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
        return 'restaurant';
      case 'activity':
        return 'local-activity';
      case 'product':
        return 'shopping-bag';
      case 'event':
        return 'event';
      default:
        return 'star';
    }
  };

  if (loading) {
    return (
      <Box flex={1} bg="gray.50" safeArea>
        <ScrollView p={4}>
          <VStack space={4}>
            <Skeleton h="20" rounded="md" />
            <HStack space={4}>
              <Skeleton flex={1} h="24" rounded="md" />
              <Skeleton flex={1} h="24" rounded="md" />
            </HStack>
            <Skeleton h="40" rounded="md" />
            <Skeleton h="32" rounded="md" />
          </VStack>
        </ScrollView>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="gray.50" safeArea>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Box bg="primary.600" px={4} py={6}>
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={3} alignItems="center">
              <Avatar
                bg="white"
                size="md"
                source={{
                  uri: user?.user_metadata?.avatar_url,
                }}
              >
                {user?.user_metadata?.full_name?.charAt(0) || 'U'}
              </Avatar>
              <VStack>
                <Text color="white" fontSize="lg" fontWeight="semibold">
                  Merhaba, {user?.user_metadata?.full_name || 'Kullanıcı'}!
                </Text>
                <Text color="primary.100" fontSize="sm">
                  Bugün hangi deneyimi yaşamak istiyorsunuz?
                </Text>
              </VStack>
            </HStack>
            <Pressable onPress={signOut}>
              <Icon
                as={MaterialIcons}
                name="logout"
                size={6}
                color="white"
              />
            </Pressable>
          </HStack>
        </Box>

        <VStack space={4} p={4}>
          {/* Quick Actions */}
          <Card>
            <VStack space={4} p={4}>
              <Heading size="md" color="gray.700">
                Hızlı İşlemler
              </Heading>
              <HStack space={3} justifyContent="space-around">
                <Button
                  flex={1}
                  leftIcon={<Icon as={MaterialIcons} name="add" size={5} />}
                  colorScheme="primary"
                  onPress={() => {
                    // Navigate to program creation
                    toast.show({
                      title: 'Yakında',
                      description: 'Program oluşturma özelliği yakında gelecek!',
                    });
                  }}
                >
                  Program Oluştur
                </Button>
                <Button
                  flex={1}
                  leftIcon={<Icon as={MaterialIcons} name="explore" size={5} />}
                  variant="outline"
                  colorScheme="primary"
                  onPress={() => {
                    // Navigate to explore
                    toast.show({
                      title: 'Yakında',
                      description: 'Keşfet özelliği yakında gelecek!',
                    });
                  }}
                >
                  Keşfet
                </Button>
              </HStack>
            </VStack>
          </Card>

          {/* User Stats */}
          <Card>
            <VStack space={4} p={4}>
              <Heading size="md" color="gray.700">
                İstatistiklerim
              </Heading>
              <HStack space={4} justifyContent="space-around">
                <VStack alignItems="center" space={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="primary.600">
                    {userStats.total_programs}
                  </Text>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    Toplam Program
                  </Text>
                </VStack>
                <VStack alignItems="center" space={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {userStats.completed_programs}
                  </Text>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    Tamamlanan
                  </Text>
                </VStack>
                <VStack alignItems="center" space={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                    ₺{userStats.total_savings.toLocaleString()}
                  </Text>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    Toplam Tasarruf
                  </Text>
                </VStack>
                <VStack alignItems="center" space={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {userStats.current_streak}
                  </Text>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    Günlük Seri
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>

          {/* Recent Programs */}
          <Card>
            <VStack space={4} p={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Heading size="md" color="gray.700">
                  Son Programlarım
                </Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="primary"
                  onPress={() => {
                    // Navigate to programs list
                    toast.show({
                      title: 'Yakında',
                      description: 'Program listesi özelliği yakında gelecek!',
                    });
                  }}
                >
                  Tümünü Gör
                </Button>
              </HStack>

              {programs.length === 0 ? (
                <Center py={8}>
                  <Icon
                    as={MaterialIcons}
                    name="event-note"
                    size={12}
                    color="gray.400"
                  />
                  <Text color="gray.500" mt={2}>
                    Henüz program oluşturmadınız
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="primary"
                    mt={3}
                    onPress={() => {
                      // Navigate to program creation
                      toast.show({
                        title: 'Yakında',
                        description: 'Program oluşturma özelliği yakında gelecek!',
                      });
                    }}
                  >
                    İlk Programınızı Oluşturun
                  </Button>
                </Center>
              ) : (
                <VStack space={3}>
                  {programs.map((program) => (
                    <Pressable
                      key={program.id}
                      onPress={() => {
                        // Navigate to program details
                        toast.show({
                          title: 'Yakında',
                          description: 'Program detayları özelliği yakında gelecek!',
                        });
                      }}
                    >
                      <Box
                        bg="white"
                        p={4}
                        rounded="md"
                        borderWidth={1}
                        borderColor="gray.200"
                      >
                        <HStack justifyContent="space-between" alignItems="center">
                          <VStack flex={1} space={1}>
                            <Text fontSize="md" fontWeight="semibold">
                              {program.title}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {new Date(program.date).toLocaleDateString('tr-TR')}
                            </Text>
                            <HStack space={2} alignItems="center">
                              <Text fontSize="xs" color="gray.500">
                                {program.activities_count} aktivite
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                •
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                ₺{program.total_budget?.toLocaleString() || 0} bütçe
                              </Text>
                            </HStack>
                          </VStack>
                          <Badge
                            colorScheme={getStatusColor(program.status)}
                            variant="solid"
                            rounded="full"
                          >
                            {getStatusText(program.status)}
                          </Badge>
                        </HStack>
                        {program.total_budget > 0 && (
                          <VStack space={1} mt={3}>
                            <HStack justifyContent="space-between">
                              <Text fontSize="xs" color="gray.500">
                                Harcanan: ₺{program.spent_amount?.toLocaleString() || 0}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {Math.round(((program.spent_amount || 0) / program.total_budget) * 100)}%
                              </Text>
                            </HStack>
                            <Progress
                              value={(program.spent_amount || 0)}
                              max={program.total_budget}
                              colorScheme="primary"
                              size="sm"
                            />
                          </VStack>
                        )}
                      </Box>
                    </Pressable>
                  ))}
                </VStack>
              )}
            </VStack>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <VStack space={4} p={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Heading size="md" color="gray.700">
                  Size Özel Öneriler
                </Heading>
                <Icon
                  as={MaterialIcons}
                  name="auto-awesome"
                  size={6}
                  color="primary.600"
                />
              </HStack>

              {recommendations.length === 0 ? (
                <Center py={8}>
                  <Icon
                    as={MaterialIcons}
                    name="lightbulb"
                    size={12}
                    color="gray.400"
                  />
                  <Text color="gray.500" mt={2} textAlign="center">
                    AI önerileriniz hazırlanıyor...
                  </Text>
                  <Text fontSize="sm" color="gray.400" mt={1} textAlign="center">
                    Daha fazla program oluşturun ve kişiselleştirilmiş öneriler alın
                  </Text>
                </Center>
              ) : (
                <VStack space={3}>
                  {recommendations.slice(0, 3).map((recommendation) => (
                    <Pressable
                      key={recommendation.id}
                      onPress={() => {
                        // Handle recommendation tap
                        toast.show({
                          title: 'Yakında',
                          description: 'Öneri detayları özelliği yakında gelecek!',
                        });
                      }}
                    >
                      <Box
                        bg="white"
                        p={4}
                        rounded="md"
                        borderWidth={1}
                        borderColor="gray.200"
                      >
                        <HStack space={3} alignItems="center">
                          <Icon
                            as={MaterialIcons}
                            name={getRecommendationIcon(recommendation.type)}
                            size={8}
                            color="primary.600"
                          />
                          <VStack flex={1} space={1}>
                            <Text fontSize="md" fontWeight="semibold">
                              {recommendation.title}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {recommendation.description}
                            </Text>
                            <Text fontSize="xs" color="primary.600">
                              {recommendation.reason}
                            </Text>
                          </VStack>
                          <VStack alignItems="center">
                            <Text fontSize="xs" color="gray.500">
                              Match
                            </Text>
                            <Text fontSize="sm" fontWeight="bold" color="primary.600">
                              {Math.round(recommendation.score * 100)}%
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    </Pressable>
                  ))}
                </VStack>
              )}
            </VStack>
          </Card>

          {/* Coming Soon Features */}
          <Card>
            <VStack space={4} p={4}>
              <Heading size="md" color="gray.700">
                Yakında Gelecek Özellikler
              </Heading>
              <VStack space={3}>
                <HStack space={3} alignItems="center">
                  <Icon
                    as={MaterialIcons}
                    name="map"
                    size={6}
                    color="blue.600"
                  />
                  <VStack flex={1}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Harita Entegrasyonu
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Yakındaki mekanları keşfedin
                    </Text>
                  </VStack>
                </HStack>
                <Divider />
                <HStack space={3} alignItems="center">
                  <Icon
                    as={MaterialIcons}
                    name="share"
                    size={6}
                    color="green.600"
                  />
                  <VStack flex={1}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Sosyal Paylaşım
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Programlarınızı sosyal medyada paylaşın
                    </Text>
                  </VStack>
                </HStack>
                <Divider />
                <HStack space={3} alignItems="center">
                  <Icon
                    as={MaterialIcons}
                    name="business"
                    size={6}
                    color="purple.600"
                  />
                  <VStack flex={1}>
                    <Text fontSize="sm" fontWeight="semibold">
                      İşletme Paneli
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      İşletmenizi kaydedin ve müşterilerinize ulaşın
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>
    </Box>
  );
}; 