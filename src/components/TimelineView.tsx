import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  Pressable,
  Modal,
  Button,
  useTheme,
  useColorModeValue,
  Progress,
  IconButton,
} from 'native-base';
import { Badge } from './ui';
import { MaterialIcons } from '@expo/vector-icons';
import { TimelineActivity, DailyTimeline } from '../services/aiAssistantService';
import { Card } from './ui/Card';

interface TimelineViewProps {
  timeline: DailyTimeline;
  isVisible: boolean;
  onClose: () => void;
  onActivitySelect?: (activity: TimelineActivity) => void;
  onAlternativeSelect?: (activity: TimelineActivity, alternative: TimelineActivity) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  timeline,
  isVisible,
  onClose,
  onActivitySelect,
  onAlternativeSelect,
}) => {
  const theme = useTheme();
  const [selectedActivity, setSelectedActivity] = useState<TimelineActivity | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const getActivityIcon = (type: string) => {
    const icons = {
      breakfast: 'restaurant',
      sport: 'fitness-center',
      shopping: 'shopping-bag',
      entertainment: 'movie',
      work: 'work',
      social: 'people',
      other: 'event',
    };
    return icons[type as keyof typeof icons] || 'event';
  };

  const getActivityColor = (type: string) => {
    const colors = {
      breakfast: 'orange',
      sport: 'green',
      shopping: 'purple',
      entertainment: 'pink',
      work: 'blue',
      social: 'cyan',
      other: 'gray',
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      energetic: 'red',
      relaxed: 'blue',
      social: 'purple',
      productive: 'green',
      creative: 'orange',
      happy: 'yellow',
      stressed: 'red',
      tired: 'gray',
    };
    return colors[mood as keyof typeof colors] || 'gray';
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // HH:MM format
  };

  const formatCurrency = (amount: number) => {
    return `₺${amount.toLocaleString()}`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} dk`;
    }
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}s ${mins}dk` : `${hours}s`;
  };

  const handleActivityPress = (activity: TimelineActivity) => {
    setSelectedActivity(activity);
    if (activity.alternatives && activity.alternatives.length > 0) {
      setShowAlternatives(true);
    }
    onActivitySelect?.(activity);
  };

  const handleAlternativeSelect = (alternative: TimelineActivity) => {
    if (selectedActivity) {
      onAlternativeSelect?.(selectedActivity, alternative);
    }
    setShowAlternatives(false);
    setSelectedActivity(null);
  };

  const renderTimelineHeader = () => (
    <VStack space={4} mb={6}>
      <HStack justifyContent="space-between" alignItems="center">
        <VStack>
          <Heading size="lg" color={textColor}>
            📅 Günlük Timeline
          </Heading>
          <Text fontSize="md" color={mutedColor}>
            {new Date(timeline.date).toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </VStack>
        
        <IconButton
          icon={<MaterialIcons name="close" size={24} />}
          onPress={onClose}
          variant="ghost"
          rounded="full"
        />
      </HStack>

      {/* Budget and Savings Summary */}
      <Card variant="elevated" padding={4}>
        <VStack space={3}>
          <HStack justifyContent="space-between">
            <VStack>
              <Text fontSize="sm" color={mutedColor}>Toplam Bütçe</Text>
              <Text fontSize="xl" fontWeight="bold" color="primary.500">
                {formatCurrency(timeline.totalBudget)}
              </Text>
            </VStack>
            <VStack alignItems="flex-end">
              <Text fontSize="sm" color={mutedColor}>Tahmini Tasarruf</Text>
              <Text fontSize="xl" fontWeight="bold" color="green.500">
                {formatCurrency(timeline.estimatedSavings)}
              </Text>
            </VStack>
          </HStack>
          
          <Progress
            value={(timeline.estimatedSavings / timeline.totalBudget) * 100}
            colorScheme="green"
            size="sm"
            rounded="full"
          />
        </VStack>
      </Card>

      {/* Mood Analysis */}
      <Card variant="glass" padding={4}>
        <VStack space={3}>
          <HStack space={3} alignItems="center">
            <Box
              bg={`${getMoodColor(timeline.moodAnalysis.primary)}.100`}
              p={2}
              rounded="full"
            >
              <MaterialIcons
                name="psychology"
                size={20}
                color={(theme.colors[getMoodColor(timeline.moodAnalysis.primary) as keyof typeof theme.colors] as any)?.[500] || theme.colors.gray[500]}
              />
            </Box>
            <VStack flex={1}>
              <Text fontSize="md" fontWeight="bold" color={textColor}>
                Ruh Hali Analizi
              </Text>
              <HStack space={2}>
                <Badge
                  label={timeline.moodAnalysis.primary}
                  colorScheme={getMoodColor(timeline.moodAnalysis.primary) as 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'}
                  variant="solid"
                  rounded={true}
                />
                <Badge
                  label={timeline.moodAnalysis.secondary}
                  colorScheme={getMoodColor(timeline.moodAnalysis.secondary) as 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'}
                  variant="outline"
                  rounded={true}
                />
              </HStack>
            </VStack>
          </HStack>
          
          {timeline.moodAnalysis.recommendations.length > 0 && (
            <VStack space={1}>
              <Text fontSize="sm" fontWeight="500" color={textColor}>
                Öneriler:
              </Text>
              {timeline.moodAnalysis.recommendations.map((rec, index) => (
                <Text key={index} fontSize="sm" color={mutedColor}>
                  • {rec}
                </Text>
              ))}
            </VStack>
          )}
        </VStack>
      </Card>
    </VStack>
  );

  const renderActivity = (activity: TimelineActivity, index: number) => {
    const isLast = index === timeline.activities.length - 1;
    const activityColor = getActivityColor(activity.type);
    
    return (
      <HStack key={activity.id} space={4} mb={isLast ? 0 : 6}>
        {/* Timeline Line */}
        <VStack alignItems="center">
          <Box
            size={12}
            bg={`${activityColor}.500`}
            rounded="full"
            justifyContent="center"
            alignItems="center"
            shadow={2}
          >
            <MaterialIcons
              name={getActivityIcon(activity.type) as keyof typeof MaterialIcons.glyphMap}
              size={20}
              color="white"
            />
          </Box>
          {!isLast && (
            <Box
              width={0.5}
              height={16}
              bg="gray.300"
              mt={2}
            />
          )}
        </VStack>

        {/* Activity Content */}
        <Pressable
          flex={1}
          onPress={() => handleActivityPress(activity)}
          _pressed={{ opacity: 0.8 }}
        >
          <Card variant="elevated" padding={4}>
            <VStack space={3}>
              {/* Time and Title */}
              <HStack justifyContent="space-between" alignItems="flex-start">
                <VStack flex={1} space={1}>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    {activity.title}
                  </Text>
                  <Text fontSize="sm" color={mutedColor}>
                    {activity.description}
                  </Text>
                </VStack>
                
                <VStack alignItems="flex-end" space={1}>
                  <Badge 
                    label={`${formatTime(activity.startTime)} - ${formatTime(activity.endTime)}`}
                    colorScheme={activityColor as 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'} 
                    variant="solid" 
                    rounded={false}
                  />
                  <Text fontSize="xs" color={mutedColor}>
                    {calculateDuration(activity.startTime, activity.endTime)}
                  </Text>
                </VStack>
              </HStack>

              {/* Location */}
              {activity.location && (
                <HStack space={2} alignItems="center">
                  <MaterialIcons name="location-on" size={16} color={theme.colors.gray[500]} />
                  <VStack flex={1}>
                    <Text fontSize="sm" fontWeight="500" color={textColor}>
                      {activity.location.name}
                    </Text>
                    <Text fontSize="xs" color={mutedColor}>
                      {activity.location.address}
                    </Text>
                  </VStack>
                </HStack>
              )}

              {/* Budget and Discount */}
              <HStack justifyContent="space-between" alignItems="center">
                {activity.budget && (
                  <HStack space={2} alignItems="center">
                    <MaterialIcons name="account-balance-wallet" size={16} color={theme.colors.gray[500]} />
                    <Text fontSize="sm" color={textColor}>
                      {formatCurrency(activity.budget.min)} - {formatCurrency(activity.budget.max)}
                    </Text>
                  </HStack>
                )}
                
                {activity.discount && (
                  <Badge 
                    label={`%${activity.discount.percentage} İndirim`}
                    colorScheme="danger" 
                    variant="solid" 
                    rounded={true}
                  />
                )}
              </HStack>

              {/* Alternatives Indicator */}
              {activity.alternatives && activity.alternatives.length > 0 && (
                <HStack space={2} alignItems="center" justifyContent="center" mt={2}>
                  <MaterialIcons name="swap-horiz" size={16} color={theme.colors.primary[500]} />
                  <Text fontSize="xs" color="primary.500" fontWeight="500">
                    {activity.alternatives.length} alternatif mevcut
                  </Text>
                </HStack>
              )}
            </VStack>
          </Card>
        </Pressable>
      </HStack>
    );
  };

  const renderAlternativesModal = () => (
    <Modal isOpen={showAlternatives} onClose={() => setShowAlternatives(false)} size="lg">
      <Modal.Content>
        <Modal.Header>
          <Text fontSize="lg" fontWeight="bold">
            🔄 Alternatif Seçenekler
          </Text>
        </Modal.Header>
        
        <Modal.Body>
          <VStack space={3}>
            {selectedActivity?.alternatives?.map((alternative, index) => (
              <Pressable
                key={`alt_${index}`}
                onPress={() => handleAlternativeSelect(alternative)}
                _pressed={{ opacity: 0.8 }}
              >
                <Card variant="outline" padding={4}>
                  <VStack space={2}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="md" fontWeight="bold" color={textColor}>
                        {alternative.title}
                      </Text>
                      {alternative.budget && (
                        <Text fontSize="sm" color="primary.500" fontWeight="500">
                          {formatCurrency(alternative.budget.min)} - {formatCurrency(alternative.budget.max)}
                        </Text>
                      )}
                    </HStack>
                    
                    <Text fontSize="sm" color={mutedColor}>
                      {alternative.description}
                    </Text>
                    
                    {alternative.location && (
                      <HStack space={1} alignItems="center">
                        <MaterialIcons name="location-on" size={14} color={theme.colors.gray[500]} />
                        <Text fontSize="xs" color={mutedColor}>
                          {alternative.location.name}
                        </Text>
                      </HStack>
                    )}
                    
                    {alternative.discount && (
                      <Badge 
                        label={`%${alternative.discount.percentage} İndirim`}
                        colorScheme="danger" 
                        variant="solid" 
                        rounded={true} 
                        alignSelf="flex-start"
                      />
                    )}
                  </VStack>
                </Card>
              </Pressable>
            ))}
          </VStack>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="ghost" onPress={() => setShowAlternatives(false)}>
            İptal
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );

  return (
    <>
      <Modal isOpen={isVisible} onClose={onClose} size="full">
        <Modal.Content bg={bgColor} maxH="95%" mt="auto" mb={0} roundedTop="3xl">
          <Modal.Body px={6} py={6} flex={1}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderTimelineHeader()}
              
              <VStack space={0}>
                {timeline.activities.map((activity, index) => 
                  renderActivity(activity, index)
                )}
              </VStack>
              
              {/* Action Buttons */}
              <VStack space={3} mt={8} mb={4}>
                <Button
                  colorScheme="primary"
                  size="lg"
                  leftIcon={<MaterialIcons name="save" size={20} color="white" />}
                  onPress={() => {
                    // Save timeline logic
                    console.log('Timeline saved');
                  }}
                >
                  Timeline'ı Kaydet
                </Button>
                
                <Button
                  variant="outline"
                  colorScheme="primary"
                  size="lg"
                  leftIcon={<MaterialIcons name="share" size={20} />}
                  onPress={() => {
                    // Share timeline logic
                    console.log('Timeline shared');
                  }}
                >
                  Paylaş
                </Button>
              </VStack>
            </ScrollView>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      
      {renderAlternativesModal()}
    </>
  );
};

export default TimelineView;