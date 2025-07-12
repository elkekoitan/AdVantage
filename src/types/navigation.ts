export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: { referralCode?: string };
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  // Add other main app screens here
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;