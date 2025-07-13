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

// Messaging & Communication Types
export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  conversation_id: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'program_share' | 'business_share';
  content?: string;
  media_url?: string;
  metadata: Record<string, any>;
  read_at?: string;
  edited_at?: string;
  deleted_at?: string;
  reply_to_id?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  conversation_type: 'direct' | 'group' | 'business';
  title?: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  last_message_id?: string;
  last_message?: string;
  last_message_at?: string;
  last_activity_at: string;
  unread_count?: number;
  is_muted?: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  left_at?: string;
  muted: boolean;
  last_read_message_id?: string;
}

export interface ConversationListItem {
  id: string;
  conversation_type: 'direct' | 'group' | 'business';
  type: 'direct' | 'group' | 'business';
  title?: string;
  avatar_url?: string;
  last_activity_at: string;
  last_message_at?: string;
  user_id: string;
  muted: boolean;
  last_read_message_id?: string;
  last_message?: string;
  last_message_content?: string;
  last_message_sender_id?: string;
  last_message_sender_name?: string;
  unread_count?: number;
  is_muted?: boolean;
  participant_count?: number;
  created_at: string;
  updated_at: string;
}

// Favorites Types
export interface UserFavorite {
  id: string;
  user_id: string;
  favorite_type: 'program' | 'company' | 'activity' | 'campaign' | 'user';
  favorite_id: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export interface UserFavoriteDetailed extends UserFavorite {
  favorite_name?: string;
  favorite_image?: string;
}

// User Connections Types
export interface UserConnection {
  id: string;
  follower_id: string;
  following_id: string;
  requester_id: string;
  user_id: string;
  requester_name?: string;
  target_name?: string;
  connection_type: 'follow' | 'friend' | 'block';
  status: 'pending' | 'active' | 'blocked' | 'accepted';
  message?: string;
  created_at: string;
}

// Business Collaboration Types
export interface BusinessCollaboration {
  id: string;
  initiator_company_id: string;
  partner_company_id: string;
  collaboration_type: 'joint_event' | 'cross_promotion' | 'package_deal' | 'referral_program' | 'shared_campaign';
  title: string;
  description?: string;
  terms: Record<string, any>;
  revenue_split: Record<string, number>;
  start_date: string;
  end_date?: string;
  status: 'proposed' | 'negotiating' | 'active' | 'paused' | 'completed' | 'cancelled';
  performance_metrics: Record<string, any>;
  requirements?: string;
  created_at: string;
  updated_at: string;
}

export interface CollaborativeEvent {
  id: string;
  collaboration_id: string;
  title: string;
  description?: string;
  event_type: 'workshop' | 'festival' | 'promotion' | 'contest' | 'networking' | 'charity';
  location?: {
    lat: number;
    lng: number;
  };
  address?: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  current_participants: number;
  registration_fee: number;
  requirements: Record<string, any>;
  media_urls?: string[];
  status: 'planning' | 'published' | 'active' | 'completed' | 'cancelled';
  metadata: Record<string, any>;
  is_participant?: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  registration_date: string;
  attendance_status: 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded' | 'waived';
  special_requirements?: string;
  feedback_rating?: number;
  feedback_comment?: string;
  created_at: string;
}

export interface PartnershipRequest {
  id: string;
  from_company_id: string;
  to_company_id: string;
  request_type: 'collaboration' | 'sponsorship' | 'vendor' | 'affiliate';
  requester_type?: string;
  requester_name?: string;
  target_name?: string;
  message?: string;
  proposed_terms: Record<string, any>;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  response_message?: string;
  expires_at: string;
  created_at: string;
  responded_at?: string;
}

// Form Types for Creating/Updating
export interface CreateMessageForm {
  recipient_id: string;
  conversation_id?: string;
  message_type?: 'text' | 'image' | 'video' | 'audio' | 'location' | 'program_share' | 'business_share';
  content?: string;
  media_url?: string;
  reply_to_id?: string;
}

export interface CreateConversationForm {
  conversation_type: 'direct' | 'group' | 'business';
  title?: string;
  description?: string;
  participant_ids: string[];
}

export interface CreateCollaborationForm {
  partner_company_id: string;
  collaboration_type: 'joint_event' | 'cross_promotion' | 'package_deal' | 'referral_program' | 'shared_campaign';
  title: string;
  description?: string;
  terms: Record<string, any>;
  revenue_split: Record<string, number>;
  start_date: string;
  end_date?: string;
}

export interface CreateEventForm {
  collaboration_id: string;
  title: string;
  description?: string;
  event_type: 'workshop' | 'festival' | 'promotion' | 'contest' | 'networking' | 'charity';
  location?: {
    lat: number;
    lng: number;
  };
  address?: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  registration_fee?: number;
  requirements?: Record<string, any>;
}

export interface CreatePartnershipRequestForm {
  to_company_id: string;
  request_type: 'collaboration' | 'sponsorship' | 'vendor' | 'affiliate';
  message?: string;
  proposed_terms: Record<string, any>;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;