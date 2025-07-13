import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'native-base';
import { Orb } from './Orb';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  onClose?: () => void;
  style?: object;
}

export default function AIChat({ onClose, style }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Merhaba! Size nasıl yardımcı olabilirim?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const theme = useTheme();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (): string => {
    const responses = [
      'Bu konuda size yardımcı olabilirim. Daha detaylı bilgi verebilir misiniz?',
      'Anladım. Bu durumda şu önerileri sunabilirim...',
      'İlginç bir soru. Bu konuda düşünmeme izin verin...',
      'Tabii ki! Bu konuda elimden geldiğince yardımcı olmaya çalışacağım.',
      'Bu konu hakkında daha fazla bilgiye ihtiyacım var. Detaylandırabilir misiniz?',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.orbContainer}>
            <Orb 
              hue={240} 
              hoverIntensity={0.3} 
              rotateOnHover={true}
              forceHoverState={isTyping}
            />
          </View>
          <View>
            <Text style={styles.title}>
              AI Asistan
            </Text>
            <Text style={styles.subtitle}>
              {isTyping ? 'Yazıyor...' : 'Çevrimiçi'}
            </Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.gray[600]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.messageWrapper, message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper]}
          >
            <View style={[styles.messageRow, message.isUser ? styles.userMessageRow : styles.aiMessageRow]}>
              {!message.isUser && (
                <View style={styles.aiAvatarContainer}>
                  <Orb 
                    hue={240} 
                    hoverIntensity={0.2} 
                    rotateOnHover={false}
                  />
                </View>
              )}
              <View style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.messageText, message.isUser ? styles.userText : styles.aiText]}>
                  {message.text}
                </Text>
              </View>
            </View>
            <Text style={[styles.timestamp, message.isUser ? styles.userTimestamp : styles.aiTimestamp]}>
              {message.timestamp.toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        ))}
        
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingRow}>
              <View style={styles.typingAvatarContainer}>
                <Orb 
                  hue={240} 
                  hoverIntensity={0.4} 
                  rotateOnHover={true}
                  forceHoverState={true}
                />
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, { opacity: 0.4 }]} />
                  <View style={[styles.dot, { opacity: 0.6 }]} />
                  <View style={[styles.dot, { opacity: 0.8 }]} />
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={theme.colors.gray[500]}
            style={styles.textInput}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity 
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
            style={[styles.sendButton, (inputText.trim() && !isTyping) ? styles.sendButtonActive : styles.sendButtonInactive]}
          >
            <Ionicons 
              name="send" 
              size={16} 
              color={inputText.trim() && !isTyping ? 'white' : theme.colors.gray[500]} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orbContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  closeButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  userMessageRow: {
    flexDirection: 'row-reverse',
  },
  aiMessageRow: {
    flexDirection: 'row',
  },
  aiAvatarContainer: {
    width: 32,
    height: 32,
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  aiTimestamp: {
    textAlign: 'left',
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  typingAvatarContainer: {
    width: 32,
    height: 32,
    marginRight: 8,
    marginBottom: 4,
  },
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#9ca3af',
    borderRadius: 4,
    marginRight: 4,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  sendButton: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#3b82f6',
  },
  sendButtonInactive: {
    backgroundColor: '#d1d5db',
  },
});

export { AIChat };