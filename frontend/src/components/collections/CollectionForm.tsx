import React, { useState } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
} from '../../types';

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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: collection?.name || '',
      description: collection?.description || '',
      isPublic: collection?.isPublic ?? true,
      imageUrl: collection?.imageUrl || '',
    },
    mode: 'onChange',
  });

  const handleClose = () => {
    reset();
    setTags(collection?.tags || []);
    setNewTag('');
    onClose();
  };

  const handleFormSubmit = async (data: CollectionFormData) => {
    try {
      const submitData = {
        ...data,
        tags,
        // Remove empty strings
        description: data.description?.trim() || undefined,
        imageUrl: data.imageUrl?.trim() || undefined,
      };
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

            {/* Image URL */}
            <Controller
              name='imageUrl'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Cover Image URL'
                  fullWidth
                  error={!!errors.imageUrl}
                  helperText={
                    errors.imageUrl?.message ||
                    'Optional URL for collection cover image'
                  }
                  disabled={loading}
                />
              )}
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
