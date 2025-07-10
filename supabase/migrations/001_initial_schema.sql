-- AdVantage Database Schema
-- Version: 1.0.0

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    location GEOGRAPHY(POINT),
    preferences JSONB DEFAULT '{}',
    referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 0, 9),
    referred_by UUID REFERENCES public.profiles(id),
    is_influencer BOOLEAN DEFAULT FALSE,
    influencer_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies/Businesses table
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    category TEXT NOT NULL,
    subcategories TEXT[],
    location GEOGRAPHY(POINT),
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    social_media JSONB DEFAULT '{}',
    business_hours JSONB DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    subscription_tier TEXT DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Programs/Itineraries
CREATE TABLE public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    is_public BOOLEAN DEFAULT FALSE,
    share_token TEXT UNIQUE DEFAULT substr(md5(random()::text), 0, 12),
    total_budget DECIMAL(10,2),
    spent_amount DECIMAL(10,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program Activities/Events
CREATE TABLE public.program_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id),
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT),
    address TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    booking_reference TEXT,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    media_urls TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns/Offers
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN ('discount', 'special_offer', 'event', 'product_launch', 'service')),
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'bogo', 'custom')),
    discount_value DECIMAL(10,2),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    target_audience JSONB DEFAULT '{}',
    terms_conditions TEXT,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    media_urls TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Campaign Interactions
CREATE TABLE public.user_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    program_activity_id UUID REFERENCES public.program_activities(id),
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('viewed', 'saved', 'used', 'shared')),
    used_at TIMESTAMPTZ,
    discount_applied DECIMAL(10,2),
    transaction_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, campaign_id, interaction_type)
);

-- Social Shares & Referrals
CREATE TABLE public.social_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'tiktok', 'whatsapp', 'telegram', 'other')),
    share_type TEXT NOT NULL CHECK (share_type IN ('story', 'post', 'reel', 'message')),
    share_url TEXT,
    media_urls TEXT[],
    collage_url TEXT,
    engagement_data JSONB DEFAULT '{}',
    earnings DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral Tracking
CREATE TABLE public.referral_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES public.profiles(id),
    visitor_id UUID REFERENCES public.profiles(id),
    share_id UUID REFERENCES public.social_shares(id),
    visit_source TEXT,
    ip_address INET,
    user_agent TEXT,
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Analytics/Traffic
CREATE TABLE public.company_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    traffic_sources JSONB DEFAULT '{}',
    demographic_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, date)
);

-- AI Recommendations
CREATE TABLE public.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('restaurant', 'activity', 'product', 'music', 'movie', 'game', 'event')),
    title TEXT NOT NULL,
    description TEXT,
    company_id UUID REFERENCES public.companies(id),
    external_id TEXT,
    score DECIMAL(3,2),
    reason TEXT,
    media_url TEXT,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    shown_at TIMESTAMPTZ DEFAULT NOW(),
    interacted_at TIMESTAMPTZ,
    interaction_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Influencer Partnerships
CREATE TABLE public.partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    partnership_type TEXT NOT NULL CHECK (partnership_type IN ('commission', 'fixed_fee', 'hybrid', 'barter')),
    commission_rate DECIMAL(5,2),
    fixed_amount DECIMAL(10,2),
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
    terms JSONB DEFAULT '{}',
    performance_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions/Payments
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    company_id UUID REFERENCES public.companies(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'refund', 'commission', 'referral_earning', 'subscription')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    payment_id TEXT,
    reference_id UUID,
    reference_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews/Ratings
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    program_activity_id UUID REFERENCES public.program_activities(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    media_urls TEXT[],
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    action_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_location ON public.profiles USING GIST(location);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_companies_location ON public.companies USING GIST(location);
CREATE INDEX idx_companies_category ON public.companies(category);
CREATE INDEX idx_programs_user_date ON public.programs(user_id, date);
CREATE INDEX idx_program_activities_program ON public.program_activities(program_id);
CREATE INDEX idx_campaigns_company_dates ON public.campaigns(company_id, start_date, end_date);
CREATE INDEX idx_user_campaigns_user ON public.user_campaigns(user_id);
CREATE INDEX idx_social_shares_user ON public.social_shares(user_id);
CREATE INDEX idx_company_analytics_company_date ON public.company_analytics(company_id, date);
CREATE INDEX idx_recommendations_user_type ON public.recommendations(user_id, recommendation_type);
CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_company ON public.transactions(company_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (to be expanded based on requirements)
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

-- Users can manage their own programs
CREATE POLICY "Users can manage own programs" ON public.programs FOR ALL USING (auth.uid() = user_id);

-- Public programs are viewable by everyone
CREATE POLICY "Public programs are viewable" ON public.programs FOR SELECT USING (is_public = true);

-- Company owners can manage their companies
CREATE POLICY "Company owners can manage companies" ON public.companies FOR ALL USING (auth.uid() = owner_id);

-- Public company data is viewable
CREATE POLICY "Companies are publicly viewable" ON public.companies FOR SELECT USING (true);

-- Functions and Triggers
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_program_activities_updated_at BEFORE UPDATE ON public.program_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partnerships_updated_at BEFORE UPDATE ON public.partnerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update company rating
CREATE OR REPLACE FUNCTION update_company_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.companies
    SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM public.reviews
        WHERE company_id = NEW.company_id
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE company_id = NEW.company_id
    )
    WHERE id = NEW.company_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_company_rating(); 