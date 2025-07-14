import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { LockReset, Email, ArrowBack } from '@mui/icons-material';

const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PasswordResetForm = ({ onSuccess, onError }: PasswordResetFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      setIsLoading(true);
      // TODO: Implement password reset API call
      // await authApi.requestPasswordReset(data.email);
      console.log('Password reset requested for:', data.email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSubmitted(true);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send reset email';
      setError('root', {
        message: errorMessage,
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Container maxWidth='sm' sx={{ mt: 4, mb: 4 }}>
        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box textAlign='center' mb={3}>
              <Email
                sx={{
                  fontSize: 48,
                  color: 'success.main',
                  mb: 2,
                }}
              />
              <Typography variant='h4' component='h1' gutterBottom>
                Check Your Email
              </Typography>
              <Typography variant='body1' color='text.secondary' paragraph>
                We've sent a password reset link to your email address. Please
                check your inbox and follow the instructions to reset your
                password.
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Didn't receive the email? Check your spam folder or{' '}
                <Button
                  variant='text'
                  size='small'
                  onClick={() => setIsSubmitted(false)}
                  sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                >
                  try again
                </Button>
              </Typography>
            </Box>

            <Box textAlign='center' mt={3}>
              <Button
                component={Link}
                to='/login'
                variant='outlined'
                startIcon={<ArrowBack />}
                sx={{ mt: 2 }}
              >
                Back to Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth='sm' sx={{ mt: 4, mb: 4 }}>
      <Card
        elevation={3}
        sx={{
          borderRadius: 2,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box textAlign='center' mb={3}>
            <LockReset
              sx={{
                fontSize: 48,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography variant='h4' component='h1' gutterBottom>
              Reset Password
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Enter your email address and we'll send you a link to reset your
              password
            </Typography>
          </Box>

          <Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {errors.root.message}
              </Alert>
            )}

            <TextField
              {...register('email')}
              fullWidth
              label='Email Address'
              type='email'
              variant='outlined'
              margin='normal'
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isSubmitting || isLoading}
              autoComplete='email'
              autoFocus
            />

            <Button
              type='submit'
              fullWidth
              variant='contained'
              size='large'
              disabled={isSubmitting || isLoading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #8B4513 30%, #A0522D 90%)',
                '&:hover': {
                  background:
                    'linear-gradient(45deg, #A0522D 30%, #CD853F 90%)',
                },
              }}
              startIcon={
                isSubmitting || isLoading ? (
                  <CircularProgress size={20} color='inherit' />
                ) : (
                  <Email />
                )
              }
            >
              {isSubmitting || isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Box textAlign='center' mt={2}>
              <Typography variant='body2' color='text.secondary'>
                Remember your password?{' '}
                <Link
                  to='/login'
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PasswordResetForm;
