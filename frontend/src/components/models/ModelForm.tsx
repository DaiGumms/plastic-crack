import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { FieldValues } from 'react-hook-form';
import * as yup from 'yup';
import type { UserModel, CreateModelData } from '../../types';

// Validation schema
const modelSchema = yup.object({
  name: yup.string().required('Model name is required').min(1, 'Name must be at least 1 character'),
  description: yup.string().optional(),
  gameSystemId: yup.string().required('Game system is required'),
  factionId: yup.string().optional(),
  collectionId: yup.string().required('Collection is required'),
  paintingStatus: yup.string().oneOf(['UNPAINTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  pointsCost: yup.number().optional().min(0, 'Points cost must be positive'),
  notes: yup.string().optional(),
  purchasePrice: yup.number().optional().min(0, 'Purchase price must be positive'),
  purchaseDate: yup.string().optional(),
  isPublic: yup.boolean().optional(),
});

export interface ModelFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateModelData) => Promise<void>;
  model?: UserModel | null;
  loading?: boolean;
  error?: string | null;
  
  // Available options
  collections: Array<{ id: string; name: string; gameSystemId: string }>;
  gameSystems: Array<{ id: string; name: string; shortName: string }>;
  factions: Array<{ id: string; name: string; gameSystemId: string }>;
}

const ModelForm: React.FC<ModelFormProps> = ({
  open,
  onClose,
  onSubmit,
  model = null,
  loading = false,
  error = null,
  collections = [],
  gameSystems = [],
  factions = [],
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedGameSystemId, setSelectedGameSystemId] = useState('');

  const isEdit = Boolean(model);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(modelSchema),
    defaultValues: {
      name: '',
      description: '',
      gameSystemId: '',
      factionId: '',
      collectionId: '',
      paintingStatus: 'UNPAINTED',
      pointsCost: undefined,
      notes: '',
      purchasePrice: undefined,
      purchaseDate: undefined,
      isPublic: true,
    },
  });

  const watchedCollectionId = watch('collectionId');
  const watchedGameSystemId = watch('gameSystemId');

  // Filter factions based on selected game system
  const availableFactions = factions.filter(
    faction => faction.gameSystemId === selectedGameSystemId
  );

  // Filter collections based on selected game system
  const availableCollections = selectedGameSystemId 
    ? collections.filter(collection => collection.gameSystemId === selectedGameSystemId)
    : collections;

  // Reset form when model changes or dialog opens
  useEffect(() => {
    if (open) {
      if (model) {
        reset({
          name: model.name,
          description: model.description || '',
          gameSystemId: model.gameSystemId,
          factionId: model.factionId || '',
          collectionId: model.collectionId,
          paintingStatus: model.paintingStatus,
          pointsCost: model.pointsCost || undefined,
          notes: model.notes || '',
          purchasePrice: model.purchasePrice || undefined,
          purchaseDate: model.purchaseDate || undefined,
          isPublic: model.isPublic,
        });
        setTags(model.tags || []);
        setSelectedGameSystemId(model.gameSystemId);
      } else {
        reset({
          name: '',
          description: '',
          gameSystemId: '',
          factionId: '',
          collectionId: '',
          paintingStatus: 'UNPAINTED',
          pointsCost: undefined,
          notes: '',
          purchasePrice: undefined,
          purchaseDate: undefined,
          isPublic: true,
        });
        setTags([]);
        setSelectedGameSystemId('');
      }
    }
  }, [model, open, reset]);

  // Update selected game system when form value changes
  useEffect(() => {
    setSelectedGameSystemId(watchedGameSystemId);
    // Reset faction when game system changes
    if (watchedGameSystemId !== selectedGameSystemId) {
      setValue('factionId', '');
    }
  }, [watchedGameSystemId, selectedGameSystemId, setValue]);

  // Auto-select collection's game system when collection is selected
  useEffect(() => {
    if (watchedCollectionId && !isEdit) {
      const selectedCollection = collections.find(c => c.id === watchedCollectionId);
      if (selectedCollection && selectedCollection.gameSystemId !== watchedGameSystemId) {
        setValue('gameSystemId', selectedCollection.gameSystemId);
      }
    }
  }, [watchedCollectionId, collections, watchedGameSystemId, setValue, isEdit]);

  const handleFormSubmit = async (data: FieldValues) => {
    const modelData: CreateModelData = {
      name: data.name,
      description: data.description || undefined,
      paintingStatus: data.paintingStatus,
      gameSystemId: data.gameSystemId,
      collectionId: data.collectionId,
      factionId: data.factionId || undefined,
      pointsCost: data.pointsCost ? parseInt(data.pointsCost, 10) : undefined,
      purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : undefined,
      purchaseDate: data.purchaseDate || undefined,
      tags: tags,
      notes: data.notes || undefined,
      isPublic: data.isPublic,
    };
    
    await onSubmit(modelData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Model' : 'Add New Model'}
      </DialogTitle>
      
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Model Name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={loading}
                        required
                      />
                    )}
                  />

                  <Controller
                    name="paintingStatus"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.paintingStatus}>
                        <InputLabel>Painting Status</InputLabel>
                        <Select
                          {...field}
                          label="Painting Status"
                          disabled={loading}
                        >
                          <MenuItem value="UNPAINTED">Unpainted</MenuItem>
                          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                          <MenuItem value="COMPLETED">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Stack>

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Game System & Collection */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Game System & Collection
              </Typography>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="gameSystemId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.gameSystemId} required>
                        <InputLabel>Game System</InputLabel>
                        <Select
                          {...field}
                          label="Game System"
                          disabled={loading}
                        >
                          {gameSystems.map((gameSystem) => (
                            <MenuItem key={gameSystem.id} value={gameSystem.id}>
                              {gameSystem.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.gameSystemId && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                            {errors.gameSystemId.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />

                  <Controller
                    name="collectionId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.collectionId} required>
                        <InputLabel>Collection</InputLabel>
                        <Select
                          {...field}
                          label="Collection"
                          disabled={loading}
                        >
                          {availableCollections.map((collection) => (
                            <MenuItem key={collection.id} value={collection.id}>
                              {collection.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.collectionId && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                            {errors.collectionId.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Stack>

                {availableFactions.length > 0 && (
                  <Controller
                    name="factionId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.factionId}>
                        <InputLabel>Faction (Optional)</InputLabel>
                        <Select
                          {...field}
                          label="Faction (Optional)"
                          disabled={loading}
                        >
                          <MenuItem value="">None</MenuItem>
                          {availableFactions.map((faction) => (
                            <MenuItem key={faction.id} value={faction.id}>
                              {faction.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Game Details */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Game Details
              </Typography>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="pointsCost"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Points Cost"
                        type="number"
                        error={!!errors.pointsCost}
                        helperText={errors.pointsCost?.message}
                        disabled={loading}
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="purchasePrice"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Purchase Price"
                        type="number"
                        error={!!errors.purchasePrice}
                        helperText={errors.purchasePrice?.message}
                        disabled={loading}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: { min: 0, step: 0.01 }
                        }}
                      />
                    )}
                  />
                </Stack>

                <Controller
                  name="purchaseDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Purchase Date"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => {
                        field.onChange(date ? date.toISOString().split('T')[0] : '');
                      }}
                      disabled={loading}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.purchaseDate,
                          helperText: errors.purchaseDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Tags */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Add Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <Button onClick={handleAddTag} disabled={loading || !newTag.trim()}>
                        Add
                      </Button>
                    ),
                  }}
                />
                {tags.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        disabled={loading}
                        size="small"
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Notes */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Notes"
                    multiline
                    rows={4}
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                    disabled={loading}
                  />
                )}
              />
            </Box>

            <Divider />

            {/* Settings */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Settings
              </Typography>
              <Controller
                name="isPublic"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        {...field}
                        checked={field.value}
                        disabled={loading}
                      />
                    }
                    label="Make this model public"
                  />
                )}
              />
            </Box>
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {isEdit ? 'Update Model' : 'Create Model'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModelForm;
