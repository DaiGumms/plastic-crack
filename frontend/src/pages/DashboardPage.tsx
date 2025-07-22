import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Collections,
  Palette,
  Add,
  MoreVert,
  AutoAwesome,
  School,
  SportsEsports,
  BookmarkBorder,
  Assignment,
  TrendingUp,
  Psychology,
  ShoppingCart,
  AttachMoney,
  Notifications,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router';

export const DashboardPage = () => {
  const { user } = useAuth();
  const theme = useTheme();

  // Mock data - will be replaced with real API calls
  const stats = {
    totalModels: 47,
    paintedModels: 23,
    inProgress: 8,
    wishlist: 15,
  };

  // Mock painting projects data - will be replaced with real API calls
  const paintingProjects = [
    {
      name: 'Ultramarines Battle Company',
      type: 'Army Project',
      progress: 65,
      modelsTotal: 42,
      modelsCompleted: 27,
      deadline: '2 weeks',
      color: 'primary' as const,
      description: 'Complete Warhammer 40K army for tournament play',
    },
    {
      name: 'NMM Technique Practice',
      type: 'Technique Practice',
      progress: 80,
      modelsTotal: 5,
      modelsCompleted: 4,
      deadline: '1 week',
      color: 'secondary' as const,
      description: 'Mastering non-metallic metal painting techniques',
    },
    {
      name: 'Golden Daemon Entry',
      type: 'Competition Entry',
      progress: 45,
      modelsTotal: 1,
      modelsCompleted: 0,
      deadline: '6 weeks',
      color: 'warning' as const,
      description: 'Showcase quality single model for competition',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'ai-generated',
      model: 'Custom Crimson Fists Paintscheme',
      description: 'AI generated unique variant',
      date: '2 hours ago',
      icon: <Psychology />,
      color: 'secondary' as const,
      feature: 'AI Features',
    },
    {
      id: 2,
      type: 'price-alert',
      model: 'Space Marine Devastators',
      description: '25% off at Element Games',
      date: '4 hours ago',
      icon: <TrendingUp />,
      color: 'success' as const,
      feature: 'Price Tracking',
    },
    {
      id: 3,
      type: 'battle-report',
      model: 'Tournament Victory vs Necrons',
      description: 'Logged 2000pt competitive game',
      date: '1 day ago',
      icon: <EmojiEvents />,
      color: 'warning' as const,
      feature: 'Battle Reports',
    },
    {
      id: 4,
      type: 'mentorship',
      model: 'Painting Technique Mastered',
      description: 'Edge highlighting lesson completed',
      date: '2 days ago',
      icon: <School />,
      color: 'info' as const,
      feature: 'Help & Mentorship',
    },
    {
      id: 5,
      type: 'wishlist-purchase',
      model: 'Imperial Knight Questoris',
      description: 'Moved from wishlist to collection',
      date: '3 days ago',
      icon: <ShoppingCart />,
      color: 'primary' as const,
      feature: 'Wishlist System',
    },
  ];

  const quickActions = [
    { label: 'Add Model', icon: <Add />, to: '/models', color: 'primary' },
    {
      label: 'Browse Models',
      icon: <Collections />,
      to: '/models',
      color: 'info',
    },
    {
      label: 'AI Features',
      icon: <AutoAwesome />,
      to: '/ai-features',
      color: 'secondary',
    },
    {
      label: 'Help & Mentorship',
      icon: <School />,
      to: '/help-mentorship',
      color: 'warning',
    },
    {
      label: 'Battle Reports',
      icon: <SportsEsports />,
      to: '/battle-reports',
      color: 'error',
    },
    {
      label: 'Wishlist System',
      icon: <BookmarkBorder />,
      to: '/wishlist',
      color: 'success',
    },
    {
      label: 'Painting System',
      icon: <Palette />,
      to: '/painting',
      color: 'info',
    },
  ];

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h3' component='h1' gutterBottom>
          Welcome back, {user?.displayName || user?.username || 'Hobbyist'}!
        </Typography>
        <Typography variant='h6' color='text.secondary'>
          Ready to manage your Warhammer collection?
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Advanced Collection Insights
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Collections sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant='h6'>Total Models</Typography>
              </Box>
              <Typography variant='h3' color='primary.main'>
                {stats.totalModels}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp
                  sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }}
                />
                <Typography variant='caption' color='success.main'>
                  +12 this month
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant='h6'>Collection Value</Typography>
              </Box>
              <Typography variant='h3' color='warning.main'>
                $2,847
              </Typography>
              <LinearProgress
                variant='determinate'
                value={73}
                color='warning'
                sx={{ mt: 1 }}
              />
              <Typography variant='caption' color='text.secondary'>
                Price tracking active
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Psychology sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant='h6'>AI Credits</Typography>
              </Box>
              <Typography variant='h3' color='secondary.main'>
                247
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                15 paintschemes generated
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BookmarkBorder sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant='h6'>Wishlist Items</Typography>
              </Box>
              <Typography variant='h3' color='info.main'>
                {stats.wishlist}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Notifications
                  sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }}
                />
                <Typography variant='caption' color='success.main'>
                  3 deals available
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        {/* Quick Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant='h6' gutterBottom>
            Quick Actions
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            {quickActions.map((action, index) => (
              <Button
                key={index}
                component={Link}
                to={action.to}
                variant='outlined'
                startIcon={action.icon}
                sx={{
                  p: 2,
                  height: 80,
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: `${action.color}.main`,
                  color: `${action.color}.main`,
                  '&:hover': {
                    borderColor: `${action.color}.main`,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        </Paper>

        {/* Recent Activity */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='h6'>Smart Platform Activity</Typography>
            <IconButton size='small'>
              <MoreVert />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            {recentActivity.map(activity => (
              <Box
                key={activity.id}
                sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette[activity.color].main, 0.1),
                    border: 1,
                    borderColor: alpha(theme.palette[activity.color].main, 0.3),
                  }}
                >
                  {activity.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='subtitle2'>{activity.model}</Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 0.5 }}
                  >
                    {activity.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={activity.feature}
                      size='small'
                      color={activity.color}
                      variant='outlined'
                    />
                    <Typography variant='caption' color='text.secondary'>
                      {activity.date}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>

          <Button fullWidth sx={{ mt: 2 }} variant='text'>
            View All Smart Features
          </Button>
        </Paper>
      </Box>

      {/* Current Painting Projects */}
      <Paper sx={{ p: 3 }}>
        <Typography variant='h6' gutterBottom>
          Current Painting Projects
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {paintingProjects.map((project, index) => (
            <Card variant='outlined' key={index}>
              <Box
                sx={{
                  height: 200,
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  p: 2,
                }}
              >
                <Assignment
                  sx={{ fontSize: 60, color: `${project.color}.main`, mb: 1 }}
                />
                <Chip
                  label={project.type}
                  size='small'
                  color={project.color}
                  variant='outlined'
                />
              </Box>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  {project.name}
                </Typography>
                <Typography variant='body2' color='text.secondary' paragraph>
                  {project.description}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: 'block', mb: 1 }}
                >
                  {project.modelsCompleted}/{project.modelsTotal} models • Due
                  in {project.deadline}
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={project.progress}
                  color={project.color}
                  sx={{ mb: 1 }}
                />
                <Typography variant='caption' color='text.secondary'>
                  {project.progress}% Complete
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            component={Link}
            to='/painting'
            variant='outlined'
            startIcon={<Palette />}
          >
            Manage Painting Projects
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
