import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  InputAdornment,
  Alert,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
    purchaseDate: null as Date | null,
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
        purchaseDate: model.purchaseDate ? new Date(model.purchaseDate) : null,
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
        purchaseDate: null,
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
      purchaseDate: formData.purchaseDate ? formData.purchaseDate.toISOString() : undefined,
      isPublic: formData.isPublic,
    };

    if (!isEditing) {
      (submitData as CreateModelData).collectionId = collectionId!;
      (submitData as CreateModelData).gameSystemId = gameSystemId!;
    }

    await onSubmit(submitData);
  };

  const handleTagsChange = (event: React.SyntheticEvent, newValue: string[]) => {
    setFormData(prev => ({ ...prev, tags: newValue }));
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSelectChange = (field: string) => (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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

            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Model Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Painting Status</InputLabel>
                  <Select
                    value={formData.paintingStatus}
                    onChange={handleSelectChange('paintingStatus')}
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
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  multiline
                  rows={3}
                  disabled={loading}
                />
              </Grid>

              {/* Game Details */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Game Details
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
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
                />
              </Grid>

              <Grid item xs={12}>
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
              </Grid>

              {/* Purchase Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Purchase Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
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
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  onChange={(newValue) => 
                    setFormData(prev => ({ ...prev, purchaseDate: newValue }))
                  }
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Additional Notes
                </Typography>
              </Grid>

              <Grid item xs={12}>
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
              </Grid>
            </Grid>
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
    </LocalizationProvider>
  );
};