import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
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

// Import new feature components
import ConversationsList from '../components/messaging/ConversationsList';
import MessagesList from '../components/messaging/MessagesList';
import FavoritesList from '../components/favorites/FavoritesList';
import CollaborationList from '../components/collaboration/CollaborationList';

// Import stack screens
import { ProgramDetailsScreen } from '../screens/programs/ProgramDetailsScreen';
import { CreateProgramScreen } from '../screens/programs/CreateProgramScreen';
import { CompanyDetailsScreen } from '../screens/companies/CompanyDetailsScreen';
import { CampaignDetailsScreen } from '../screens/campaigns/CampaignDetailsScreen';
import SocialShareScreen from '../screens/social/SocialShareScreen';

// Import types
import { MainTabParamList, MainStackParamList } from '../types/navigation';

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
        name="Messages"
        component={ConversationsList}
        options={{
          tabBarLabel: 'Mesajlar',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="message" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesList}
        options={{
          tabBarLabel: 'Favoriler',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Collaboration"
        component={CollaborationList}
        options={{
          tabBarLabel: 'İşbirliği',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="handshake" size={size} color={color} />
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
      <Stack.Screen
        name="SocialShare"
        component={SocialShareScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ConversationDetail"
        component={({ route }: { route: { params?: { conversationId?: string } } }) => <MessagesList conversationId={route.params?.conversationId || ''} />}
        options={{
          animation: 'slide_from_right',
          headerTitle: 'Sohbet',
        }}
      />
      <Stack.Screen
        name="FavoriteDetail"
        component={FavoritesList}
        options={{
          animation: 'slide_from_right',
          headerTitle: 'Favori Detayı',
        }}
      />
      <Stack.Screen
        name="CollaborationDetail"
        component={CollaborationList}
        options={{
          animation: 'slide_from_right',
          headerTitle: 'İşbirliği Detayı',
        }}
      />
      <Stack.Screen
        name="EventDetail"
        component={CollaborationList}
        options={{
          animation: 'slide_from_right',
          headerTitle: 'Etkinlik Detayı',
        }}
      />
    </Stack.Navigator>
  );
};