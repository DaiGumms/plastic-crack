import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Chip,
  IconButton,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageInput } from '../ui/ImageInput';
import type {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
} from '../../types';
import {
  GAME_SYSTEMS,
  getGameSystemIcon,
  getGameSystemDbId,
  DB_TO_FRONTEND_GAME_SYSTEM_MAP,
} from '../../utils/gameSystems';

const collectionSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  gameSystem: z.string().min(1, 'Game system is required'),
  isPublic: z.boolean(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

interface CollectionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateCollectionData | UpdateCollectionData
  ) => Promise<void>;
  collection?: Collection;
  loading?: boolean;
  error?: string | null;
}

export const CollectionForm: React.FC<CollectionFormProps> = ({
  open,
  onClose,
  onSubmit,
  collection,
  loading = false,
  error = null,
}) => {
  const isEditing = Boolean(collection);
  const [tags, setTags] = useState<string[]>(collection?.tags || []);
  const [newTag, setNewTag] = useState('');

  // Convert database game system to frontend ID for editing
  const getDefaultGameSystem = useCallback(() => {
    if (!collection?.gameSystem?.shortName) return '';
    return (
      DB_TO_FRONTEND_GAME_SYSTEM_MAP[collection.gameSystem.shortName] || ''
    );
  }, [collection?.gameSystem?.shortName]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: '',
      description: '',
      gameSystem: '',
      isPublic: true,
      imageUrl: '',
    },
    mode: 'onChange',
  });

  // Update form values when collection changes
  useEffect(() => {
    reset({
      name: collection?.name || '',
      description: collection?.description || '',
      gameSystem: getDefaultGameSystem(),
      isPublic: collection?.isPublic ?? true,
      imageUrl: collection?.imageUrl || '',
    });

    setTags(collection?.tags || []);
  }, [collection, reset, getDefaultGameSystem]);

  const handleClose = () => {
    reset();
    setTags(collection?.tags || []);
    setNewTag('');
    onClose();
  };

  const handleFormSubmit = async (data: CollectionFormData) => {
    try {
      // Destructure to remove gameSystem field
      const { gameSystem, ...restData } = data;
      let submitData: CreateCollectionData | UpdateCollectionData;

      if (isEditing && collection) {
        // For editing, keep the existing gameSystemId
        submitData = {
          ...restData,
          gameSystemId: collection.gameSystemId,
          tags,
          // Remove empty strings
          description: restData.description?.trim() || undefined,
          imageUrl: restData.imageUrl?.trim() || undefined,
        };
      } else {
        // For creating, convert frontend gameSystem ID to database gameSystemId
        const gameSystemId = await getGameSystemDbId(gameSystem);
        submitData = {
          ...restData,
          gameSystemId,
          tags,
          // Remove empty strings
          description: restData.description?.trim() || undefined,
          imageUrl: restData.imageUrl?.trim() || undefined,
        };
      }

      await onSubmit(submitData);
      handleClose();
    } catch (err) {
      // Error is handled by parent component
      console.error('Form submission error:', err);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 20) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' },
      }}
    >
      <DialogTitle>
        {isEditing ? 'Edit Collection' : 'Create New Collection'}
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Name */}
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Collection Name'
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={loading}
                />
              )}
            />

            {/* Game System */}
            {isEditing && collection?.gameSystem ? (
              // Read-only display for editing
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant='body2' color='text.secondary'>
                  Game System
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'grey.50',
                  }}
                >
                  {getGameSystemIcon(getDefaultGameSystem(), {
                    fontSize: 'small',
                  })}
                  <Typography variant='body1'>
                    {collection.gameSystem.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    (Cannot be changed)
                  </Typography>
                </Box>
              </Box>
            ) : (
              // Editable select for creation
              <Controller
                name='gameSystem'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.gameSystem}>
                    <InputLabel>Game System</InputLabel>
                    <Select {...field} label='Game System' disabled={loading}>
                      {GAME_SYSTEMS.map(system => (
                        <MenuItem key={system.id} value={system.id}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            {getGameSystemIcon(system.id, {
                              fontSize: 'small',
                            })}
                            {system.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.gameSystem && (
                      <Typography
                        variant='caption'
                        color='error'
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {errors.gameSystem.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            )}

            {/* Description */}
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Description'
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={
                    errors.description?.message ||
                    'Optional description for your collection'
                  }
                  disabled={loading}
                />
              )}
            />

            {/* Cover Image */}
            <Controller
              name='imageUrl'
              control={control}
              render={({ field }) => {
                // Determine if we're editing (collection exists) vs creating new (no collection)
                const isEditingMode = !!collection;

                // For editing existing collections, show upload functionality if collection has an ID
                // For new collections, only show URL input until collection is saved
                const canUpload = isEditingMode && collection?.id;

                return canUpload ? (
                  // Editing existing collection - show full upload functionality
                  <ImageInput
                    value={field.value}
                    onChange={field.onChange}
                    label='Cover Image'
                    placeholder='Enter image URL or upload an image'
                    uploadType='collection-thumbnail'
                    collectionId={collection.id}
                    error={!!errors.imageUrl}
                    helperText={
                      errors.imageUrl?.message ||
                      'Add a cover image via URL or upload'
                    }
                    disabled={loading}
                  />
                ) : (
                  // Creating new collection - URL input only (upload available after saving)
                  <Box>
                    <TextField
                      {...field}
                      label='Cover Image URL'
                      placeholder='Enter image URL'
                      fullWidth
                      error={!!errors.imageUrl}
                      helperText={
                        errors.imageUrl?.message ||
                        'Enter a URL for the cover image (you can upload after creating the collection)'
                      }
                      disabled={loading}
                    />
                  </Box>
                );
              }}
            />

            {/* Tags */}
            <Box>
              <Typography variant='subtitle2' gutterBottom>
                Tags
              </Typography>

              {/* Tag Input */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size='small'
                  placeholder='Add a tag'
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  disabled={loading || tags.length >= 20}
                  sx={{ flexGrow: 1 }}
                />
                <IconButton
                  onClick={handleAddTag}
                  disabled={
                    !newTag.trim() ||
                    tags.includes(newTag.trim()) ||
                    tags.length >= 20 ||
                    loading
                  }
                  color='primary'
                >
                  <AddIcon />
                </IconButton>
              </Box>

              {/* Tag Display */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    deleteIcon={<CloseIcon />}
                    size='small'
                    disabled={loading}
                  />
                ))}
              </Box>

              <Typography variant='caption' color='text.secondary'>
                {tags.length}/20 tags
              </Typography>
            </Box>

            {/* Public/Private Toggle */}
            <Controller
              name='isPublic'
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={loading}
                    />
                  }
                  label={
                    <Box>
                      <Typography component='span'>
                        {field.value
                          ? 'Public Collection'
                          : 'Private Collection'}
                      </Typography>
                      <Typography
                        variant='caption'
                        display='block'
                        color='text.secondary'
                      >
                        {field.value
                          ? 'Anyone can view this collection'
                          : 'Only you can view this collection'}
                      </Typography>
                    </Box>
                  }
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={!isValid || loading}
          >
            {loading
              ? 'Saving...'
              : isEditing
                ? 'Update Collection'
                : 'Create Collection'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CollectionForm;
