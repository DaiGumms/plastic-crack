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
import LibraryModelGrid from '../components/models/LibraryModelGrid';
import type { LibraryModel, Collection, PaginatedResponse } from '../types';
import { libraryModelService, type LibraryModelFilters } from '../services/libraryModelService';
import { gameSystemService, type GameSystem, type Faction } from '../services/gameSystemService';

// Mock service for now - will be replaced with real API
const mockCollectionService = {
  getUserCollections: async (): Promise<Collection[]> => {
    return [
      {
        id: '1',
        name: 'My Warhammer 40K Collection',
        description: 'Space Marines and more',
        isPublic: false,
        userId: 'user1',
        gameSystemId: 'wh40k',
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2', 
        name: 'Age of Sigmar Collection',
        description: 'Stormcast Eternals',
        isPublic: true,
        userId: 'user1',
        gameSystemId: 'aos',
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];
  },
};

const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<LibraryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameSystems, setGameSystems] = useState<GameSystem[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  
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
        const [gameSystemsData, collectionsData] = await Promise.all([
          gameSystemService.getGameSystems(),
          mockCollectionService.getUserCollections(),
        ]);
        
        setGameSystems(gameSystemsData.data);
        setCollections(collectionsData);
        
        // Extract unique factions from game systems
        const allFactions: Faction[] = [];
        gameSystemsData.data.forEach((gs: GameSystem) => {
          // This would normally come from the API
          // For now, mock some factions
          if (gs.id === 'wh40k') {
            allFactions.push(
              { id: 'sm', name: 'Space Marines', gameSystemId: gs.id, createdAt: '', updatedAt: '', description: '' },
              { id: 'csm', name: 'Chaos Space Marines', gameSystemId: gs.id, createdAt: '', updatedAt: '', description: '' },
              { id: 'necrons', name: 'Necrons', gameSystemId: gs.id, createdAt: '', updatedAt: '', description: '' },
            );
          } else if (gs.id === 'aos') {
            allFactions.push(
              { id: 'sce', name: 'Stormcast Eternals', gameSystemId: gs.id, createdAt: '', updatedAt: '', description: '' },
              { id: 'chaos', name: 'Chaos', gameSystemId: gs.id, createdAt: '', updatedAt: '', description: '' },
            );
          }
        });
        setFactions(allFactions);
        
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load initial data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load models when filters or page changes
  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedResponse<LibraryModel> = await libraryModelService.getModels(
        currentPage,
        pageSize,
        filters
      );
      
      setModels(response.data);
      setTotalCount(response.pagination.total);
    } catch (err) {
      console.error('Error loading models:', err);
      setError('Failed to load models. Please try again.');
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: LibraryModelFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle add to collection
  const handleAddToCollection = useCallback((model: LibraryModel) => {
    setSelectedModel(model);
    setAddDialogOpen(true);
    setSelectedCollection(collections[0]?.id || '');
  }, [collections]);

  // Handle view details
  const handleViewDetails = useCallback((model: LibraryModel) => {
    // TODO: Navigate to model detail page
    console.log('View details for model:', model.name);
  }, []);

  // Handle confirm add to collection
  const handleConfirmAddToCollection = async () => {
    if (!selectedModel || !selectedCollection) return;
    
    try {
      setAddingToCollection(true);
      
      // TODO: Call API to add model to collection
      // await userModelService.createUserModel({
      //   libraryModelId: selectedModel.id,
      //   collectionId: selectedCollection,
      //   paintingStatus: 'UNPAINTED',
      //   isPublic: false,
      // });
      
      console.log(`Added ${selectedModel.name} to collection ${selectedCollection}`);
      
      // Show success message
      // You might want to use a notification system here
      
      setAddDialogOpen(false);
      setSelectedModel(null);
      setSelectedCollection('');
    } catch (err) {
      console.error('Error adding model to collection:', err);
      // Handle error
    } finally {
      setAddingToCollection(false);
    }
  };

  // Handle cancel add to collection
  const handleCancelAddToCollection = () => {
    setAddDialogOpen(false);
    setSelectedModel(null);
    setSelectedCollection('');
  };

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

      {/* Models Grid */}
      <LibraryModelGrid
        models={models}
        loading={loading}
        error={error}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onAddToCollection={handleAddToCollection}
        onViewDetails={handleViewDetails}
        gameSystems={gameSystems as any}
        factions={factions as any}
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
          {collections.length === 0 ? (
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
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Choose which collection to add this model to:
              </Typography>
              
              <Stack spacing={1} sx={{ mt: 2 }}>
                {collections.map((collection) => (
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAddToCollection}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAddToCollection}
            variant="contained"
            disabled={!selectedCollection || addingToCollection || collections.length === 0}
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
