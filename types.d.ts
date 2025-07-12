declare module '@expo/vector-icons' {
  export * from '@expo/vector-icons/build/vendor-react-native-vector-icons/lib/create-icon-set';
  export { default as AntDesign } from '@expo/vector-icons/build/AntDesign';
  export { default as Entypo } from '@expo/vector-icons/build/Entypo';
  export { default as EvilIcons } from '@expo/vector-icons/build/EvilIcons';
  export { default as Feather } from '@expo/vector-icons/build/Feather';
  export { default as FontAwesome } from '@expo/vector-icons/build/FontAwesome';
  export { default as FontAwesome5 } from '@expo/vector-icons/build/FontAwesome5';
  export { default as Fontisto } from '@expo/vector-icons/build/Fontisto';
  export { default as Foundation } from '@expo/vector-icons/build/Foundation';
  export { default as Ionicons } from '@expo/vector-icons/build/Ionicons';
  export { default as MaterialCommunityIcons } from '@expo/vector-icons/build/MaterialCommunityIcons';
  export { default as MaterialIcons } from '@expo/vector-icons/build/MaterialIcons';
  export { default as Octicons } from '@expo/vector-icons/build/Octicons';
  export { default as SimpleLineIcons } from '@expo/vector-icons/build/SimpleLineIcons';
  export { default as Zocial } from '@expo/vector-icons/build/Zocial';
}

declare module '@react-navigation/native' {
  export * from '@react-navigation/core';
  export { NavigationContainer } from '@react-navigation/core';
}

declare module '@react-navigation/native-stack' {
  export * from '@react-navigation/native-stack/lib/typescript/src';
}

declare module '@react-navigation/bottom-tabs' {
  export * from '@react-navigation/bottom-tabs/lib/typescript/src';
}

declare module 'react-native-vector-icons/*' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';
  
  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  
  export default class Icon extends Component<IconProps> {}
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const value: any;
  export default value;
}

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: string;
    EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY: string;
    EXPO_PUBLIC_OPENROUTE_API_KEY: string;
  }
}

declare namespace process {
  function cwd(): string;
  function exit(code?: number): never;
  const env: NodeJS.ProcessEnv;
}