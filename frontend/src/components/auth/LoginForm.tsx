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
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff, Login } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// Validation schema
const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearErrors();
      await login({
        emailOrUsername: data.emailOrUsername,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      setError('root', { message: errorMessage });
      onError?.(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth='sm'>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box textAlign='center' mb={4}>
              <Login sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography
                variant='h4'
                component='h1'
                fontWeight={600}
                gutterBottom
              >
                Welcome Back
              </Typography>
              <Typography color='text.secondary' variant='body1'>
                Sign in to your account
              </Typography>
            </Box>

            {/* Form */}
            <Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email/Username Field */}
              <TextField
                {...register('emailOrUsername')}
                fullWidth
                label='Email or Username'
                variant='outlined'
                margin='normal'
                autoComplete='username'
                autoFocus
                error={!!errors.emailOrUsername}
                helperText={errors.emailOrUsername?.message}
                sx={{ mb: 2 }}
              />

              {/* Password Field */}
              <TextField
                {...register('password')}
                fullWidth
                label='Password'
                type={showPassword ? 'text' : 'password'}
                variant='outlined'
                margin='normal'
                autoComplete='current-password'
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label='toggle password visibility'
                        onClick={togglePasswordVisibility}
                        edge='end'
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Remember Me & Forgot Password */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox {...register('rememberMe')} color='primary' />
                  }
                  label='Remember me'
                />
                <Link
                  to='/auth/reset-password'
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  <Typography
                    variant='body2'
                    color='primary'
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Link>
              </Box>

              {/* Error Alert */}
              {errors.root && (
                <Alert severity='error' sx={{ mb: 3 }}>
                  {errors.root.message}
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type='submit'
                fullWidth
                variant='contained'
                size='large'
                disabled={isSubmitting || isLoading}
                startIcon={
                  isSubmitting || isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Login />
                  )
                }
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                {isSubmitting || isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Divider */}
              <Divider sx={{ mb: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  or
                </Typography>
              </Divider>

              {/* Sign Up Link */}
              <Box textAlign='center'>
                <Typography variant='body2' color='text.secondary'>
                  Don't have an account?{' '}
                  <Link
                    to='/auth/register'
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    <Typography
                      component='span'
                      variant='body2'
                      color='primary'
                      fontWeight={600}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Sign up here
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
