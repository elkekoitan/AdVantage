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
  FormControl,
  WarningOutlineIcon,
} from 'native-base';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { resetPassword } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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
      toast.show({
        title: 'E-posta Gönderildi',
        description: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
        variant: 'top-accent',
        bgColor: 'green.500',
      });
    } catch (error: any) {
      toast.show({
        title: 'Hata',
        description: error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'top-accent',
        bgColor: 'red.500',
      });
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
      <Box flex={1} bg="white" safeArea>
        <VStack flex={1} px={6} py={8} space={6} justifyContent="center">
          <VStack space={4} alignItems="center">
            <Icon
              as={MaterialIcons}
              name="mark-email-read"
              size={20}
              color="green.500"
            />
            <Heading size="xl" fontWeight="bold" color="primary.600" textAlign="center">
              E-posta Gönderildi
            </Heading>
            <Text fontSize="md" color="gray.600" textAlign="center">
              Şifre sıfırlama bağlantısı{' '}
              <Text fontWeight="semibold" color="primary.600">
                {email}
              </Text>{' '}
              adresine gönderildi.
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              E-postanızı kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
            </Text>
          </VStack>

          <VStack space={4}>
            <Button
              size="lg"
              colorScheme="primary"
              onPress={handleResetPassword}
              isLoading={loading}
              isLoadingText="Tekrar gönderiliyor..."
            >
              E-postayı Tekrar Gönder
            </Button>

            <Button
              size="lg"
              variant="outline"
              colorScheme="gray"
              onPress={() => navigation.navigate('Login')}
            >
              Giriş Sayfasına Dön
            </Button>
          </VStack>

          <HStack justifyContent="center" mt={4}>
            <Text fontSize="sm" color="gray.600">
              E-posta gelmedi mi?{' '}
            </Text>
            <Link
              _text={{
                color: 'primary.600',
                fontWeight: 'medium',
                fontSize: 'sm',
              }}
              onPress={() => {
                toast.show({
                  title: 'İpucu',
                  description: 'Spam klasörünüzü kontrol edin veya birkaç dakika bekleyin.',
                  variant: 'top-accent',
                  bgColor: 'blue.500',
                });
              }}
            >
              Yardım Al
            </Link>
          </HStack>
        </VStack>
      </Box>
    );
  }

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
            <VStack space={4} alignItems="center" mt={8}>
              <Icon
                as={MaterialIcons}
                name="lock-reset"
                size={16}
                color="primary.600"
              />
              <Heading size="2xl" fontWeight="bold" color="primary.600">
                Şifremi Unuttum
              </Heading>
              <Text fontSize="md" color="gray.600" textAlign="center">
                E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
              </Text>
            </VStack>

            {/* Form */}
            <VStack space={6} mt={8}>
              <FormControl isRequired isInvalid={!!error}>
                <FormControl.Label>E-posta Adresi</FormControl.Label>
                <Input
                  placeholder="E-posta adresinizi giriniz"
                  size="lg"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={handleEmailChange}
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
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  {error}
                </FormControl.ErrorMessage>
              </FormControl>

              <Button
                size="lg"
                colorScheme="primary"
                onPress={handleResetPassword}
                isLoading={loading}
                isLoadingText="Gönderiliyor..."
              >
                Şifre Sıfırlama Bağlantısı Gönder
              </Button>
            </VStack>

            {/* Additional Info */}
            <VStack space={4} mt={8}>
              <Box bg="blue.50" p={4} rounded="md">
                <HStack space={3} alignItems="flex-start">
                  <Icon
                    as={MaterialIcons}
                    name="info"
                    size={5}
                    color="blue.600"
                    mt={0.5}
                  />
                  <VStack flex={1} space={1}>
                    <Text fontSize="sm" fontWeight="medium" color="blue.800">
                      Bilgi
                    </Text>
                    <Text fontSize="xs" color="blue.700">
                      Şifre sıfırlama bağlantısı 15 dakika geçerlidir. 
                      E-posta gelmezse spam klasörünüzü kontrol edin.
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </VStack>

            {/* Back to Login */}
            <HStack justifyContent="center" mt="auto">
              <Text fontSize="sm" color="gray.600">
                Şifrenizi hatırladınız mı?{' '}
              </Text>
              <Link
                _text={{
                  color: 'primary.600',
                  fontWeight: 'medium',
                  fontSize: 'sm',
                }}
                onPress={() => navigation.navigate('Login')}
              >
                Giriş Yap
              </Link>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}; 