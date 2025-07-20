import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Pagination,
  Chip,
  Alert,
  Menu,
  MenuItem,
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
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CollectionGrid } from '../components/collections/CollectionGrid';
import { CollectionForm } from '../components/collections/CollectionForm';
import CollectionService from '../services/collectionService';
import type {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
  CollectionFilter,
} from '../types';
import { useAuth } from '../hooks/useAuth';
import {
  getPersistedViewMode,
  setPersistedViewMode,
  type ViewMode,
} from '../utils/viewMode';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role='tabpanel' hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export const CollectionsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState(user ? 0 : 1); // Non-authenticated users start on public collections
  const [viewMode, setViewMode] = useState<ViewMode>(getPersistedViewMode());
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CollectionFilter>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] =
    useState<Collection | null>(null);
  const [deletionInfo, setDeletionInfo] = useState<{
    collection: { id: string; name: string };
    modelCount: number;
  } | null>(null);
  const [loadingDeletionInfo, setLoadingDeletionInfo] = useState(false);

  const limit = 12;

  // Determine which collections to fetch based on active tab and authentication
  const getCollectionsQuery = () => {
    const baseFilters = { ...filters, search: searchQuery || undefined };

    // For non-authenticated users, always show public collections
    if (!user) {
      return CollectionService.getPublicCollections(page, limit, baseFilters);
    }

    switch (activeTab) {
      case 0: // My Collections
        return CollectionService.getMyCollections(page, limit, baseFilters);
      case 1: // Public Collections
        return CollectionService.getPublicCollections(page, limit, baseFilters);
      default:
        return CollectionService.getMyCollections(page, limit, baseFilters);
    }
  };

  // Queries
  const {
    data: collectionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['collections', activeTab, page, searchQuery, filters, !!user],
    queryFn: getCollectionsQuery,
    enabled: activeTab !== 0 || !!user, // Only run for My Collections if user is authenticated
    placeholderData: {
      data: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    },
  });

  // Ensure we always have valid data
  const safeCollectionsData = collectionsData?.data || [];
  const safePaginationData = collectionsData?.pagination || {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: CollectionService.createCollection,
    onSuccess: () => {
      // Invalidate all collections queries
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      // Refetch the current collections data
      refetch();
      setFormOpen(false);
    },
    onError: error => {
      console.error('❌ Failed to create collection:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionData }) =>
      CollectionService.updateCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setEditingCollection(null);
      setFormOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: CollectionService.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setDeleteConfirmOpen(false);
      setCollectionToDelete(null);
    },
    onError: error => {
      console.error('❌ Failed to delete collection:', error);
    },
  });

  // Event handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    // For non-authenticated users, adjust tab index since "My Collections" tab doesn't exist
    const adjustedValue = !user ? newValue + 1 : newValue;
    setActiveTab(adjustedValue);
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setPage(1);
  };

  const handleFormSubmit = async (
    data: CreateCollectionData | UpdateCollectionData
  ) => {
    if (editingCollection) {
      await updateMutation.mutateAsync({
        id: editingCollection.id,
        data: data as UpdateCollectionData,
      });
    } else {
      await createMutation.mutateAsync(data as CreateCollectionData);
    }
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setFormOpen(true);
  };

  const handleDeleteCollection = async (collection: Collection) => {
    setCollectionToDelete(collection);
    setLoadingDeletionInfo(true);

    try {
      const info = await CollectionService.getCollectionDeletionInfo(
        collection.id
      );
      setDeletionInfo(info);
      setDeleteConfirmOpen(true);
    } catch (error) {
      console.error('Failed to get deletion info:', error);
      // Fallback to basic deletion without model count
      setDeletionInfo({
        collection: { id: collection.id, name: collection.name },
        modelCount: 0,
      });
      setDeleteConfirmOpen(true);
    } finally {
      setLoadingDeletionInfo(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (collectionToDelete) {
      await deleteMutation.mutateAsync(collectionToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setCollectionToDelete(null);
    setDeletionInfo(null);
  };

  const handleFilterChange = (newFilters: Partial<CollectionFilter>) => {
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
      filters[key as keyof CollectionFilter] !== undefined &&
      filters[key as keyof CollectionFilter] !== ''
  ).length;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4' component='h1' fontWeight='bold'>
          Collections
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => {
              const newViewMode = viewMode === 'grid' ? 'list' : 'grid';
              setViewMode(newViewMode);
              setPersistedViewMode(newViewMode);
            }}
            color='primary'
          >
            {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
          </IconButton>

          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
            disabled={!user}
          >
            New Collection
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Box
            component='form'
            onSubmit={handleSearchSubmit}
            sx={{ flexGrow: 1 }}
          >
            <TextField
              fullWidth
              placeholder='Search collections...'
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
            {filters.gameSystem && (
              <Chip
                label={`Game: ${filters.gameSystem}`}
                onDelete={() => handleFilterChange({ gameSystem: undefined })}
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
      </Paper>

      {/* Registration Encouragement for Non-Authenticated Users */}
      {!user && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                size="small" 
                variant="outlined"
                href="/login"
              >
                Sign In
              </Button>
              <Button 
                color="inherit" 
                size="small" 
                variant="contained"
                href="/register"
              >
                Sign Up
              </Button>
            </Box>
          }
        >
          <Typography variant="body2">
            <strong>Discover amazing collections!</strong> Sign up to create your own collections, save favorites, and unlock access to model details within collections.
          </Typography>
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={!user ? activeTab - 1 : activeTab} onChange={handleTabChange}>
          {user && <Tab label='My Collections' />}
          <Tab label={user ? 'Public Collections' : 'Collections'} />
        </Tabs>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </Alert>
      )}

      {/* Tab Panels */}
      {user && (
        <TabPanel value={activeTab} index={0}>
          <CollectionGrid
            collections={safeCollectionsData}
            loading={isLoading}
            showOwner={false}
            onEdit={handleEditCollection}
            onDelete={handleDeleteCollection}
            currentUserId={user?.id}
            emptyMessage="You haven't created any collections yet"
            emptySubMessage='Create your first collection to organize your Warhammer models'
            viewMode={viewMode}
          />
        </TabPanel>
      )}

      <TabPanel value={activeTab} index={1}>
        <CollectionGrid
          collections={safeCollectionsData}
          loading={isLoading}
          showOwner={true}
          currentUserId={user?.id}
          emptyMessage='No public collections found'
          emptySubMessage='Try adjusting your search or filters'
          viewMode={viewMode}
        />
      </TabPanel>

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
            Filter Collections
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Game System</InputLabel>
            <Select
              value={filters.gameSystem || ''}
              onChange={e =>
                handleFilterChange({ gameSystem: e.target.value || undefined })
              }
              label='Game System'
            >
              <MenuItem value=''>All Systems</MenuItem>
              <MenuItem value='W40K'>Warhammer 40,000</MenuItem>
              <MenuItem value='AOS'>Age of Sigmar</MenuItem>
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

      {/* Collection Form */}
      <CollectionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCollection(null);
        }}
        onSubmit={handleFormSubmit}
        collection={editingCollection || undefined}
        loading={createMutation.isPending || updateMutation.isPending}
        error={
          createMutation.error?.message || updateMutation.error?.message || null
        }
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>Delete Collection</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            {loadingDeletionInfo ? (
              'Loading collection information...'
            ) : (
              <>
                Are you sure you want to delete "
                {deletionInfo?.collection.name || collectionToDelete?.name}"?
                {deletionInfo && deletionInfo.modelCount > 0 && (
                  <>
                    <br />
                    <br />
                    <strong>Warning:</strong> This collection contains{' '}
                    <strong>{deletionInfo.modelCount}</strong> model
                    {deletionInfo.modelCount !== 1 ? 's' : ''}. All models in
                    this collection will also be permanently deleted.
                  </>
                )}
                <br />
                <br />
                This action cannot be undone.
              </>
            )}
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
            disabled={deleteMutation.isPending || loadingDeletionInfo}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionsPage;
