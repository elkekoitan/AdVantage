-- Sosyal medya paylaşımları tablosu
CREATE TABLE IF NOT EXISTS social_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    platforms TEXT[] NOT NULL, -- ['instagram', 'facebook', 'twitter', 'tiktok', 'whatsapp']
    platform TEXT NOT NULL, -- 'instagram', 'facebook', 'twitter', 'tiktok', 'whatsapp'
    share_type TEXT NOT NULL DEFAULT 'post', -- 'story', 'post', 'reel'
    media_urls TEXT[],
    caption TEXT,
    hashtags TEXT[],
    engagement_metrics JSONB DEFAULT '{}', -- { likes, comments, shares, views }
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_social_shares_user_id ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_program_id ON social_shares(program_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_shared_at ON social_shares(shared_at);

-- RLS politikaları
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi paylaşımlarını görebilir
CREATE POLICY "Users can view own social shares" ON social_shares
    FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi paylaşımlarını oluşturabilir
CREATE POLICY "Users can create own social shares" ON social_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi paylaşımlarını güncelleyebilir
CREATE POLICY "Users can update own social shares" ON social_shares
    FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcılar kendi paylaşımlarını silebilir
CREATE POLICY "Users can delete own social shares" ON social_shares
    FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_shares_updated_at
    BEFORE UPDATE ON social_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sosyal medya istatistikleri için view
CREATE OR REPLACE VIEW social_share_stats AS
SELECT 
    user_id,
    COUNT(*) as total_shares,
    COUNT(DISTINCT platform) as platforms_used,
    COUNT(CASE WHEN shared_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as shares_last_7_days,
    COUNT(CASE WHEN shared_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as shares_last_30_days,
    COALESCE(SUM((engagement_metrics->>'likes')::int), 0) as total_likes,
    COALESCE(SUM((engagement_metrics->>'comments')::int), 0) as total_comments,
    COALESCE(SUM((engagement_metrics->>'shares')::int), 0) as total_reshares,
    COALESCE(SUM((engagement_metrics->>'views')::int), 0) as total_views
FROM social_shares
GROUP BY user_id;

-- Platform bazında istatistikler
CREATE OR REPLACE VIEW platform_share_stats AS
SELECT 
    platform,
    COUNT(*) as total_shares,
    COUNT(DISTINCT user_id) as unique_users,
    AVG((engagement_metrics->>'likes')::int) as avg_likes,
    AVG((engagement_metrics->>'comments')::int) as avg_comments,
    AVG((engagement_metrics->>'shares')::int) as avg_reshares,
    AVG((engagement_metrics->>'views')::int) as avg_views
FROM social_shares
WHERE engagement_metrics IS NOT NULL
GROUP BY platform;