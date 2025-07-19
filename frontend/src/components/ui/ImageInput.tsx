import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  IconButton,
  InputAdornment,
  Stack,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { UploadDialog } from './UploadDialog';
import type { UploadFile } from './DragDropUpload';

export interface ImageInputProps {
  value?: string;
  onChange: (url: string) => void;
  uploadType: 'avatar' | 'collection-thumbnail' | 'model-image';
  collectionId?: string;
  modelId?: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  showPreview?: boolean;
  fullWidth?: boolean;
}

const getDefaultLabel = (uploadType: string): string => {
  switch (uploadType) {
    case 'avatar':
      return 'Profile Avatar';
    case 'collection-thumbnail':
      return 'Collection Thumbnail';
    case 'model-image':
      return 'Model Image';
    default:
      return 'Image';
  }
};

export const ImageInput: React.FC<ImageInputProps> = ({
  value = '',
  onChange,
  uploadType,
  collectionId,
  modelId,
  label,
  placeholder = 'Enter image URL or upload a file',
  helperText,
  error = false,
  disabled = false,
  showPreview = true,
  fullWidth = true,
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleClearImage = () => {
    onChange('');
  };

  const handleUploadComplete = (results: UploadFile[]) => {
    if (results.length > 0 && results[0].result?.url) {
      onChange(results[0].result.url);
    }
    setUploadDialogOpen(false);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // Could show a toast notification here
  };

  const displayLabel = label || getDefaultLabel(uploadType);
  const isAvatar = uploadType === 'avatar';

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {displayLabel}
      </Typography>

      <Stack spacing={2}>
        {/* Preview */}
        {showPreview && value && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAvatar ? (
              <Avatar
                src={value}
                sx={{ width: 80, height: 80 }}
                alt="Preview"
              >
                <ImageIcon />
              </Avatar>
            ) : (
              <Box
                component="img"
                src={value}
                alt="Preview"
                sx={{
                  width: 120,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
                onError={(e) => {
                  // Hide broken images
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <IconButton
              onClick={handleClearImage}
              disabled={disabled}
              color="error"
              size="small"
            >
              <ClearIcon />
            </IconButton>
          </Box>
        )}

        {/* URL Input */}
        <TextField
          value={value}
          onChange={handleUrlChange}
          placeholder={placeholder}
          fullWidth={fullWidth}
          error={error}
          helperText={helperText}
          disabled={disabled}
          InputProps={{
            endAdornment: value ? (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearImage}
                  disabled={disabled}
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />

        {/* Divider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Divider sx={{ flexGrow: 1 }} />
          <Typography variant="caption" color="text.secondary">
            OR
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>

        {/* Upload Button */}
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
          disabled={disabled}
          fullWidth={fullWidth}
        >
          {uploadType === 'avatar' 
            ? 'Upload Avatar' 
            : uploadType === 'collection-thumbnail'
            ? 'Upload Thumbnail'
            : 'Upload Photos'
          }
        </Button>
      </Stack>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        uploadType={uploadType}
        collectionId={collectionId}
        modelId={modelId}
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
      />
    </Box>
  );
};

export default ImageInput;
