import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  HStack,
  Link,
  useToast,
  KeyboardAvoidingView,
  ScrollView,
  Icon,
  Pressable,
} from 'native-base';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.show({
        title: 'Hata',
        description: 'Lütfen e-posta ve şifre girin.',
        colorScheme: 'error',
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
        description: errorMessage,
        colorScheme: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      flex={1}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Box flex={1} bg="white" safeArea>
          <VStack flex={1} px={6} py={8} space={6}>
            {/* Header */}
            <VStack space={2} alignItems="center" mt={8}>
              <Heading size="2xl" fontWeight="bold" color="primary.600">
                Hoş Geldiniz
              </Heading>
              <Text fontSize="md" color="gray.600">
                Hesabınıza giriş yapın
              </Text>
            </VStack>

            {/* Form */}
            <VStack space={4} mt={8}>
              <Input
                placeholder="E-posta"
                size="lg"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
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

              <Input
                placeholder="Şifre"
                size="lg"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChangeText={setPassword}
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
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Icon
                      as={MaterialIcons}
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={5}
                      mr={3}
                      color="gray.400"
                    />
                  </Pressable>
                }
              />

              <HStack justifyContent="flex-end">
                <Link
                  _text={{
                    fontSize: 'sm',
                    fontWeight: '500',
                    color: 'primary.600',
                  }}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  Şifremi Unuttum
                </Link>
              </HStack>
            </VStack>

            {/* Login Button */}
            <Button
              size="lg"
              colorScheme="primary"
              onPress={handleLogin}
              isLoading={loading}
              isLoadingText="Giriş yapılıyor..."
              mt={4}
            >
              Giriş Yap
            </Button>

            {/* Social Login */}
            <VStack space={3} mt={6}>
              <HStack alignItems="center" space={2}>
                <Box flex={1} h={0.5} bg="gray.300" />
                <Text fontSize="sm" color="gray.500">
                  veya
                </Text>
                <Box flex={1} h={0.5} bg="gray.300" />
              </HStack>

              <HStack space={3}>
                <Button
                  flex={1}
                  variant="outline"
                  colorScheme="gray"
                  leftIcon={
                    <Icon as={MaterialIcons} name="g-mobiledata" size={6} />
                  }
                >
                  Google
                </Button>
                <Button
                  flex={1}
                  variant="outline"
                  colorScheme="gray"
                  leftIcon={
                    <Icon as={MaterialIcons} name="apple" size={5} />
                  }
                >
                  Apple
                </Button>
              </HStack>
            </VStack>

            {/* Register Link */}
            <HStack justifyContent="center" mt="auto">
              <Text fontSize="sm" color="gray.600">
                Hesabınız yok mu?{' '}
              </Text>
              <Link
                _text={{
                  color: 'primary.600',
                  fontWeight: 'medium',
                  fontSize: 'sm',
                }}
                onPress={() => navigation.navigate('Register')}
              >
                Kayıt Ol
              </Link>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}; 