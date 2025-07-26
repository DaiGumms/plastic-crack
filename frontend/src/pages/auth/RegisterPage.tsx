import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Email as InterestIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Redirect after showing the message briefly
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/beta-interest');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth='sm'>
        <Card
          sx={{
            textAlign: 'center',
            p: 4,
            borderRadius: 3,
            boxShadow: theme.shadows[10],
          }}
        >
          <CardContent>
            {/* Icon */}
            <Box sx={{ mb: 3 }}>
              <RocketIcon
                sx={{
                  fontSize: 64,
                  color: 'primary.main',
                  mb: 2,
                }}
              />
            </Box>

            {/* Title */}
            <Typography
              variant='h4'
              component='h1'
              gutterBottom
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Registration Temporarily Closed
            </Typography>

            {/* Message */}
            <Typography
              variant='h6'
              color='text.secondary'
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              We're currently in closed beta testing
            </Typography>

            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              New account registration is temporarily disabled while we perfect
              the Plastic Crack experience with our beta testers. Join our beta
              waitlist to be notified when registration reopens!
            </Typography>

            {/* Beta Alert */}
            <Alert
              severity='info'
              sx={{
                mb: 4,
                textAlign: 'left',
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              <Typography variant='body2' sx={{ mb: 1 }}>
                <strong>Closed Beta Program</strong>
              </Typography>
              <Typography variant='body2'>
                We're working with a select group of beta testers to ensure
                Plastic Crack meets the high standards the Warhammer community
                deserves. Registration will reopen for everyone soon!
              </Typography>
            </Alert>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Button
                component={Link}
                to='/beta-interest'
                variant='contained'
                size='large'
                startIcon={<InterestIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                }}
              >
                Join Beta Waitlist
              </Button>

              <Button
                component={Link}
                to='/login'
                variant='outlined'
                size='large'
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                }}
              >
                Sign In Instead
              </Button>
            </Box>

            {/* Auto-redirect notice */}
            <Typography variant='caption' color='text.secondary'>
              You'll be redirected to the beta waitlist in a few seconds...
            </Typography>

            {/* Manual navigation */}
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant='body2' color='text.secondary'>
                <Link
                  to='/'
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                  }}
                >
                  ← Back to Home
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
