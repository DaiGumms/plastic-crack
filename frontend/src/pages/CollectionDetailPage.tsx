import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Add as AddIcon,
  Groups as FactionIcon,
  LocalOffer as TagIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { CollectionService } from '../services/collectionService';
import { modelService } from '../services/modelService';
import { libraryModelService } from '../services/libraryModelService';
import { UploadDialog } from '../components/ui/UploadDialog';
import { ModelPhotoCarousel } from '../components/ui/ModelPhotoCarousel';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import type { UserModel, CreateModelData, LibraryModel } from '../types';
import type { UploadFile } from '../components/ui/DragDropUpload';

export const CollectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // State for dialogs and menus
  const [editingModel, setEditingModel] = useState<UserModel | null>(null);
  const [modelToDelete, setModelToDelete] = useState<UserModel | null>(null);
  const [photoUploadModel, setPhotoUploadModel] = useState<UserModel | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedModel, setSelectedModel] = useState<UserModel | null>(null);
  const [showAddModelDialog, setShowAddModelDialog] = useState(false);

  // State for Add Model dialog
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryModels, setLibraryModels] = useState<LibraryModel[]>([]);
  const [loadingLibraryModels, setLoadingLibraryModels] = useState(false);
  const [addingModel, setAddingModel] = useState<string | null>(null);
  const [expandedFactions, setExpandedFactions] = useState<Set<string>>(
    new Set()
  );
  const [addModelError, setAddModelError] = useState<string | null>(null);

  const {
    data: collection,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['collection', id, isAuthenticated],
    queryFn: () => {
      if (!id) throw new Error('Collection ID is required');

      // Use appropriate endpoint based on authentication
      if (isAuthenticated) {
        return CollectionService.getCollection(id);
      } else {
        return CollectionService.getPublicCollection(id);
      }
    },
    enabled: !!id,
  });

  // Mutations for model operations
  const updateModelMutation = useMutation({
    mutationFn: ({
      modelId,
      data,
    }: {
      modelId: string;
      data: Partial<CreateModelData>;
    }) => modelService.updateModel(modelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
      setEditingModel(null);
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: (modelId: string) => modelService.deleteModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
      setModelToDelete(null);
    },
  });

  const addLibraryModelMutation = useMutation({
    mutationFn: (libraryModel: LibraryModel) =>
      modelService.addLibraryModelToCollection(libraryModel, id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
      setShowAddModelDialog(false);
      setSearchTerm('');
      setLibraryModels([]);
      setAddingModel(null);
      setAddModelError(null);
    },
    onError: (error: Error) => {
      console.error('Failed to add model to collection:', error);
      setAddingModel(null);

      // Handle specific error messages
      if (error.message.includes('already exists in this collection')) {
        setAddModelError('This model is already in your collection.');
      } else {
        setAddModelError('Failed to add model. Please try again.');
      }
    },
  });

  // Event handlers
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    model: UserModel
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedModel(model);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedModel(null);
  };

  const handleAddModel = () => {
    setShowAddModelDialog(true);
  };

  const handleEditModel = () => {
    if (selectedModel) {
      setEditingModel(selectedModel);
      handleMenuClose();
    }
  };

  const handleDeleteModel = () => {
    if (selectedModel) {
      setModelToDelete(selectedModel);
      handleMenuClose();
    }
  };

  const handlePhotoUpload = () => {
    if (selectedModel) {
      setPhotoUploadModel(selectedModel);
      handleMenuClose();
    }
  };

  const handleModelUpdate = async (data: Partial<CreateModelData>) => {
    if (editingModel) {
      await updateModelMutation.mutateAsync({ modelId: editingModel.id, data });
    }
  };

  const handleModelDelete = () => {
    if (modelToDelete) {
      deleteModelMutation.mutate(modelToDelete.id);
    }
  };

  // Search library models when dialog opens or search term changes
  const searchLibraryModels = useCallback(async () => {
    if (!collection) return;

    setLoadingLibraryModels(true);
    try {
      const response = await libraryModelService.getModels(1, 10, {
        search: searchTerm,
        gameSystemId: collection.gameSystemId,
      });
      setLibraryModels(response.data);
    } catch (error) {
      console.error('Failed to search library models:', error);
      setLibraryModels([]);
    } finally {
      setLoadingLibraryModels(false);
    }
  }, [collection, searchTerm]);

  useEffect(() => {
    if (showAddModelDialog) {
      searchLibraryModels();
      // Auto-expand all factions when dialog opens
      setExpandedFactions(new Set());
    }
  }, [showAddModelDialog, searchLibraryModels]);

  // Group library models by faction
  const groupedLibraryModels = React.useMemo(() => {
    const grouped: {
      [factionId: string]: {
        faction: { id: string; name: string };
        models: LibraryModel[];
      };
    } = {};

    libraryModels.forEach(model => {
      if (!model.faction) return;

      const factionId = model.faction.id;
      if (!grouped[factionId]) {
        grouped[factionId] = {
          faction: model.faction,
          models: [],
        };
      }
      grouped[factionId].models.push(model);
    });

    return grouped;
  }, [libraryModels]);

  // Auto-expand factions when search results change
  useEffect(() => {
    const factionIds = Object.keys(groupedLibraryModels);
    setExpandedFactions(new Set(factionIds));
  }, [groupedLibraryModels]);

  const handleAddLibraryModel = (libraryModel: LibraryModel) => {
    setAddingModel(libraryModel.id);
    addLibraryModelMutation.mutate(libraryModel);
  };

  const handleFactionToggle = (factionId: string) => {
    setExpandedFactions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(factionId)) {
        newSet.delete(factionId);
      } else {
        newSet.add(factionId);
      }
      return newSet;
    });
  };

  const handlePhotoUploadComplete = async (results: UploadFile[]) => {
    const successfulUploads = results.filter(
      file => file.status === 'success' && file.result?.url
    );

    if (successfulUploads.length > 0 && photoUploadModel) {
      // Refresh the collection data to show new photos
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
      setPhotoUploadModel(null);
    }
  };

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

      {/* Registration Encouragement for Non-Authenticated Users */}
      {!isAuthenticated && (
        <Alert
          severity='info'
          sx={{ mb: 3 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color='inherit'
                size='small'
                variant='outlined'
                href='/login'
              >
                Sign In
              </Button>
              <Button
                color='inherit'
                size='small'
                variant='contained'
                href='/register'
              >
                Sign Up
              </Button>
            </Box>
          }
        >
          <Typography variant='body2'>
            <strong>Join to unlock the full experience!</strong> Sign up to view
            detailed model information, create your own collections, and connect
            with other collectors.
          </Typography>
        </Alert>
      )}

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

          {/* Factions */}
          {collection.factions && collection.factions.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant='subtitle2'
                color='text.secondary'
                sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <FactionIcon sx={{ fontSize: '1rem' }} />
                Factions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {collection.factions.map(faction => (
                  <Chip
                    key={faction.id}
                    icon={<FactionIcon sx={{ fontSize: '0.8rem' }} />}
                    label={faction.name}
                    variant='outlined'
                    size='small'
                    color='secondary'
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Tags */}
          {collection.tags && collection.tags.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant='subtitle2'
                color='text.secondary'
                sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <TagIcon sx={{ fontSize: '1rem' }} />
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {collection.tags.map(tag => (
                  <Chip
                    key={tag}
                    icon={<TagIcon sx={{ fontSize: '0.8rem' }} />}
                    label={tag}
                    variant='outlined'
                    size='small'
                  />
                ))}
              </Box>
            </Box>
          )}

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

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant='h6'>Models ({modelCount})</Typography>
            {isAuthenticated &&
              user &&
              collection &&
              user.id === collection.userId && (
                <Button
                  variant='outlined'
                  startIcon={<AddIcon />}
                  onClick={handleAddModel}
                  size='small'
                >
                  Add Model
                </Button>
              )}
          </Box>

          {modelCount === 0 ? (
            <Box>
              <Alert severity='info' sx={{ mb: 2 }}>
                No models in this collection yet.
                {isAuthenticated &&
                  user &&
                  collection &&
                  user.id === collection.userId && (
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      Start building your collection by adding some models!
                    </Typography>
                  )}
              </Alert>
              {isAuthenticated &&
                user &&
                collection &&
                user.id === collection.userId && (
                  <Button
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={handleAddModel}
                    sx={{ mb: 2 }}
                  >
                    Add Your First Model
                  </Button>
                )}
            </Box>
          ) : !isAuthenticated ? (
            <Alert severity='info' sx={{ mt: 2 }}>
              <Typography variant='body2'>
                <strong>
                  This collection contains {modelCount} model
                  {modelCount !== 1 ? 's' : ''}.
                </strong>
              </Typography>
              <Typography variant='body2' sx={{ mt: 1 }}>
                Sign up to view detailed model information, photos, and
                collector notes!
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button variant='outlined' size='small' href='/login'>
                  Sign In
                </Button>
                <Button variant='contained' size='small' href='/register'>
                  Sign Up
                </Button>
              </Box>
            </Alert>
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
                      gap: 3,
                      flexDirection: { xs: 'column', md: 'row' },
                    }}
                  >
                    {/* Photo Carousel */}
                    <Box
                      sx={{
                        minWidth: { xs: '100%', md: 280 },
                        maxWidth: { xs: '100%', md: 280 },
                      }}
                    >
                      <ModelPhotoCarousel
                        photos={userModel.photos || []}
                        height={200}
                        showNavigation={true}
                        showFullscreenButton={true}
                      />
                    </Box>

                    {/* Model Details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
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

                    {/* Status and Actions */}
                    <Box
                      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                    >
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
                      {/* Only show actions menu for authenticated collection owners */}
                      {isAuthenticated &&
                        user &&
                        collection &&
                        user.id === collection.userId && (
                          <IconButton
                            aria-label='more actions'
                            onClick={event => handleMenuOpen(event, userModel)}
                            size='small'
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEditModel}>
          <EditIcon sx={{ mr: 1 }} fontSize='small' />
          Edit Model
        </MenuItem>
        <MenuItem onClick={handlePhotoUpload}>
          <PhotoCameraIcon sx={{ mr: 1 }} fontSize='small' />
          Manage Photos
        </MenuItem>
        <MenuItem onClick={handleDeleteModel} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize='small' />
          Delete Model
        </MenuItem>
      </Menu>

      {/* Edit Model Dialog */}
      <Dialog
        open={Boolean(editingModel)}
        onClose={() => setEditingModel(null)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Edit Model</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='Custom Name'
              defaultValue={editingModel?.customName || ''}
              fullWidth
              id='customName'
            />
            <TextField
              label='Notes'
              defaultValue={editingModel?.notes || ''}
              multiline
              rows={3}
              fullWidth
              id='notes'
            />
            <FormControl fullWidth>
              <InputLabel>Painting Status</InputLabel>
              <Select
                defaultValue={editingModel?.paintingStatus || 'UNPAINTED'}
                label='Painting Status'
                id='paintingStatus'
              >
                <MenuItem value='UNPAINTED'>Unpainted</MenuItem>
                <MenuItem value='IN_PROGRESS'>In Progress</MenuItem>
                <MenuItem value='COMPLETED'>Completed</MenuItem>
                <MenuItem value='SHOWCASE'>Showcase</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label='Purchase Price'
              type='number'
              defaultValue={editingModel?.purchasePrice || ''}
              fullWidth
              id='purchasePrice'
              InputProps={{
                startAdornment: <span>$</span>,
              }}
            />
            <TextField
              label='Points Cost'
              type='number'
              defaultValue={editingModel?.customPointsCost || ''}
              fullWidth
              id='pointsCost'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingModel(null)}>Cancel</Button>
          <Button
            onClick={() => {
              const form = document.getElementById(
                'customName'
              ) as HTMLInputElement;
              const notes = document.getElementById(
                'notes'
              ) as HTMLInputElement;
              const status = document.getElementById(
                'paintingStatus'
              ) as HTMLInputElement;
              const price = document.getElementById(
                'purchasePrice'
              ) as HTMLInputElement;
              const points = document.getElementById(
                'pointsCost'
              ) as HTMLInputElement;

              const data = {
                customName: form.value,
                notes: notes.value,
                paintingStatus: status.value as
                  | 'UNPAINTED'
                  | 'IN_PROGRESS'
                  | 'COMPLETED'
                  | 'SHOWCASE',
                purchasePrice: price.value ? Number(price.value) : undefined,
                customPointsCost: points.value
                  ? Number(points.value)
                  : undefined,
              };

              handleModelUpdate(data);
            }}
            variant='contained'
            disabled={updateModelMutation.isPending}
          >
            {updateModelMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Model Confirmation Dialog */}
      <Dialog
        open={Boolean(modelToDelete)}
        onClose={() => setModelToDelete(null)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Delete Model</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "
            {modelToDelete?.customName || modelToDelete?.model?.name}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModelToDelete(null)}>Cancel</Button>
          <Button
            onClick={handleModelDelete}
            color='error'
            variant='contained'
            disabled={deleteModelMutation.isPending}
          >
            {deleteModelMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Model Dialog */}
      <Dialog
        open={showAddModelDialog}
        onClose={() => setShowAddModelDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Add Model from Library</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label='Search models'
            variant='outlined'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            placeholder='Search by model name...'
          />

          {loadingLibraryModels ? (
            <Box display='flex' justifyContent='center' p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {Object.keys(groupedLibraryModels).length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color='text.secondary'>
                    {searchTerm.trim()
                      ? 'No models found'
                      : 'Start typing to search models'}
                  </Typography>
                  {searchTerm.trim() && (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mt: 1 }}
                    >
                      Try adjusting your search terms
                    </Typography>
                  )}
                </Box>
              ) : (
                Object.entries(groupedLibraryModels).map(
                  ([factionId, factionData]) => (
                    <Accordion
                      key={factionId}
                      expanded={expandedFactions.has(factionId)}
                      onChange={() => handleFactionToggle(factionId)}
                      sx={{
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:before': { display: 'none' },
                        '&.Mui-expanded': { margin: 'auto' },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          backgroundColor: 'action.hover',
                          '& .MuiAccordionSummary-content': {
                            alignItems: 'center',
                          },
                        }}
                      >
                        <Typography
                          variant='subtitle1'
                          sx={{ fontWeight: 'medium', color: 'primary.main' }}
                        >
                          {factionData.faction.name}
                        </Typography>
                        <Chip
                          size='small'
                          label={factionData.models.length}
                          variant='outlined'
                          sx={{ ml: 1 }}
                        />
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <List dense>
                          {factionData.models.map(model => (
                            <ListItem
                              key={model.id}
                              sx={{
                                pl: 3,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                mb: 1,
                                mx: 1,
                                display: 'flex',
                                alignItems: 'flex-start',
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                },
                              }}
                            >
                              <ListItemText
                                primary={model.name}
                                secondary={`Points: ${model.pointsCost || 'Unknown'} • ${model.description || 'No description'}`}
                                sx={{ flex: 1 }}
                              />
                              <Button
                                variant='contained'
                                size='small'
                                onClick={() => handleAddLibraryModel(model)}
                                disabled={
                                  addingModel === model.id ||
                                  addLibraryModelMutation.isPending
                                }
                                sx={{ ml: 2 }}
                              >
                                {addingModel === model.id ? 'Adding...' : 'Add'}
                              </Button>
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  )
                )
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddModelDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Photo Upload Dialog */}
      {photoUploadModel && (
        <UploadDialog
          open={true}
          onClose={() => setPhotoUploadModel(null)}
          uploadType='model-image'
          collectionId={id}
          modelId={photoUploadModel.id}
          onUploadComplete={handlePhotoUploadComplete}
          onUploadError={error => {
            console.error('Photo upload error:', error);
          }}
        />
      )}
    </Container>
  );
};

export default CollectionDetailPage;
