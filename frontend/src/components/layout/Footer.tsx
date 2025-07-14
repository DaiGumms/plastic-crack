import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box
      component='footer'
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth='lg'>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
            gap: 4,
          }}
        >
          {/* Brand */}
          <Box>
            <Link
              component={RouterLink}
              to='/'
              sx={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              Plastic Crack
            </Link>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mt: 1, maxWidth: 400 }}
            >
              The ultimate Warhammer collection management app. Track your
              miniatures, get AI-powered painting suggestions, and connect with
              the community.
            </Typography>
          </Box>

          {/* Navigation */}
          <Box>
            <Typography
              variant='h6'
              color='text.primary'
              gutterBottom
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              App
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Link
                component={RouterLink}
                to='/'
                color='text.secondary'
                display='block'
                sx={{
                  mb: 1,
                  textDecoration: 'none',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                Home
              </Link>
              <Link
                component={RouterLink}
                to='/beta-interest'
                color='text.secondary'
                display='block'
                sx={{
                  mb: 1,
                  textDecoration: 'none',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                Join Beta
              </Link>
            </Box>
          </Box>

          {/* Legal */}
          <Box>
            <Typography
              variant='h6'
              color='text.primary'
              gutterBottom
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Legal
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Link
                href='#'
                color='text.secondary'
                display='block'
                sx={{
                  mb: 1,
                  textDecoration: 'none',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                Terms of Service
              </Link>
              <Link
                href='#'
                color='text.secondary'
                display='block'
                sx={{
                  mb: 1,
                  textDecoration: 'none',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                Contact
              </Link>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box textAlign='center'>
          <Typography variant='body2' color='text.secondary'>
            &copy; 2025 Plastic Crack. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
