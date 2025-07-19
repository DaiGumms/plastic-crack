import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import DragDropUpload, { type UploadFile } from './DragDropUpload';

export interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  uploadType: 'avatar' | 'collection-thumbnail' | 'model-image';
  collectionId?: string;
  modelId?: string;
  title?: string;
  description?: string;
  onUploadComplete?: (results: UploadFile[]) => void;
  onUploadError?: (error: string) => void;
}

const getDefaultTitle = (uploadType: string): string => {
  switch (uploadType) {
    case 'avatar':
      return 'Upload Profile Avatar';
    case 'collection-thumbnail':
      return 'Upload Collection Thumbnail';
    case 'model-image':
      return 'Upload Model Photos';
    default:
      return 'Upload Images';
  }
};

const getDefaultDescription = (uploadType: string): string => {
  switch (uploadType) {
    case 'avatar':
      return 'Upload a profile picture. Only one image can be selected.';
    case 'collection-thumbnail':
      return 'Upload a thumbnail image for your collection.';
    case 'model-image':
      return 'Upload photos of your painted models. You can select multiple images to upload at once.';
    default:
      return 'Select images to upload.';
  }
};

export const UploadDialog: React.FC<UploadDialogProps> = ({
  open,
  onClose,
  uploadType,
  collectionId,
  modelId,
  title,
  description,
  onUploadComplete,
  onUploadError,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  // Configuration based on upload type
  const isMultiple = uploadType !== 'avatar';
  const maxFiles = uploadType === 'avatar' ? 1 : 20;
  const showDescriptions = uploadType === 'model-image';

  const handleClose = () => {
    if (!isUploading) {
      onClose();
      // Clear files when dialog closes
      setUploadFiles([]);
    }
  };

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleUploadComplete = (results: UploadFile[]) => {
    setIsUploading(false);
    onUploadComplete?.(results);

    // Auto-close dialog after successful upload
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleUploadError = (error: string) => {
    setIsUploading(false);
    onUploadError?.(error);
  };

  const handleFilesChange = (files: UploadFile[]) => {
    setUploadFiles(files);
  };

  const hasFiles = uploadFiles.length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant='h6'>
            {title || getDefaultTitle(uploadType)}
          </Typography>
          <IconButton onClick={handleClose} disabled={isUploading} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>
        {(description || getDefaultDescription(uploadType)) && (
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            {description || getDefaultDescription(uploadType)}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <DragDropUpload
          uploadType={uploadType}
          collectionId={collectionId}
          modelId={modelId}
          multiple={isMultiple}
          maxFiles={maxFiles}
          showPreviews={true}
          showDescriptions={showDescriptions}
          disabled={isUploading}
          height={hasFiles ? 150 : 250}
          variant='dropzone'
          onUploadStart={handleUploadStart}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          onFilesChange={handleFilesChange}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isUploading} variant='outlined'>
          Cancel
        </Button>

        {/* Additional info about file limits */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant='caption' color='text.secondary'>
            {uploadType === 'avatar'
              ? 'Max 1 file • JPEG, PNG, WebP • 10MB max'
              : `Max ${maxFiles} files • JPEG, PNG, WebP • 10MB each`}
          </Typography>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDialog;
