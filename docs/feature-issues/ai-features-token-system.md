# Feature: AI Features and Token System

## Overview
Comprehensive AI-powered features that enhance the user experience through intelligent recommendations, creative assistance, and automated content generation. The system includes paintscheme recommendations based on user descriptions, AI-generated nicknames for models and collections, and a token-based monetization system that allows users to purchase credits for AI requests.

## Priority
**Priority**: High (Revenue Generation & Differentiation)
**Estimated Story Points**: 32
**Implementation Time**: 8-10 sprints
**Dependencies**: User authentication, collection system, premium subscription system

## User Stories

### Epic 1: AI Paintscheme Recommendations (12 points)
- **As a user**, I want to describe my vision for a paintscheme so I can get AI-generated color recommendations
- **As a user**, I want to specify faction themes and moods so I can get contextually appropriate suggestions
- **As a user**, I want to see visual examples of recommended paintschemes so I can visualize the results
- **As a user**, I want to save AI-generated paintschemes so I can reference them later
- **As a user**, I want to share successful AI paintschemes so I can inspire the community

### Epic 2: AI Nickname Generation (8 points)
- **As a user**, I want AI to suggest creative nicknames for my models so I can add personality to my collection
- **As a user**, I want AI to generate thematic collection names so I can organize my armies creatively
- **As a user**, I want to specify themes and personalities so the AI generates appropriate names
- **As a user**, I want to regenerate names until I find one I like so I have creative control

### Epic 3: Token System and Monetization (12 points)
- **As a user**, I want to purchase AI tokens so I can access premium AI features
- **As a user**, I want to see my token balance so I can manage my AI usage
- **As a user**, I want different AI features to cost different amounts so I can prioritize my usage
- **As a user**, I want token bundles and subscriptions so I can choose the best value option
- **As a user**, I want free tokens periodically so I can try AI features without immediate payment

## Technical Requirements

### Database Schema

```sql
-- AI Features and Usage Tracking
CREATE TABLE ai_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    request_type VARCHAR(50) NOT NULL, -- 'paintscheme', 'nickname_model', 'nickname_collection'
    input_data JSONB NOT NULL, -- user description, parameters, etc.
    response_data JSONB, -- AI response, alternatives, confidence scores
    tokens_cost INTEGER NOT NULL,
    processing_time_ms INTEGER,
    model_version VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

CREATE TABLE ai_paintschemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES ai_requests(id),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200),
    description TEXT,
    color_palette JSONB NOT NULL, -- primary, secondary, accent colors with hex codes
    technique_suggestions TEXT[],
    difficulty_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    faction_tags VARCHAR(50)[],
    mood_tags VARCHAR(50)[],
    is_public BOOLEAN DEFAULT false,
    is_favorited BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_nicknames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES ai_requests(id),
    user_id UUID NOT NULL REFERENCES users(id),
    target_type VARCHAR(20) NOT NULL, -- 'model', 'collection'
    target_id UUID NOT NULL,
    suggested_names TEXT[] NOT NULL,
    selected_name VARCHAR(200),
    theme_tags VARCHAR(50)[],
    personality_traits VARCHAR(50)[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    selected_at TIMESTAMP WITH TIME ZONE
);

-- Token System
CREATE TABLE user_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    current_balance INTEGER DEFAULT 0,
    total_purchased INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    last_free_tokens_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    transaction_type VARCHAR(20) NOT NULL, -- 'purchase', 'spend', 'earn', 'refund'
    amount INTEGER NOT NULL, -- positive for credits, negative for debits
    description VARCHAR(200) NOT NULL,
    reference_type VARCHAR(50), -- 'ai_request', 'purchase', 'daily_bonus', 'refund'
    reference_id UUID,
    payment_id VARCHAR(200), -- from payment processor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE token_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    token_amount INTEGER NOT NULL,
    price_usd DECIMAL(10,2) NOT NULL,
    bonus_percentage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Feature Configuration
CREATE TABLE ai_feature_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_type VARCHAR(50) NOT NULL UNIQUE,
    token_cost INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'paintscheme', 'nickname', 'general'
    version VARCHAR(20) NOT NULL,
    endpoint_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    performance_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences and History
CREATE TABLE ai_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    preferred_painting_style VARCHAR(50), -- 'realistic', 'stylized', 'grimdark', 'bright'
    favorite_color_schemes VARCHAR(50)[],
    naming_preferences JSONB, -- themes, tone preferences, etc.
    auto_save_results BOOLEAN DEFAULT true,
    share_results_publicly BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add AI fields to existing tables
ALTER TABLE user_models ADD COLUMN ai_suggested_nickname VARCHAR(200);
ALTER TABLE user_models ADD COLUMN ai_paintscheme_id UUID REFERENCES ai_paintschemes(id);
ALTER TABLE collections ADD COLUMN ai_suggested_name VARCHAR(200);
ALTER TABLE collections ADD COLUMN ai_theme_tags VARCHAR(50)[];
```

### API Endpoints

#### AI Paintscheme Recommendations
- `POST /api/ai/paintschemes/generate` - Generate paintscheme recommendations
- `GET /api/ai/paintschemes` - List user's generated paintschemes
- `GET /api/ai/paintschemes/{id}` - Get specific paintscheme details
- `POST /api/ai/paintschemes/{id}/favorite` - Favorite a paintscheme
- `POST /api/ai/paintschemes/{id}/apply` - Apply paintscheme to model
- `GET /api/ai/paintschemes/public` - Browse public paintschemes

#### AI Nickname Generation
- `POST /api/ai/nicknames/generate` - Generate nickname suggestions
- `GET /api/ai/nicknames/history` - Get user's nickname generation history
- `POST /api/ai/nicknames/{id}/select` - Select and apply a nickname
- `POST /api/ai/nicknames/regenerate` - Regenerate new options

#### Token Management
- `GET /api/tokens/balance` - Get user's current token balance
- `GET /api/tokens/transactions` - Get transaction history
- `POST /api/tokens/purchase` - Purchase token package
- `GET /api/tokens/packages` - Get available token packages
- `POST /api/tokens/claim-daily` - Claim daily free tokens

#### AI System Management
- `GET /api/ai/features/costs` - Get current AI feature costs
- `GET /api/ai/usage/stats` - Get user's AI usage statistics
- `PUT /api/ai/preferences` - Update AI preferences
- `GET /api/ai/models/status` - Get AI model availability

### Frontend Components

```typescript
// AI Paintscheme Components
interface PaintschemeGeneratorProps {
  onGenerate: (description: string, parameters: PaintschemeParams) => void;
  tokenCost: number;
  userTokens: number;
}

interface PaintschemeResultProps {
  paintscheme: AIPaintscheme;
  onSave: () => void;
  onApplyToModel: (modelId: string) => void;
  onRegenerate: () => void;
}

interface ColorPaletteDisplayProps {
  colors: ColorPalette;
  techniques: string[];
  showTechniques?: boolean;
}

// AI Nickname Components
interface NicknameGeneratorProps {
  targetType: 'model' | 'collection';
  targetId: string;
  onGenerate: (theme: string, traits: string[]) => void;
  tokenCost: number;
}

interface NicknameSuggestionsProps {
  suggestions: string[];
  onSelect: (nickname: string) => void;
  onRegenerate: () => void;
}

// Token System Components
interface TokenBalanceProps {
  balance: number;
  onPurchase: () => void;
  showPurchaseButton?: boolean;
}

interface TokenPurchaseModalProps {
  packages: TokenPackage[];
  onPurchase: (packageId: string) => void;
  onClose: () => void;
}

interface AIUsageStatsProps {
  stats: AIUsageStats;
  timeframe: 'week' | 'month' | 'all';
}

// AI Preferences
interface AIPreferencesProps {
  preferences: AIUserPreferences;
  onUpdate: (preferences: AIUserPreferences) => void;
}
```

## Implementation Phases

### Phase 1: Core AI Infrastructure (2-3 sprints)
1. **AI Service Integration**
   - Set up AI model endpoints and authentication
   - Implement basic request/response handling
   - Create AI usage tracking system

2. **Token System Foundation**
   - User token balance management
   - Transaction logging and history
   - Basic purchase flow integration

### Phase 2: AI Paintscheme Recommendations (3-4 sprints)
1. **Paintscheme Generation**
   - Natural language processing for user descriptions
   - Color palette generation and visualization
   - Technique recommendation system

2. **Paintscheme Management**
   - Save and organize generated paintschemes
   - Apply paintschemes to models
   - Public sharing and discovery

### Phase 3: AI Nickname Generation (2-3 sprints)
1. **Nickname Generation Engine**
   - Theme-based name generation
   - Personality trait integration
   - Contextual naming for different model types

2. **Nickname Application**
   - Apply nicknames to models and collections
   - Nickname history and regeneration
   - Theme customization options

### Phase 4: Advanced Features and Optimization (1-2 sprints)
1. **Advanced AI Features**
   - User preference learning
   - Improved recommendation accuracy
   - Batch processing capabilities

2. **Monetization Optimization**
   - Dynamic pricing based on demand
   - Token bundle optimization
   - Usage analytics and insights

## Mobile Integration Considerations

### Offline Capabilities
- Cache generated paintschemes for offline viewing
- Store token balance and transaction history locally
- Queue AI requests when offline for processing when connected

### Mobile-Specific Features
- Camera integration for color analysis and paintscheme inspiration
- Push notifications for completed AI processing
- Touch-optimized color palette selection
- Voice input for paintscheme descriptions

### Performance Optimization
- Progressive loading of AI results
- Image optimization for color palettes
- Efficient token balance synchronization
- Background processing for AI requests

## Acceptance Criteria

### AI Paintscheme Recommendations
- [ ] Users can describe desired paintschemes in natural language
- [ ] AI generates contextually appropriate color palettes and techniques
- [ ] Generated paintschemes can be saved and applied to models
- [ ] Public paintscheme sharing and discovery works effectively
- [ ] Paintscheme generation costs tokens and respects user balance

### AI Nickname Generation
- [ ] AI generates creative, thematic nicknames for models and collections
- [ ] Users can specify themes and personality traits for customization
- [ ] Nickname regeneration provides fresh alternatives
- [ ] Selected nicknames are properly applied and stored
- [ ] Nickname generation integrates with token system

### Token System
- [ ] Users can purchase token packages through integrated payment system
- [ ] Token balance is accurately tracked and updated in real-time
- [ ] AI feature costs are clearly displayed before use
- [ ] Transaction history provides complete audit trail
- [ ] Daily free tokens encourage regular engagement

### System Integration
- [ ] AI features integrate seamlessly with existing model and collection management
- [ ] Premium subscription system properly gates AI feature access
- [ ] Performance monitoring tracks AI model response times and accuracy
- [ ] Error handling provides clear feedback for failed AI requests

## Success Metrics

### Engagement Metrics
- **AI Feature Adoption**: 60% of premium users try AI features within first week
- **Token Purchase Rate**: 25% of AI users purchase additional tokens
- **Feature Retention**: 70% of AI users continue using features after 30 days
- **Generation Volume**: 1000+ AI requests per day at scale

### Revenue Metrics
- **Token Revenue**: $10,000+ monthly revenue from token sales
- **Average Spend**: $15 average monthly spend per AI user
- **Conversion Rate**: 30% conversion from free to paid AI usage
- **Premium Upgrade**: 40% of AI users upgrade to premium subscriptions

### Quality Metrics
- **User Satisfaction**: >85% satisfaction with AI-generated content
- **Usage Success**: >90% of AI generations result in user action (save/apply)
- **Processing Time**: <30 seconds average AI response time
- **Error Rate**: <5% failed AI requests

## Dependencies

### Internal Systems
- User authentication and premium subscription system
- Collection and model management system
- Payment processing integration
- Mobile app framework and offline capabilities

### External Services
- OpenAI GPT API or similar for text generation
- Stability AI or similar for image generation
- Color palette analysis services
- Payment processing (Stripe, Apple Pay, Google Pay)
- Analytics and monitoring services

## Privacy and Security Considerations

### Data Protection
- User descriptions and AI inputs are encrypted
- AI-generated content respects intellectual property
- Token transaction data is securely stored
- User preferences and history have privacy controls

### AI Ethics
- Clear disclosure of AI-generated content
- Respect for Games Workshop and other IP holders
- Appropriate content filtering for generated names
- User control over AI data usage and retention

## Future Enhancements

### Advanced AI Features
- Image-based paintscheme analysis and recommendations
- 3D model visualization with AI paintschemes
- AI-powered army composition suggestions
- Automated battle report generation

### Enhanced Monetization
- AI subscription tiers with different features
- Bulk token discounts for power users
- AI marketplace for sharing premium content
- Professional AI tools for commission artists

### Integration Expansion
- AI integration with tutorial creation
- Smart inventory management suggestions
- AI-powered community matching
- Automated social content generation

---

This AI features and token system will provide significant value to users while creating a sustainable revenue stream through innovative AI-powered hobby tools and a fair, transparent token-based monetization model.
