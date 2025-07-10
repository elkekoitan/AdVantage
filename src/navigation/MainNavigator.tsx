import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from 'native-base';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Import main screens
import { HomeScreen } from '../screens/main/HomeScreen';
import { ExploreScreen } from '../screens/main/ExploreScreen';
import { ProgramScreen } from '../screens/main/ProgramScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

// Import stack screens
import { ProgramDetailsScreen } from '../screens/programs/ProgramDetailsScreen';
import { CreateProgramScreen } from '../screens/programs/CreateProgramScreen';
import { CompanyDetailsScreen } from '../screens/companies/CompanyDetailsScreen';
import { CampaignDetailsScreen } from '../screens/campaigns/CampaignDetailsScreen';

// Type definitions
export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Program: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  ProgramDetails: { programId: string };
  CreateProgram: { date?: string };
  CompanyDetails: { companyId: string };
  CampaignDetails: { campaignId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <Icon as={MaterialIcons} name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color, size }) => (
            <Icon as={MaterialIcons} name="explore" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Program"
        component={ProgramScreen}
        options={{
          tabBarLabel: 'Programım',
          tabBarIcon: ({ color, size }) => (
            <Icon as={MaterialCommunityIcons} name="calendar-clock" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Icon as={MaterialIcons} name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="ProgramDetails"
        component={ProgramDetailsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="CreateProgram"
        component={CreateProgramScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="CompanyDetails"
        component={CompanyDetailsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="CampaignDetails"
        component={CampaignDetailsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}; 