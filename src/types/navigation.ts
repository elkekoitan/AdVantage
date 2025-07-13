import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: { referralCode?: string };
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Program: undefined;
  Messages: undefined;
  Favorites: undefined;
  Collaboration: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ProgramDetails: { programId: string };
  CreateProgram: { date?: string };
  CompanyDetails: { companyId: string };
  CampaignDetails: { campaignId: string };
  Map: { 
    initialLocation?: { latitude: number; longitude: number };
    searchQuery?: string;
    places?: Array<{ id: string; name: string; latitude: number; longitude: number; }>;
  };
  Settings: undefined;
  Notifications: undefined;
  Chat: { chatId?: string; chatType?: 'direct' | 'group' | 'program'; participantId?: string; programId?: string };
  ActivityDetail: { activityId: string };
  SocialShare: { program: { id: string; title: string; description: string; activities: Array<{ id: string; title: string; }> } };
  ConversationDetail: { conversationId: string };
  FavoriteDetail: { favoriteId: string; favoriteType: string };
  CollaborationDetail: { collaborationId: string };
  EventDetail: { eventId: string };
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;