import { Link } from 'react-router';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Palette,
  PhotoCamera,
  TrendingUp,
  People,
  Star,
  ArrowForward,
  LoginOutlined,
  PersonAdd,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { SEOHead, SEOConfigs } from '../components/seo/SEOHead';
import { CollectionCarousel } from '../components/CollectionCarousel';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  const features = [
    {
      icon: <PhotoCamera sx={{ fontSize: 40 }} />,
      title: 'Smart Collection Tracking',
      description:
        'Catalog your miniatures with AI-powered photo recognition and detailed progress tracking.',
      color: theme.palette.primary.main,
    },
    {
      icon: <Palette sx={{ fontSize: 40 }} />,
      title: 'AI Painting Guidance',
      description:
        'Get personalized color schemes and painting techniques based on your models and skill level.',
      color: theme.palette.secondary.main,
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Market Intelligence',
      description:
        'Real-time pricing, deal alerts, and collection value tracking from multiple retailers.',
      color: theme.palette.success.main,
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Community Features',
      description:
        'Share your work, get feedback, and connect with fellow Warhammer enthusiasts.',
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box>
      <SEOHead {...SEOConfigs.home} />
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          pt: { xs: 4, md: 8 },
          pb: { xs: 6, md: 12 },
        }}
      >
        <Container maxWidth='lg'>
          <Box textAlign='center' mb={6}>
            <Typography
              variant='h1'
              component='h1'
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Manage Your Warhammer Collection Like Never Before
            </Typography>

            <Typography
              variant='h6'
              color='text.secondary'
              sx={{
                maxWidth: 800,
                mx: 'auto',
                mb: 4,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 1.6,
              }}
            >
              Track your miniatures, get AI-powered painting suggestions,
              discover deals, and connect with the community. The ultimate tool
              for Warhammer enthusiasts.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent='center'
              alignItems='center'
            >
              {!isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    to='/auth/register'
                    variant='contained'
                    size='large'
                    startIcon={<PersonAdd />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      minWidth: 200,
                    }}
                  >
                    Join the Beta
                  </Button>
                  <Button
                    component={Link}
                    to='/auth/login'
                    variant='outlined'
                    size='large'
                    startIcon={<LoginOutlined />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      minWidth: 200,
                    }}
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <Button
                  component={Link}
                  to='/dashboard'
                  variant='contained'
                  size='large'
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    minWidth: 200,
                  }}
                >
                  Go to Dashboard
                </Button>
              )}
            </Stack>
          </Box>

          {/* Beta Badge */}
          <Box textAlign='center' mb={4}>
            <Chip
              label='🚀 Closed Beta - Early Access'
              color='primary'
              variant='filled'
              sx={{
                px: 2,
                py: 0.5,
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth='lg' sx={{ py: { xs: 6, md: 10 } }}>
        <Box textAlign='center' mb={6}>
          <Typography variant='h2' component='h2' gutterBottom>
            Everything You Need for Your Collection
          </Typography>
          <Typography
            variant='h6'
            color='text.secondary'
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Plastic Crack will revolutionize how you manage and enjoy your
            Warhammer hobby.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
          }}
        >
          {features.map((feature, index) => (
            <Box key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: alpha(feature.color, 0.1),
                        color: feature.color,
                        mr: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant='h5' component='h3' fontWeight={600}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography color='text.secondary' sx={{ lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Recent Collections Carousel */}
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" component="h2" gutterBottom>
              Recent Collections
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Discover what the community has been working on lately
            </Typography>
          </Box>
          
          <CollectionCarousel limit={8} />
        </Container>
      </Box>

      {/* Coming Soon Section */}
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.grey[100], 0.5),
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth='md' sx={{ textAlign: 'center' }}>
          <Star
            sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }}
          />
          <Typography variant='h3' component='h2' gutterBottom>
            Coming Soon
          </Typography>
          <Typography
            variant='h6'
            color='text.secondary'
            sx={{ mb: 4, lineHeight: 1.6 }}
          >
            We're putting the finishing touches on Plastic Crack. Join our
            closed beta to get early access and help shape the future of
            Warhammer collection management.
          </Typography>

          {!isAuthenticated && (
            <Button
              component={Link}
              to='/beta-interest'
              variant='contained'
              size='large'
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 3,
              }}
            >
              Request Beta Access
            </Button>
          )}
        </Container>
      </Box>
    </Box>
  );
};
