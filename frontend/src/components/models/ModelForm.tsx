import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  InputAdornment,
  Alert,
  Autocomplete,
  Box,
} from '@mui/material';
import type { Model, CreateModelData, UpdateModelData, PaintingStatus } from '../../types';

interface ModelFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateModelData | UpdateModelData) => Promise<void>;
  model?: Model;
  collectionId?: string;
  gameSystemId?: string;
  loading?: boolean;
  error?: string | null;
}

const paintingStatusOptions: { value: PaintingStatus; label: string }[] = [
  { value: 'UNPAINTED', label: 'Unpainted' },
  { value: 'PRIMED', label: 'Primed' },
  { value: 'BASE_COATED', label: 'Base Coated' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'SHOWCASE', label: 'Showcase' },
];

const commonTags = [
  'Infantry', 'Vehicle', 'Monster', 'Character', 'HQ', 'Troops', 'Elite',
  'Fast Attack', 'Heavy Support', 'Flyer', 'Transport', 'Walker',
  'Dreadnought', 'Tank', 'Bike', 'Jump Pack', 'Terminator',
];

export const ModelForm: React.FC<ModelFormProps> = ({
  open,
  onClose,
  onSubmit,
  model,
  collectionId,
  gameSystemId,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    paintingStatus: 'UNPAINTED' as PaintingStatus,
    pointsCost: '',
    notes: '',
    tags: [] as string[],
    purchasePrice: '',
    purchaseDate: '',
    isPublic: true,
  });

  const isEditing = !!model;

  useEffect(() => {
    if (model) {
      setFormData({
        name: model.name || '',
        description: model.description || '',
        paintingStatus: model.paintingStatus || 'UNPAINTED',
        pointsCost: model.pointsCost ? model.pointsCost.toString() : '',
        notes: model.notes || '',
        tags: model.tags || [],
        purchasePrice: model.purchasePrice ? model.purchasePrice.toString() : '',
        purchaseDate: model.purchaseDate ? model.purchaseDate.split('T')[0] : '',
        isPublic: model.isPublic ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        paintingStatus: 'UNPAINTED',
        pointsCost: '',
        notes: '',
        tags: [],
        purchasePrice: '',
        purchaseDate: '',
        isPublic: true,
      });
    }
  }, [model, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: CreateModelData | UpdateModelData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      paintingStatus: formData.paintingStatus,
      pointsCost: formData.pointsCost ? parseInt(formData.pointsCost, 10) : undefined,
      notes: formData.notes.trim() || undefined,
      tags: formData.tags,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      purchaseDate: formData.purchaseDate ? formData.purchaseDate : undefined,
      isPublic: formData.isPublic,
    };

    if (!isEditing) {
      (submitData as CreateModelData).collectionId = collectionId!;
      (submitData as CreateModelData).gameSystemId = gameSystemId!;
    }

    await onSubmit(submitData);
  };

  const handleTagsChange = (_event: React.SyntheticEvent, newValue: string[]) => {
    setFormData(prev => ({ ...prev, tags: newValue }));
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      <DialogTitle>
        {isEditing ? 'Edit Model' : 'Add New Model'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Model Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  disabled={loading}
                />

                <FormControl fullWidth>
                  <InputLabel>Painting Status</InputLabel>
                  <Select
                    value={formData.paintingStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, paintingStatus: e.target.value as PaintingStatus }))}
                    label="Painting Status"
                    disabled={loading}
                  >
                    {paintingStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleInputChange('description')}
                multiline
                rows={3}
                disabled={loading}
                sx={{ mb: 2 }}
              />
            </Box>

            {/* Game Details */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Game Details
              </Typography>
              
              <TextField
                fullWidth
                label="Points Cost"
                value={formData.pointsCost}
                onChange={handleInputChange('pointsCost')}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">pts</InputAdornment>,
                }}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <Autocomplete
                multiple
                freeSolo
                options={commonTags}
                value={formData.tags}
                onChange={handleTagsChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags..."
                    disabled={loading}
                  />
                )}
                disabled={loading}
              />
            </Box>

            {/* Purchase Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Purchase Information
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Purchase Price"
                  value={formData.purchasePrice}
                  onChange={handleInputChange('purchasePrice')}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  onChange={handleInputChange('purchaseDate')}
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={loading}
                />
              </Box>
            </Box>

            {/* Notes */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Additional Notes
              </Typography>
              
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={handleInputChange('notes')}
                multiline
                rows={4}
                placeholder="Add any additional notes about this model..."
                disabled={loading}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Model' : 'Add Model'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};