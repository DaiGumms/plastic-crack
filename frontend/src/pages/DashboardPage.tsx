import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
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
  PhotoCamera,
  TrendingUp,
  Add,
  MoreVert,
  Star,
  Schedule,
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

  const recentActivity = [
    {
      id: 1,
      type: 'painted',
      model: 'Space Marine Captain',
      date: '2 hours ago',
      image: '/api/placeholder/60/60',
    },
    {
      id: 2,
      type: 'added',
      model: 'Necron Warriors Squad',
      date: '1 day ago',
      image: '/api/placeholder/60/60',
    },
    {
      id: 3,
      type: 'progress',
      model: 'Imperial Knight',
      date: '3 days ago',
      image: '/api/placeholder/60/60',
    },
  ];

  const quickActions = [
    { label: 'Add Model', icon: <Add />, to: '/models/add', color: 'primary' },
    {
      label: 'Take Photo',
      icon: <PhotoCamera />,
      to: '/photo',
      color: 'secondary',
    },
    {
      label: 'Browse Deals',
      icon: <TrendingUp />,
      to: '/deals',
      color: 'success',
    },
    {
      label: 'Gallery',
      icon: <Collections />,
      to: '/gallery',
      color: 'warning',
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
          Collection Overview
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
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Palette sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant='h6'>Painted</Typography>
              </Box>
              <Typography variant='h3' color='success.main'>
                {stats.paintedModels}
              </Typography>
              <LinearProgress
                variant='determinate'
                value={(stats.paintedModels / stats.totalModels) * 100}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant='h6'>In Progress</Typography>
              </Box>
              <Typography variant='h3' color='warning.main'>
                {stats.inProgress}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Star sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant='h6'>Wishlist</Typography>
              </Box>
              <Typography variant='h3' color='info.main'>
                {stats.wishlist}
              </Typography>
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
            <Typography variant='h6'>Recent Activity</Typography>
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
                <Avatar src={activity.image} sx={{ width: 48, height: 48 }}>
                  {activity.model.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='subtitle2'>{activity.model}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={activity.type}
                      size='small'
                      color={
                        activity.type === 'painted'
                          ? 'success'
                          : activity.type === 'added'
                            ? 'primary'
                            : 'warning'
                      }
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
            View All Activity
          </Button>
        </Paper>
      </Box>

      {/* Current Projects */}
      <Paper sx={{ p: 3 }}>
        <Typography variant='h6' gutterBottom>
          Current Projects
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
          {[1, 2, 3].map(project => (
            <Card variant='outlined' key={project}>
              <Box
                sx={{
                  height: 200,
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Collections sx={{ fontSize: 60, color: 'grey.400' }} />
              </Box>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Project {project}
                </Typography>
                <Typography variant='body2' color='text.secondary' paragraph>
                  Description of the current painting project...
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={30 + project * 20}
                  sx={{ mb: 1 }}
                />
                <Typography variant='caption' color='text.secondary'>
                  {30 + project * 20}% Complete
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};
