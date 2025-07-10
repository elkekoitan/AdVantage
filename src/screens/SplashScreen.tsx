import React from 'react';
import { Box, Center, Heading, Spinner, VStack, Text } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';

export const SplashScreen = () => {
  return (
    <Box flex={1}>
      <LinearGradient
        colors={['#2196F3', '#1976D2', '#0D47A1']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />
      <Center flex={1}>
        <VStack space={8} alignItems="center">
          <VStack space={2} alignItems="center">
            <Heading size="3xl" color="white" fontWeight="bold">
              AdVantage
            </Heading>
            <Text fontSize="lg" color="white" opacity={0.9}>
              AI-Powered Social Commerce
            </Text>
          </VStack>
          <Spinner color="white" size="lg" />
        </VStack>
      </Center>
    </Box>
  );
}; 