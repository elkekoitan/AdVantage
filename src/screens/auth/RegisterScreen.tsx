import React, { useState, useRef, useEffect } from 'react';
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
  useToast,
  FormControl,
} from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import type { AuthStackParamList } from '../../types/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation values
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = 'Ad gereklidir';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Ad en az 2 karakter olmalıdır';
    }

    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = 'Soyad gereklidir';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Soyad en az 2 karakter olmalıdır';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    // Phone validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Telefon numarası gereklidir';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Geçerli bir telefon numarası giriniz';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gereklidir';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData.email, formData.password, {
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phoneNumber,
      });

      toast.show({
        title: 'Başarılı!',
        description: 'Hesabınız başarıyla oluşturuldu. Giriş yapabilirsiniz.'
      });
      
      navigation.navigate('Login');
    } catch (error: unknown) {
      toast.show({
        title: 'Hata',
        description: (error as Error)?.message || 'Kayıt olurken bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView
      flex={1}
      bg="blue.500"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0ea5e9', '#0284c7', '#0369a1', '#075985']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      {/* Decorative Elements */}
      <Box
        position="absolute"
        top={-100}
        right={-100}
        w={200}
        h={200}
        borderRadius={100}
        bg="rgba(255, 255, 255, 0.1)"
      />
      <Box
        position="absolute"
        bottom={-80}
        left={-80}
        w={160}
        h={160}
        borderRadius={80}
        bg="rgba(255, 255, 255, 0.08)"
      />
      
      <ScrollView
        flex={1}
        px={5}
        pb={10}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <HStack
          alignItems="center"
          pt={Platform.OS === 'ios' ? 60 : 40}
          pb={5}
        >
          <Pressable
            w={11}
            h={11}
            borderRadius={22}
            bg="rgba(255, 255, 255, 0.2)"
            justifyContent="center"
            alignItems="center"
            mr={4}
            onPress={() => navigation.goBack()}
          >
            <Icon as={MaterialIcons} name="arrow-back" size={6} color="white" />
          </Pressable>
          <Text fontSize="2xl" fontWeight="bold" color="white" flex={1}>
            Hesap Oluştur
          </Text>
        </HStack>
        
        {/* Main Content */}
        <Box flex={1} justifyContent="center">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
          >
            <Box
              borderRadius={24}
              overflow="hidden"
              my={5}
              p={6}
              bg="rgba(255, 255, 255, 0.1)"
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.2)"
            >
              {/* Icon and Title */}
              <VStack alignItems="center" mb={6}>
                <Icon as={MaterialIcons} name="person-add" size={60} color="white" />
              </VStack>
              
              <Text fontSize="3xl" fontWeight="bold" color="white" textAlign="center" mb={2}>
                Yeni Hesap Oluşturun
              </Text>
              <Text fontSize="md" color="rgba(255, 255, 255, 0.8)" textAlign="center" mb={8} lineHeight={6}>
                Bilgilerinizi girerek hemen hesabınızı oluşturun.
              </Text>
              
              {/* Form Fields */}
              <VStack space={5} mb={6}>
                {/* First Name */}
                <FormControl isInvalid={!!errors.firstName}>
                  <Input
                    placeholder="Adınız"
                    value={formData.firstName}
                    onChangeText={(text) => updateFormData('firstName', text)}
                    autoCapitalize="words"
                    autoCorrect={false}
                    bg="rgba(255, 255, 255, 0.15)"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    borderRadius={16}
                    h={14}
                    fontSize="md"
                    color="white"
                    placeholderTextColor="#94a3b8"
                    _focus={{
                      borderColor: "white",
                      bg: "rgba(255, 255, 255, 0.25)"
                    }}
                    InputLeftElement={
                      <Icon as={MaterialIcons} name="person" size={5} color="gray.400" ml={4} />
                    }
                  />
                  <FormControl.ErrorMessage>{errors.firstName}</FormControl.ErrorMessage>
                </FormControl>
                
                {/* Last Name */}
                <FormControl isInvalid={!!errors.lastName}>
                  <Input
                    placeholder="Soyadınız"
                    value={formData.lastName}
                    onChangeText={(text) => updateFormData('lastName', text)}
                    autoCapitalize="words"
                    autoCorrect={false}
                    bg="rgba(255, 255, 255, 0.15)"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    borderRadius={16}
                    h={14}
                    fontSize="md"
                    color="white"
                    placeholderTextColor="#94a3b8"
                    _focus={{
                      borderColor: "white",
                      bg: "rgba(255, 255, 255, 0.25)"
                    }}
                    InputLeftElement={
                      <Icon as={MaterialIcons} name="person" size={5} color="gray.400" ml={4} />
                    }
                  />
                  <FormControl.ErrorMessage>{errors.lastName}</FormControl.ErrorMessage>
                </FormControl>
                
                {/* Email */}
                <FormControl isInvalid={!!errors.email}>
                  <Input
                    placeholder="E-posta adresiniz"
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    bg="rgba(255, 255, 255, 0.15)"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    borderRadius={16}
                    h={14}
                    fontSize="md"
                    color="white"
                    placeholderTextColor="#94a3b8"
                    _focus={{
                      borderColor: "white",
                      bg: "rgba(255, 255, 255, 0.25)"
                    }}
                    InputLeftElement={
                      <Icon as={MaterialIcons} name="email" size={5} color="gray.400" ml={4} />
                    }
                  />
                  <FormControl.ErrorMessage>{errors.email}</FormControl.ErrorMessage>
                </FormControl>
                
                {/* Phone Number */}
                <FormControl isInvalid={!!errors.phoneNumber}>
                  <Input
                    placeholder="Telefon numaranız"
                    value={formData.phoneNumber}
                    onChangeText={(text) => updateFormData('phoneNumber', text)}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    bg="rgba(255, 255, 255, 0.15)"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    borderRadius={16}
                    h={14}
                    fontSize="md"
                    color="white"
                    placeholderTextColor="#94a3b8"
                    _focus={{
                      borderColor: "white",
                      bg: "rgba(255, 255, 255, 0.25)"
                    }}
                    InputLeftElement={
                      <Icon as={MaterialIcons} name="phone" size={5} color="gray.400" ml={4} />
                    }
                  />
                  <FormControl.ErrorMessage>{errors.phoneNumber}</FormControl.ErrorMessage>
                </FormControl>
                
                {/* Password */}
                <FormControl isInvalid={!!errors.password}>
                  <Input
                    placeholder="Şifreniz"
                    value={formData.password}
                    onChangeText={(text) => updateFormData('password', text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    bg="rgba(255, 255, 255, 0.15)"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    borderRadius={16}
                    h={14}
                    fontSize="md"
                    color="white"
                    placeholderTextColor="#94a3b8"
                    _focus={{
                      borderColor: "white",
                      bg: "rgba(255, 255, 255, 0.25)"
                    }}
                    InputLeftElement={
                      <Icon as={MaterialIcons} name="lock" size={5} color="gray.400" ml={4} />
                    }
                    InputRightElement={
                      <Pressable onPress={() => setShowPassword(!showPassword)} p={2} mr={2}>
                        <Icon
                          as={MaterialIcons}
                          name={showPassword ? 'visibility-off' : 'visibility'}
                          size={5}
                          color="gray.400"
                        />
                      </Pressable>
                    }
                  />
                  <FormControl.ErrorMessage>{errors.password}</FormControl.ErrorMessage>
                </FormControl>
                
                {/* Confirm Password */}
                <FormControl isInvalid={!!errors.confirmPassword}>
                  <Input
                    placeholder="Şifre tekrarı"
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    bg="rgba(255, 255, 255, 0.15)"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    borderRadius={16}
                    h={14}
                    fontSize="md"
                    color="white"
                    placeholderTextColor="#94a3b8"
                    _focus={{
                      borderColor: "white",
                      bg: "rgba(255, 255, 255, 0.25)"
                    }}
                    InputLeftElement={
                      <Icon as={MaterialIcons} name="lock" size={5} color="gray.400" ml={4} />
                    }
                    InputRightElement={
                      <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} p={2} mr={2}>
                        <Icon
                          as={MaterialIcons}
                          name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                          size={5}
                          color="gray.400"
                        />
                      </Pressable>
                    }
                  />
                  <FormControl.ErrorMessage>{errors.confirmPassword}</FormControl.ErrorMessage>
                </FormControl>
              </VStack>
              
              {/* Register Button */}
              <Button
                onPress={handleRegister}
                isDisabled={loading}
                isLoading={loading}
                isLoadingText="Creating Account..."
                borderRadius={16}
                h={14}
                mt={2}
                mb={4}
                bg="white"
                _pressed={{ bg: "gray.100" }}
                leftIcon={
                  !loading ? <Icon as={MaterialIcons} name="person-add" size={5} color="blue.500" /> : undefined
                }
              >
                <Text fontSize="md" fontWeight="600" color="blue.500">
                  {loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
                </Text>
              </Button>
              
              {/* Login Link */}
              <Pressable
                alignItems="center"
                mt={2}
                onPress={() => navigation.navigate('Login')}
              >
                <Text fontSize="sm" color="rgba(255, 255, 255, 0.8)">
                  Zaten hesabınız var mı?{' '}
                  <Text color="white" fontWeight="600">
                    Giriş Yapın
                  </Text>
                </Text>
              </Pressable>
            </Box>
          </Animated.View>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};



export default RegisterScreen;