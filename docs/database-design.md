# Database Design - Plastic Crack

## 1. Database Overview

Plastic Crack uses a multi-database architecture with PostgreSQL as the primary database, Redis for caching and real-time features, ElasticSearch for search functionality, and specialized time-series storage for pricing data.

### 1.1 Design Principles
- **Cross-Platform Support**: Optimized for mobile and web applications
- **Real-Time Features**: Support for live updates and social interactions
- **AI Integration**: Structured data for machine learning algorithms
- **Price Intelligence**: Time-series data for price tracking and trends
- **Social Graph**: Optimized relationship management
- **Scalability**: Horizontal partitioning and sharding support
- **Data Integrity**: Comprehensive constraints and validation
- **Audit Trail**: Complete audit logging for all entities

### 1.2 Database Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Redis         │    │  ElasticSearch  │
│   (Primary DB)  │    │   (Cache/RT)    │    │   (Search)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   InfluxDB      │
                    │   (Time Series  │
                    │    for Pricing) │
                    └─────────────────┘
```

### 1.3 Database Configuration
- **PostgreSQL 15+**: Primary relational data
- **Redis 7+**: Caching, sessions, real-time features
- **ElasticSearch 8+**: Full-text search and analytics
- **InfluxDB 2+**: Time-series data for pricing
- **Encoding**: UTF-8
- **Timezone**: UTC

## 2. User Management Tables

### 2.1 Enhanced Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth-only users
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    location VARCHAR(255),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    privacy_setting privacy_level DEFAULT 'public',
    experience_level experience_level DEFAULT 'beginner',
    preferred_game_systems TEXT[], -- Array of game systems
    preferred_paint_brands TEXT[], -- Array of paint brands
    notification_preferences JSONB DEFAULT '{}',
    ai_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_sync_at TIMESTAMP WITH TIME ZONE -- For mobile sync
);

-- Enhanced enums
CREATE TYPE privacy_level AS ENUM ('public', 'friends', 'private');
CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_premium ON users(is_premium) WHERE is_premium = TRUE;
CREATE INDEX idx_users_game_systems ON users USING GIN(preferred_game_systems);
```

### 2.2 OAuth Providers Table
```sql
CREATE TABLE oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'facebook', 'apple'
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_oauth_user_id ON oauth_providers(user_id);
CREATE INDEX idx_oauth_provider ON oauth_providers(provider, provider_user_id);
```

### 2.3 Device Management Table
```sql
CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    platform device_platform NOT NULL,
    app_version VARCHAR(20),
    os_version VARCHAR(20),
    push_token TEXT,
    push_enabled BOOLEAN DEFAULT TRUE,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, device_id)
);

CREATE TYPE device_platform AS ENUM ('ios', 'android', 'web');
CREATE INDEX idx_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_devices_platform ON user_devices(platform);
```

## 3. Enhanced Collection Management

### 3.1 Models Catalog with Pricing
```sql
CREATE TABLE models_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    faction_id UUID REFERENCES factions(id),
    game_system_id UUID REFERENCES game_systems(id),
    manufacturer VARCHAR(100) DEFAULT 'Games Workshop',
    model_type model_type_enum,
    msrp DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    release_date DATE,
    discontinued BOOLEAN DEFAULT FALSE,
    barcode VARCHAR(50),
    description TEXT,
    lore_description TEXT, -- For AI color recommendations
    images JSONB DEFAULT '[]', -- Array of image URLs
    dimensions JSONB, -- Height, width, depth
    base_size VARCHAR(20),
    points_value INTEGER,
    rules_text TEXT,
    tags TEXT[],
    ai_metadata JSONB DEFAULT '{}', -- For ML features
    search_vector tsvector, -- Full-text search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE model_type_enum AS ENUM (
    'character', 'troop', 'elite', 'fast_attack', 'heavy_support', 
    'dedicated_transport', 'lord_of_war', 'fortification'
);

-- Indexes
CREATE INDEX idx_models_name ON models_catalog(name);
CREATE INDEX idx_models_slug ON models_catalog(slug);
CREATE INDEX idx_models_faction ON models_catalog(faction_id);
CREATE INDEX idx_models_game_system ON models_catalog(game_system_id);
CREATE INDEX idx_models_search ON models_catalog USING GIN(search_vector);
CREATE INDEX idx_models_tags ON models_catalog USING GIN(tags);
CREATE INDEX idx_models_barcode ON models_catalog(barcode);
```

### 3.2 User Collections with AI Metadata
```sql
CREATE TABLE user_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models_catalog(id),
    custom_name VARCHAR(255), -- User's custom name for this model
    quantity INTEGER DEFAULT 1,
    purchase_price DECIMAL(10,2),
    purchase_date DATE,
    purchase_location VARCHAR(255),
    painting_status painting_status_enum DEFAULT 'unpainted',
    painting_start_date DATE,
    painting_completion_date DATE,
    painting_time_minutes INTEGER, -- Total time spent painting
    skill_assessment JSONB, -- AI-generated skill assessment
    color_scheme JSONB, -- Color scheme used
    techniques_used TEXT[],
    notes TEXT,
    images JSONB DEFAULT '[]', -- Progress photos
    is_showcase BOOLEAN DEFAULT FALSE, -- Featured in user's showcase
    is_wishlist BOOLEAN DEFAULT FALSE,
    condition condition_enum DEFAULT 'new',
    location VARCHAR(100), -- Physical storage location
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    ai_generated_tags TEXT[], -- AI-generated tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE painting_status_enum AS ENUM (
    'unpainted', 'primed', 'basecoated', 'shaded', 'highlighted', 
    'detailed', 'finished', 'showcase_ready'
);

CREATE TYPE condition_enum AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');

-- Indexes
CREATE INDEX idx_user_models_user_id ON user_models(user_id);
CREATE INDEX idx_user_models_model_id ON user_models(model_id);
CREATE INDEX idx_user_models_painting_status ON user_models(painting_status);
CREATE INDEX idx_user_models_showcase ON user_models(is_showcase) WHERE is_showcase = TRUE;
CREATE INDEX idx_user_models_wishlist ON user_models(user_id, is_wishlist) WHERE is_wishlist = TRUE;
```

## 4. AI and Recommendation Tables

### 4.1 AI Color Schemes
```sql
CREATE TABLE ai_color_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    model_id UUID REFERENCES models_catalog(id),
    faction_id UUID REFERENCES factions(id),
    primary_colors JSONB NOT NULL, -- Array of color objects
    secondary_colors JSONB,
    accent_colors JSONB,
    techniques TEXT[],
    difficulty_level difficulty_enum,
    estimated_time_minutes INTEGER,
    lore_accuracy DECIMAL(3,2), -- 0-1 scale
    popularity_score DECIMAL(3,2),
    ai_confidence DECIMAL(3,2),
    tutorial_links TEXT[],
    created_by ai_source_enum,
    user_ratings JSONB DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE difficulty_enum AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE ai_source_enum AS ENUM ('gpt4', 'custom_model', 'community', 'official');

CREATE INDEX idx_color_schemes_model ON ai_color_schemes(model_id);
CREATE INDEX idx_color_schemes_faction ON ai_color_schemes(faction_id);
CREATE INDEX idx_color_schemes_difficulty ON ai_color_schemes(difficulty_level);
CREATE INDEX idx_color_schemes_popularity ON ai_color_schemes(popularity_score DESC);
```

### 4.2 Purchase Recommendations
```sql
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models_catalog(id),
    recommendation_type recommendation_type_enum,
    reason TEXT,
    confidence_score DECIMAL(3,2),
    priority_score DECIMAL(3,2),
    estimated_value DECIMAL(10,2),
    context JSONB, -- Additional context data
    expires_at TIMESTAMP WITH TIME ZONE,
    clicked BOOLEAN DEFAULT FALSE,
    purchased BOOLEAN DEFAULT FALSE,
    dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE recommendation_type_enum AS ENUM (
    'army_completion', 'similar_interest', 'price_drop', 
    'trending', 'seasonal', 'skill_progression'
);

CREATE INDEX idx_recommendations_user ON ai_recommendations(user_id);
CREATE INDEX idx_recommendations_type ON ai_recommendations(recommendation_type);
CREATE INDEX idx_recommendations_active ON ai_recommendations(user_id, expires_at) 
    WHERE expires_at > CURRENT_TIMESTAMP AND dismissed = FALSE;
```

## 5. Price Intelligence Tables

### 5.1 Retailers and Price Data
```sql
CREATE TABLE retailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    country_code VARCHAR(2),
    currency VARCHAR(3),
    affiliate_program BOOLEAN DEFAULT FALSE,
    scraping_enabled BOOLEAN DEFAULT TRUE,
    api_integration BOOLEAN DEFAULT FALSE,
    reliability_score DECIMAL(3,2) DEFAULT 1.0,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Price data stored in InfluxDB for time-series performance
-- This table stores current/latest prices for quick access
CREATE TABLE current_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models_catalog(id),
    retailer_id UUID NOT NULL REFERENCES retailers(id),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stock_status stock_status_enum DEFAULT 'unknown',
    product_url TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_on_sale BOOLEAN DEFAULT FALSE,
    discount_percentage DECIMAL(5,2),
    UNIQUE(model_id, retailer_id)
);

CREATE TYPE stock_status_enum AS ENUM ('in_stock', 'limited', 'out_of_stock', 'pre_order', 'unknown');

CREATE INDEX idx_current_prices_model ON current_prices(model_id);
CREATE INDEX idx_current_prices_retailer ON current_prices(retailer_id);
CREATE INDEX idx_current_prices_updated ON current_prices(last_updated);
CREATE INDEX idx_current_prices_sale ON current_prices(is_on_sale) WHERE is_on_sale = TRUE;
```

### 5.2 Price Alerts
```sql
CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models_catalog(id),
    target_price DECIMAL(10,2) NOT NULL,
    operator alert_operator DEFAULT 'lte',
    notification_methods TEXT[] DEFAULT ARRAY['push'],
    is_active BOOLEAN DEFAULT TRUE,
    triggered_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE alert_operator AS ENUM ('lte', 'gte', 'eq');

CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_model ON price_alerts(model_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active, expires_at) 
    WHERE is_active = TRUE;
```

## 6. Enhanced Social Features

### 6.1 Social Relationships
```sql
CREATE TABLE user_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_type relationship_type_enum DEFAULT 'follow',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE TYPE relationship_type_enum AS ENUM ('follow', 'friend', 'blocked');

CREATE INDEX idx_relationships_follower ON user_relationships(follower_id);
CREATE INDEX idx_relationships_following ON user_relationships(following_id);
CREATE INDEX idx_relationships_type ON user_relationships(relationship_type);
```

### 6.2 Battle Reports
```sql
CREATE TABLE battle_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    game_system_id UUID REFERENCES game_systems(id),
    points_limit INTEGER,
    my_army JSONB NOT NULL, -- Army composition
    opponent_army JSONB NOT NULL,
    opponent_user_id UUID REFERENCES users(id), -- If opponent is registered
    result battle_result_enum,
    my_score INTEGER,
    opponent_score INTEGER,
    duration_minutes INTEGER,
    location VARCHAR(255),
    battle_date DATE DEFAULT CURRENT_DATE,
    narrative TEXT,
    highlights JSONB DEFAULT '[]', -- Array of highlight objects
    photos JSONB DEFAULT '[]',
    tags TEXT[],
    visibility privacy_level DEFAULT 'public',
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE battle_result_enum AS ENUM ('victory', 'defeat', 'draw');

CREATE INDEX idx_battle_reports_user ON battle_reports(user_id);
CREATE INDEX idx_battle_reports_date ON battle_reports(battle_date DESC);
CREATE INDEX idx_battle_reports_game_system ON battle_reports(game_system_id);
CREATE INDEX idx_battle_reports_visibility ON battle_reports(visibility);
```

### 6.3 Community Help System
```sql
CREATE TABLE help_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type help_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    photos JSONB DEFAULT '[]',
    tags TEXT[],
    experience_level experience_level,
    urgency urgency_level DEFAULT 'medium',
    status help_status_enum DEFAULT 'open',
    best_answer_id UUID, -- References comments table
    view_count INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    answer_count INTEGER DEFAULT 0,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE help_type_enum AS ENUM ('painting', 'army_building', 'rules', 'general');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE help_status_enum AS ENUM ('open', 'answered', 'resolved', 'closed');

CREATE INDEX idx_help_requests_user ON help_requests(user_id);
CREATE INDEX idx_help_requests_type ON help_requests(type);
CREATE INDEX idx_help_requests_status ON help_requests(status);
CREATE INDEX idx_help_requests_tags ON help_requests USING GIN(tags);
```

### 6.4 Real-Time Messaging
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type conversation_type_enum DEFAULT 'direct',
    name VARCHAR(255), -- For group conversations
    description TEXT,
    created_by_id UUID NOT NULL REFERENCES users(id),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE conversation_type_enum AS ENUM ('direct', 'group', 'help_thread');

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    role participant_role DEFAULT 'member',
    UNIQUE(conversation_id, user_id)
);

CREATE TYPE participant_role AS ENUM ('admin', 'moderator', 'member');

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type message_type_enum DEFAULT 'text',
    reply_to_id UUID REFERENCES messages(id),
    attachments JSONB DEFAULT '[]',
    reactions JSONB DEFAULT '{}', -- User reactions
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE message_type_enum AS ENUM ('text', 'image', 'model_share', 'battle_report_share');

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_user ON messages(user_id);
```

## 7. Collection Management Tables

### 7.1 Models Table
```sql
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    faction_id UUID REFERENCES factions(id),
    game_system_id UUID REFERENCES game_systems(id),
    points_value INTEGER,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    painting_status painting_status DEFAULT 'unpainted',
    notes TEXT,
    tags TEXT[], -- PostgreSQL array for tags
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom enum for painting status
CREATE TYPE painting_status AS ENUM (
    'unpainted', 
    'primed', 
    'basecoated', 
    'detailed', 
    'finished', 
    'display_ready'
);

-- Indexes
CREATE INDEX idx_models_user_id ON models(user_id);
CREATE INDEX idx_models_faction_id ON models(faction_id);
CREATE INDEX idx_models_game_system_id ON models(game_system_id);
CREATE INDEX idx_models_painting_status ON models(painting_status);
CREATE INDEX idx_models_created_at ON models(created_at);
CREATE INDEX idx_models_public ON models(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_models_tags ON models USING GIN(tags);

-- Full-text search index
CREATE INDEX idx_models_search ON models USING GIN(
    to_tsvector('english', name || ' ' || COALESCE(notes, ''))
);
```

### 7.2 Model Photos Table
```sql
CREATE TABLE model_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    file_size INTEGER, -- in bytes
    width INTEGER,
    height INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_model_photos_model_id ON model_photos(model_id);
CREATE INDEX idx_model_photos_sort_order ON model_photos(model_id, sort_order);
```

### 7.3 Custom Fields Table
```sql
CREATE TABLE custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    field_type custom_field_type NOT NULL,
    options JSONB, -- For dropdown/multi-select options
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Custom enum for field types
CREATE TYPE custom_field_type AS ENUM (
    'text', 
    'number', 
    'date', 
    'boolean', 
    'dropdown', 
    'multiselect'
);

-- Custom field values
CREATE TABLE model_custom_fields (
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    custom_field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
    value JSONB NOT NULL,
    PRIMARY KEY (model_id, custom_field_id)
);
```

## 8. Army and List Management

### 8.1 Armies Table
```sql
CREATE TABLE armies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    faction_id UUID REFERENCES factions(id),
    game_system_id UUID REFERENCES game_systems(id),
    description TEXT,
    points_limit INTEGER,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_armies_user_id ON armies(user_id);
CREATE INDEX idx_armies_faction_id ON armies(faction_id);
CREATE INDEX idx_armies_public ON armies(is_public) WHERE is_public = TRUE;
```

### 8.2 Army Models Table
```sql
CREATE TABLE army_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    army_id UUID NOT NULL REFERENCES armies(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(army_id, model_id)
);

-- Indexes
CREATE INDEX idx_army_models_army_id ON army_models(army_id);
CREATE INDEX idx_army_models_model_id ON army_models(model_id);
```

## 9. Social Features Tables

### 9.1 User Relationships Table
```sql
CREATE TABLE user_relationships (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Indexes
CREATE INDEX idx_relationships_follower ON user_relationships(follower_id);
CREATE INDEX idx_relationships_following ON user_relationships(following_id);
```

### 9.2 Model Likes Table
```sql
CREATE TABLE model_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, model_id)
);

-- Indexes
CREATE INDEX idx_model_likes_model_id ON model_likes(model_id);
CREATE INDEX idx_model_likes_created_at ON model_likes(created_at);
```

### 9.3 Comments Table
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_comments_model_id ON comments(model_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

## 10. Wishlist and Shopping

### 10.1 Wishlist Table
```sql
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'My Wishlist',
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_default ON wishlists(user_id, is_default) WHERE is_default = TRUE;
```

### 10.2 Wishlist Items Table
```sql
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    faction_id UUID REFERENCES factions(id),
    game_system_id UUID REFERENCES game_systems(id),
    estimated_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    priority wishlist_priority DEFAULT 'medium',
    notes TEXT,
    product_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom enum for priority levels
CREATE TYPE wishlist_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Indexes
CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_priority ON wishlist_items(priority);
```

## 11. Activity and Notifications

### 11.1 Activities Table
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    entity_type VARCHAR(50), -- 'model', 'army', 'comment', etc.
    entity_id UUID,
    data JSONB, -- Additional activity data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Custom enum for activity types
CREATE TYPE activity_type AS ENUM (
    'model_added',
    'model_updated',
    'model_painted',
    'army_created',
    'comment_added',
    'user_followed',
    'achievement_earned'
);

-- Create partitions for activities (monthly partitions)
CREATE TABLE activities_2025_07 PARTITION OF activities
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

-- Indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_created_at ON activities(created_at);
```

### 11.2 Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Custom enum for notification types
CREATE TYPE notification_type AS ENUM (
    'like',
    'comment',
    'follow',
    'achievement',
    'system',
    'reminder'
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## 12. Authentication and Security

### 12.1 Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

### 12.2 OAuth Providers Table
```sql
CREATE TABLE oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'facebook', etc.
    provider_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- Indexes
CREATE INDEX idx_oauth_providers_user_id ON oauth_providers(user_id);
CREATE INDEX idx_oauth_providers_provider ON oauth_providers(provider, provider_user_id);
```

## 13. Gamification Tables

### 13.1 Achievements Table
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(500),
    category achievement_category,
    points INTEGER DEFAULT 0,
    criteria JSONB NOT NULL, -- Achievement criteria
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom enum for achievement categories
CREATE TYPE achievement_category AS ENUM (
    'collection',
    'painting',
    'social',
    'milestone'
);
```

### 13.2 User Achievements Table
```sql
CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress JSONB, -- Progress tracking data
    PRIMARY KEY (user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned_at ON user_achievements(earned_at);
```

## 14. System Tables

### 14.1 Application Settings Table
```sql
CREATE TABLE app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample system settings
INSERT INTO app_settings (key, value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('max_upload_size', '5242880', 'Maximum file upload size in bytes'),
('supported_image_types', '["jpg", "jpeg", "png", "webp"]', 'Supported image file types');
```

### 14.2 Audit Log Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for audit logs
CREATE TABLE audit_logs_2025_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
```

## 15. Views and Functions

### 15.1 User Statistics View
```sql
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    COUNT(m.id) as total_models,
    COUNT(CASE WHEN m.painting_status IN ('finished', 'display_ready') THEN 1 END) as painted_models,
    COUNT(DISTINCT m.faction_id) as faction_count,
    COUNT(DISTINCT a.id) as army_count,
    COALESCE(SUM(m.purchase_price), 0) as total_spent,
    COUNT(DISTINCT f.follower_id) as follower_count,
    COUNT(DISTINCT fo.following_id) as following_count
FROM users u
LEFT JOIN models m ON u.id = m.user_id
LEFT JOIN armies a ON u.id = a.user_id
LEFT JOIN user_relationships f ON u.id = f.following_id
LEFT JOIN user_relationships fo ON u.id = fo.follower_id
GROUP BY u.id, u.username;
```

### 15.2 Popular Models View
```sql
CREATE VIEW popular_models AS
SELECT 
    m.*,
    u.username as owner_username,
    COUNT(ml.user_id) as like_count,
    COUNT(c.id) as comment_count
FROM models m
JOIN users u ON m.user_id = u.id
LEFT JOIN model_likes ml ON m.id = ml.model_id
LEFT JOIN comments c ON m.id = c.model_id
WHERE m.is_public = TRUE
GROUP BY m.id, u.username
ORDER BY like_count DESC, comment_count DESC;
```

### 15.3 Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_armies_updated_at BEFORE UPDATE ON armies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 16. Performance Optimizations

### 16.1 Materialized Views
```sql
-- Materialized view for faction statistics
CREATE MATERIALIZED VIEW faction_stats AS
SELECT 
    f.id,
    f.name,
    f.game_system_id,
    COUNT(m.id) as model_count,
    COUNT(DISTINCT m.user_id) as user_count,
    AVG(CASE WHEN m.painting_status IN ('finished', 'display_ready') THEN 1.0 ELSE 0.0 END) as avg_painted_ratio
FROM factions f
LEFT JOIN models m ON f.id = m.faction_id
GROUP BY f.id, f.name, f.game_system_id;

-- Refresh materialized view daily
CREATE INDEX idx_faction_stats_game_system ON faction_stats(game_system_id);
```

### 16.2 Partitioning Strategy
```sql
-- Partition large tables by date
-- Activities table (already partitioned above)
-- Audit logs table (already partitioned above)

-- Partition models table by user_id for very large datasets
-- This would be implemented if the user base grows significantly
```

## 17. Data Integrity Constraints

### 17.1 Check Constraints
```sql
-- Ensure positive values
ALTER TABLE models ADD CONSTRAINT chk_models_positive_quantity 
    CHECK (quantity > 0);

ALTER TABLE models ADD CONSTRAINT chk_models_positive_price 
    CHECK (purchase_price >= 0);

-- Ensure valid dates
ALTER TABLE models ADD CONSTRAINT chk_models_valid_purchase_date 
    CHECK (purchase_date <= CURRENT_DATE);

-- Ensure valid email format
ALTER TABLE users ADD CONSTRAINT chk_users_valid_email 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

### 17.2 Foreign Key Constraints
All foreign key relationships are defined with appropriate CASCADE or RESTRICT actions to maintain referential integrity while allowing for proper data cleanup when records are deleted.

This database design provides a solid foundation for the Plastic Crack application, ensuring data integrity, performance, and scalability while supporting all the functional requirements outlined in the application specification.
