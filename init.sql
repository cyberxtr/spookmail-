-- Database initialization script
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables if they don't exist yet (fallback if migrations fail)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telegram_users (
    id TEXT PRIMARY KEY,
    username VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    language_code VARCHAR(10),
    is_bot BOOLEAN DEFAULT FALSE,
    checks_used INTEGER DEFAULT 0,
    checks_limit INTEGER DEFAULT 5,
    last_check_reset TIMESTAMP DEFAULT NOW(),
    referral_code VARCHAR(20) UNIQUE,
    referred_by TEXT,
    total_referrals INTEGER DEFAULT 0,
    bonus_checks INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES telegram_users(id),
    email VARCHAR(255) NOT NULL,
    is_valid BOOLEAN,
    is_disposable BOOLEAN,
    is_catchall BOOLEAN,
    quality_score INTEGER,
    api_response JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bot_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bot_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    command VARCHAR(50) NOT NULL,
    description TEXT,
    response TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    media_url TEXT,
    target_audience VARCHAR(20) DEFAULT 'all',
    sent_count INTEGER DEFAULT 0,
    total_targets INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMP DEFAULT NOW(),
    new_users INTEGER DEFAULT 0,
    total_checks INTEGER DEFAULT 0,
    valid_emails INTEGER DEFAULT 0,
    invalid_emails INTEGER DEFAULT 0,
    new_referrals INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0
);

-- Insert default admin if not exists
INSERT INTO admins (username, password, role)
VALUES ('torevar', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default bot settings
INSERT INTO bot_settings (key, value, description)
VALUES 
('welcome_message', 'Welcome to the Email Verification Bot! I can help you verify email addresses.', 'Welcome message shown to new users'),
('help_message', 'This bot helps you verify email addresses. Type /check followed by an email to verify it.', 'Help message shown when /help is used'),
('daily_limit', '5', 'Daily limit of email checks per user'),
('referral_bonus', '2', 'Number of bonus checks for each referral')
ON CONFLICT (key) DO NOTHING;
