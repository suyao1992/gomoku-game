-- ============================================
-- 棋友圈社区数据库 Schema
-- Cloudflare D1 (SQLite)
-- ============================================

-- 用户表 (从游戏同步)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    elo INTEGER DEFAULT 1000,
    is_banned INTEGER DEFAULT 0,
    ban_reason TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 帖子表
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('discussion', 'battle', 'replay', 'announcement')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    images TEXT,                    -- JSON数组 ["url1", "url2"]
    battle_config TEXT,             -- 约战配置 JSON
    battle_status TEXT,             -- 'open' | 'matched' | 'finished'
    battle_opponent_id TEXT,        -- 接受约战的用户ID
    battle_room_code TEXT,          -- 生成的房间码
    replay_data TEXT,               -- 棋谱数据 JSON
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'pending', 'hidden', 'deleted')),
    is_pinned INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 评论表 (支持多层嵌套)
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    parent_id TEXT,                 -- 父评论ID，NULL = 顶级评论
    reply_to_user_id TEXT,          -- 回复的用户ID
    reply_to_user_name TEXT,        -- 回复的用户名
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'hidden', 'deleted')),
    created_at INTEGER NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment')),
    target_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(target_type, target_id, user_id)
);

-- 举报表
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment', 'user')),
    target_id TEXT NOT NULL,
    reporter_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    handled_by TEXT,
    handled_note TEXT,
    handled_at INTEGER,
    created_at INTEGER NOT NULL
);

-- 敏感词表
CREATE TABLE IF NOT EXISTS sensitive_words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL UNIQUE,
    level TEXT DEFAULT 'block' CHECK(level IN ('block', 'warn', 'replace')),
    replacement TEXT,
    created_at INTEGER NOT NULL
);

-- ============================================
-- 索引优化
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(is_pinned DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);

-- ============================================
-- 初始化敏感词
-- ============================================
INSERT OR IGNORE INTO sensitive_words (word, level, created_at) VALUES 
    ('傻逼', 'block', strftime('%s', 'now') * 1000),
    ('操你妈', 'block', strftime('%s', 'now') * 1000),
    ('fuck', 'block', strftime('%s', 'now') * 1000),
    ('shit', 'warn', strftime('%s', 'now') * 1000);

-- ============================================
-- 消息通知表
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,            -- 接收通知的用户
    type TEXT NOT NULL CHECK(type IN ('comment', 'like', 'reply', 'mention', 'system')),
    title TEXT NOT NULL,
    content TEXT,
    from_user_id TEXT,                -- 触发通知的用户
    from_user_name TEXT,
    target_type TEXT,                 -- 'post', 'comment'
    target_id TEXT,
    post_id TEXT,                     -- 关联帖子ID (方便跳转)
    is_read INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- 游戏分析数据表
-- ============================================

-- 访问记录表
CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    page TEXT DEFAULT 'home',
    referrer TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    is_new_visitor INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
);

-- 对局记录表
CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    mode TEXT NOT NULL,
    sub_mode TEXT,
    result TEXT,
    winner TEXT,
    moves_count INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0,
    started_at INTEGER NOT NULL,
    ended_at INTEGER
);

-- 事件记录表
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_data TEXT,
    created_at INTEGER NOT NULL
);

-- 每日汇总表
CREATE TABLE IF NOT EXISTS daily_stats (
    date TEXT PRIMARY KEY,
    pv INTEGER DEFAULT 0,
    uv INTEGER DEFAULT 0,
    new_visitors INTEGER DEFAULT 0,
    games_total INTEGER DEFAULT 0,
    games_pve INTEGER DEFAULT 0,
    games_pvp INTEGER DEFAULT 0,
    games_online INTEGER DEFAULT 0,
    avg_duration INTEGER DEFAULT 0,
    updated_at INTEGER
);

-- 分析表索引
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(created_at);
CREATE INDEX IF NOT EXISTS idx_games_mode ON games(mode);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(started_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type, event_name);
