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
  Select,
  Checkbox,
  FormControl,
  WarningOutlineIcon,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';

import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  username: string;
  phone: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined;
  dateOfBirth: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  username?: string;
  phone?: string;
  acceptTerms?: string;
}

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    phone: '',
    gender: undefined,
    dateOfBirth: '',
    acceptTerms: false,
    acceptMarketing: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Şifre en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gereklidir';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = 'Ad soyad gereklidir';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Ad soyad en az 2 karakter olmalıdır';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Kullanıcı adı gereklidir';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir';
    }

    // Phone validation
    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    // Terms validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Kullanım koşullarını kabul etmelisiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        fullName: formData.fullName,
        username: formData.username,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        acceptMarketing: formData.acceptMarketing,
      });

      toast.show({
        title: 'Kayıt Başarılı',
        description: 'Hesabınız oluşturuldu.',
        colorScheme: 'success',
      });

      // Navigation will be handled by AuthContext
    } catch (error: unknown) {
      let errorMessage = 'Bir hata oluştu';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.show({
        title: 'Hata',
        description: errorMessage,
        colorScheme: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      let errorMessage = 'Google ile kayıt başarısız';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Kayıt Başarısız',
        description: errorMessage,
        colorScheme: 'error',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setAppleLoading(true);
    try {
      await signInWithApple();
    } catch (error: unknown) {
      let errorMessage = 'Apple ile kayıt başarısız';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.show({
        title: 'Kayıt Başarısız',
        description: errorMessage,
        colorScheme: 'error',
      });
    } finally {
      setAppleLoading(false);
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
          <VStack flex={1} px={6} py={4} space={4}>
            {/* Header */}
            <VStack space={2} alignItems="center" mt={4}>
              <Heading size="2xl" fontWeight="bold" color="primary.600">
                Hesap Oluştur
              </Heading>
              <Text fontSize="md" color="gray.600" textAlign="center">
                AdVantage&apos;a katılın ve kişiselleştirilmiş deneyimler keşfedin
              </Text>
            </VStack>

            {/* Form */}
            <VStack space={4}>
              {/* Full Name */}
              <FormControl isRequired isInvalid={!!errors.fullName}>
                <FormControl.Label>Ad Soyad</FormControl.Label>
                <Input
                  placeholder="Ad Soyad"
                  size="lg"
                  value={formData.fullName}
                  onChangeText={(text) => updateFormData('fullName', text)}
                  InputLeftElement={
                    <Icon
                      as={MaterialIcons}
                      name="person"
                      size={5}
                      ml={3}
                      color="gray.400"
                    />
                  }
                />
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.fullName}
                </FormControl.ErrorMessage>
              </FormControl>

              {/* Username */}
              <FormControl isRequired isInvalid={!!errors.username}>
                <FormControl.Label>Kullanıcı Adı</FormControl.Label>
                <Input
                  placeholder="Kullanıcı Adı"
                  size="lg"
                  value={formData.username}
                  onChangeText={(text) => updateFormData('username', text.toLowerCase())}
                  autoCapitalize="none"
                  InputLeftElement={
                    <Icon
                      as={MaterialIcons}
                      name="alternate-email"
                      size={5}
                      ml={3}
                      color="gray.400"
                    />
                  }
                />
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.username}
                </FormControl.ErrorMessage>
              </FormControl>

              {/* Email */}
              <FormControl isRequired isInvalid={!!errors.email}>
                <FormControl.Label>E-posta</FormControl.Label>
                <Input
                  testID="email-input"
                  placeholder="E-posta"
                  size="lg"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
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
                  {errors.email}
                </FormControl.ErrorMessage>
              </FormControl>

              {/* Phone */}
              <FormControl isInvalid={!!errors.phone}>
                <FormControl.Label>Telefon (Opsiyonel)</FormControl.Label>
                <Input
                  placeholder="Telefon Numarası"
                  size="lg"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => updateFormData('phone', text)}
                  InputLeftElement={
                    <Icon
                      as={MaterialIcons}
                      name="phone"
                      size={5}
                      ml={3}
                      color="gray.400"
                    />
                  }
                />
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.phone}
                </FormControl.ErrorMessage>
              </FormControl>

              {/* Gender */}
              <FormControl>
                <FormControl.Label>Cinsiyet (Opsiyonel)</FormControl.Label>
                <Select
                  selectedValue={formData.gender}
                  placeholder="Cinsiyet Seçiniz"
                  size="lg"
                  onValueChange={(value) => updateFormData('gender', value)}
                >
                  <Select.Item label="Erkek" value="male" />
                  <Select.Item label="Kadın" value="female" />
                  <Select.Item label="Diğer" value="other" />
                  <Select.Item label="Belirtmek İstemiyorum" value="prefer_not_to_say" />
                </Select>
              </FormControl>

              {/* Date of Birth */}
              <FormControl>
                <FormControl.Label>Doğum Tarihi (Opsiyonel)</FormControl.Label>
                <Pressable
                  onPress={() => {}}
                >
                  <Input
                    placeholder="Doğum tarihinizi seçin"
                    size="lg"
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('tr-TR') : ''}
                    isReadOnly
                    InputLeftElement={
                      <Icon
                        as={MaterialIcons}
                        name="cake"
                        size={5}
                        ml={3}
                        color="gray.400"
                      />
                    }
                  />
                </Pressable>
                {/* Temporarily disabled DateTimePicker due to native module issue */}
                {/* {showDatePicker && (
                  <DateTimePicker
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        updateFormData('dateOfBirth', selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                  />
                )} */}
              </FormControl>

              {/* Password */}
              <FormControl isRequired isInvalid={!!errors.password}>
                <FormControl.Label>Şifre</FormControl.Label>
                <Input
                  testID="password-input"
                  placeholder="Şifre"
                  size="lg"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
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
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.password}
                </FormControl.ErrorMessage>
              </FormControl>

              {/* Confirm Password */}
              <FormControl isRequired isInvalid={!!errors.confirmPassword}>
                <FormControl.Label>Şifre Tekrar</FormControl.Label>
                <Input
                  testID="confirm-password-input"
                  placeholder="Şifre Tekrar"
                  size="lg"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
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
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Icon
                        as={MaterialIcons}
                        name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                        size={5}
                        mr={3}
                        color="gray.400"
                      />
                    </Pressable>
                  }
                />
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.confirmPassword}
                </FormControl.ErrorMessage>
              </FormControl>

              {/* Terms and Conditions */}
              <FormControl isRequired isInvalid={!!errors.acceptTerms}>
                <VStack space={2}>
                  <Checkbox
                    value="terms"
                    isChecked={formData.acceptTerms}
                    onChange={(isChecked) => updateFormData('acceptTerms', isChecked)}
                    colorScheme="primary"
                    testID="terms-checkbox"
                  >
                    <Text fontSize="sm" color="gray.700">
                      <Link _text={{ color: 'primary.600' }}>Kullanım Koşulları</Link> ve&nbsp;
                      <Link _text={{ color: 'primary.600' }}>Gizlilik Politikası</Link>&apos;nı kabul ediyorum
                    </Text>
                  </Checkbox>
                  <Checkbox
                    value="marketing"
                    isChecked={formData.acceptMarketing}
                    onChange={(isChecked) => updateFormData('acceptMarketing', isChecked)}
                    colorScheme="primary"
                  >
                    <Text fontSize="sm" color="gray.700">
                      Pazarlama e-postalarını almayı kabul ediyorum
                    </Text>
                  </Checkbox>
                </VStack>
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  {errors.acceptTerms}
                </FormControl.ErrorMessage>
              </FormControl>
            </VStack>

            {/* Register Button */}
            <Button
              size="lg"
              colorScheme="primary"
              onPress={handleRegister}
              isLoading={loading}
              isLoadingText="Kayıt oluşturuluyor..."
              mt={4}
            >
              Hesap Oluştur
            </Button>

            {/* Social Register */}
            <VStack space={3} mt={4}>
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
                  onPress={handleGoogleSignUp}
                  isLoading={googleLoading}
                  isLoadingText="Google..."
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
                  onPress={handleAppleSignUp}
                  isLoading={appleLoading}
                  isLoadingText="Apple..."
                >
                  Apple
                </Button>
              </HStack>
            </VStack>

            {/* Login Link */}
            <HStack justifyContent="center" mt={4}>
              <Text fontSize="sm" color="gray.600">
                Zaten hesabınız var mı?&nbsp;
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