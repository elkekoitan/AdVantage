-- AdVantage Messaging, Favorites & Collaboration Features
-- Version: 1.1.0

-- User Messages/Chat System
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'location', 'program_share', 'business_share')),
    content TEXT,
    media_url TEXT,
    metadata JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    reply_to_id UUID REFERENCES public.messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_type TEXT DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group', 'business')),
    title TEXT,
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES public.profiles(id),
    last_message_id UUID REFERENCES public.messages(id),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Participants
CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    muted BOOLEAN DEFAULT FALSE,
    last_read_message_id UUID REFERENCES public.messages(id),
    UNIQUE(conversation_id, user_id)
);

-- User Favorites (Programs, Businesses, Activities)
CREATE TABLE public.user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    favorite_type TEXT NOT NULL CHECK (favorite_type IN ('program', 'company', 'activity', 'campaign', 'user')),
    favorite_id UUID NOT NULL,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, favorite_type, favorite_id)
);

-- Business Collaborations
CREATE TABLE public.business_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiator_company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    partner_company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    collaboration_type TEXT NOT NULL CHECK (collaboration_type IN ('joint_event', 'cross_promotion', 'package_deal', 'referral_program', 'shared_campaign')),
    title TEXT NOT NULL,
    description TEXT,
    terms JSONB DEFAULT '{}',
    revenue_split JSONB DEFAULT '{}', -- {"initiator": 60, "partner": 40}
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'negotiating', 'active', 'paused', 'completed', 'cancelled')),
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collaborative Events/Programs
CREATE TABLE public.collaborative_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collaboration_id UUID REFERENCES public.business_collaborations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'festival', 'promotion', 'contest', 'networking', 'charity')),
    location GEOGRAPHY(POINT),
    address TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    requirements JSONB DEFAULT '{}',
    media_urls TEXT[],
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'published', 'active', 'completed', 'cancelled')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Participants
CREATE TABLE public.event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.collaborative_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    attendance_status TEXT DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'waived')),
    special_requirements TEXT,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- User Connections/Following System
CREATE TABLE public.user_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    connection_type TEXT DEFAULT 'follow' CHECK (connection_type IN ('follow', 'friend', 'block')),
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Business Partnership Requests
CREATE TABLE public.partnership_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    to_company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('collaboration', 'sponsorship', 'vendor', 'affiliate')),
    message TEXT,
    proposed_terms JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    response_message TEXT,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_conversations_participants ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversations_user ON public.conversation_participants(user_id);
CREATE INDEX idx_user_favorites_user_type ON public.user_favorites(user_id, favorite_type);
CREATE INDEX idx_business_collaborations_companies ON public.business_collaborations(initiator_company_id, partner_company_id);
CREATE INDEX idx_collaborative_events_collaboration ON public.collaborative_events(collaboration_id);
CREATE INDEX idx_collaborative_events_dates ON public.collaborative_events(start_date, end_date);
CREATE INDEX idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX idx_event_participants_user ON public.event_participants(user_id);
CREATE INDEX idx_user_connections_follower ON public.user_connections(follower_id);
CREATE INDEX idx_user_connections_following ON public.user_connections(following_id);
CREATE INDEX idx_partnership_requests_companies ON public.partnership_requests(from_company_id, to_company_id);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Messages: Users can see messages in conversations they participate in
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
);

CREATE POLICY "Users can send messages to their conversations" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
);

-- Conversations: Users can see conversations they participate in
CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()
    )
);

-- User Favorites: Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON public.user_favorites FOR ALL USING (auth.uid() = user_id);

-- Business Collaborations: Company owners can manage their collaborations
CREATE POLICY "Company owners can manage collaborations" ON public.business_collaborations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.companies c
        WHERE (c.id = initiator_company_id OR c.id = partner_company_id)
        AND c.owner_id = auth.uid()
    )
);

-- User Connections: Users can manage their own connections
CREATE POLICY "Users can manage own connections" ON public.user_connections FOR ALL USING (
    auth.uid() = follower_id OR auth.uid() = following_id
);

-- Partnership Requests: Company owners can manage their requests
CREATE POLICY "Company owners can manage partnership requests" ON public.partnership_requests FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.companies c
        WHERE (c.id = from_company_id OR c.id = to_company_id)
        AND c.owner_id = auth.uid()
    )
);

-- Update triggers
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_collaborations_updated_at BEFORE UPDATE ON public.business_collaborations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaborative_events_updated_at BEFORE UPDATE ON public.collaborative_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation last activity
CREATE OR REPLACE FUNCTION update_conversation_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_id = NEW.id,
        last_activity_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_activity_trigger
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_activity();

-- Function to update event participant count
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.collaborative_events
        SET current_participants = current_participants + 1
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.collaborative_events
        SET current_participants = current_participants - 1
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_participants_count_trigger
AFTER INSERT OR DELETE ON public.event_participants
FOR EACH ROW EXECUTE FUNCTION update_event_participants_count();

-- Views for easier querying
CREATE VIEW public.user_conversation_list AS
SELECT 
    c.id,
    c.conversation_type,
    c.title,
    c.avatar_url,
    c.last_activity_at,
    cp.user_id,
    cp.muted,
    cp.last_read_message_id,
    m.content as last_message_content,
    m.sender_id as last_message_sender_id,
    sender.full_name as last_message_sender_name
FROM public.conversations c
JOIN public.conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN public.messages m ON c.last_message_id = m.id
LEFT JOIN public.profiles sender ON m.sender_id = sender.id
WHERE cp.left_at IS NULL;

CREATE VIEW public.user_favorites_detailed AS
SELECT 
    uf.*,
    CASE 
        WHEN uf.favorite_type = 'company' THEN c.name
        WHEN uf.favorite_type = 'program' THEN p.title
        WHEN uf.favorite_type = 'user' THEN pr.full_name
    END as favorite_name,
    CASE 
        WHEN uf.favorite_type = 'company' THEN c.logo_url
        WHEN uf.favorite_type = 'user' THEN pr.avatar_url
    END as favorite_image
FROM public.user_favorites uf
LEFT JOIN public.companies c ON uf.favorite_type = 'company' AND uf.favorite_id = c.id
LEFT JOIN public.programs p ON uf.favorite_type = 'program' AND uf.favorite_id = p.id
LEFT JOIN public.profiles pr ON uf.favorite_type = 'user' AND uf.favorite_id = pr.id;

-- Comments
COMMENT ON TABLE public.messages IS 'User-to-user messaging system';
COMMENT ON TABLE public.conversations IS 'Chat conversations (direct, group, business)';
COMMENT ON TABLE public.user_favorites IS 'User favorites for programs, businesses, activities';
COMMENT ON TABLE public.business_collaborations IS 'Business-to-business collaboration agreements';
COMMENT ON TABLE public.collaborative_events IS 'Joint events organized by collaborating businesses';
COMMENT ON TABLE public.user_connections IS 'User following/friendship system';
COMMENT ON TABLE public.partnership_requests IS 'Business partnership requests and proposals';