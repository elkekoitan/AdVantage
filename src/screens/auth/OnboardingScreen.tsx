import React from 'react';
import { Box, Button, Heading, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Onboarding'
>;

const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();

  return (
    <Box flex={1} safeArea p={8} justifyContent="center" w="100%">
      <VStack space={4} alignItems="center">
        <Heading size="2xl" mb={8}>
          AdVantage'a Hoş Geldiniz
        </Heading>
        <Button
          w="100%"
          onPress={() => navigation.navigate('Login')}
          size="lg"
        >
          Giriş Yap
        </Button>
        <Button
          w="100%"
          variant="outline"
          onPress={() => navigation.navigate('Register', {})}
          size="lg"
        >
          Kayıt Ol
        </Button>
      </VStack>
    </Box>
  );
};

export { OnboardingScreen };