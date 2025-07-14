import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  alpha,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Rocket,
  Speed,
  Security,
  People,
} from '@mui/icons-material';
import { BetaInterestForm } from '../components/beta/BetaInterestForm';
import { SEOHead, SEOConfigs } from '../components/seo/SEOHead';

export const BetaInterestPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [emailRegistered, setEmailRegistered] = useState<string | null>(null);

  const betaFeatures = [
    {
      icon: <Rocket sx={{ fontSize: 32 }} />,
      title: 'Early Access',
      description:
        "Be the first to try new features before they're released to the public.",
      color: theme.palette.primary.main,
    },
    {
      icon: <Speed sx={{ fontSize: 32 }} />,
      title: 'Priority Support',
      description:
        'Get faster response times and direct access to our development team.',
      color: theme.palette.secondary.main,
    },
    {
      icon: <Security sx={{ fontSize: 32 }} />,
      title: 'Exclusive Features',
      description:
        'Access beta-only features and help shape the future of Plastic Crack.',
      color: theme.palette.success.main,
    },
    {
      icon: <People sx={{ fontSize: 32 }} />,
      title: 'Beta Community',
      description:
        'Join our exclusive Discord community for beta testers and power users.',
      color: theme.palette.warning.main,
    },
  ];

  const handleRegistrationSuccess = (email: string) => {
    setEmailRegistered(email);
  };

  return (
    <>
      <SEOHead {...SEOConfigs.betaInterest} />
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header */}
        <Container maxWidth='lg'>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{ mb: 2 }}
            >
              Back to Home
            </Button>

            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Chip
                label='🚀 Closed Beta'
                color='primary'
                variant='filled'
                sx={{ mb: 2, px: 2, py: 0.5, fontSize: '0.9rem' }}
              />
              <Typography
                variant='h2'
                component='h1'
                gutterBottom
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Join the Beta Program
              </Typography>
              <Typography
                variant='h6'
                color='text.secondary'
                sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
              >
                Get early access to Plastic Crack and help us build the ultimate
                Warhammer collection management platform.
              </Typography>
            </Box>
          </Box>

          {/* Beta Benefits */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant='h4'
              component='h2'
              textAlign='center'
              gutterBottom
              sx={{ mb: 4 }}
            >
              Beta Program Benefits
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: 'repeat(4, 1fr)',
                },
                gap: 3,
              }}
            >
              {betaFeatures.map((feature, index) => (
                <Card
                  key={index}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(feature.color, 0.1),
                        color: feature.color,
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant='h6' gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography
                      color='text.secondary'
                      variant='body2'
                      sx={{ lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Registration Form */}
          <Box sx={{ mb: 6 }}>
            <BetaInterestForm onSuccess={handleRegistrationSuccess} />
          </Box>

          {/* Additional Info */}
          {!emailRegistered && (
            <Box
              sx={{
                textAlign: 'center',
                backgroundColor: alpha(theme.palette.grey[100], 0.5),
                borderRadius: 2,
                p: 4,
              }}
            >
              <Typography variant='h6' gutterBottom>
                What to Expect
              </Typography>
              <Typography color='text.secondary' sx={{ mb: 2 }}>
                Beta access will be granted in waves starting in early 2025.
                We'll send you an email when it's your turn to join!
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Beta testing will run for approximately 3-6 months before our
                public launch.
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};
