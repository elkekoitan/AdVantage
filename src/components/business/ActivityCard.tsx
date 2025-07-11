import React from 'react';
import { VStack, HStack, Text, Pressable } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Badge, Button } from '../ui';

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  current_amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  created_at: string;
  completed_at?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  notes?: string;
}

interface ActivityCardProps {
  activity: Activity;
  onPress?: (activity: Activity) => void;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activity: Activity) => void;
  onToggleComplete?: (activity: Activity) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  onEdit,
  onDelete,
  onToggleComplete,
  variant = 'default',
  showActions = true,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'pending':
        return 'Beklemede';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Acil';
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return 'Bilinmiyor';
    }
  };

  const getProgressPercentage = () => {
    if (activity.target_amount === 0) return 0;
    return Math.min((activity.current_amount / activity.target_amount) * 100, 100);
  };

  const isOverdue = () => {
    if (!activity.due_date || activity.status === 'completed') return false;
    return new Date(activity.due_date) < new Date();
  };

  const getDaysRemaining = () => {
    if (!activity.due_date || activity.status === 'completed') return null;
    const today = new Date();
    const dueDate = new Date(activity.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (variant === 'compact') {
    return (
      <Card onPress={onPress ? () => onPress(activity) : undefined} variant="outline">
        <HStack space={3} alignItems="center">
          <Pressable
            onPress={onToggleComplete ? () => onToggleComplete(activity) : undefined}
            p={1}
          >
            <MaterialIcons
              name={activity.status === 'completed' ? 'check-circle' : 'radio-button-unchecked'}
              size={24}
              color={activity.status === 'completed' ? '#10B981' : '#9CA3AF'}
            />
          </Pressable>
          
          <VStack flex={1} space={1}>
            <Text
              fontSize="md"
              fontWeight="600"
              color={activity.status === 'completed' ? 'gray.500' : 'gray.800'}
              strikeThrough={activity.status === 'completed'}
              numberOfLines={1}
            >
              {activity.title}
            </Text>
            
            <HStack alignItems="center" space={2}>
              <Badge
                label={activity.category}
                colorScheme="primary"
                size="sm"
                variant="subtle"
              />
              
              <Text fontSize="sm" fontWeight="600" color="success.600">
                {formatCurrency(activity.current_amount)} / {formatCurrency(activity.target_amount)}
              </Text>
            </HStack>
          </VStack>
          
          <VStack alignItems="flex-end" space={1}>
            <Badge
              label={getStatusText(activity.status)}
              colorScheme={getStatusColor(activity.status)}
              size="sm"
            />
            
            {activity.due_date && (
              <Text fontSize="xs" color={isOverdue() ? 'error.500' : 'gray.500'}>
                {formatDate(activity.due_date)}
              </Text>
            )}
          </VStack>
        </HStack>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card onPress={onPress ? () => onPress(activity) : undefined}>
        <VStack space={4}>
          <HStack justifyContent="space-between" alignItems="flex-start">
            <HStack space={3} alignItems="flex-start" flex={1}>
              <Pressable
                onPress={onToggleComplete ? () => onToggleComplete(activity) : undefined}
                p={1}
                mt={-1}
              >
                <MaterialIcons
                  name={activity.status === 'completed' ? 'check-circle' : 'radio-button-unchecked'}
                  size={24}
                  color={activity.status === 'completed' ? '#10B981' : '#9CA3AF'}
                />
              </Pressable>
              
              <VStack flex={1} space={2}>
                <Text
                  fontSize="lg"
                  fontWeight="700"
                  color={activity.status === 'completed' ? 'gray.500' : 'gray.800'}
                  strikeThrough={activity.status === 'completed'}
                >
                  {activity.title}
                </Text>
                
                <Text fontSize="sm" color="gray.600">
                  {activity.description}
                </Text>
                
                <HStack alignItems="center" space={2} flexWrap="wrap">
                  <Badge
                    label={activity.category}
                    colorScheme="primary"
                    size="sm"
                    variant="subtle"
                    leftIcon="category"
                  />
                  
                  <Badge
                    label={getPriorityText(activity.priority)}
                    colorScheme={getPriorityColor(activity.priority)}
                    size="sm"
                    variant="outline"
                    leftIcon="flag"
                  />
                  
                  {activity.tags?.map((tag, index) => (
                    <Badge
                      key={index}
                      label={tag}
                      colorScheme="gray"
                      size="sm"
                      variant="subtle"
                    />
                  ))}
                </HStack>
              </VStack>
            </HStack>
            
            <Badge
              label={getStatusText(activity.status)}
              colorScheme={getStatusColor(activity.status)}
              size="md"
            />
          </HStack>
          
          <VStack space={3}>
            <VStack space={2}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" fontWeight="600" color="gray.700">
                  İlerleme
                </Text>
                <Text fontSize="sm" fontWeight="600" color="gray.700">
                  {getProgressPercentage().toFixed(0)}%
                </Text>
              </HStack>
              
              <VStack space={1}>
                <HStack
                  h={2}
                  bg="gray.200"
                  borderRadius={4}
                  overflow="hidden"
                >
                  <HStack
                    w={`${getProgressPercentage()}%`}
                    bg={activity.status === 'completed' ? 'success.500' : 'primary.500'}
                    borderRadius={4}
                  />
                </HStack>
                
                <HStack justifyContent="space-between">
                  <Text fontSize="xs" color="gray.500">
                    {formatCurrency(activity.current_amount)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {formatCurrency(activity.target_amount)}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
            
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="xs" color="gray.500">
                  Oluşturulma
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {formatDate(activity.created_at)}
                </Text>
              </VStack>
              
              {activity.due_date && (
                <VStack alignItems="flex-end">
                  <Text fontSize="xs" color="gray.500">
                    {isOverdue() ? 'Gecikti' : 'Bitiş Tarihi'}
                  </Text>
                  <Text fontSize="sm" color={isOverdue() ? 'error.500' : 'gray.700'}>
                    {formatDate(activity.due_date)}
                    {getDaysRemaining() !== null && (
                      <Text fontSize="xs" color={isOverdue() ? 'error.500' : 'gray.500'}>
                        {' '}({getDaysRemaining()! > 0 ? `${getDaysRemaining()} gün kaldı` : 'Bugün bitiyor'})
                      </Text>
                    )}
                  </Text>
                </VStack>
              )}
              
              {activity.completed_at && (
                <VStack alignItems="flex-end">
                  <Text fontSize="xs" color="gray.500">
                    Tamamlanma
                  </Text>
                  <Text fontSize="sm" color="success.600">
                    {formatDate(activity.completed_at)}
                  </Text>
                </VStack>
              )}
            </HStack>
            
            {activity.notes && (
              <VStack space={1}>
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                  Notlar
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {activity.notes}
                </Text>
              </VStack>
            )}
          </VStack>
          
          {showActions && (onEdit || onDelete) && (
            <HStack space={2} justifyContent="flex-end">
              {onEdit && (
                <Button
                  title="Düzenle"
                  variant="outline"
                  size="sm"
                  colorScheme="primary"
                  leftIcon="edit"
                  onPress={() => onEdit(activity)}
                />
              )}
              
              {onDelete && (
                <Button
                  title="Sil"
                  variant="outline"
                  size="sm"
                  colorScheme="error"
                  leftIcon="delete"
                  onPress={() => onDelete(activity)}
                />
              )}
            </HStack>
          )}
        </VStack>
      </Card>
    );
  }

  // Default variant
  return (
    <Card onPress={onPress ? () => onPress(activity) : undefined}>
      <VStack space={3}>
        <HStack justifyContent="space-between" alignItems="flex-start">
          <HStack space={3} alignItems="flex-start" flex={1}>
            <Pressable
              onPress={onToggleComplete ? () => onToggleComplete(activity) : undefined}
              p={1}
              mt={-1}
            >
              <MaterialIcons
                name={activity.status === 'completed' ? 'check-circle' : 'radio-button-unchecked'}
                size={20}
                color={activity.status === 'completed' ? '#10B981' : '#9CA3AF'}
              />
            </Pressable>
            
            <VStack flex={1} space={1}>
              <Text
                fontSize="md"
                fontWeight="600"
                color={activity.status === 'completed' ? 'gray.500' : 'gray.800'}
                strikeThrough={activity.status === 'completed'}
                numberOfLines={2}
              >
                {activity.title}
              </Text>
              
              <Text fontSize="sm" color="gray.600" numberOfLines={2}>
                {activity.description}
              </Text>
            </VStack>
          </HStack>
          
          <Badge
            label={getStatusText(activity.status)}
            colorScheme={getStatusColor(activity.status)}
            size="sm"
          />
        </HStack>
        
        <VStack space={2}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="xs" color="gray.500">
              İlerleme: {getProgressPercentage().toFixed(0)}%
            </Text>
            <Text fontSize="sm" fontWeight="600" color="success.600">
              {formatCurrency(activity.current_amount)} / {formatCurrency(activity.target_amount)}
            </Text>
          </HStack>
          
          <HStack
            h={1.5}
            bg="gray.200"
            borderRadius={2}
            overflow="hidden"
          >
            <HStack
              w={`${getProgressPercentage()}%`}
              bg={activity.status === 'completed' ? 'success.500' : 'primary.500'}
              borderRadius={2}
            />
          </HStack>
        </VStack>
        
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={2}>
            <Badge
              label={activity.category}
              colorScheme="primary"
              size="sm"
              variant="subtle"
            />
            
            <Badge
              label={getPriorityText(activity.priority)}
              colorScheme={getPriorityColor(activity.priority)}
              size="sm"
              variant="outline"
            />
          </HStack>
          
          {activity.due_date && (
            <Text fontSize="xs" color={isOverdue() ? 'error.500' : 'gray.500'}>
              {isOverdue() ? 'Gecikti' : formatDate(activity.due_date)}
            </Text>
          )}
        </HStack>
        
        {showActions && (onEdit || onDelete) && (
          <HStack space={2} justifyContent="flex-end" pt={2} borderTopWidth={1} borderTopColor="gray.100">
            {onEdit && (
              <Pressable
                onPress={() => onEdit(activity)}
                p={2}
                borderRadius={6}
                _pressed={{ bg: 'gray.100' }}
              >
                <MaterialIcons name="edit" size={16} color="#6B7280" />
              </Pressable>
            )}
            
            {onDelete && (
              <Pressable
                onPress={() => onDelete(activity)}
                p={2}
                borderRadius={6}
                _pressed={{ bg: 'gray.100' }}
              >
                <MaterialIcons name="delete" size={16} color="#EF4444" />
              </Pressable>
            )}
          </HStack>
        )}
      </VStack>
    </Card>
  );
};