import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Modal,
  ScrollView,
  Pressable,
  useTheme,
  useColorModeValue,
  Badge,
  Spinner,
  Avatar,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { Animated, Vibration } from 'react-native';
import { voiceService, VoiceMessage } from '../services/voiceService';
import { aiAssistantService } from '../services/aiAssistantService';
import { useAuth } from '../contexts/AuthContext';

interface VoiceAgentProps {
  isVisible: boolean;
  onClose: () => void;
  onTimelineGenerated?: (timeline: any) => void;
  onRecommendationsGenerated?: (recommendations: any[]) => void;
}

export const VoiceAgent: React.FC<VoiceAgentProps> = ({
  isVisible,
  onClose,
  onTimelineGenerated,
  onRecommendationsGenerated,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSessionId] = useState(() => `session_${Date.now()}`);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);

  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const assistantBgColor = useColorModeValue('primary.50', 'primary.900');
  const userBgColor = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
      startWaveAnimation();
    } else {
      stopAnimations();
    }
  }, [isRecording]);

  useEffect(() => {
    if (isVisible) {
      // Add welcome message when modal opens
      addWelcomeMessage();
    }
  }, [isVisible]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopAnimations = () => {
    pulseAnim.setValue(1);
    waveAnim.setValue(0);
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: VoiceMessage = {
      id: `welcome_${Date.now()}`,
      text: '🌟 Merhaba! Ben sizin kişisel AI asistanınızım. Bugün size nasıl yardımcı olabilirim? Günlük programınızı planlamak, öneriler almak veya sohbet etmek için sesli olarak benimle konuşabilirsiniz!',
      timestamp: new Date(),
      type: 'assistant',
    };
    setMessages([welcomeMessage]);
    
    // Speak welcome message
    voiceService.speak(welcomeMessage.text);
  };

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      Vibration.vibrate(50); // Haptic feedback
      await voiceService.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      Vibration.vibrate(50); // Haptic feedback
      
      const audioUri = await voiceService.stopRecording();
      
      if (audioUri) {
        // Convert speech to text (mock for now)
        const transcribedText = await voiceService.convertSpeechToText(audioUri);
        
        // Add user message
        const userMessage: VoiceMessage = {
          id: `user_${Date.now()}`,
          text: transcribedText,
          timestamp: new Date(),
          type: 'user',
          audioUri,
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // Process with AI assistant
        const response = await aiAssistantService.processUserMessage(
          user?.id || 'anonymous',
          transcribedText,
          { sessionId: currentSessionId }
        );
        
        // Add assistant response
        const assistantMessage: VoiceMessage = {
          id: `assistant_${Date.now()}`,
          text: response.response,
          timestamp: new Date(),
          type: 'assistant',
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Handle special actions
        if (response.timeline && onTimelineGenerated) {
          onTimelineGenerated(response.timeline);
        }
        
        if (response.recommendations && onRecommendationsGenerated) {
          onRecommendationsGenerated(response.recommendations);
        }
        
        // Speak response
        setIsSpeaking(true);
        await voiceService.speak(response.response);
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Failed to process voice input:', error);
      const errorMessage: VoiceMessage = {
        id: `error_${Date.now()}`,
        text: 'Üzgünüm, ses kaydınızı işleyemedim. Lütfen tekrar deneyin.',
        timestamp: new Date(),
        type: 'assistant',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopSpeaking = async () => {
    await voiceService.stopSpeaking();
    setIsSpeaking(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (message: VoiceMessage) => {
    const isUser = message.type === 'user';
    
    return (
      <Box
        key={message.id}
        alignSelf={isUser ? 'flex-end' : 'flex-start'}
        maxW="80%"
        mb={3}
      >
        <HStack space={2} alignItems="flex-end">
          {!isUser && (
            <Avatar
              size="sm"
              bg="primary.500"
              _text={{ color: 'white', fontSize: 'xs' }}
            >
              AI
            </Avatar>
          )}
          
          <VStack space={1} flex={1}>
            <Box
              bg={isUser ? userBgColor : assistantBgColor}
              px={4}
              py={3}
              rounded="2xl"
              roundedBottomLeft={isUser ? '2xl' : 'md'}
              roundedBottomRight={isUser ? 'md' : '2xl'}
            >
              <Text
                color={textColor}
                fontSize="md"
                lineHeight="md"
              >
                {message.text}
              </Text>
            </Box>
            
            <Text
              fontSize="xs"
              color={mutedColor}
              alignSelf={isUser ? 'flex-end' : 'flex-start'}
              px={2}
            >
              {formatTime(message.timestamp)}
            </Text>
          </VStack>
          
          {isUser && (
            <Avatar
              size="sm"
              bg="gray.500"
              _text={{ color: 'white', fontSize: 'xs' }}
            >
              {user?.user_metadata?.full_name?.charAt(0) || 'U'}
            </Avatar>
          )}
        </HStack>
      </Box>
    );
  };

  const renderRecordingButton = () => {
    if (isProcessing) {
      return (
        <Box
          size={20}
          bg="orange.500"
          rounded="full"
          justifyContent="center"
          alignItems="center"
        >
          <Spinner color="white" size="lg" />
        </Box>
      );
    }

    if (isSpeaking) {
      return (
        <Pressable onPress={handleStopSpeaking}>
          <Box
            size={20}
            bg="green.500"
            rounded="full"
            justifyContent="center"
            alignItems="center"
          >
            <MaterialIcons name="volume-up" size={32} color="white" />
          </Box>
        </Pressable>
      );
    }

    return (
      <Pressable
        onPressIn={handleStartRecording}
        onPressOut={handleStopRecording}
        _pressed={{ opacity: 0.8 }}
      >
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Box
            size={20}
            bg={isRecording ? 'red.500' : 'primary.500'}
            rounded="full"
            justifyContent="center"
            alignItems="center"
            shadow={isRecording ? 8 : 4}
          >
            <MaterialIcons
              name={isRecording ? 'stop' : 'mic'}
              size={32}
              color="white"
            />
          </Box>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Modal isOpen={isVisible} onClose={onClose} size="full">
      <Modal.Content bg={bgColor} maxH="90%" mt="auto" mb={0} roundedTop="3xl">
        <Modal.Header
          bg={bgColor}
          borderBottomWidth={1}
          borderBottomColor="gray.200"
          roundedTop="3xl"
        >
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                🤖 AI Asistan
              </Text>
              <Text fontSize="sm" color={mutedColor}>
                Sesli komutlarla konuşun
              </Text>
            </VStack>
            
            <HStack space={2} alignItems="center">
              {isRecording && (
                <Badge colorScheme="red" variant="solid" rounded="full">
                  <HStack space={1} alignItems="center">
                    <Box size={2} bg="white" rounded="full" />
                    <Text fontSize="xs" color="white">KAYIT</Text>
                  </HStack>
                </Badge>
              )}
              
              <IconButton
                icon={<MaterialIcons name="close" size={24} />}
                onPress={onClose}
                variant="ghost"
                rounded="full"
              />
            </HStack>
          </HStack>
        </Modal.Header>

        <Modal.Body px={4} py={4} flex={1}>
          <VStack flex={1} space={4}>
            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              flex={1}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }}
            >
              <VStack space={2} py={2}>
                {messages.map(renderMessage)}
              </VStack>
            </ScrollView>

            {/* Recording Status */}
            {isRecording && (
              <Box
                bg="red.50"
                px={4}
                py={3}
                rounded="xl"
                borderWidth={1}
                borderColor="red.200"
              >
                <HStack space={3} alignItems="center">
                  <Animated.View
                    style={{
                      opacity: waveAnim,
                    }}
                  >
                    <MaterialIcons name="graphic-eq" size={24} color={theme.colors.red[500]} />
                  </Animated.View>
                  <VStack flex={1}>
                    <Text fontSize="sm" fontWeight="bold" color="red.600">
                      Dinliyorum...
                    </Text>
                    <Text fontSize="xs" color="red.500">
                      Konuşmayı bitirmek için butonu bırakın
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}

            {/* Processing Status */}
            {isProcessing && (
              <Box
                bg="orange.50"
                px={4}
                py={3}
                rounded="xl"
                borderWidth={1}
                borderColor="orange.200"
              >
                <HStack space={3} alignItems="center">
                  <Spinner color="orange.500" size="sm" />
                  <Text fontSize="sm" color="orange.600">
                    İşleniyor...
                  </Text>
                </HStack>
              </Box>
            )}

            {/* Voice Control Button */}
            <Box alignItems="center" py={4}>
              {renderRecordingButton()}
              <Text
                fontSize="xs"
                color={mutedColor}
                textAlign="center"
                mt={3}
                maxW="80%"
              >
                {isRecording
                  ? 'Konuşun ve bitirmek için butonu bırakın'
                  : isProcessing
                  ? 'Ses kaydınız işleniyor...'
                  : isSpeaking
                  ? 'Konuşmayı durdurmak için dokunun'
                  : 'Konuşmak için basılı tutun'}
              </Text>
            </Box>
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default VoiceAgent;