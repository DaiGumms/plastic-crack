import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  useTheme,
  alpha,
  Stack,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  SportsEsports,
  CameraAlt,
  BarChart,
  EmojiEvents,
  LocationOn,
  Group,
  Schedule,
  Collections,
  Star,
  Assignment,
} from '@mui/icons-material';
import { Link } from 'react-router';

export const BattleReportsGamingPage = () => {
  const theme = useTheme();

  const userBenefits = [
    {
      title: 'Document Epic Battles',
      description:
        'Capture your greatest victories and learn from defeats with detailed battle reports and photos.',
      icon: <Assignment />,
      userType: 'all players',
      benefit: 'Never forget an amazing game again',
    },
    {
      title: 'Track Your Gaming Journey',
      description:
        'See your improvement over time with detailed win/loss statistics and performance analytics.',
      icon: <BarChart />,
      userType: 'competitive',
      benefit: 'Identify strengths and improve weaknesses',
    },
    {
      title: 'Find Local Gaming Groups',
      description:
        'Connect with nearby players and join gaming communities in your area.',
      icon: <LocationOn />,
      userType: 'social',
      benefit: 'Never play alone again',
    },
    {
      title: 'Organize Epic Tournaments',
      description:
        'Create and manage tournaments with automated pairings and real-time standings.',
      icon: <EmojiEvents />,
      userType: 'organizers',
      benefit: 'Become the tournament organizer hero',
    },
    {
      title: 'Climb the Leaderboards',
      description:
        'Compete with friends and see how you rank in various gaming categories.',
      icon: <Star />,
      userType: 'competitive',
      benefit: 'Earn bragging rights and recognition',
    },
    {
      title: 'Discover Gaming Events',
      description:
        'Find tournaments, casual games, and meetups happening near you.',
      icon: <Schedule />,
      userType: 'social',
      benefit: 'Always have something fun to play',
    },
  ];

  const mockGamers = [
    {
      name: 'Alex "WaaghBoss" K.',
      level: 'Tournament Champion',
      record: '73% Win Rate',
      achievement: 'Won 12 local tournaments',
      avatar: 'A',
      color: 'primary' as const,
    },
    {
      name: 'Sarah "PaintQueen" M.',
      level: 'Community Organizer',
      record: '85 Battle Reports',
      achievement: 'Organized 6 successful events',
      avatar: 'S',
      color: 'secondary' as const,
    },
    {
      name: 'Mike "TankCommander" R.',
      level: 'Statistics Master',
      record: '156 Games Tracked',
      achievement: 'Most improved player 2024',
      avatar: 'M',
      color: 'success' as const,
    },
  ];

  const features = [
    {
      title: 'Battle Report Creation',
      description:
        'Create detailed battle reports with turn-by-turn photos, results, and tactical notes.',
      icon: <Assignment />,
      status: 'planned',
      highlight: 'Document every epic moment',
    },
    {
      title: 'Gaming Statistics Tracking',
      description:
        'Automatic win/loss tracking with detailed performance analytics and trends.',
      icon: <BarChart />,
      status: 'planned',
      highlight: 'See your improvement over time',
    },
    {
      title: 'Tournament Management',
      description:
        'Full tournament system with automated pairings, brackets, and live standings.',
      icon: <EmojiEvents />,
      status: 'planned',
      highlight: 'Host professional tournaments',
    },
    {
      title: 'Local Gaming Groups',
      description:
        'Location-based discovery of gaming groups, events, and tournament venues.',
      icon: <Group />,
      status: 'planned',
      highlight: 'Connect with local players',
    },
    {
      title: 'Mobile Gaming Companion',
      description:
        'Quick photo capture, QR code scanning, and offline battle report drafts.',
      icon: <CameraAlt />,
      status: 'planned',
      highlight: 'Perfect for gaming on the go',
    },
    {
      title: 'Community Leaderboards',
      description:
        'Rankings and achievements across different factions, missions, and game types.',
      icon: <Star />,
      status: 'planned',
      highlight: 'Compete for glory and recognition',
    },
  ];

  const mockBattleReports = [
    {
      title: 'Orks vs Space Marines - Eternal War',
      result: 'Victory',
      score: '89 - 76',
      faction: 'Orks',
      opponent: 'AlexTactical',
      mission: 'Secure Primary',
      photos: 12,
    },
    {
      title: 'Necrons vs Death Guard - Crusade',
      result: 'Defeat',
      score: '67 - 82',
      faction: 'Necrons',
      opponent: 'PlagueMaster',
      mission: 'Supply Lines',
      photos: 8,
    },
    {
      title: 'Tau vs Imperial Guard - Tournament',
      result: 'Victory',
      score: '94 - 71',
      faction: 'Tau Empire',
      opponent: 'TankCommander',
      mission: 'Sweeping Engagement',
      photos: 15,
    },
  ];

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'completed':
        return <Chip label='Complete' color='success' size='small' />;
      case 'in-progress':
        return <Chip label='In Progress' color='warning' size='small' />;
      case 'planned':
      default:
        return <Chip label='Coming Soon' color='default' size='small' />;
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'competitive':
        return 'error';
      case 'social':
        return 'info';
      case 'organizers':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getResultColor = (result: string) => {
    return result === 'Victory' ? 'success' : 'error';
  };

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SportsEsports sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant='h3' component='h1'>
            Battle Reports & Gaming
          </Typography>
          <Chip
            label='Coming Soon'
            color='primary'
            variant='outlined'
            sx={{ ml: 2 }}
          />
        </Box>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 3 }}>
          Document epic battles, track your gaming progress, and connect with
          the ultimate wargaming community
        </Typography>

        <Paper
          sx={{
            p: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: 1,
            borderColor: 'primary.main',
          }}
        >
          <Typography variant='body1' sx={{ mb: 2 }}>
            <strong>⚔️ Gaming Revolution</strong> - The ultimate battle tracking
            and gaming companion is in development! Document every victory,
            organize tournaments, and connect with players worldwide.
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            See{' '}
            <Link
              to='https://github.com/DaiGumms/plastic-crack/issues/69'
              target='_blank'
              rel='noopener'
            >
              Issue #69
            </Link>{' '}
            for development progress and technical details.
          </Typography>
        </Paper>
      </Box>

      {/* Featured Gamers */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Gaming Champions Preview
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {mockGamers.map((gamer, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: `${gamer.color}.main` }}>
                    {gamer.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant='h6'>{gamer.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {gamer.level}
                    </Typography>
                  </Box>
                </Box>
                <Stack spacing={1}>
                  <Chip
                    label={gamer.record}
                    size='small'
                    color={gamer.color}
                    variant='outlined'
                  />
                  <Typography variant='body2' color='text.secondary'>
                    🏆 {gamer.achievement}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* User Benefits */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          How Gaming Will Transform Your Hobby
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
            },
            gap: 2,
          }}
        >
          {userBenefits.map((benefit, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ mr: 2, mt: 0.5 }}>{benefit.icon}</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant='h6' sx={{ flexGrow: 1 }}>
                        {benefit.title}
                      </Typography>
                      <Chip
                        label={benefit.userType}
                        size='small'
                        color={getUserTypeColor(benefit.userType)}
                        variant='outlined'
                      />
                    </Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 1 }}
                    >
                      {benefit.description}
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        borderRadius: 1,
                        border: 1,
                        borderColor: alpha(theme.palette.success.main, 0.3),
                      }}
                    >
                      <Typography
                        variant='caption'
                        color='success.dark'
                        fontWeight='medium'
                      >
                        ⚔️ {benefit.benefit}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Battle Reports Preview & Platform Features */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              Battle Reports Preview
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              See how your gaming history will look:
            </Typography>

            <Stack spacing={2}>
              {mockBattleReports.map((report, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant='h6' sx={{ flexGrow: 1 }}>
                      {report.title}
                    </Typography>
                    <Chip
                      label={report.result}
                      size='small'
                      color={getResultColor(report.result)}
                    />
                  </Box>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 1 }}
                  >
                    <strong>Score:</strong> {report.score} | <strong>vs</strong>{' '}
                    {report.opponent}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={report.faction}
                      size='small'
                      variant='outlined'
                    />
                    <Chip
                      label={report.mission}
                      size='small'
                      variant='outlined'
                    />
                    <Chip
                      label={`${report.photos} photos`}
                      size='small'
                      color='info'
                    />
                  </Box>
                  {index < mockBattleReports.length - 1 && (
                    <Box
                      sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Gaming Stats
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Track your progress across all systems:
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant='h3' color='success.main'>
                  73%
                </Typography>
                <Typography variant='body2'>Overall Win Rate</Typography>
                <LinearProgress
                  variant='determinate'
                  value={73}
                  color='success'
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant='h3' color='primary.main'>
                  42
                </Typography>
                <Typography variant='body2'>Battle Reports Created</Typography>
              </Box>

              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant='h3' color='warning.main'>
                  #8
                </Typography>
                <Typography variant='body2'>
                  Local Tournament Ranking
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  borderRadius: 1,
                }}
              >
                <Typography variant='subtitle2' color='error.dark' gutterBottom>
                  🏆 Next Achievement
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Win 5 more games to unlock "Battle Veteran" badge!
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Platform Features */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Gaming Platform Features
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
            },
            gap: 2,
          }}
        >
          {features.map((feature, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ mr: 2, mt: 0.5 }}>{feature.icon}</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant='h6' sx={{ flexGrow: 1 }}>
                        {feature.title}
                      </Typography>
                      {getStatusChip(feature.status)}
                    </Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 1 }}
                    >
                      {feature.description}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='primary.main'
                      fontWeight='bold'
                    >
                      {feature.highlight}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Call to Action */}
      <Card sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <SportsEsports
            sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }}
          />
          <Typography variant='h5' gutterBottom>
            Ready for Battle?
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            The ultimate gaming companion is coming! Document epic battles,
            organize tournaments, and climb the leaderboards in the most
            comprehensive wargaming platform ever created.
          </Typography>
          <Stack
            direction='row'
            spacing={2}
            justifyContent='center'
            sx={{ mb: 2 }}
          >
            <Chip label='Track Every Victory' color='success' />
            <Chip label='Organize Tournaments' color='warning' />
            <Chip label='Connect with Players' color='info' />
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              component={Link}
              to='/models'
              variant='contained'
              startIcon={<Collections />}
            >
              Browse Models
            </Button>
            <Button component={Link} to='/dashboard' variant='outlined'>
              Back to Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};
