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
  LinearProgress,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Palette,
  Assignment,
  Timer,
  BarChart,
  PhotoCamera,
  ColorLens,
  EmojiEvents,
  Star,
  Collections,
} from '@mui/icons-material';
import { Link } from 'react-router';

export const PaintingSystemPage = () => {
  const theme = useTheme();

  const userBenefits = [
    {
      title: 'Organized Painting Projects',
      description:
        'Create focused projects with specific goals, deadlines, and themes to keep your painting on track.',
      icon: <Assignment />,
      userType: 'project managers',
      benefit: 'Never lose motivation on large projects',
    },
    {
      title: 'Progress Tracking',
      description:
        'Track painting stages from primed to showcase quality with visual progress indicators.',
      icon: <BarChart />,
      userType: 'goal-oriented',
      benefit: 'See your improvement over time',
    },
    {
      title: 'Time Management',
      description:
        'Track painting sessions and estimate completion times for better planning.',
      icon: <Timer />,
      userType: 'planners',
      benefit: 'Make the most of your painting time',
    },
    {
      title: 'Technique Development',
      description:
        'Practice specific techniques with dedicated projects and reference materials.',
      icon: <ColorLens />,
      userType: 'skill builders',
      benefit: 'Master new painting techniques',
    },
    {
      title: 'Photography Integration',
      description:
        'Document progress with before/after photos and build a portfolio of your work.',
      icon: <PhotoCamera />,
      userType: 'showcasers',
      benefit: 'Build an amazing painting portfolio',
    },
    {
      title: 'Competition Ready',
      description:
        'Set quality targets and track progress toward competition-level painting.',
      icon: <EmojiEvents />,
      userType: 'competitors',
      benefit: 'Achieve showcase quality results',
    },
  ];

  const mockProjects = [
    {
      name: 'Ultramarines Battle Company',
      type: 'Army Project',
      progress: 65,
      modelsTotal: 42,
      modelsCompleted: 27,
      deadline: '2 weeks',
      color: 'primary' as const,
    },
    {
      name: 'NMM Technique Practice',
      type: 'Technique Practice',
      progress: 80,
      modelsTotal: 5,
      modelsCompleted: 4,
      deadline: '1 week',
      color: 'secondary' as const,
    },
    {
      name: 'Golden Daemon Entry',
      type: 'Competition Entry',
      progress: 45,
      modelsTotal: 1,
      modelsCompleted: 0,
      deadline: '6 weeks',
      color: 'warning' as const,
    },
  ];

  const paintingStages = [
    { stage: 'Unpainted', count: 23, color: 'inherit' as const },
    { stage: 'Primed', count: 15, color: 'info' as const },
    { stage: 'Base Coated', count: 12, color: 'warning' as const },
    { stage: 'In Progress', count: 8, color: 'secondary' as const },
    { stage: 'Completed', count: 34, color: 'success' as const },
    { stage: 'Showcase', count: 6, color: 'error' as const },
  ];

  const features = [
    {
      title: 'Project Management',
      description:
        'Create themed projects with goals, deadlines, and color schemes for organized painting.',
      icon: <Assignment />,
      status: 'planned',
      highlight: 'Stay focused on your goals',
    },
    {
      title: 'Progress Tracking',
      description:
        'Track models through 6 painting stages with visual progress indicators.',
      icon: <BarChart />,
      status: 'planned',
      highlight: 'See your painting journey',
    },
    {
      title: 'Time Tracking',
      description:
        'Log painting sessions and track time spent on each model and project.',
      icon: <Timer />,
      status: 'planned',
      highlight: 'Optimize your painting time',
    },
    {
      title: 'Technique Library',
      description:
        'Build a personal library of painting techniques with notes and reference images.',
      icon: <ColorLens />,
      status: 'planned',
      highlight: 'Master new skills systematically',
    },
    {
      title: 'Photo Documentation',
      description:
        'Before/after photos with progress galleries for each model and project.',
      icon: <PhotoCamera />,
      status: 'planned',
      highlight: 'Build your painting portfolio',
    },
    {
      title: 'Quality Targets',
      description:
        'Set quality goals from tabletop to competition level with targeted techniques.',
      icon: <Star />,
      status: 'planned',
      highlight: 'Achieve your quality goals',
    },
  ];

  const mockPaintingHistory = [
    {
      model: 'Space Marine Captain',
      action: 'Completed painting',
      time: '2 hours ago',
      stage: 'Completed',
      project: 'Ultramarines Battle Company',
    },
    {
      model: 'Tactical Squad (5)',
      action: 'Started base coating',
      time: '1 day ago',
      stage: 'Base Coated',
      project: 'Ultramarines Battle Company',
    },
    {
      model: 'Librarian',
      action: 'Applied primer',
      time: '2 days ago',
      stage: 'Primed',
      project: 'NMM Technique Practice',
    },
  ];

  const projectTypes = [
    { type: 'Army Project', description: 'Complete gaming armies', icon: '⚔️' },
    {
      type: 'Technique Practice',
      description: 'Skill development focus',
      icon: '🎨',
    },
    {
      type: 'Competition Entry',
      description: 'Showcase quality pieces',
      icon: '🏆',
    },
    {
      type: 'Commission Work',
      description: 'Client painting projects',
      icon: '💼',
    },
    {
      type: 'Personal Challenge',
      description: 'Self-imposed goals',
      icon: '🎯',
    },
    {
      type: 'Seasonal Theme',
      description: 'Holiday or event themes',
      icon: '🎃',
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
      case 'project managers':
        return 'primary';
      case 'goal-oriented':
        return 'success';
      case 'planners':
        return 'info';
      case 'skill builders':
        return 'secondary';
      case 'showcasers':
        return 'warning';
      case 'competitors':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Completed':
        return 'success';
      case 'Base Coated':
        return 'warning';
      case 'Primed':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Palette sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant='h3' component='h1'>
            Painting System
          </Typography>
          <Chip
            label='Coming Soon'
            color='primary'
            variant='outlined'
            sx={{ ml: 2 }}
          />
        </Box>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 3 }}>
          Complete painting project management with progress tracking, time
          logging, and technique development
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
            <strong>🎨 Painting Revolution</strong> - The ultimate painting
            management system is in development! Organize projects, track
            progress, and master new techniques with comprehensive painting
            tools.
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            See{' '}
            <Link
              to='https://github.com/DaiGumms/plastic-crack/issues/65'
              target='_blank'
              rel='noopener'
            >
              Issue #65
            </Link>{' '}
            (Projects) and{' '}
            <Link
              to='https://github.com/DaiGumms/plastic-crack/issues/64'
              target='_blank'
              rel='noopener'
            >
              Issue #64
            </Link>{' '}
            (Progress Tracking) for development details.
          </Typography>
        </Paper>
      </Box>

      {/* Current Projects Preview */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Your Painting Projects Preview
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
          {mockProjects.map((project, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assignment
                    sx={{ mr: 1.5, color: `${project.color}.main` }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant='h6'>{project.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {project.type} • Due in {project.deadline}
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={1.5}>
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant='body2'>Progress</Typography>
                      <Typography variant='body2' fontWeight='bold'>
                        {project.modelsCompleted}/{project.modelsTotal} models
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={project.progress}
                      color={project.color}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant='caption' color='text.secondary'>
                      {project.progress}% complete
                    </Typography>
                  </Box>

                  <Chip
                    label={project.type}
                    size='small'
                    color={project.color}
                    variant='outlined'
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* User Benefits */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          How Painting System Will Transform Your Hobby
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
                        🎨 {benefit.benefit}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Progress Tracking & Painting Activity */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1fr 1fr',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              Painting Progress Overview
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Track models through every painting stage:
            </Typography>

            <Stack spacing={2}>
              {paintingStages.map((stage, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant='h6' sx={{ flexGrow: 1 }}>
                      {stage.stage}
                    </Typography>
                    <Typography variant='h6' color={`${stage.color}.main`}>
                      {stage.count}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={(stage.count / 98) * 100}
                    color={stage.color}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  {index < paintingStages.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </Stack>

            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 1,
              }}
            >
              <Typography variant='subtitle1' color='primary.dark' gutterBottom>
                📊 Your Painting Stats
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Total Models: 98 • Completion Rate: 41% • This Month: +12
                completed
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Recent Painting Activity
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Your latest painting progress:
            </Typography>

            <Stack spacing={2}>
              {mockPaintingHistory.map((activity, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1.5,
                        bgcolor: 'primary.main',
                      }}
                    >
                      <Palette sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant='subtitle2'>
                        {activity.model}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {activity.action} • {activity.time}
                      </Typography>
                    </Box>
                    <Chip
                      label={activity.stage}
                      size='small'
                      color={getStageColor(activity.stage)}
                    />
                  </Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ ml: 6 }}
                  >
                    Project: {activity.project}
                  </Typography>
                  {index < mockPaintingHistory.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </Stack>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant='h4' color='success.main'>
                32h
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Painting time this month
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Project Types */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Project Types Available
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {projectTypes.map((type, index) => (
            <Card key={index}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {type.icon}
                </Typography>
                <Typography variant='h6' gutterBottom>
                  {type.type}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {type.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* System Features */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Painting System Features
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

      {/* Development Phases */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Development Roadmap
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {[
            {
              phase: 'Phase 1',
              title: 'Core Projects',
              features: ['Project CRUD', 'Basic Progress', 'Simple UI'],
            },
            {
              phase: 'Phase 2',
              title: 'Enhanced Tracking',
              features: ['Time Logging', 'Photo Upload', 'Detailed Stats'],
            },
            {
              phase: 'Phase 3',
              title: 'Advanced Tools',
              features: ['Technique Library', 'Templates', 'Analytics'],
            },
            {
              phase: 'Phase 4',
              title: 'Social Features',
              features: ['Project Sharing', 'Community', 'Challenges'],
            },
          ].map((phase, index) => (
            <Card key={index}>
              <CardContent>
                <Typography variant='h6' color='primary.main' gutterBottom>
                  {phase.phase}
                </Typography>
                <Typography
                  variant='subtitle1'
                  fontWeight='bold'
                  sx={{ mb: 1 }}
                >
                  {phase.title}
                </Typography>
                <Stack spacing={0.5}>
                  {phase.features.map((feature, featureIndex) => (
                    <Typography
                      key={featureIndex}
                      variant='body2'
                      color='text.secondary'
                    >
                      • {feature}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Call to Action */}
      <Card sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Palette sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
          <Typography variant='h5' gutterBottom>
            Ready to Master Your Painting?
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            The comprehensive painting system is coming! Organize projects,
            track progress, and develop your techniques with the ultimate
            painting management platform.
          </Typography>
          <Stack
            direction='row'
            spacing={2}
            justifyContent='center'
            sx={{ mb: 2 }}
          >
            <Chip label='Project Organization' color='primary' />
            <Chip label='Progress Tracking' color='success' />
            <Chip label='Technique Development' color='info' />
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
