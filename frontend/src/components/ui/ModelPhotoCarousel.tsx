import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';

interface ModelPhoto {
  id: string;
  fileName: string;
  originalUrl: string;
  thumbnailUrl?: string;
  description?: string;
  isPrimary: boolean;
}

interface ModelPhotoCarouselProps {
  photos: ModelPhoto[];
  height?: number;
  showNavigation?: boolean;
  showFullscreenButton?: boolean;
}

export const ModelPhotoCarousel: React.FC<ModelPhotoCarouselProps> = ({
  photos,
  height = 200,
  showNavigation = true,
  showFullscreenButton = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.100',
          border: '2px dashed',
          borderColor: 'grey.300',
          borderRadius: 1,
        }}
      >
        <Typography variant='body2' color='text.secondary'>
          No photos uploaded
        </Typography>
      </Box>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handlePhotoClick = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenOpen(true);
  };

  const handleFullscreenPrevious = () => {
    setFullscreenIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleFullscreenNext = () => {
    setFullscreenIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const currentPhoto = photos[currentIndex];
  const fullscreenPhoto = photos[fullscreenIndex];

  return (
    <>
      <Card sx={{ position: 'relative', height }}>
        <CardMedia
          component='img'
          height={height}
          image={currentPhoto.thumbnailUrl || currentPhoto.originalUrl}
          alt={currentPhoto.description || `Model photo ${currentIndex + 1}`}
          sx={{
            objectFit: 'cover',
            cursor: 'pointer',
          }}
          onClick={() => handlePhotoClick(currentIndex)}
        />

        {/* Primary photo indicator */}
        {currentPhoto.isPrimary && (
          <Chip
            label='Primary'
            size='small'
            color='primary'
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
            }}
          />
        )}

        {/* Photo counter */}
        {photos.length > 1 && (
          <Chip
            label={`${currentIndex + 1} / ${photos.length}`}
            size='small'
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
            }}
          />
        )}

        {/* Fullscreen button */}
        {showFullscreenButton && (
          <IconButton
            size='small'
            onClick={() => handlePhotoClick(currentIndex)}
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              },
            }}
          >
            <FullscreenIcon fontSize='small' />
          </IconButton>
        )}

        {/* Navigation arrows */}
        {showNavigation && photos.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevious}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Card>

      {/* Fullscreen dialog */}
      <Dialog
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 'none',
            maxHeight: '100vh',
            margin: 0,
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: '80vh',
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={() => setFullscreenOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Photo counter */}
          {photos.length > 1 && (
            <Chip
              label={`${fullscreenIndex + 1} / ${photos.length}`}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
              }}
            />
          )}

          {/* Main photo */}
          <Box
            component='img'
            src={fullscreenPhoto.originalUrl}
            alt={
              fullscreenPhoto.description ||
              `Model photo ${fullscreenIndex + 1}`
            }
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />

          {/* Navigation arrows for fullscreen */}
          {photos.length > 1 && (
            <>
              <IconButton
                onClick={handleFullscreenPrevious}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                onClick={handleFullscreenNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}
        </DialogContent>

        {/* Photo description */}
        {fullscreenPhoto.description && (
          <DialogActions
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant='body2'
              color='white'
              sx={{ textAlign: 'center' }}
            >
              {fullscreenPhoto.description}
            </Typography>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default ModelPhotoCarousel;
