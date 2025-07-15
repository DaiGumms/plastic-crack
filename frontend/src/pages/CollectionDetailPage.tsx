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
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { CollectionService } from '../services/collectionService';
import ModelService from '../services/modelService';
import { ModelGrid, ModelForm } from '../components/models';
import { formatDistanceToNow } from 'date-fns';
import type { Model, CreateModelData, UpdateModelData, ModelFilters, PaintingStatus } from '../types';
import { useAuth } from '../hooks/useAuth';

export const CollectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ModelFilters>({});
  const [modelFormOpen, setModelFormOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);

  const limit = 12;

  // Collection query
  const {
    data: collection,
    isLoading: collectionLoading,
    error: collectionError,
  } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => CollectionService.getCollection(id!),
    enabled: !!id,
  });

  // Models query
  const {
    data: modelsData,
    isLoading: modelsLoading,
    error: modelsError,
    refetch: refetchModels,
  } = useQuery({
    queryKey: ['models', 'collection', id, page, searchQuery, filters],
    queryFn: () =>
      ModelService.getModelsByCollection(
        id!,
        { ...filters, search: searchQuery || undefined },
        { page, limit, sortBy: 'createdAt', sortOrder: 'desc' }
      ),
    enabled: !!id,
    placeholderData: {
      data: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    },
  });

  const safeModelsData = modelsData?.data || [];
  const safePaginationData = modelsData?.pagination || {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  };

  const isOwner = user?.id === collection?.userId;

  // Mutations
  const createModelMutation = useMutation({
    mutationFn: ModelService.createModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
      refetchModels();
      setModelFormOpen(false);
    },
  });

  const updateModelMutation = useMutation({
    mutationFn: ({ modelId, data }: { modelId: string; data: UpdateModelData }) =>
      ModelService.updateModel(modelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
      setEditingModel(null);
      setModelFormOpen(false);
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: ModelService.deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
      setDeleteConfirmOpen(false);
      setModelToDelete(null);
    },
  });

  // Event handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetchModels();
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setPage(1);
  };

  const handleAddModel = () => {
    setEditingModel(null);
    setModelFormOpen(true);
  };

  const handleEditModel = (model: Model) => {
    setEditingModel(model);
    setModelFormOpen(true);
  };

  const handleDeleteModel = (model: Model) => {
    setModelToDelete(model);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (modelToDelete) {
      await deleteModelMutation.mutateAsync(modelToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setModelToDelete(null);
  };

  const handleModelFormSubmit = async (data: CreateModelData | UpdateModelData) => {
    if (editingModel) {
      await updateModelMutation.mutateAsync({
        modelId: editingModel.id,
        data: data as UpdateModelData,
      });
    } else {
      const createData: CreateModelData = {
        ...(data as CreateModelData),
        collectionId: id!,
        gameSystemId: collection?.gameSystemId || '',
      };
      await createModelMutation.mutateAsync(createData);
    }
  };

  const handleFilterChange = (newFilters: Partial<ModelFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
    setFilterMenuAnchor(null);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
    setFilterMenuAnchor(null);
  };

  const activeFilterCount = Object.keys(filters).filter(
    key =>
      filters[key as keyof ModelFilters] !== undefined &&
      filters[key as keyof ModelFilters] !== ''
  ).length;

  if (collectionLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant='rectangular' width={100} height={36} />
        </Box>
        <Card>
          <CardContent>
            <Skeleton variant='text' sx={{ fontSize: '2rem', mb: 2 }} />
            <Skeleton variant='text' sx={{ fontSize: '1rem', mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Skeleton variant='rectangular' width={80} height={24} />
              <Skeleton variant='rectangular' width={80} height={24} />
            </Box>
            <Skeleton variant='rectangular' height={200} />
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (collectionError || !collection) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/collections')}
          sx={{ mb: 3 }}
        >
          Back to Collections
        </Button>
        <Alert severity='error'>
          {collectionError instanceof Error 
            ? collectionError.message 
            : 'Failed to load collection. Please try again later.'}
        </Alert>
      </Container>
    );
  }

  const modelCount = safePaginationData.total;

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/collections')}
        sx={{ mb: 3 }}
      >
        Back to Collections
      </Button>

      {/* Collection Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant='h4' component='h1' sx={{ flexGrow: 1 }}>
              {collection.name}
            </Typography>
            <Chip
              icon={collection.isPublic ? <PublicIcon /> : <PrivateIcon />}
              label={collection.isPublic ? 'Public' : 'Private'}
              color={collection.isPublic ? 'success' : 'default'}
              variant='outlined'
            />
          </Box>

          {collection.description && (
            <Typography variant='body1' sx={{ mb: 3 }}>
              {collection.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {collection.gameSystem && (
              <Chip 
                label={collection.gameSystem.name} 
                color="primary" 
                variant="outlined" 
              />
            )}
            {collection.tags?.map(tag => (
              <Chip key={tag} label={tag} variant='outlined' size='small' />
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {collection.user?.displayName?.[0] ||
                collection.user?.username?.[0] ||
                '?'}
            </Avatar>
            <Box>
              <Typography variant='body2' color='text.secondary'>
                Created by{' '}
                {collection.user?.displayName ||
                  collection.user?.username ||
                  'Unknown'}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {formatDistanceToNow(new Date(collection.createdAt), {
                  addSuffix: true,
                })}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Models Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h5'>
          Models ({modelCount})
        </Typography>
        {isOwner && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleAddModel}
          >
            Add Model
          </Button>
        )}
      </Box>

      {/* Search and Filters */}
      {modelCount > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Box
                component='form'
                onSubmit={handleSearchSubmit}
                sx={{ flexGrow: 1 }}
              >
                <TextField
                  fullWidth
                  placeholder='Search models...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position='end'>
                        <IconButton size='small' onClick={handleSearchClear}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                variant='outlined'
                startIcon={<FilterIcon />}
                onClick={e => setFilterMenuAnchor(e.currentTarget)}
                color={activeFilterCount > 0 ? 'primary' : 'inherit'}
              >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </Box>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {filters.paintingStatus && (
                  <Chip
                    label={`Status: ${filters.paintingStatus}`}
                    onDelete={() => handleFilterChange({ paintingStatus: undefined })}
                    size='small'
                  />
                )}
                {filters.tags &&
                  filters.tags.length > 0 &&
                  filters.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={`Tag: ${tag}`}
                      onDelete={() =>
                        handleFilterChange({
                          tags: filters.tags?.filter(t => t !== tag),
                        })
                      }
                      size='small'
                    />
                  ))}
                <Button size='small' onClick={handleClearFilters}>
                  Clear All
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Models Grid */}
      {modelsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {modelsError instanceof Error ? modelsError.message : 'Failed to load models'}
        </Alert>
      )}

      <ModelGrid
        models={safeModelsData}
        loading={modelsLoading}
        onEdit={isOwner ? handleEditModel : undefined}
        onDelete={isOwner ? handleDeleteModel : undefined}
        onAddModel={isOwner ? handleAddModel : undefined}
        currentUserId={user?.id}
        showOwner={false}
        emptyMessage={modelCount === 0 ? "No models in this collection yet" : "No models match your filters"}
        emptySubMessage={modelCount === 0 ? "Add your first model to get started" : "Try adjusting your search or filters"}
        canAddModel={isOwner && modelCount === 0}
      />

      {/* Pagination */}
      {safePaginationData.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={safePaginationData.totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color='primary'
            size='large'
          />
        </Box>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 300 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant='subtitle2' gutterBottom>
            Filter Models
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Painting Status</InputLabel>
            <Select
              value={filters.paintingStatus || ''}
              onChange={e =>
                handleFilterChange({ paintingStatus: e.target.value as PaintingStatus || undefined })
              }
              label='Painting Status'
            >
              <MenuItem value=''>All Status</MenuItem>
              <MenuItem value='UNPAINTED'>Unpainted</MenuItem>
              <MenuItem value='PRIMED'>Primed</MenuItem>
              <MenuItem value='BASE_COATED'>Base Coated</MenuItem>
              <MenuItem value='IN_PROGRESS'>In Progress</MenuItem>
              <MenuItem value='COMPLETED'>Completed</MenuItem>
              <MenuItem value='SHOWCASE'>Showcase</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size='small' onClick={handleClearFilters}>
              Clear
            </Button>
            <Button size='small' onClick={() => setFilterMenuAnchor(null)}>
              Close
            </Button>
          </Box>
        </Box>
      </Menu>

      {/* Model Form */}
      <ModelForm
        open={modelFormOpen}
        onClose={() => {
          setModelFormOpen(false);
          setEditingModel(null);
        }}
        onSubmit={handleModelFormSubmit}
        model={editingModel || undefined}
        collectionId={id}
        gameSystemId={collection.gameSystemId}
        loading={createModelMutation.isPending || updateModelMutation.isPending}
        error={
          createModelMutation.error?.message || updateModelMutation.error?.message || null
        }
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>Delete Model</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            Are you sure you want to delete "{modelToDelete?.name}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color='primary'>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
            disabled={deleteModelMutation.isPending}
          >
            {deleteModelMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CollectionDetailPage;
