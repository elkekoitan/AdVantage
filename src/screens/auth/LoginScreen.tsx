import React, { useState, useEffect, useRef } from 'react';
import {
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Icon,
  Divider,
  useToast,
} from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../contexts/AuthContext';
import type { AuthStackParamList } from '../../types/navigation';



// Dimensions removed as not needed with Native Base

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animasyon referansları
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Sayfa yüklenme animasyonu
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

  const handleLogin = async () => {
    if (!email || !password) {
      toast.show({
        title: 'Hata',
        description: 'Lütfen e-posta ve şifre girin.'
      });
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation will be handled by AuthContext
    } catch (error: unknown) {
      let errorMessage = 'Bir hata oluştu';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.show({
        title: 'Giriş Başarısız',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      let errorMessage = 'Google ile giriş başarısız';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Giriş Başarısız',
        description: errorMessage
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setAppleLoading(true);
    try {
      await signInWithApple();
    } catch (error: unknown) {
      let errorMessage = 'Apple ile giriş başarısız';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Giriş Başarısız',
        description: errorMessage
      });
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      flex={1}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ flex: 1 }}
      >
        <ScrollView 
          flex={1}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
        >
          {/* Logo ve Başlık */}
          <VStack space={6} alignItems="center" mb={8}>
            <Box
              w={20}
              h={20}
              borderRadius="full"
              bg="white"
              alignItems="center"
              justifyContent="center"
              shadow={3}
            >
              <Text fontSize="2xl" fontWeight="bold" color="primary.500">
                A
              </Text>
            </Box>
            <VStack space={2} alignItems="center">
              <Text fontSize="3xl" fontWeight="bold" color="white">
                AdVantage
              </Text>
              <Text fontSize="md" color="white" opacity={0.8}>
                İş dünyasında avantajınız
              </Text>
            </VStack>
          </VStack>
          
          {/* Login Card */}
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Box
              bg="white"
              borderRadius="2xl"
              p={6}
              mx={4}
              shadow={9}
              opacity={0.95}
            >
              <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign="center" mb={6}>
                Hoş Geldiniz
              </Text>
              <Text fontSize="md" color="gray.600" textAlign="center" mb={8}>
                Hesabınıza giriş yapın
              </Text>
              
              <VStack space={4}>
                {/* Email Input */}
                <VStack space={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    E-posta
                  </Text>
                  <Input
                    placeholder="E-posta adresinizi girin"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    size="lg"
                    variant="filled"
                    bg="gray.50"
                    borderColor="gray.200"
                    _focus={{
                      bg: 'white',
                      borderColor: 'primary.500',
                      borderWidth: 2
                    }}
                    InputLeftElement={
                      <Icon
                        as={MaterialIcons}
                        name="email"
                        size={5}
                        ml={3}
                        color="gray.400"
                      />
                    }
                  />
                </VStack>

                {/* Password Input */}
                <VStack space={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Şifre
                  </Text>
                  <Input
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    size="lg"
                    variant="filled"
                    bg="gray.50"
                    borderColor="gray.200"
                    _focus={{
                      bg: 'white',
                      borderColor: 'primary.500',
                      borderWidth: 2
                    }}
                    InputLeftElement={
                      <Icon
                        as={MaterialIcons}
                        name="lock"
                        size={5}
                        ml={3}
                        color="gray.400"
                      />
                    }
                    InputRightElement={
                      <Pressable onPress={() => setShowPassword(!showPassword)} mr={3}>
                        <Icon
                          as={MaterialIcons}
                          name={showPassword ? 'visibility' : 'visibility-off'}
                          size={5}
                          color="gray.400"
                        />
                      </Pressable>
                    }
                  />
                </VStack>
                
                {/* Forgot Password */}
                 <Pressable 
                   alignSelf="flex-end"
                   onPress={() => navigation.navigate('ForgotPassword' as any)}
                   mt={2}
                 >
                   <Text fontSize="sm" color="primary.500" fontWeight="medium">
                     Şifremi Unuttum
                   </Text>
                 </Pressable>
              </VStack>
              
              {/* Login Button */}
              <Button
                onPress={handleLogin}
                isLoading={loading}
                isDisabled={loading}
                size="lg"
                colorScheme="primary"
                borderRadius="xl"
                mt={6}
                _text={{
                  fontSize: 'md',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
              
              {/* Divider */}
              <HStack alignItems="center" my={6}>
                <Divider flex={1} />
                <Text px={3} fontSize="sm" color="gray.500">
                  veya
                </Text>
                <Divider flex={1} />
              </HStack>
              
              {/* Social Login */}
              <VStack space={3}>
                <Button
                  onPress={handleGoogleLogin}
                  isLoading={googleLoading}
                  isDisabled={googleLoading}
                  variant="outline"
                  size="lg"
                  borderRadius="xl"
                  borderColor="gray.300"
                  bg="white"
                  _text={{
                    color: 'gray.700',
                    fontSize: 'md',
                    fontWeight: 'medium'
                  }}
                  _pressed={{
                    bg: 'gray.50'
                  }}
                  leftIcon={
                    <Icon
                      as={MaterialIcons}
                      name="google"
                      size={5}
                      color="red.500"
                    />
                  }
                >
                  {googleLoading ? 'Yükleniyor...' : 'Google ile Giriş'}
                </Button>
                
                {Platform.OS === 'ios' && (
                  <Button
                    onPress={handleAppleLogin}
                    isLoading={appleLoading}
                    isDisabled={appleLoading}
                    variant="solid"
                    size="lg"
                    borderRadius="xl"
                    bg="black"
                    _text={{
                      color: 'white',
                      fontSize: 'md',
                      fontWeight: 'medium'
                    }}
                    _pressed={{
                      bg: 'gray.800'
                    }}
                    leftIcon={
                      <Icon
                        as={MaterialIcons}
                        name="apple"
                        size={5}
                        color="white"
                      />
                    }
                  >
                    {appleLoading ? 'Yükleniyor...' : 'Apple ile Giriş'}
                  </Button>
                )}
              </VStack>
            </Box>
          </Animated.View>
          
          {/* Register Link */}
           <HStack justifyContent="center" mt={6} space={1}>
             <Text fontSize="md" color="white" opacity={0.8}>
               Hesabınız yok mu?
             </Text>
             <Pressable onPress={() => navigation.navigate('Register' as any)}>
                <Text fontSize="md" color="white" fontWeight="bold" underline>
                  Kayıt Ol
                </Text>
              </Pressable>
           </HStack>
         </ScrollView>
       </LinearGradient>
     </KeyboardAvoidingView>
  );
};



export default LoginScreen;