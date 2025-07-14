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
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])/,
        'Password must contain at least one lowercase letter'
      )
      .regex(
        /^(?=.*[A-Z])/,
        'Password must contain at least one uppercase letter'
      )
      .regex(/^(?=.*\d)/, 'Password must contain at least one number')
      .regex(
        /^(?=.*[@$!%*?&])/,
        'Password must contain at least one special character (@$!%*?&)'
      ),
    confirmPassword: z.string(),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    displayName: z.string().min(1, 'Display name is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const RegisterForm = ({ onSuccess, onError }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        username: data.username,
        displayName: data.displayName,
      });
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      setError('root', {
        message: errorMessage,
      });
      onError?.(errorMessage);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

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
            <PersonAdd
              sx={{
                fontSize: 48,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography variant='h4' component='h1' gutterBottom>
              Create Account
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Join the Plastic Crack community
            </Typography>
          </Box>

          <Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {errors.root.message}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                {...register('username')}
                fullWidth
                label='Username'
                variant='outlined'
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={isSubmitting || isLoading}
                autoComplete='username'
              />
              <TextField
                {...register('displayName')}
                fullWidth
                label='Display Name'
                variant='outlined'
                error={!!errors.displayName}
                helperText={errors.displayName?.message}
                disabled={isSubmitting || isLoading}
                autoComplete='name'
              />
            </Box>

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
            />

            <TextField
              {...register('password')}
              fullWidth
              label='Password'
              type={showPassword ? 'text' : 'password'}
              variant='outlined'
              margin='normal'
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isSubmitting || isLoading}
              autoComplete='new-password'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={handleClickShowPassword}
                      edge='end'
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {...register('confirmPassword')}
              fullWidth
              label='Confirm Password'
              type={showConfirmPassword ? 'text' : 'password'}
              variant='outlined'
              margin='normal'
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              disabled={isSubmitting || isLoading}
              autoComplete='new-password'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle confirm password visibility'
                      onClick={handleClickShowConfirmPassword}
                      edge='end'
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
                  <PersonAdd />
                )
              }
            >
              {isSubmitting || isLoading
                ? 'Creating Account...'
                : 'Create Account'}
            </Button>

            <Box textAlign='center' mt={2}>
              <Typography variant='body2' color='text.secondary'>
                Already have an account?{' '}
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

export default RegisterForm;
