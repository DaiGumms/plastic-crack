# Feature: Enhanced Social Features

## Overview
Comprehensive social interaction features that build upon the basic social functionality from issue #48, creating a vibrant community platform for miniature wargaming enthusiasts. These features will transform the app from a collection management tool into a full-featured social platform for the hobby community.

## Priority
**Priority**: Medium (Post-Beta Enhancement)
**Estimated Story Points**: 42
**Implementation Time**: 12-15 sprints
**Dependencies**: Basic social features (#48), user authentication, collection system

## User Stories

### Epic 1: Direct Messaging System (10 points)
- **As a user**, I want to send private messages to other users so I can have personal conversations
- **As a user**, I want to create group chats so I can coordinate with multiple hobbyists
- **As a user**, I want to share images in messages so I can get feedback on my work
- **As a user**, I want message history and search so I can find previous conversations
- **As a user**, I want message notifications so I don't miss important communications

### Epic 2: Interest-Based Groups (12 points)
- **As a user**, I want to create groups around specific topics so I can connect with like-minded hobbyists
- **As a user**, I want to join existing groups so I can participate in focused discussions
- **As a user**, I want group-specific content feeds so I can see relevant posts
- **As a user**, I want to moderate groups I create so I can maintain quality discussions
- **As a user**, I want group event coordination so I can organize activities with members

### Epic 3: Community Challenges (10 points)
- **As a user**, I want to participate in painting competitions so I can showcase my skills
- **As a user**, I want to vote on challenge entries so I can support community members
- **As a user**, I want to create custom challenges so I can organize events for my interests
- **As a user**, I want challenge leaderboards so I can track my progress and achievements
- **As a user**, I want themed challenges so I can participate in seasonal or special events

### Epic 4: Ratings and Reviews (10 points)
- **As a user**, I want to rate tutorials and guides so I can help others find quality content
- **As a user**, I want to review products and tools so I can share my experiences
- **As a user**, I want to see aggregated ratings so I can make informed decisions
- **As a user**, I want to follow reviewers I trust so I can get personalized recommendations
- **As a user**, I want to write detailed reviews so I can provide valuable feedback to the community

## Technical Requirements

### Database Schema

```sql
-- Direct Messaging
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL DEFAULT 'direct', -- 'direct', 'group'
    name VARCHAR(100), -- for group chats
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'moderator', 'member'
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'system'
    metadata JSONB, -- image URLs, system message data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Interest Groups
CREATE TABLE interest_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'painting', 'gaming', 'modeling', 'general'
    privacy_level VARCHAR(20) DEFAULT 'public', -- 'public', 'private', 'invite_only'
    avatar_url VARCHAR(500),
    banner_url VARCHAR(500),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    member_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES interest_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'member', -- 'owner', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(group_id, user_id)
);

CREATE TABLE group_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES interest_groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200),
    content TEXT NOT NULL,
    post_type VARCHAR(20) DEFAULT 'discussion', -- 'discussion', 'showcase', 'question', 'event'
    image_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT false,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0
);

-- Community Challenges
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    challenge_type VARCHAR(50) NOT NULL, -- 'painting', 'speed_paint', 'conversion', 'army_challenge'
    category VARCHAR(50), -- 'infantry', 'vehicles', 'terrain', 'army'
    rules TEXT,
    prize_description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    voting_end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    max_participants INTEGER,
    participant_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'active', 'voting', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE challenge_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_urls TEXT[] NOT NULL,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    vote_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    is_winner BOOLEAN DEFAULT false,
    UNIQUE(challenge_id, participant_id)
);

CREATE TABLE challenge_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES challenge_entries(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entry_id, voter_id)
);

-- Ratings and Reviews
CREATE TABLE content_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL, -- 'tutorial', 'product', 'guide', 'collection'
    content_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id, user_id)
);

CREATE TABLE review_helpfulness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rating_id UUID NOT NULL REFERENCES content_ratings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rating_id, user_id)
);

-- Add social fields to existing tables
ALTER TABLE users ADD COLUMN reputation_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_seen_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT false;
```

### API Endpoints

#### Direct Messaging
- `GET /api/social/conversations` - List user's conversations
- `POST /api/social/conversations` - Create new conversation
- `GET /api/social/conversations/{id}/messages` - Get conversation messages
- `POST /api/social/conversations/{id}/messages` - Send message
- `PUT /api/social/messages/{id}` - Edit message
- `DELETE /api/social/messages/{id}` - Delete message
- `POST /api/social/conversations/{id}/participants` - Add participant to group chat

#### Interest Groups
- `GET /api/social/groups` - List available groups with filters
- `POST /api/social/groups` - Create new group
- `GET /api/social/groups/{id}` - Get group details
- `POST /api/social/groups/{id}/join` - Join group
- `DELETE /api/social/groups/{id}/leave` - Leave group
- `GET /api/social/groups/{id}/posts` - Get group posts
- `POST /api/social/groups/{id}/posts` - Create group post
- `PUT /api/social/groups/{id}/members/{userId}/role` - Update member role

#### Community Challenges
- `GET /api/social/challenges` - List active and upcoming challenges
- `POST /api/social/challenges` - Create new challenge
- `GET /api/social/challenges/{id}` - Get challenge details
- `POST /api/social/challenges/{id}/enter` - Submit challenge entry
- `GET /api/social/challenges/{id}/entries` - Get challenge entries
- `POST /api/social/challenges/entries/{id}/vote` - Vote on entry
- `GET /api/social/challenges/{id}/leaderboard` - Get challenge rankings

#### Ratings and Reviews
- `POST /api/social/ratings` - Submit rating/review
- `GET /api/social/content/{type}/{id}/ratings` - Get content ratings
- `PUT /api/social/ratings/{id}` - Update rating/review
- `POST /api/social/ratings/{id}/helpful` - Mark review as helpful
- `GET /api/social/users/{id}/reviews` - Get user's reviews

### Frontend Components

```typescript
// Direct Messaging
interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
}

interface MessageThreadProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

// Interest Groups
interface GroupListProps {
  groups: InterestGroup[];
  userGroups: InterestGroup[];
  onJoinGroup: (groupId: string) => void;
}

interface GroupDetailProps {
  group: InterestGroup;
  posts: GroupPost[];
  userRole: GroupRole;
}

// Community Challenges
interface ChallengeListProps {
  challenges: Challenge[];
  filter: ChallengeFilter;
}

interface ChallengeEntryProps {
  challenge: Challenge;
  onSubmitEntry: (entry: ChallengeEntryData) => void;
}

// Ratings and Reviews
interface RatingComponentProps {
  contentType: string;
  contentId: string;
  currentRating?: number;
  onRate: (rating: number, review?: string) => void;
}
```

## Implementation Phases

### Phase 1: Direct Messaging (3-4 sprints)
1. **Core Messaging Infrastructure**
   - Database schema for conversations and messages
   - Real-time messaging with WebSocket support
   - Basic message UI components

2. **Message Features**
   - Text messaging with emoji support
   - Image sharing capabilities
   - Message history and search

3. **Group Messaging**
   - Group chat creation and management
   - Participant management
   - Group chat moderation tools

### Phase 2: Interest Groups (4-5 sprints)
1. **Group Management**
   - Group creation and discovery
   - Membership management
   - Group settings and privacy controls

2. **Group Content**
   - Group-specific post feeds
   - Content categorization
   - Group moderation tools

3. **Group Features**
   - Event coordination within groups
   - Group analytics and insights
   - Advanced group permissions

### Phase 3: Community Challenges (3-4 sprints)
1. **Challenge Framework**
   - Challenge creation and management
   - Entry submission system
   - Challenge categorization

2. **Voting and Rankings**
   - Community voting system
   - Leaderboards and rankings
   - Winner determination

3. **Challenge Features**
   - Themed challenges and seasons
   - Challenge notifications
   - Achievement system

### Phase 4: Ratings and Reviews (2 sprints)
1. **Rating System**
   - Content rating infrastructure
   - Review submission and display
   - Rating aggregation

2. **Review Features**
   - Review helpfulness voting
   - Reviewer reputation system
   - Review moderation

## Mobile Integration Considerations

### Push Notifications
- Real-time message notifications
- Challenge and group activity alerts
- Social interaction notifications
- Customizable notification preferences

### Camera Integration
- Direct camera access for message images
- Quick photo sharing in groups and challenges
- Image editing and filters
- Batch photo uploads

### Offline Features
- Cached conversation history
- Offline group content viewing
- Draft message storage
- Sync when connection restored

### Location Services
- Find nearby users and groups
- Location-based event discovery
- Gaming group meetup coordination
- Privacy-controlled location sharing

## Acceptance Criteria

### Direct Messaging
- [ ] Users can send and receive private messages in real-time
- [ ] Group chats support multiple participants with role management
- [ ] Message history is searchable and properly paginated
- [ ] Image sharing works seamlessly in conversations
- [ ] Users receive appropriate notifications for messages

### Interest Groups
- [ ] Users can discover and join groups based on interests
- [ ] Group owners can moderate content and manage members
- [ ] Group feeds display relevant content with proper filtering
- [ ] Group events can be created and managed effectively
- [ ] Privacy settings work correctly for different group types

### Community Challenges
- [ ] Users can participate in painting and modeling challenges
- [ ] Voting system is fair and prevents manipulation
- [ ] Challenge leaderboards update correctly in real-time
- [ ] Challenge entries display properly with images and descriptions
- [ ] Winners are determined accurately based on voting results

### Ratings and Reviews
- [ ] Users can rate and review various types of content
- [ ] Rating aggregation displays accurate averages
- [ ] Review helpfulness voting works correctly
- [ ] User reputation scores update based on review quality
- [ ] Content recommendations improve based on user ratings

## Success Metrics

### Engagement Metrics
- **Daily Active Users**: 40% increase in daily engagement
- **Session Duration**: 25% increase in average session length
- **User Retention**: 30% improvement in 30-day retention
- **Social Interactions**: 500+ social actions per day

### Feature Adoption
- **Messaging**: 60% of users send at least one message per week
- **Groups**: 40% of users join at least one interest group
- **Challenges**: 25% of users participate in monthly challenges
- **Reviews**: 35% of users leave ratings/reviews

### Community Health
- **Content Quality**: >90% positive rating on user-generated content
- **Moderation**: <5% of content requires moderation action
- **User Satisfaction**: >85% satisfaction with social features
- **Community Growth**: 20% month-over-month growth in social activity

## Dependencies

### Internal Systems
- User authentication and profiles (#48)
- Collection management system
- Image upload and storage
- Real-time notification system
- Content moderation system (#67)

### External Services
- WebSocket service for real-time messaging
- Push notification service
- Image processing and optimization
- Content delivery network (CDN)
- Analytics platform

## Future Enhancements

### Advanced Social Features
- Video calling for tutorial sessions
- Live streaming of painting sessions
- Virtual reality meetups and events
- AI-powered content recommendations

### Gamification
- Social achievement badges
- Community leaderboards
- Seasonal events and rewards
- Social credit system

### Integration Features
- Social media platform integration
- Cross-platform community features
- Third-party tournament integration
- Marketplace integration for social commerce

---

These enhanced social features will transform the app into a comprehensive community platform, fostering deeper connections among miniature wargaming enthusiasts while providing engaging ways to share, learn, and compete within the hobby community.
