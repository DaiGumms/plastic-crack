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
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack,
  Rocket,
  Speed,
  Security,
  People,
  Build,
  Schedule,
  Launch,
  ExpandMore,
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

  const roadmapItems = [
    {
      phase: 'Phase 1',
      title: 'Beta Launch',
      description: 'Core collection management and basic features',
      date: 'Q1 2025',
      status: 'current',
      features: [
        'Collection Tracking',
        'Model Database',
        'Basic Profile',
        'Photo Upload',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'AI & Intelligence',
      description: 'AI-powered features and smart recommendations',
      date: 'Q2 2025',
      status: 'upcoming',
      features: [
        'AI Painting Assistance',
        'Smart Categorization',
        'Color Palette Generation',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'Social & Community',
      description: 'Community features and social interaction',
      date: 'Q3 2025',
      status: 'planned',
      features: [
        'Following System',
        'Community Galleries',
        'Collaboration Tools',
      ],
    },
    {
      phase: 'Phase 4',
      title: 'Public Launch',
      description: 'Full public release with premium features',
      date: 'Q4 2025',
      status: 'planned',
      features: ['Mobile App', 'Premium Subscriptions', 'Advanced Analytics'],
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
                label='🚀 Closed Beta - Limited Access'
                color='primary'
                variant='filled'
                sx={{ mb: 3, px: 3, py: 1, fontSize: '1rem', fontWeight: 600 }}
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
                Join the Plastic Crack Beta
              </Typography>
              <Typography
                variant='h6'
                color='text.secondary'
                sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6, mb: 2 }}
              >
                Get early access to the ultimate Warhammer collection management
                platform
              </Typography>

              {/* Beta Progress */}
              <Card sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Beta Progress
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={65}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 1,
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      },
                    }}
                  />
                  <Typography variant='caption' color='text.secondary'>
                    65% Complete - Core Features Ready
                  </Typography>
                </CardContent>
              </Card>
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
              Why Join the Beta?
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
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
          <Box sx={{ mb: 8 }}>
            <Typography
              variant='h4'
              component='h2'
              textAlign='center'
              gutterBottom
              sx={{ mb: 4 }}
            >
              Request Beta Access
            </Typography>
            <BetaInterestForm onSuccess={handleRegistrationSuccess} />
          </Box>

          {/* Development Roadmap */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant='h4'
              component='h2'
              textAlign='center'
              gutterBottom
              sx={{ mb: 4 }}
            >
              Development Roadmap
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                },
                gap: 3,
              }}
            >
              {roadmapItems.map((item, index) => (
                <Card
                  key={index}
                  variant='outlined'
                  sx={{
                    height: '100%',
                    border:
                      item.status === 'current'
                        ? `2px solid ${theme.palette.primary.main}`
                        : undefined,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          p: 1,
                          borderRadius: 1,
                          backgroundColor:
                            item.status === 'current'
                              ? alpha(theme.palette.primary.main, 0.1)
                              : item.status === 'upcoming'
                                ? alpha(theme.palette.secondary.main, 0.1)
                                : alpha(theme.palette.grey[500], 0.1),
                          color:
                            item.status === 'current'
                              ? theme.palette.primary.main
                              : item.status === 'upcoming'
                                ? theme.palette.secondary.main
                                : theme.palette.grey[500],
                          mr: 2,
                        }}
                      >
                        {item.status === 'current' ? (
                          <Build />
                        ) : item.status === 'upcoming' ? (
                          <Schedule />
                        ) : (
                          <Launch />
                        )}
                      </Box>
                      <Box>
                        <Typography variant='h6' component='div'>
                          {item.phase}: {item.title}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {item.date}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography color='text.secondary' sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {item.features.map((feature, fIndex) => (
                        <Chip
                          key={fIndex}
                          label={feature}
                          size='small'
                          variant='outlined'
                          color={
                            item.status === 'current' ? 'primary' : 'default'
                          }
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* FAQ Section */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant='h4'
              component='h2'
              textAlign='center'
              gutterBottom
              sx={{ mb: 4 }}
            >
              Frequently Asked Questions
            </Typography>

            {[
              {
                question: 'When will the beta start?',
                answer:
                  "Beta access will begin rolling out in Q1 2025. We'll be granting access in waves to ensure the best possible experience for all testers.",
              },
              {
                question: 'How long will the beta last?',
                answer:
                  'The closed beta is expected to run for 6-9 months, allowing us to thoroughly test and refine all features before public launch.',
              },
              {
                question: 'Will my beta data be preserved?',
                answer:
                  'Yes! All collections, photos, and data you create during the beta will be preserved when we launch publicly.',
              },
              {
                question: 'What features will be available in beta?',
                answer:
                  'Beta will include core collection management, photo uploads, basic AI features, and community tools. New features will be added throughout the beta period.',
              },
              {
                question: 'How can I provide feedback?',
                answer:
                  'Beta testers will have access to exclusive Discord channels, in-app feedback tools, and direct communication with our development team.',
              },
            ].map((faq, index) => (
              <Accordion key={index}>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls={`panel${index}a-content`}
                  id={`panel${index}a-header`}
                >
                  <Typography variant='h6'>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color='text.secondary'>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
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
                Beta access will be granted in waves starting in Q1 2025. We'll
                send you an email when it's your turn to join!
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Beta testing will run for approximately 6-9 months before our
                public launch, giving you exclusive access to shape the future
                of Plastic Crack.
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};
