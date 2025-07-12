import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../contexts/AuthContext';
import type { AuthStackParamList } from '../../types/navigation';

// Dimensions removed as not used

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setError('E-posta adresi gereklidir');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail(email)) return;

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error: unknown) {
      let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) setError('');
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Gradient Background */}
        <LinearGradient
          colors={['#0ea5e9', '#0284c7', '#0369a1', '#075985']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.successCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <BlurView intensity={20} style={styles.card}>
              {/* Success Icon */}
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#10b981" />
              </View>
              
              <Text style={styles.successTitle}>E-posta Gönderildi!</Text>
              <Text style={styles.successDescription}>
                Şifre sıfırlama bağlantısı{' '}
                <Text style={styles.emailText}>{email}</Text>{' '}
                adresine gönderildi.
              </Text>
              <Text style={styles.successSubtext}>
                E-postanızı kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
              </Text>
              
              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f8fafc']}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <Ionicons name="refresh" size={20} color="#0ea5e9" />
                    ) : (
                      <Ionicons name="mail" size={20} color="#0ea5e9" />
                    )}
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'Gönderiliyor...' : 'Tekrar Gönder'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Ionicons name="arrow-back" size={20} color="#ffffff" />
                  <Text style={styles.secondaryButtonText}>Giriş Sayfasına Dön</Text>
                </TouchableOpacity>
              </View>
              
              {/* Help Text */}
              <TouchableOpacity
                style={styles.helpContainer}
                onPress={() => Alert.alert('İpucu', 'Spam klasörünüzü kontrol edin veya birkaç dakika bekleyin.')}
              >
                <Text style={styles.helpText}>
                  E-posta gelmedi mi? <Text style={styles.helpLink}>Yardım Al</Text>
                </Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0ea5e9', '#0284c7', '#0369a1', '#075985']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Şifremi Unuttum</Text>
        </View>
        
        {/* Main Content */}
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <BlurView intensity={20} style={styles.card}>
              {/* Icon and Title */}
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed" size={60} color="#ffffff" />
              </View>
              
              <Text style={styles.title}>Şifrenizi Sıfırlayın</Text>
              <Text style={styles.description}>
                E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
              </Text>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
                  <Ionicons name="mail" size={20} color={emailFocused ? '#0ea5e9' : '#94a3b8'} />
                  <TextInput
                    style={styles.input}
                    placeholder="E-posta adresinizi girin"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={handleEmailChange}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}
              </View>
              
              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <Ionicons name="refresh" size={20} color="#0ea5e9" />
                  ) : (
                    <Ionicons name="send" size={20} color="#0ea5e9" />
                  )}
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Info Box */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#0ea5e9" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>Bilgi</Text>
                  <Text style={styles.infoText}>
                    Şifre sıfırlama bağlantısı 15 dakika geçerlidir. E-posta gelmezse spam klasörünüzü kontrol edin.
                  </Text>
                </View>
              </View>
              
              {/* Login Link */}
              <TouchableOpacity
                style={styles.loginContainer}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginText}>
                  Şifrenizi hatırladınız mı? <Text style={styles.loginLink}>Giriş Yap</Text>
                </Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0ea5e9',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -30,
    left: -30,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: StatusBar.currentHeight || 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  formCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  successCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  successDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  successSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  emailText: {
    fontWeight: '600',
    color: '#0ea5e9',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: '#0ea5e9',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 16,
    paddingLeft: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 16,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButton: {
    marginBottom: 20,
  },
  primaryButton: {
    // Primary button styles
  },
  secondaryButton: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  helpContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#64748b',
  },
  helpLink: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
});