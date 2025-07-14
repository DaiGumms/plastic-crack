import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Chip,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CircularProgress,
  Fade,
} from '@mui/material';
import { CheckCircle, Email, Star } from '@mui/icons-material';

// Validation schema
const betaInterestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
  interests: z.array(z.string()).optional(),
  acceptUpdates: z.boolean().optional(),
});

type BetaInterestFormData = z.infer<typeof betaInterestSchema>;

interface BetaInterestFormProps {
  onSuccess?: (email: string) => void;
  compact?: boolean;
}

const interestOptions = [
  { id: 'collection-tracking', label: 'Collection Tracking' },
  { id: 'ai-painting', label: 'AI Painting Assistance' },
  { id: 'market-intelligence', label: 'Market Intelligence' },
  { id: 'community-features', label: 'Community Features' },
  { id: 'mobile-app', label: 'Mobile App' },
  { id: 'advanced-analytics', label: 'Advanced Analytics' },
];

export const BetaInterestForm: React.FC<BetaInterestFormProps> = ({
  onSuccess,
  compact = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<BetaInterestFormData>({
    resolver: zodResolver(betaInterestSchema),
    defaultValues: {
      email: '',
      name: '',
      interests: [],
      acceptUpdates: true,
    },
  });

  const watchedEmail = watch('email');

  const handleInterestChange = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const onSubmit = async (data: BetaInterestFormData) => {
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/beta/interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          interests: selectedInterests,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        onSuccess?.(data.email);
        reset();
        setSelectedInterests([]);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Beta interest registration error:', error);
      // TODO: Show error notification
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Fade in={isSubmitted}>
        <Card sx={{ maxWidth: compact ? 400 : 600, mx: 'auto' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle
              sx={{
                fontSize: 64,
                color: 'success.main',
                mb: 2,
              }}
            />
            <Typography variant='h5' gutterBottom>
              Welcome to the Beta!
            </Typography>
            <Typography color='text.secondary' sx={{ mb: 3 }}>
              Thank you for your interest! We'll send you beta access details
              soon.
            </Typography>
            <Chip
              label="You're in the queue!"
              color='success'
              variant='filled'
              icon={<Star />}
            />
          </CardContent>
        </Card>
      </Fade>
    );
  }

  return (
    <Card sx={{ maxWidth: compact ? 400 : 600, mx: 'auto' }}>
      <CardContent sx={{ p: compact ? 3 : 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Email sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant={compact ? 'h6' : 'h5'} gutterBottom>
            Join the Closed Beta
          </Typography>
          <Typography color='text.secondary' variant='body2'>
            Be among the first to experience Plastic Crack
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 3 }}>
            <TextField
              {...register('email')}
              label='Email Address'
              type='email'
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              {...register('name')}
              label='Name (Optional)'
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Box>

          {!compact && (
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' gutterBottom>
                What features are you most interested in?
              </Typography>
              <FormControl component='fieldset'>
                <FormGroup row>
                  {interestOptions.map(option => (
                    <FormControlLabel
                      key={option.id}
                      control={
                        <Checkbox
                          checked={selectedInterests.includes(option.id)}
                          onChange={() => handleInterestChange(option.id)}
                          size='small'
                        />
                      }
                      label={option.label}
                      sx={{
                        mr: 2,
                        mb: 1,
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem',
                        },
                      }}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Box>
          )}

          <FormControlLabel
            control={
              <Checkbox
                {...register('acceptUpdates')}
                defaultChecked
                size='small'
              />
            }
            label={
              <Typography variant='body2' color='text.secondary'>
                Send me updates about Plastic Crack development
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          <Button
            type='submit'
            variant='contained'
            fullWidth
            size='large'
            disabled={isSubmitting || !watchedEmail}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              'Request Beta Access'
            )}
          </Button>

          <Alert severity='info' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              Beta access will be granted in waves. You'll receive an email when
              it's your turn!
            </Typography>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
};
