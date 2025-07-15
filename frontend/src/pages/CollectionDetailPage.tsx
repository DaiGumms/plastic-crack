import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
} from '@mui/icons-material';
import { CollectionService } from '../services/collectionService';
import { formatDistanceToNow } from 'date-fns';

export const CollectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: collection,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => CollectionService.getCollection(id!),
    enabled: !!id,
  });

  // Use models from collection response instead of separate API call
  const models = collection?.userModels || [];

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant='rectangular' width={100} height={36} />
        </Box>
        <Card>
          <CardContent>
            <Skeleton variant='text' sx={{ fontSize: '2rem', mb: 2 }} />
            <Skeleton variant='text' sx={{ fontSize: '1rem', mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Skeleton variant='rectangular' width={80} height={24} />
              <Skeleton variant='rectangular' width={80} height={24} />
            </Box>
            <Skeleton variant='rectangular' height={200} />
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/collections')}
          sx={{ mb: 3 }}
        >
          Back to Collections
        </Button>
        <Alert severity='error'>
          Failed to load collection. Please try again later.
        </Alert>
      </Container>
    );
  }

  if (!collection) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/collections')}
          sx={{ mb: 3 }}
        >
          Back to Collections
        </Button>
        <Alert severity='info'>Collection not found.</Alert>
      </Container>
    );
  }

  const modelCount = models.length;

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/collections')}
        sx={{ mb: 3 }}
      >
        Back to Collections
      </Button>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant='h4' component='h1' sx={{ flexGrow: 1 }}>
              {collection.name}
            </Typography>
            <Chip
              icon={collection.isPublic ? <PublicIcon /> : <PrivateIcon />}
              label={collection.isPublic ? 'Public' : 'Private'}
              color={collection.isPublic ? 'success' : 'default'}
              variant='outlined'
            />
          </Box>

          {collection.description && (
            <Typography variant='body1' sx={{ mb: 3 }}>
              {collection.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {collection.tags?.map(tag => (
              <Chip key={tag} label={tag} variant='outlined' size='small' />
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {collection.user?.displayName?.[0] ||
                collection.user?.username?.[0] ||
                '?'}
            </Avatar>
            <Box>
              <Typography variant='body2' color='text.secondary'>
                Created by{' '}
                {collection.user?.displayName ||
                  collection.user?.username ||
                  'Unknown'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {formatDistanceToNow(new Date(collection.createdAt), {
                  addSuffix: true,
                })}
              </Typography>
            </Box>
          </Box>

          <Typography variant='h6' sx={{ mb: 2 }}>
            Models ({modelCount})
          </Typography>

          {modelCount === 0 ? (
            <Alert severity='info'>No models in this collection yet.</Alert>
          ) : isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...Array(3)].map((_, index) => (
                <Paper key={index} sx={{ p: 2 }}>
                  <Skeleton
                    variant='text'
                    sx={{ fontSize: '1.25rem', mb: 1 }}
                  />
                  <Skeleton variant='text' sx={{ fontSize: '1rem', mb: 1 }} />
                  <Skeleton variant='text' sx={{ fontSize: '0.875rem' }} />
                </Paper>
              ))}
            </Box>
          ) : error ? (
            <Alert severity='error'>
              Failed to load models for this collection.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {models.map(userModel => (
                <Paper key={userModel.id} sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='h6' component='h3'>
                        {userModel.customName || userModel.model?.name}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 1 }}
                      >
                        {userModel.model?.gameSystem?.name} -{' '}
                        {userModel.model?.faction?.name}
                      </Typography>
                      {userModel.notes && (
                        <Typography variant='body2' sx={{ mb: 1 }}>
                          {userModel.notes}
                        </Typography>
                      )}
                      {userModel.tags.length > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            mb: 1,
                          }}
                        >
                          {userModel.tags.map(tag => (
                            <Chip
                              key={tag}
                              label={tag}
                              size='small'
                              variant='outlined'
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                      <Chip
                        label={userModel.paintingStatus.replace('_', ' ')}
                        color={
                          userModel.paintingStatus === 'COMPLETED'
                            ? 'success'
                            : userModel.paintingStatus === 'IN_PROGRESS'
                              ? 'warning'
                              : userModel.paintingStatus === 'SHOWCASE'
                                ? 'primary'
                                : 'default'
                        }
                        size='small'
                        sx={{ mb: 1 }}
                      />
                      {userModel.purchasePrice && (
                        <Typography variant='body2' color='text.secondary'>
                          ${userModel.purchasePrice.toFixed(2)}
                        </Typography>
                      )}
                      {userModel.purchaseDate && (
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          display='block'
                        >
                          Purchased{' '}
                          {formatDistanceToNow(
                            new Date(userModel.purchaseDate),
                            { addSuffix: true }
                          )}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default CollectionDetailPage;
