# Feature: Battle Reports and Gaming

## Overview

Comprehensive gaming and battle tracking features that allow users to document their gaming
experiences, track performance statistics, organize tournaments, and connect with local gaming
communities. This feature transforms the app into a complete gaming companion for miniature
wargaming enthusiasts.

## Priority

**Priority**: Medium (Post-Beta Enhancement) **Estimated Story Points**: 38 **Implementation Time**:
10-12 sprints **Dependencies**: Basic social features (#48), collection system, enhanced social
features

## User Stories

### Epic 1: Battle Report Creation (12 points)

- **As a gamer**, I want to create detailed battle reports so I can document memorable games
- **As a gamer**, I want to add photos to battle reports so I can capture key moments
- **As a gamer**, I want to record game results and statistics so I can track my progress
- **As a gamer**, I want to tag opponents and armies so I can reference past games
- **As a gamer**, I want to share battle reports so I can showcase epic battles to the community

### Epic 2: Gaming Statistics (8 points)

- **As a gamer**, I want to track my win/loss record so I can monitor my improvement
- **As a gamer**, I want to see performance by army and faction so I can optimize my gameplay
- **As a gamer**, I want mission-specific statistics so I can identify strengths and weaknesses
- **As a gamer**, I want comparative statistics with friends so I can see how I'm doing

### Epic 3: Tournament Management (10 points)

- **As a tournament organizer**, I want to create tournaments so I can manage competitive events
- **As a participant**, I want to register for tournaments so I can compete with others
- **As an organizer**, I want to manage brackets and pairings so I can run smooth tournaments
- **As a participant**, I want to see tournament standings so I can track my progress
- **As an organizer**, I want to publish results so I can provide transparency

### Epic 4: Local Gaming Groups (8 points)

- **As a gamer**, I want to find local gaming groups so I can connect with nearby players
- **As a group organizer**, I want to manage my gaming group so I can coordinate activities
- **As a member**, I want to see group events so I can plan my gaming schedule
- **As a gamer**, I want to RSVP to events so I can confirm my attendance

## Technical Requirements

### Database Schema

```sql
-- Battle Reports
CREATE TABLE battle_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    game_system_id UUID NOT NULL REFERENCES game_systems(id),
    mission_type VARCHAR(100),
    mission_name VARCHAR(100),
    points_limit INTEGER,
    game_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    location VARCHAR(200),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT true,
    like_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0
);

CREATE TABLE battle_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_report_id UUID NOT NULL REFERENCES battle_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    player_name VARCHAR(100) NOT NULL, -- for non-registered players
    faction_id UUID REFERENCES factions(id),
    army_name VARCHAR(100),
    army_points INTEGER,
    is_winner BOOLEAN,
    victory_points INTEGER,
    deployment_zone VARCHAR(50),
    notes TEXT
);

CREATE TABLE battle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_report_id UUID NOT NULL REFERENCES battle_reports(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    turn_number INTEGER,
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gaming Statistics
CREATE TABLE gaming_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    game_system_id UUID NOT NULL REFERENCES game_systems(id),
    faction_id UUID REFERENCES factions(id),
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    games_drawn INTEGER DEFAULT 0,
    total_points_scored INTEGER DEFAULT 0,
    average_points DECIMAL(5,2) DEFAULT 0.00,
    favorite_mission VARCHAR(100),
    last_game_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_system_id, faction_id)
);

CREATE TABLE mission_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    game_system_id UUID NOT NULL REFERENCES game_systems(id),
    mission_name VARCHAR(100) NOT NULL,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_system_id, mission_name)
);

-- Tournament Management
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    game_system_id UUID NOT NULL REFERENCES game_systems(id),
    format VARCHAR(50) NOT NULL, -- 'swiss', 'elimination', 'round_robin'
    points_limit INTEGER,
    max_participants INTEGER,
    entry_fee DECIMAL(10,2),
    prize_pool TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    location VARCHAR(200),
    organizer_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'registration', 'active', 'completed'
    participant_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tournament_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    faction_id UUID REFERENCES factions(id),
    army_list TEXT,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in BOOLEAN DEFAULT false,
    dropped_out BOOLEAN DEFAULT false,
    final_ranking INTEGER,
    total_points INTEGER DEFAULT 0,
    UNIQUE(tournament_id, user_id)
);

CREATE TABLE tournament_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    mission_name VARCHAR(100),
    is_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tournament_pairings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID NOT NULL REFERENCES tournament_rounds(id) ON DELETE CASCADE,
    player1_id UUID NOT NULL REFERENCES tournament_participants(id),
    player2_id UUID REFERENCES tournament_participants(id), -- null for bye
    table_number INTEGER,
    player1_score INTEGER,
    player2_score INTEGER,
    result VARCHAR(20), -- 'player1_win', 'player2_win', 'draw', 'pending'
    battle_report_id UUID REFERENCES battle_reports(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Local Gaming Groups
CREATE TABLE gaming_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    meeting_day VARCHAR(20), -- 'monday', 'tuesday', etc.
    meeting_time TIME,
    preferred_systems UUID[], -- array of game_system_ids
    organizer_id UUID NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT true,
    member_count INTEGER DEFAULT 0,
    max_members INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gaming_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES gaming_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'member', -- 'organizer', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(group_id, user_id)
);

CREATE TABLE gaming_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES gaming_groups(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- 'casual_games', 'tournament', 'painting_session', 'social'
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    location VARCHAR(200),
    max_attendees INTEGER,
    attendee_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES gaming_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    rsvp_status VARCHAR(20) DEFAULT 'pending', -- 'attending', 'maybe', 'not_attending', 'pending'
    rsvp_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in BOOLEAN DEFAULT false,
    UNIQUE(event_id, user_id)
);
```

### API Endpoints

#### Battle Reports

- `GET /api/gaming/battle-reports` - List battle reports with filters
- `POST /api/gaming/battle-reports` - Create new battle report
- `GET /api/gaming/battle-reports/{id}` - Get battle report details
- `PUT /api/gaming/battle-reports/{id}` - Update battle report
- `DELETE /api/gaming/battle-reports/{id}` - Delete battle report
- `POST /api/gaming/battle-reports/{id}/images` - Upload battle images
- `POST /api/gaming/battle-reports/{id}/like` - Like battle report

#### Gaming Statistics

- `GET /api/gaming/statistics/user/{id}` - Get user's gaming statistics
- `GET /api/gaming/statistics/factions` - Get faction performance statistics
- `GET /api/gaming/statistics/missions` - Get mission-specific statistics
- `GET /api/gaming/statistics/leaderboards` - Get community leaderboards
- `POST /api/gaming/statistics/refresh` - Refresh calculated statistics

#### Tournament Management

- `GET /api/gaming/tournaments` - List tournaments with filters
- `POST /api/gaming/tournaments` - Create new tournament
- `GET /api/gaming/tournaments/{id}` - Get tournament details
- `POST /api/gaming/tournaments/{id}/register` - Register for tournament
- `GET /api/gaming/tournaments/{id}/participants` - Get participant list
- `POST /api/gaming/tournaments/{id}/check-in` - Check in participant
- `GET /api/gaming/tournaments/{id}/pairings` - Get round pairings
- `POST /api/gaming/tournaments/{id}/results` - Submit round results

#### Local Gaming Groups

- `GET /api/gaming/groups` - Find gaming groups with location filters
- `POST /api/gaming/groups` - Create new gaming group
- `GET /api/gaming/groups/{id}` - Get group details
- `POST /api/gaming/groups/{id}/join` - Join gaming group
- `GET /api/gaming/groups/{id}/events` - Get group events
- `POST /api/gaming/groups/{id}/events` - Create group event
- `POST /api/gaming/events/{id}/rsvp` - RSVP to event

### Frontend Components

```typescript
// Battle Reports
interface BattleReportFormProps {
  onSubmit: (report: BattleReportData) => void;
  gameSystem: GameSystem;
  existingReport?: BattleReport;
}

interface BattleReportCardProps {
  report: BattleReport;
  showActions?: boolean;
  onLike?: () => void;
}

// Gaming Statistics
interface StatsDashboardProps {
  userId: string;
  gameSystem?: GameSystem;
  timeframe: 'month' | 'year' | 'all';
}

interface PerformanceChartProps {
  data: StatisticsData[];
  chartType: 'wins' | 'points' | 'missions';
}

// Tournament Management
interface TournamentListProps {
  tournaments: Tournament[];
  filter: TournamentFilter;
  onRegister: (tournamentId: string) => void;
}

interface TournamentBracketProps {
  tournament: Tournament;
  rounds: TournamentRound[];
  userRole: 'participant' | 'organizer' | 'viewer';
}

// Gaming Groups
interface GroupFinderProps {
  userLocation?: Coordinates;
  searchRadius: number;
  preferredSystems: GameSystem[];
}

interface EventCalendarProps {
  events: GamingEvent[];
  onRSVP: (eventId: string, status: RSVPStatus) => void;
}
```

## Implementation Phases

### Phase 1: Battle Reports (3-4 sprints)

1. **Core Battle Report System**
   - Battle report creation and editing
   - Image upload and management
   - Participant tracking

2. **Battle Report Features**
   - Public sharing and discovery
   - Like and comment system
   - Search and filtering

3. **Advanced Features**
   - Battle report templates
   - Turn-by-turn documentation
   - Army list integration

### Phase 2: Gaming Statistics (2-3 sprints)

1. **Statistics Infrastructure**
   - Automatic stat calculation from battle reports
   - Performance tracking by faction and mission
   - Win/loss record management

2. **Statistics Dashboard**
   - Visual charts and graphs
   - Comparative statistics
   - Performance trends

### Phase 3: Tournament Management (3-4 sprints)

1. **Tournament Creation**
   - Tournament setup and configuration
   - Registration system
   - Participant management

2. **Tournament Operations**
   - Automated pairing system
   - Result submission and tracking
   - Standings and rankings

3. **Tournament Features**
   - Swiss and elimination formats
   - Live tournament updates
   - Tournament history

### Phase 4: Local Gaming Groups (2-3 sprints)

1. **Group Management**
   - Group creation and discovery
   - Location-based search
   - Member management

2. **Event Coordination**
   - Event creation and management
   - RSVP system
   - Calendar integration

## Mobile Integration Considerations

### Location Services

- Find nearby gaming groups and events
- Location-based group recommendations
- Check-in functionality for events
- Gaming venue discovery

### Offline Features

- Cached battle report drafts
- Offline statistics viewing
- Tournament bracket viewing
- Event calendar synchronization

### Camera Integration

- Quick battle photo capture during games
- Image editing and enhancement
- Batch photo uploads for battle reports
- QR code scanning for tournament check-ins

## Acceptance Criteria

### Battle Reports

- [ ] Users can create detailed battle reports with photos and results
- [ ] Battle reports can be shared publicly or kept private
- [ ] Image upload and organization works seamlessly
- [ ] Battle participants can be tagged and linked to their profiles
- [ ] Community can like and comment on battle reports

### Gaming Statistics

- [ ] Win/loss records are automatically calculated from battle reports
- [ ] Statistics are broken down by faction, mission, and time period
- [ ] Performance trends are visualized with charts and graphs
- [ ] Users can compare their statistics with friends
- [ ] Leaderboards show top performers in various categories

### Tournament Management

- [ ] Tournament organizers can create and manage competitive events
- [ ] Participants can register and check in to tournaments
- [ ] Automated pairing system works for different tournament formats
- [ ] Results can be submitted and standings updated in real-time
- [ ] Tournament history and achievements are tracked

### Local Gaming Groups

- [ ] Users can find gaming groups based on location and preferences
- [ ] Group organizers can manage members and coordinate events
- [ ] RSVP system allows proper event planning
- [ ] Event calendar shows upcoming gaming activities
- [ ] Group communication facilitates coordination

## Success Metrics

### Engagement Metrics

- **Battle Report Creation**: 15% of users create at least one battle report per month
- **Tournament Participation**: 25% of users participate in at least one tournament per quarter
- **Group Membership**: 40% of users join at least one local gaming group
- **Event Attendance**: 60% of RSVP'd users actually attend events

### Content Quality

- **Battle Report Completion**: >80% of started battle reports are completed
- **Image Quality**: Average of 5+ images per battle report
- **Tournament Completion**: >90% of registered participants complete tournaments
- **Group Activity**: >70% of gaming groups host at least one event per month

### Community Growth

- **New Tournaments**: 20% month-over-month growth in tournament creation
- **Group Formation**: 15% month-over-month growth in new gaming groups
- **Cross-Platform Engagement**: 50% of battle report creators also participate in other social
  features
- **User Retention**: 35% improvement in long-term retention for gaming feature users

## Dependencies

### Internal Systems

- Basic social features (#48)
- Enhanced social features
- Collection management system
- User authentication and profiles
- Image upload and storage

### External Services

- Mapping and location services
- Push notification system
- Email notification service
- Analytics platform
- Content delivery network

## Future Enhancements

### Advanced Gaming Features

- Live streaming of tournament games
- AI-powered game analysis and recommendations
- Integration with official tournament tracking systems
- Virtual reality tournament viewing

### Enhanced Analytics

- Machine learning-powered performance insights
- Predictive tournament bracket analysis
- Advanced statistical modeling
- Comparative meta-game analysis

### Professional Features

- Sponsored tournament support
- Professional tournament broadcasting
- Prize management and distribution
- Official ranking system integration

---

These battle reports and gaming features will establish the app as the premier platform for
competitive miniature wargaming, providing comprehensive tools for documenting, analyzing, and
organizing gaming experiences while fostering a vibrant competitive community.
