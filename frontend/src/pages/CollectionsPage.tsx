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
import type { Collection, CreateCollectionData, UpdateCollectionData, CollectionFilter } from '../types';
import { useAuth } from '../hooks/useAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export const CollectionsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CollectionFilter>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  
  const limit = 12;

  // Determine which collections to fetch based on active tab
  const getCollectionsQuery = () => {
    const baseFilters = { ...filters, search: searchQuery || undefined };
    
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
    refetch
  } = useQuery({
    queryKey: ['collections', activeTab, page, searchQuery, filters],
    queryFn: getCollectionsQuery,
    placeholderData: { data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: CollectionService.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setFormOpen(false);
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
    },
  });

  // Event handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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

  const handleFormSubmit = async (data: CreateCollectionData | UpdateCollectionData) => {
    if (editingCollection) {
      await updateMutation.mutateAsync({ id: editingCollection.id, data: data as UpdateCollectionData });
    } else {
      await createMutation.mutateAsync(data as CreateCollectionData);
    }
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setFormOpen(true);
  };

  const handleDeleteCollection = async (collection: Collection) => {
    if (window.confirm(`Are you sure you want to delete "${collection.name}"?`)) {
      await deleteMutation.mutateAsync(collection.id);
    }
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

  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof CollectionFilter] !== undefined && 
    filters[key as keyof CollectionFilter] !== ''
  ).length;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Collections
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            color="primary"
          >
            {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
          </IconButton>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            New Collection
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSearchClear}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
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
                size="small"
              />
            )}
            {filters.paintingStatus && (
              <Chip
                label={`Status: ${filters.paintingStatus}`}
                onDelete={() => handleFilterChange({ paintingStatus: undefined })}
                size="small"
              />
            )}
            {filters.tags && filters.tags.length > 0 && (
              filters.tags.map(tag => (
                <Chip
                  key={tag}
                  label={`Tag: ${tag}`}
                  onDelete={() => handleFilterChange({ 
                    tags: filters.tags?.filter(t => t !== tag) 
                  })}
                  size="small"
                />
              ))
            )}
            <Button size="small" onClick={handleClearFilters}>
              Clear All
            </Button>
          </Box>
        )}
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="My Collections" />
          <Tab label="Public Collections" />
        </Tabs>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </Alert>
      )}

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <CollectionGrid
          collections={collectionsData?.data || []}
          loading={isLoading}
          showOwner={false}
          onEdit={handleEditCollection}
          onDelete={handleDeleteCollection}
          currentUserId={user?.id}
          emptyMessage="You haven't created any collections yet"
          emptySubMessage="Create your first collection to organize your Warhammer models"
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <CollectionGrid
          collections={collectionsData?.data || []}
          loading={isLoading}
          showOwner={true}
          currentUserId={user?.id}
          emptyMessage="No public collections found"
          emptySubMessage="Try adjusting your search or filters"
        />
      </TabPanel>

      {/* Pagination */}
      {collectionsData && collectionsData.pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={collectionsData.pagination.totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            size="large"
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
          <Typography variant="subtitle2" gutterBottom>
            Filter Collections
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Game System</InputLabel>
            <Select
              value={filters.gameSystem || ''}
              onChange={(e) => handleFilterChange({ gameSystem: e.target.value || undefined })}
              label="Game System"
            >
              <MenuItem value="">All Systems</MenuItem>
              <MenuItem value="Warhammer 40K">Warhammer 40K</MenuItem>
              <MenuItem value="Age of Sigmar">Age of Sigmar</MenuItem>
              <MenuItem value="Kill Team">Kill Team</MenuItem>
              <MenuItem value="Necromunda">Necromunda</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Painting Status</InputLabel>
            <Select
              value={filters.paintingStatus || ''}
              onChange={(e) => handleFilterChange({ paintingStatus: e.target.value || undefined })}
              label="Painting Status"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="unpainted">Unpainted</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button size="small" onClick={() => setFilterMenuAnchor(null)}>
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
        error={createMutation.error?.message || updateMutation.error?.message || null}
      />
    </Box>
  );
};

export default CollectionsPage;
