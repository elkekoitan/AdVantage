import React from 'react';
import { VStack, HStack, Text, Progress, Pressable } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, Badge, StatusBadge } from '../ui';

interface Program {
  id: string;
  title: string;
  description: string;
  total_budget: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'paused';
  category: string;
  activities_count: number;
  progress_percentage: number;
}

interface ProgramCardProps {
  program: Program;
  onPress?: (program: Program) => void;
  onEdit?: (program: Program) => void;
  onDelete?: (program: Program) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  onPress,
  onEdit,
  onDelete,
  variant = 'default',
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getRemainingDays = () => {
    const endDate = new Date(program.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const remainingDays = getRemainingDays();
  const progressColor = program.progress_percentage >= 80 ? 'success' : program.progress_percentage >= 50 ? 'warning' : 'primary';

  if (variant === 'compact') {
    return (
      <Card onPress={onPress ? () => onPress(program) : undefined} variant="outline">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack flex={1} space={1}>
            <Text fontSize="md" fontWeight="600" color="gray.800" numberOfLines={1}>
              {program.title}
            </Text>
            <HStack alignItems="center" space={2}>
              <StatusBadge status={program.status} size="sm" />
              <Text fontSize="xs" color="gray.500">
                {program.activities_count} aktivite
              </Text>
            </HStack>
          </VStack>
          <VStack alignItems="flex-end" space={1}>
            <Text fontSize="sm" fontWeight="600" color="gray.800">
              {formatCurrency(program.spent_amount)}
            </Text>
            <Text fontSize="xs" color="gray.500">
              / {formatCurrency(program.total_budget)}
            </Text>
          </VStack>
        </HStack>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card onPress={onPress ? () => onPress(program) : undefined}>
        <VStack space={4}>
          <Card.Header
            title={program.title}
            subtitle={program.description}
            rightElement={
              <HStack space={1}>
                {onEdit && (
                  <Pressable
                    onPress={() => onEdit(program)}
                    p={2}
                    borderRadius="md"
                    _pressed={{ bg: 'gray.100' }}
                  >
                    <MaterialIcons name="edit" size={18} color="#6B7280" />
                  </Pressable>
                )}
                {onDelete && (
                  <Pressable
                    onPress={() => onDelete(program)}
                    p={2}
                    borderRadius="md"
                    _pressed={{ bg: 'gray.100' }}
                  >
                    <MaterialIcons name="delete" size={18} color="#EF4444" />
                  </Pressable>
                )}
              </HStack>
            }
          />
          
          <Card.Body>
            <VStack space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <StatusBadge status={program.status} />
                <Badge label={program.category} variant="subtle" colorScheme="primary" size="sm" />
              </HStack>
              
              <VStack space={2}>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.600">
                    İlerleme
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color={`${progressColor}.600`}>
                    %{program.progress_percentage}
                  </Text>
                </HStack>
                <Progress
                  value={program.progress_percentage}
                  colorScheme={progressColor}
                  size="sm"
                  borderRadius="full"
                />
              </VStack>
              
              <HStack justifyContent="space-between">
                <VStack>
                  <Text fontSize="xs" color="gray.500">
                    Harcanan
                  </Text>
                  <Text fontSize="md" fontWeight="600" color="gray.800">
                    {formatCurrency(program.spent_amount)}
                  </Text>
                </VStack>
                <VStack alignItems="flex-end">
                  <Text fontSize="xs" color="gray.500">
                    Toplam Bütçe
                  </Text>
                  <Text fontSize="md" fontWeight="600" color="gray.800">
                    {formatCurrency(program.total_budget)}
                  </Text>
                </VStack>
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontSize="xs" color="gray.500">
                    Başlangıç
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    {formatDate(program.start_date)}
                  </Text>
                </VStack>
                <VStack alignItems="center">
                  <Text fontSize="xs" color="gray.500">
                    Kalan Gün
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color={remainingDays <= 7 ? 'error.600' : 'gray.700'}>
                    {remainingDays > 0 ? `${remainingDays} gün` : 'Süresi doldu'}
                  </Text>
                </VStack>
                <VStack alignItems="flex-end">
                  <Text fontSize="xs" color="gray.500">
                    Bitiş
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    {formatDate(program.end_date)}
                  </Text>
                </VStack>
              </HStack>
              
              <HStack alignItems="center" space={2}>
                <MaterialIcons name="assignment" size={16} color="#6B7280" />
                <Text fontSize="sm" color="gray.600">
                  {program.activities_count} aktivite
                </Text>
              </HStack>
            </VStack>
          </Card.Body>
        </VStack>
      </Card>
    );
  }

  // Default variant
  return (
    <Card onPress={onPress ? () => onPress(program) : undefined}>
      <VStack space={3}>
        <Card.Header
          title={program.title}
          subtitle={program.description}
          rightElement={
            <HStack space={1}>
              {onEdit && (
                <Pressable
                  onPress={() => onEdit(program)}
                  p={1}
                  borderRadius="md"
                  _pressed={{ bg: 'gray.100' }}
                >
                  <MaterialIcons name="edit" size={16} color="#6B7280" />
                </Pressable>
              )}
              {onDelete && (
                <Pressable
                  onPress={() => onDelete(program)}
                  p={1}
                  borderRadius="md"
                  _pressed={{ bg: 'gray.100' }}
                >
                  <MaterialIcons name="delete" size={16} color="#EF4444" />
                </Pressable>
              )}
            </HStack>
          }
        />
        
        <Card.Body>
          <VStack space={3}>
            <HStack justifyContent="space-between" alignItems="center">
              <StatusBadge status={program.status} size="sm" />
              <Text fontSize="xs" color="gray.500">
                {program.activities_count} aktivite
              </Text>
            </HStack>
            
            <VStack space={2}>
              <HStack justifyContent="space-between">
                <Text fontSize="sm" color="gray.600">
                  İlerleme
                </Text>
                <Text fontSize="sm" fontWeight="600" color={`${progressColor}.600`}>
                  %{program.progress_percentage}
                </Text>
              </HStack>
              <Progress
                value={program.progress_percentage}
                colorScheme={progressColor}
                size="sm"
                borderRadius="full"
              />
            </VStack>
            
            <HStack justifyContent="space-between">
              <Text fontSize="sm" color="gray.600">
                {formatCurrency(program.spent_amount)} / {formatCurrency(program.total_budget)}
              </Text>
              <Text fontSize="sm" color={remainingDays <= 7 ? 'error.600' : 'gray.600'}>
                {remainingDays > 0 ? `${remainingDays} gün kaldı` : 'Süresi doldu'}
              </Text>
            </HStack>
          </VStack>
        </Card.Body>
      </VStack>
    </Card>
  );
};