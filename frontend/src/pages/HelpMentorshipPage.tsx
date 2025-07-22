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
} from '@mui/material';
import {
  School,
  Person,
  MenuBook,
  QuestionAnswer,
  WorkOutline,
  Star,
  Collections,
  EmojiEvents,
  Group,
  Lightbulb,
} from '@mui/icons-material';
import { Link } from 'react-router';

export const HelpMentorshipPage = () => {
  const theme = useTheme();

  const userBenefits = [
    {
      title: 'Get Expert Help Instantly',
      description:
        'Upload photos of your work and get personalized feedback from experienced hobbyists within hours.',
      icon: <Person />,
      userType: 'beginner',
      benefit: 'Learn faster with expert guidance',
    },
    {
      title: 'Find Your Perfect Mentor',
      description:
        'Connect with mentors who specialize in your interests and get ongoing support for your hobby journey.',
      icon: <School />,
      userType: 'beginner',
      benefit: 'Accelerate your skill development',
    },
    {
      title: 'Learn from Step-by-Step Tutorials',
      description:
        'Follow detailed tutorials created by master painters, with progress tracking and achievement unlocks.',
      icon: <MenuBook />,
      userType: 'beginner',
      benefit: 'Master techniques at your own pace',
    },
    {
      title: 'Share Your Expertise',
      description:
        'Help others while building your reputation as a trusted expert in the community.',
      icon: <Star />,
      userType: 'expert',
      benefit: 'Build recognition and help others grow',
    },
    {
      title: 'Earn from Commission Work',
      description:
        'Showcase your skills and accept paid commissions from fellow hobbyists.',
      icon: <WorkOutline />,
      userType: 'expert',
      benefit: 'Monetize your hobby expertise',
    },
    {
      title: 'Access Community Knowledge',
      description:
        'Search through thousands of answered questions and proven techniques.',
      icon: <QuestionAnswer />,
      userType: 'everyone',
      benefit: 'Never get stuck on a technique again',
    },
  ];

  const successStories = [
    {
      name: 'Sarah M.',
      level: 'Beginner → Intermediate',
      story:
        'Went from struggling with basecoats to winning local painting competitions in 6 months',
      mentor: 'John_PaintMaster',
      improvement: '+400% painting confidence',
    },
    {
      name: 'Mike R.',
      level: 'Expert Mentor',
      story: 'Helped 50+ beginners and earned $2,000+ from commission work',
      students: '52 successful students',
      earnings: '$2,340 in commissions',
    },
    {
      name: 'Alex T.',
      level: 'Tutorial Creator',
      story:
        'Created the "Perfect Edge Highlighting" tutorial followed by 10,000+ users',
      followers: '10,247 tutorial followers',
      rating: '4.9/5 star rating',
    },
  ];

  const features = [
    {
      title: 'Help Requests & Expert Responses',
      description:
        'Get personalized help from the community with photo uploads and detailed guidance.',
      icon: <QuestionAnswer />,
      status: 'planned',
    },
    {
      title: 'Mentor Matching System',
      description:
        'Find mentors based on your skill level, interests, and learning goals.',
      icon: <School />,
      status: 'planned',
    },
    {
      title: 'Interactive Tutorial Platform',
      description:
        'Follow step-by-step tutorials with progress tracking and achievement rewards.',
      icon: <MenuBook />,
      status: 'planned',
    },
    {
      title: 'Commission Marketplace',
      description:
        'Connect with skilled artists for custom painting services and commissions.',
      icon: <WorkOutline />,
      status: 'planned',
    },
    {
      title: 'Community Q&A Forums',
      description:
        'Searchable knowledge base with expert answers and community voting.',
      icon: <Group />,
      status: 'planned',
    },
    {
      title: 'Achievement & Reputation System',
      description:
        'Build your reputation and unlock achievements as you help others and improve.',
      icon: <EmojiEvents />,
      status: 'planned',
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
      case 'beginner':
        return 'success';
      case 'expert':
        return 'primary';
      case 'everyone':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <School sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant='h3' component='h1'>
            Help & Mentorship
          </Typography>
          <Chip
            label='Coming Soon'
            color='primary'
            variant='outlined'
            sx={{ ml: 2 }}
          />
        </Box>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 3 }}>
          Connect with experts, learn from mentors, and accelerate your hobby
          journey with our supportive community
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
            <strong>🎓 Learning Revolution</strong> - A comprehensive mentorship
            platform is in development to connect beginners with experts and
            create the ultimate learning community for miniature wargaming!
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            See{' '}
            <Link
              to='https://github.com/DaiGumms/plastic-crack/issues/70'
              target='_blank'
              rel='noopener'
            >
              Issue #70
            </Link>{' '}
            for development progress and technical details.
          </Typography>
        </Paper>
      </Box>

      {/* Success Stories */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Success Stories Preview
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
          {successStories.map((story, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {story.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant='h6'>{story.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {story.level}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant='body2' sx={{ mb: 2 }}>
                  "{story.story}"
                </Typography>
                <Stack spacing={1}>
                  {story.mentor && (
                    <Chip
                      label={`Mentor: ${story.mentor}`}
                      size='small'
                      color='primary'
                      variant='outlined'
                    />
                  )}
                  {story.improvement && (
                    <Chip
                      label={story.improvement}
                      size='small'
                      color='success'
                    />
                  )}
                  {story.students && (
                    <Chip label={story.students} size='small' color='info' />
                  )}
                  {story.earnings && (
                    <Chip label={story.earnings} size='small' color='success' />
                  )}
                  {story.followers && (
                    <Chip
                      label={story.followers}
                      size='small'
                      color='secondary'
                    />
                  )}
                  {story.rating && (
                    <Chip label={story.rating} size='small' color='warning' />
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* User Benefits */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          How You'll Benefit
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
                        💡 {benefit.benefit}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Platform Features */}
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
              Platform Features
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Everything you need to learn, teach, and grow in the hobby:
            </Typography>

            <Stack spacing={2}>
              {features.map((feature, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ mr: 2 }}>{feature.icon}</Box>
                    <Typography variant='h6' sx={{ flexGrow: 1 }}>
                      {feature.title}
                    </Typography>
                    {getStatusChip(feature.status)}
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    {feature.description}
                  </Typography>
                  {index < features.length - 1 && (
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
              Community Impact
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Building the most supportive hobby community:
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant='h3' color='primary.main'>
                  85%
                </Typography>
                <Typography variant='body2'>Help requests resolved</Typography>
              </Box>

              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant='h3' color='success.main'>
                  10K+
                </Typography>
                <Typography variant='body2'>Tutorial views expected</Typography>
              </Box>

              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant='h3' color='warning.main'>
                  70%
                </Typography>
                <Typography variant='body2'>
                  Active mentorship retention
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  borderRadius: 1,
                }}
              >
                <Typography variant='subtitle2' color='info.dark' gutterBottom>
                  💰 Monetization Opportunity
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Expert members can earn money through commission work and
                  premium tutorials.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Call to Action */}
      <Card sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Lightbulb sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
          <Typography variant='h5' gutterBottom>
            Join the Learning Revolution!
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            Whether you're a beginner looking to learn or an expert ready to
            teach, our mentorship platform will transform how you experience the
            hobby.
          </Typography>
          <Stack
            direction='row'
            spacing={2}
            justifyContent='center'
            sx={{ mb: 2 }}
          >
            <Chip label='Learn from Experts' color='success' />
            <Chip label='Build Your Reputation' color='primary' />
            <Chip label='Earn from Your Skills' color='warning' />
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
