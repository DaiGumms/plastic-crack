import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Alert,
  TextField,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import type { ModelPhoto, ModelPhotoData } from '../../types';

interface ModelImageGalleryProps {
  open: boolean;
  onClose: () => void;
  modelId: string;
  photos: ModelPhoto[];
  onUpload: (photos: ModelPhotoData[]) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const ModelImageGallery: React.FC<ModelImageGalleryProps> = ({
  open,
  onClose,
  modelId,
  photos,
  onUpload,
  loading = false,
  error = null,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadDescriptions, setUploadDescriptions] = useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<number>(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setUploadDescriptions(new Array(files.length).fill(''));
    setPrimaryIndex(0);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const newDescriptions = [...uploadDescriptions];
    newDescriptions[index] = description;
    setUploadDescriptions(newDescriptions);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    // For demo purposes, we'll create mock URLs
    // In a real implementation, you'd upload to a server or cloud storage
    const photoData: ModelPhotoData[] = selectedFiles.map((file, index) => ({
      fileName: file.name,
      originalUrl: URL.createObjectURL(file), // This would be the server URL
      thumbnailUrl: URL.createObjectURL(file), // This would be the thumbnail URL
      description: uploadDescriptions[index] || undefined,
      isPrimary: index === primaryIndex,
      sortOrder: index,
      fileSize: file.size,
      width: undefined, // Would be set after image processing
      height: undefined, // Would be set after image processing
      mimeType: file.type,
    }));

    try {
      await onUpload(photoData);
      setSelectedFiles([]);
      setUploadDescriptions([]);
      setPrimaryIndex(0);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newDescriptions = uploadDescriptions.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setUploadDescriptions(newDescriptions);
    if (primaryIndex >= newFiles.length) {
      setPrimaryIndex(Math.max(0, newFiles.length - 1));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoCameraIcon />
          Model Photos
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Upload Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Upload New Photos
          </Typography>
          
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              bgcolor: 'grey.50',
              mb: 2,
            }}
          >
            <input
              accept="image/*"
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="photo-upload"
            />
            <label htmlFor="photo-upload">
              <Box sx={{ cursor: 'pointer' }}>
                <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="body1" color="primary">
                  Click to select photos or drag and drop
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports JPG, PNG, WebP (max 10MB each)
                </Typography>
              </Box>
            </label>
          </Box>

          {/* Preview Selected Files */}
          {selectedFiles.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Photos ({selectedFiles.length})
              </Typography>
              <Grid container spacing={2}>
                {selectedFiles.map((file, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="150"
                          image={URL.createObjectURL(file)}
                          alt={file.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                          }}
                          size="small"
                          onClick={() => removeFile(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                          }}
                          size="small"
                          onClick={() => setPrimaryIndex(index)}
                        >
                          {primaryIndex === index ? (
                            <StarIcon color="primary" />
                          ) : (
                            <StarBorderIcon />
                          )}
                        </IconButton>
                        {primaryIndex === index && (
                          <Chip
                            label="Primary"
                            size="small"
                            color="primary"
                            sx={{
                              position: 'absolute',
                              bottom: 4,
                              left: 4,
                            }}
                          />
                        )}
                      </Box>
                      <CardActions sx={{ flexDirection: 'column', p: 1 }}>
                        <TextField
                          size="small"
                          placeholder="Photo description (optional)"
                          value={uploadDescriptions[index] || ''}
                          onChange={(e) => handleDescriptionChange(index, e.target.value)}
                          fullWidth
                        />
                        <Typography variant="caption" color="text.secondary">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </Typography>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        {/* Existing Photos */}
        {photos.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Current Photos ({photos.length})
            </Typography>
            <Grid container spacing={2}>
              {photos.map((photo) => (
                <Grid item xs={12} sm={6} md={4} key={photo.id}>
                  <Card>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="150"
                        image={photo.thumbnailUrl || photo.originalUrl}
                        alt={photo.description || 'Model photo'}
                        sx={{ objectFit: 'cover' }}
                      />
                      {photo.isPrimary && (
                        <Chip
                          label="Primary"
                          size="small"
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                          }}
                        />
                      )}
                    </Box>
                    {photo.description && (
                      <CardActions>
                        <Typography variant="body2" color="text.secondary">
                          {photo.description}
                        </Typography>
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {photos.length === 0 && selectedFiles.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PhotoCameraIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No photos yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload your first photo to get started
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {selectedFiles.length > 0 && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
            startIcon={<UploadIcon />}
          >
            {loading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};