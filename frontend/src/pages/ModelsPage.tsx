import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import LibraryModelList from '../components/models/LibraryModelList';
import type { LibraryModel, Collection, PaginatedResponse } from '../types';
import { libraryModelService, type LibraryModelFilters } from '../services/libraryModelService';
import CollectionService from '../services/collectionService';
import { modelService } from '../services/modelService';

const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<LibraryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  
  // Filter state
  const [filters, setFilters] = useState<LibraryModelFilters>({});
  
  // Add to collection dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<LibraryModel | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [addingToCollection, setAddingToCollection] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Load all user collections (use large limit to get all)
        const collectionsResponse = await CollectionService.getMyCollections(1, 100);
        setCollections(collectionsResponse.data);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load initial data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Function to reload collections
  const reloadCollections = useCallback(async () => {
    try {
      const collectionsResponse = await CollectionService.getMyCollections(1, 100);
      setCollections(collectionsResponse.data);
    } catch (err) {
      console.error('Error reloading collections:', err);
    }
  }, []);

  // Reload collections when window gains focus (user might have created a collection in another tab)
  useEffect(() => {
    const handleFocus = () => {
      reloadCollections();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [reloadCollections]);

  // Load models when filters change - loads ALL models by making multiple API calls
  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let allModels: LibraryModel[] = [];
      let currentPage = 1;
      const pageSize = 100; // Use maximum allowed by backend
      let hasMoreData = true;

      // Keep fetching until we get all models
      while (hasMoreData) {
        const response: PaginatedResponse<LibraryModel> = await libraryModelService.getModels(
          currentPage,
          pageSize,
          filters
        );
        
        allModels = [...allModels, ...response.data];
        
        // Check if we've loaded all models
        hasMoreData = response.data.length === pageSize && 
                      allModels.length < response.pagination.total;
        
        currentPage++;
      }
      
      setModels(allModels);
    } catch (err) {
      console.error('Error loading models:', err);
      setError('Failed to load models. Please try again.');
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: LibraryModelFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle add to collection
  const handleAddToCollection = useCallback((model: LibraryModel) => {
    setSelectedModel(model);
    setAddDialogOpen(true);
    setSelectedCollection(collections[0]?.id || '');
  }, [collections]);

  // Handle confirm add to collection
  const handleConfirmAddToCollection = async () => {
    if (!selectedModel || !selectedCollection) return;
    
    try {
      setAddingToCollection(true);
      
      // Use the proper method to add library model to collection
      await modelService.addLibraryModelToCollection(selectedModel, selectedCollection);
      
      console.log(`Added ${selectedModel.name} to collection successfully!`);
      
      // Close dialog and reset state
      setAddDialogOpen(false);
      setSelectedModel(null);
      setSelectedCollection('');
      
      // Refresh collections to show updated counts
      await reloadCollections();
      
    } catch (err) {
      console.error('Error adding model to collection:', err);
      // TODO: Show error notification to user
    } finally {
      setAddingToCollection(false);
    }
  };

  // Handle cancel add to collection
  const handleCancelAddToCollection = () => {
    setAddDialogOpen(false);
    setSelectedModel(null);
    setSelectedCollection('');
    // Refresh collections in case user created one in another tab
    reloadCollections();
  };

  // Extract unique game systems and factions from models
  const gameSystems = React.useMemo(() => {
    const uniqueSystems = new Map();
    models.forEach(model => {
      if (model.gameSystem) {
        uniqueSystems.set(model.gameSystem.id, model.gameSystem);
      }
    });
    return Array.from(uniqueSystems.values());
  }, [models]);

  const factions = React.useMemo(() => {
    const uniqueFactions = new Map();
    models.forEach(model => {
      if (model.faction) {
        uniqueFactions.set(model.faction.id, model.faction);
      }
    });
    return Array.from(uniqueFactions.values());
  }, [models]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <CategoryIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Model Library
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Model Library
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Browse and discover models to add to your collections
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Models List */}
      <LibraryModelList
        models={models}
        loading={loading}
        error={error}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onAddToCollection={handleAddToCollection}
        gameSystems={gameSystems}
        factions={factions}
        showAddButtons={collections.length > 0}
      />

      {/* Add to Collection Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCancelAddToCollection}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add "{selectedModel?.name}" to Collection
        </DialogTitle>
        <DialogContent>
          {(() => {
            // Debug logging
            console.log('Selected model:', selectedModel);
            console.log('Available collections:', collections);
            console.log('Model game system ID:', selectedModel?.gameSystem?.id);
            collections.forEach(c => console.log('Collection:', c.name, 'Game System ID:', c.gameSystemId));
            
            // Filter collections to only show those that match the model's game system
            const compatibleCollections = collections.filter(collection => 
              collection.gameSystemId === selectedModel?.gameSystem?.id
            );
            
            if (collections.length === 0) {
              return (
                <Alert severity="info" sx={{ mt: 1 }}>
                  You need to create a collection first before adding models.
                  <Button
                    component={RouterLink}
                    to="/collections"
                    sx={{ ml: 1 }}
                  >
                    Go to Collections
                  </Button>
                </Alert>
              );
            }
            
            if (compatibleCollections.length === 0) {
              return (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  You don't have any collections for{' '}
                  <strong>{selectedModel?.gameSystem?.name || 'this game system'}</strong>.
                  Create a collection for this game system first.
                  <Button
                    component={RouterLink}
                    to="/collections"
                    sx={{ ml: 1 }}
                  >
                    Create Collection
                  </Button>
                </Alert>
              );
            }
            
            return (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Choose which <strong>{selectedModel?.gameSystem?.name}</strong> collection to add this model to:
                </Typography>
                
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {compatibleCollections.map((collection) => (
                    <Button
                      key={collection.id}
                      variant={selectedCollection === collection.id ? "contained" : "outlined"}
                      onClick={() => setSelectedCollection(collection.id)}
                      sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                    >
                      <Box>
                        <Typography variant="subtitle2">
                          {collection.name}
                        </Typography>
                        {collection.description && (
                          <Typography variant="caption" color="text.secondary">
                            {collection.description}
                          </Typography>
                        )}
                      </Box>
                    </Button>
                  ))}
                </Stack>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAddToCollection}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAddToCollection}
            variant="contained"
            disabled={
              !selectedCollection || 
              addingToCollection || 
              collections.length === 0 ||
              collections.filter(c => c.gameSystemId === selectedModel?.gameSystem?.id).length === 0
            }
            startIcon={addingToCollection ? undefined : <AddIcon />}
          >
            {addingToCollection ? 'Adding...' : 'Add to Collection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ModelsPage;
