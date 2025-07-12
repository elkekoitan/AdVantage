import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
// Define PlaceResult type locally until googleMapsService is implemented
type PlaceResult = {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
};

// Import main screens
import { HomeScreen } from '../screens/main/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import { ProgramScreen } from '../screens/main/ProgramScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import MapScreen from '../screens/main/MapScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { ActivityDetailScreen } from '../screens/main/ActivityDetailScreen';

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
  Map: { 
    initialLocation?: { latitude: number; longitude: number };
    searchQuery?: string;
    places?: PlaceResult[];
  };
  Settings: undefined;
  Notifications: undefined;
  Chat: { chatId?: string; chatType?: 'direct' | 'group' | 'program'; participantId?: string; programId?: string };
  ActivityDetail: { activityId: string };
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
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="explore" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Program"
        component={ProgramScreen}
        options={{
          tabBarLabel: 'Programım',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-clock" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
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
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: '#2196F3',
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProgramDetails"
        component={ProgramDetailsScreen}
        options={{
          animation: 'slide_from_right',
          headerTitle: 'Program Detayları',
        }}
      />
      <Stack.Screen
        name="CreateProgram"
        component={CreateProgramScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
          headerTitle: 'Yeni Program',
        }}
      />
      <Stack.Screen
        name="CompanyDetails"
        component={CompanyDetailsScreen}
        options={{
          animation: 'slide_from_right',
          headerTitle: 'Şirket Detayları',
        }}
      />
      <Stack.Screen
        name="CampaignDetails"
        component={CampaignDetailsScreen}
        options={{
          animation: 'slide_from_right',
          headerTitle: 'Kampanya Detayları',
        }}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          animation: 'slide_from_right',
          headerShown: true,
          headerTitle: 'Harita',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          animation: 'slide_from_right',
          headerTitle: 'Ayarlar',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          animation: 'slide_from_right',
          headerTitle: 'Bildirimler',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          animation: 'slide_from_right',
          headerTitle: 'Sohbet',
        }}
      />
      <Stack.Screen
        name="ActivityDetail"
        component={ActivityDetailScreen}
        options={{
          animation: 'slide_from_right',
          headerTitle: 'Aktivite Detayları',
        }}
      />
    </Stack.Navigator>
  );
};