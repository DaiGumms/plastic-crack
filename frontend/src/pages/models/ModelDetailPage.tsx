import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ImageList,
  ImageListItem,
  Fab,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PhotoCamera as PhotoCameraIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import ModelService from '../../services/modelService';
import { ModelForm, ModelImageGallery } from '../../components/models';
import type { UpdateModelData, PaintingStatus, ModelPhotoData } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const paintingStatusColors: Record<PaintingStatus, string> = {
  UNPAINTED: '#9e9e9e',
  PRIMED: '#795548',
  BASE_COATED: '#ff9800',
  IN_PROGRESS: '#2196f3',
  COMPLETED: '#4caf50',
  SHOWCASE: '#9c27b0',
};

const paintingStatusLabels: Record<PaintingStatus, string> = {
  UNPAINTED: 'Unpainted',
  PRIMED: 'Primed',
  BASE_COATED: 'Base Coated',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  SHOWCASE: 'Showcase',
};

export const ModelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [editFormOpen, setEditFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);

  const {
    data: model,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['model', id],
    queryFn: () => ModelService.getModel(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateModelData) => ModelService.updateModel(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model', id] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setEditFormOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => ModelService.deleteModel(id!),
    onSuccess: () => {
      navigate(`/collections/${model?.collectionId}`);
    },
  });

  const addPhotosMutation = useMutation({
    mutationFn: (photos: ModelPhotoData[]) => ModelService.addModelPhotos(id!, photos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model', id] });
      setImageGalleryOpen(false);
    },
  });

  const isOwner = user?.id === model?.userId;
  const primaryPhoto = model?.photos?.find(photo => photo.isPrimary) || model?.photos?.[0];
  const galleryPhotos = model?.photos?.filter(photo => !photo.isPrimary) || [];

  const handleEdit = () => {
    setEditFormOpen(true);
    setMenuAnchor(null);
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
    setMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync();
  };

  const handleFormSubmit = async (data: UpdateModelData) => {
    await updateMutation.mutateAsync(data);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: model?.name,
        text: `Check out this ${model?.name} model`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
    setMenuAnchor(null);
  };

  const handleAddPhotos = () => {
    setImageGalleryOpen(true);
    setMenuAnchor(null);
  };

  const handleUploadPhotos = async (photos: ModelPhotoData[]) => {
    await addPhotosMutation.mutateAsync(photos);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" width={100} height={36} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 2 }}>
            <Skeleton variant="rectangular" height={400} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Skeleton variant="rectangular" width={80} height={24} />
                  <Skeleton variant="rectangular" width={80} height={24} />
                </Box>
                <Skeleton variant="rectangular" height={200} />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    );
  }

  if (error || !model) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back
        </Button>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Model not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/collections/${model.collectionId}`)}
        >
          Back to Collection
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {isOwner && (
            <>
              <IconButton
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem onClick={handleEdit}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit Model
                </MenuItem>
                <MenuItem onClick={handleAddPhotos}>
                  <PhotoCameraIcon fontSize="small" sx={{ mr: 1 }} />
                  Manage Photos
                </MenuItem>
                <MenuItem onClick={handleShare}>
                  <ShareIcon fontSize="small" sx={{ mr: 1 }} />
                  Share
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete Model
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Image Gallery */}
        <Box sx={{ flex: 2 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {primaryPhoto ? (
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={primaryPhoto.originalUrl}
                    alt={model.name}
                    sx={{
                      width: '100%',
                      height: 400,
                      objectFit: 'cover',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleImageClick(primaryPhoto.originalUrl)}
                  />
                  
                  {/* Painting Status Overlay */}
                  <Chip
                    label={paintingStatusLabels[model.paintingStatus]}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      bgcolor: paintingStatusColors[model.paintingStatus],
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />

                  {/* Privacy Status */}
                  <Tooltip title={model.isPublic ? 'Public Model' : 'Private Model'}>
                    <Chip
                      icon={model.isPublic ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      label={model.isPublic ? 'Public' : 'Private'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: model.isPublic ? 'success.main' : 'warning.main',
                        color: 'white',
                      }}
                    />
                  </Tooltip>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    color: 'text.secondary',
                    flexDirection: 'column',
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 64, mb: 2 }} />
                  <Typography>No photos yet</Typography>
                </Box>
              )}

              {/* Gallery Thumbnails */}
              {galleryPhotos.length > 0 && (
                <Box sx={{ p: 2 }}>
                  <ImageList cols={4} gap={8}>
                    {galleryPhotos.map((photo) => (
                      <ImageListItem
                        key={photo.id}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleImageClick(photo.originalUrl)}
                      >
                        <img
                          src={photo.thumbnailUrl || photo.originalUrl}
                          alt={photo.description || model.name}
                          loading="lazy"
                          style={{
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Add Photo Button */}
          {isOwner && (
            <Fab
              color="primary"
              size="medium"
              sx={{ position: 'fixed', bottom: 24, right: 24 }}
              onClick={handleAddPhotos}
            >
              <AddIcon />
            </Fab>
          )}
        </Box>

        {/* Model Details */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {model.name}
              </Typography>

              {model.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {model.description}
                </Typography>
              )}

              {/* Game System & Faction */}
              <Box sx={{ mb: 3 }}>
                {model.gameSystem && (
                  <Chip
                    label={model.gameSystem.name}
                    color="primary"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                {model.faction && (
                  <Chip
                    label={model.faction.name}
                    color="secondary"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                {model.pointsCost && (
                  <Chip
                    label={`${model.pointsCost} pts`}
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
              </Box>

              {/* Tags */}
              {model.tags && model.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {model.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Purchase Information */}
              {(model.purchasePrice || model.purchaseDate) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Purchase Information
                  </Typography>
                  {model.purchasePrice && (
                    <Typography variant="body2" color="text.secondary">
                      Price: ${model.purchasePrice}
                    </Typography>
                  )}
                  {model.purchaseDate && (
                    <Typography variant="body2" color="text.secondary">
                      Date: {new Date(model.purchaseDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Notes */}
              {model.notes && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {model.notes}
                  </Typography>
                </Box>
              )}

              {/* Owner Info */}
              {model.user && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                    {model.user.displayName?.[0] || model.user.username?.[0] || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">
                      {model.user.displayName || model.user.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Added {formatDistanceToNow(new Date(model.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Image Viewer Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt={model.name}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedImage(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Form */}
      <ModelForm
        open={editFormOpen}
        onClose={() => setEditFormOpen(false)}
        onSubmit={handleFormSubmit}
        model={model}
        loading={updateMutation.isPending}
        error={updateMutation.error?.message || null}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Model</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{model.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Gallery */}
      <ModelImageGallery
        open={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
        photos={model.photos || []}
        onUpload={handleUploadPhotos}
        loading={addPhotosMutation.isPending}
        error={addPhotosMutation.error?.message || null}
      />
    </Container>
  );
};