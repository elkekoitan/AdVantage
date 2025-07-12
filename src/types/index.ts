// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profile_visibility: 'public' | 'private' | 'friends';
      activity_visibility: 'public' | 'private' | 'friends';
    };
    language: string;
    currency: string;
  };
  stats: {
    total_programs: number;
    completed_programs: number;
    total_savings: number;
    current_streak: number;
    longest_streak: number;
  };
  achievements: Achievement[];
  created_at: string;
  updated_at: string;
}

// Program Types
export interface Program {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  current_amount: number;
  target_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled' | 'draft';
  completed_at?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  auto_tracking: boolean;
  notifications_enabled: boolean;
  activities: Activity[];
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Activity Types
export interface Activity {
  id: string;
  program_id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  target_amount: number;
  current_amount: number;
  estimated_cost: number;
  duration_hours: number;
  location: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  created_at: string;
  completed_at?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  notes?: string;
}

// Campaign Types
export interface Campaign {
  id: string;
  company_id: string;
  title: string;
  description: string;
  discount_percentage: number;
  discount_amount?: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'upcoming' | 'paused';
  category: string;
  image_url?: string;
  terms_and_conditions: string;
  usage_count: number;
  max_usage?: number;
  location?: string;
  is_featured: boolean;
  company: Company;
  reviews: Review[];
  created_at: string;
  updated_at: string;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string;
  cover_image?: string;
  category: string;
  rating: number;
  review_count: number;
  verified: boolean;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  stats: {
    active_campaigns: number;
    total_savings: number;
    customer_count: number;
  };
  working_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  created_at: string;
  updated_at: string;
}

// Review Types
export interface Review {
  id: string;
  user_id: string;
  campaign_id?: string;
  company_id?: string;
  rating: number;
  comment: string;
  helpful_count: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  created_at: string;
  updated_at: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'savings' | 'programs' | 'activities' | 'social' | 'special';
  requirement: {
    type: 'savings_amount' | 'program_count' | 'activity_count' | 'streak_days' | 'special';
    value: number;
  };
  reward?: {
    type: 'badge' | 'discount' | 'points';
    value: string | number;
  };
  unlocked_at?: string;
  progress: number;
  max_progress: number;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'campaign' | 'achievement' | 'reminder';
  read: boolean;
  action_url?: string;
  data?: Record<string, unknown>;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
}

export interface ProgramForm {
  title: string;
  description: string;
  category: string;
  budget: number;
  target_amount: number;
  start_date: string;
  end_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  auto_tracking: boolean;
  notifications_enabled: boolean;
  activities: ActivityForm[];
  tags?: string[];
  notes?: string;
}

export interface ActivityForm {
  title: string;
  description: string;
  category: string;
  target_amount: number;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  notes?: string;
}

export interface ProfileForm {
  name: string;
  bio?: string;
  location?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface PreferencesForm {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'friends';
    activity_visibility: 'public' | 'private' | 'friends';
  };
  language: string;
  currency: string;
}

// Navigation Types
export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Main Stack
  Home: undefined;
  Programs: undefined;
  ProgramDetail: { programId: string };
  CreateProgram: undefined;
  EditProgram: { programId: string };
  
  Campaigns: undefined;
  CampaignDetail: { campaignId: string };
  
  Companies: undefined;
  CompanyDetail: { companyId: string };
  
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  
  // Modal Stack
  ActivityModal: { activityId?: string; programId?: string };
  ReviewModal: { campaignId?: string; companyId?: string };
};

// Theme Types
export interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  error: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

// OpenRouteService Types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MatrixResponse {
  durations?: number[][];
  distances?: number[][];
  sources: Array<{
    location: [number, number];
    snapped_distance?: number;
  }>;
  destinations: Array<{
    location: [number, number];
    snapped_distance?: number;
  }>;
}

export interface POIResponse {
  features: Array<{
    geometry: {
      coordinates: [number, number];
      type: string;
    };
    properties: {
      id: string;
      gid: string;
      layer: string;
      source: string;
      source_id: string;
      name: string;
      confidence: number;
      match_type: string;
      accuracy: string;
      country: string;
      country_gid: string;
      country_a: string;
      region: string;
      region_gid: string;
      locality: string;
      locality_gid: string;
      label: string;
    };
    type: string;
  }>;
  geocoding: {
    version: string;
    attribution: string;
    query: Record<string, unknown>;
    engine: {
      name: string;
      author: string;
      version: string;
    };
    timestamp: number;
  };
  type: string;
  bbox: [number, number, number, number];
}

export interface OptimizationResponse {
  code: number;
  summary: {
    cost: number;
    routes: number;
    unassigned: number;
    setup: number;
    service: number;
    duration: number;
    waiting_time: number;
    priority: number;
    delivery: number[];
    pickup: number[];
    distance: number;
  };
  unassigned: unknown[];
  routes: Array<{
    vehicle: number;
    cost: number;
    delivery: number[];
    pickup: number[];
    setup: number;
    service: number;
    duration: number;
    waiting_time: number;
    priority: number;
    distance: number;
    steps: Array<{
      type: string;
      location: [number, number];
      id?: number;
      setup?: number;
      service?: number;
      waiting_time?: number;
      job?: number;
      load?: number[];
      arrival?: number;
      duration?: number;
      distance?: number;
    }>;
    geometry?: string;
  }>;
}

export interface ElevationResponse {
  geometry: {
    coordinates: Array<[number, number, number]>;
    type: string;
  };
  type: string;
}

export interface GeocodingResponse {
  features: Array<{
    geometry: {
      coordinates: [number, number];
      type: string;
    };
    properties: {
      id: string;
      gid: string;
      layer: string;
      source: string;
      source_id: string;
      name: string;
      housenumber?: string;
      street?: string;
      confidence: number;
      match_type: string;
      accuracy: string;
      country: string;
      country_gid: string;
      country_a: string;
      region: string;
      region_gid: string;
      locality: string;
      locality_gid: string;
      label: string;
    };
    type: string;
  }>;
  geocoding: {
    version: string;
    attribution: string;
    query: Record<string, unknown>;
    engine: {
      name: string;
      author: string;
      version: string;
    };
    timestamp: number;
  };
  type: string;
  bbox: [number, number, number, number];
}

export interface IsochroneResponse {
  features: Array<{
    geometry: {
      coordinates: number[][][];
      type: string;
    };
    properties: {
      group_index: number;
      value: number;
      center: [number, number];
    };
    type: string;
  }>;
  type: string;
  bbox: [number, number, number, number];
  metadata: {
    attribution: string;
    service: string;
    timestamp: number;
    query: Record<string, unknown>;
    engine: {
      version: string;
      build_date: string;
      graph_date: string;
    };
  };
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;