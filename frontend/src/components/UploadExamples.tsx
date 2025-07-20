import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  Collections as CollectionsIcon,
  Camera as CameraIcon,
} from '@mui/icons-material';
import { UploadDialog } from './ui/UploadDialog';
import { ImageInput } from './ui/ImageInput';
import type { UploadFile } from './ui/DragDropUpload';

/**
 * Example component demonstrating how to use the upload functionality
 * This shows integration examples for all three upload types:
 * - Profile avatars (single upload)
 * - Collection thumbnails (single upload)
 * - Model images (batch upload)
 */
export const UploadExamples: React.FC = () => {
  // State for dialog visibility
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);

  // State for uploaded images
  const [avatarUrl, setAvatarUrl] = useState('');
  const [collectionThumbnailUrl, setCollectionThumbnailUrl] = useState('');
  const [modelImages, setModelImages] = useState<string[]>([]);

  // State for upload feedback
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadComplete = (results: UploadFile[], type: string) => {
    const urls = results
      .filter(file => file.status === 'success' && file.result?.url)
      .map(file => file.result!.url);

    if (urls.length > 0) {
      switch (type) {
        case 'avatar':
          setAvatarUrl(urls[0]);
          break;
        case 'collection':
          setCollectionThumbnailUrl(urls[0]);
          break;
        case 'model':
          setModelImages(prev => [...prev, ...urls]);
          break;
      }
      setUploadSuccess(`Successfully uploaded ${urls.length} image(s)`);
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setTimeout(() => setUploadError(null), 5000);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant='h4' gutterBottom>
        Upload Component Examples
      </Typography>
      <Typography variant='body1' color='text.secondary' paragraph>
        This page demonstrates the drag-and-drop upload functionality for
        different use cases.
      </Typography>

      {/* Upload Feedback */}
      {uploadSuccess && (
        <Alert
          severity='success'
          sx={{ mb: 2 }}
          onClose={() => setUploadSuccess(null)}
        >
          {uploadSuccess}
        </Alert>
      )}
      {uploadError && (
        <Alert
          severity='error'
          sx={{ mb: 2 }}
          onClose={() => setUploadError(null)}
        >
          {uploadError}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Avatar Upload Example */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <PersonIcon color='primary' />
              <Typography variant='h6'>Profile Avatar Upload</Typography>
            </Box>
            <Typography variant='body2' color='text.secondary' paragraph>
              Single image upload for user profile avatars. Only one image can
              be selected.
            </Typography>

            {/* Option 1: Using UploadDialog */}
            <Button
              variant='outlined'
              startIcon={<UploadIcon />}
              onClick={() => setAvatarDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              Upload Avatar (Dialog)
            </Button>

            {/* Option 2: Using ImageInput */}
            <Divider sx={{ my: 2 }}>
              <Typography variant='caption'>OR</Typography>
            </Divider>

            <ImageInput
              value={avatarUrl}
              onChange={setAvatarUrl}
              uploadType='avatar'
              label='Profile Avatar'
              placeholder='Enter avatar URL or upload a file'
              showPreview={true}
            />

            {avatarUrl && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mt: 1 }}
              >
                Current avatar URL: {avatarUrl}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Collection Thumbnail Upload Example */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <CollectionsIcon color='primary' />
              <Typography variant='h6'>Collection Thumbnail Upload</Typography>
            </Box>
            <Typography variant='body2' color='text.secondary' paragraph>
              Upload a thumbnail image for collections. Typically used in
              collection forms.
            </Typography>

            <Button
              variant='outlined'
              startIcon={<UploadIcon />}
              onClick={() => setCollectionDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              Upload Collection Thumbnail
            </Button>

            <ImageInput
              value={collectionThumbnailUrl}
              onChange={setCollectionThumbnailUrl}
              uploadType='collection-thumbnail'
              label='Collection Thumbnail'
              placeholder='Enter thumbnail URL or upload a file'
              showPreview={true}
            />

            {collectionThumbnailUrl && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mt: 1 }}
              >
                Current thumbnail URL: {collectionThumbnailUrl}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Model Images Upload Example */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <CameraIcon color='primary' />
              <Typography variant='h6'>Model Photos Upload</Typography>
            </Box>
            <Typography variant='body2' color='text.secondary' paragraph>
              Batch upload multiple photos of painted models. Users can upload
              up to 20 images at once and add descriptions to each photo.
            </Typography>

            <Button
              variant='outlined'
              startIcon={<UploadIcon />}
              onClick={() => setModelDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              Upload Model Photos (Batch)
            </Button>

            {modelImages.length > 0 && (
              <Box>
                <Typography variant='subtitle2' gutterBottom>
                  Uploaded Model Images ({modelImages.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {modelImages.map((url, index) => (
                    <Box
                      key={index}
                      component='img'
                      src={url}
                      alt={`Model ${index + 1}`}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Upload Dialogs */}
      <UploadDialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        uploadType='avatar'
        onUploadComplete={results => handleUploadComplete(results, 'avatar')}
        onUploadError={handleUploadError}
      />

      <UploadDialog
        open={collectionDialogOpen}
        onClose={() => setCollectionDialogOpen(false)}
        uploadType='collection-thumbnail'
        collectionId='123e4567-e89b-12d3-a456-426614174000' // Valid UUID for testing
        onUploadComplete={results =>
          handleUploadComplete(results, 'collection')
        }
        onUploadError={handleUploadError}
      />

      <UploadDialog
        open={modelDialogOpen}
        onClose={() => setModelDialogOpen(false)}
        uploadType='model-image'
        collectionId='123e4567-e89b-12d3-a456-426614174000' // Valid UUID for testing
        modelId='456e7890-e89b-12d3-a456-426614174001' // Valid UUID for testing
        onUploadComplete={results => handleUploadComplete(results, 'model')}
        onUploadError={handleUploadError}
      />
    </Box>
  );
};

export default UploadExamples;
