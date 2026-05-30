-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  tier VARCHAR(20) NOT NULL DEFAULT 'FREE', -- FREE or PREMIUM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create connected_accounts table (stores OAuth tokens for each platform)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- youtube, instagram, tiktok, facebook
  platform_user_id VARCHAR(255) NOT NULL, -- The user's ID on that platform
  platform_username VARCHAR(255),
  access_token TEXT NOT NULL, -- Encrypted at rest by Supabase
  refresh_token TEXT, -- Some platforms don't provide this
  token_expires_at TIMESTAMP,
  profile_picture_url TEXT,
  followers_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_synced_at TIMESTAMP,
  UNIQUE(user_id, platform, platform_user_id)
);

-- Create platform_stats table (daily snapshots)
CREATE TABLE IF NOT EXISTS platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  followers_count INTEGER,
  views_count BIGINT,
  engagement_rate FLOAT,
  videos_count INTEGER,
  earnings DECIMAL(10, 2) DEFAULT 0, -- Manual entry by user
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create scheduled_posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT, -- URL to the video file (stored in cloud storage)
  captions JSONB, -- {
                   -- "youtube": "Caption for YouTube",
                   -- "instagram": "Caption for Instagram",
                   -- "tiktok": "Caption for TikTok",
                   -- "facebook": "Caption for Facebook"
                   -- }
  platforms_to_post JSONB, -- ["youtube", "instagram", "tiktok"]
  scheduled_time TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, POSTED, FAILED, CANCELLED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  posted_at TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL DEFAULT 'FREE', -- FREE or PREMIUM
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50), -- active, past_due, canceled, etc.
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create earnings table (manual entry)
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES connected_accounts(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  source VARCHAR(100), -- AdSense, Super Chat, Affiliate, etc.
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_connected_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX idx_platform_stats_account_id ON platform_stats(account_id);
CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_earnings_user_id ON earnings(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Enable Row Level Security (RLS) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read their own accounts" ON connected_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own stats" ON platform_stats
  FOR SELECT USING (
    account_id IN (
      SELECT id FROM connected_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their own posts" ON scheduled_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own earnings" ON earnings
  FOR SELECT USING (auth.uid() = user_id);
