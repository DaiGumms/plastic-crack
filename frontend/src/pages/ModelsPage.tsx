import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { ModelGrid, ModelForm } from '../components/models';
import { useAuth } from '../hooks/useAuth';
import { modelService, type ModelListParams } from '../services/modelService';
import CollectionService from '../services/collectionService';
// import gameSystemService from '../services/gameSystemService';
import type { UserModel, CreateModelData, Collection } from '../types';
// import type { GameSystem, Faction } from '../services/gameSystemService';

const ModelsPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [models, setModels] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<UserModel | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<UserModel | null>(null);
  
  // Success message
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [paintingStatusFilter, setPaintingStatusFilter] = useState('');
  const [gameSystemFilter, setGameSystemFilter] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  
  // Options for form
  const [collections, setCollections] = useState<Array<{ id: string; name: string; gameSystemId: string }>>([]);
  const [gameSystems, setGameSystems] = useState<Array<{ id: string; name: string; shortName: string }>>([]);
  const [factions, setFactions] = useState<Array<{ id: string; name: string; gameSystemId: string }>>([]);

  // Load models
  const loadModels = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const params: ModelListParams = {
        page,
        limit: 12,
        search: searchQuery || undefined,
        paintingStatus: paintingStatusFilter || undefined,
        gameSystemId: gameSystemFilter || undefined,
        collectionId: collectionId || undefined,
        tags: tagFilter.length > 0 ? tagFilter : undefined,
      };

      // Only show user's own models if not viewing a specific collection
      if (!collectionId && user) {
        params.userId = user.id;
      }

      const response = await modelService.getModels(params);
      setModels(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, paintingStatusFilter, gameSystemFilter, tagFilter, collectionId, user]);

  // Load form options
  const loadFormOptions = useCallback(async () => {
    try {
      // For now, we'll use mock data since we need to implement game systems properly
      const collectionsRes = await CollectionService.getCollections(1, 100);
      
      setCollections(collectionsRes.data.map((c: Collection) => ({
        id: c.id,
        name: c.name,
        gameSystemId: c.gameSystemId,
      })));
      
      // Mock game systems for now
      setGameSystems([
        { id: '1', name: 'Warhammer 40,000', shortName: 'WH40K' },
        { id: '2', name: 'Age of Sigmar', shortName: 'AOS' },
        { id: '3', name: 'Kill Team', shortName: 'KT' },
      ]);

      // Mock factions for now
      setFactions([
        { id: '1', name: 'Space Marines', gameSystemId: '1' },
        { id: '2', name: 'Orks', gameSystemId: '1' },
        { id: '3', name: 'Stormcast Eternals', gameSystemId: '2' },
      ]);
    } catch (err) {
      console.error('Failed to load form options:', err);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadModels();
    loadFormOptions();
  }, [loadModels, loadFormOptions]);

  // Handlers
  const handleAddModel = () => {
    setSelectedModel(null);
    setFormError(null);
    setFormOpen(true);
  };

  const handleEditModel = (model: UserModel) => {
    setSelectedModel(model);
    setFormError(null);
    setFormOpen(true);
  };

  const handleDeleteModel = (model: UserModel) => {
    setModelToDelete(model);
    setDeleteDialogOpen(true);
  };

  const handleModelClick = (model: UserModel) => {
    navigate(`/models/${model.id}`);
  };

  const handleFormSubmit = async (data: CreateModelData) => {
    try {
      setFormLoading(true);
      setFormError(null);

      if (selectedModel) {
        await modelService.updateModel(selectedModel.id, data);
        setSuccessMessage('Model updated successfully!');
      } else {
        await modelService.createModel(data);
        setSuccessMessage('Model created successfully!');
      }

      setFormOpen(false);
      setSelectedModel(null);
      loadModels();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save model');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!modelToDelete) return;

    try {
      await modelService.deleteModel(modelToDelete.id);
      setSuccessMessage('Model deleted successfully!');
      setDeleteDialogOpen(false);
      setModelToDelete(null);
      loadModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete model');
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'paintingStatus':
        setPaintingStatusFilter(value);
        break;
      case 'gameSystem':
        setGameSystemFilter(value);
        break;
    }
    setPage(1); // Reset to first page
  };

  const handleTagFilterChange = (tags: string[]) => {
    setTagFilter(tags);
    setPage(1); // Reset to first page
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <ModelGrid
        models={models}
        loading={loading}
        error={error}
        showAddButton={Boolean(user)}
        showOwner={!collectionId}
        showCollectionFilter={!collectionId}
        onAddModel={handleAddModel}
        onEditModel={handleEditModel}
        onDeleteModel={handleDeleteModel}
        onModelClick={handleModelClick}
        
        // Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        
        // Filtering
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        paintingStatusFilter={paintingStatusFilter}
        onPaintingStatusFilterChange={(status) => handleFilterChange('paintingStatus', status)}
        gameSystemFilter={gameSystemFilter}
        onGameSystemFilterChange={(gameSystem) => handleFilterChange('gameSystem', gameSystem)}
        tagFilter={tagFilter}
        onTagFilterChange={handleTagFilterChange}
        
        // Available filter options
        availableGameSystems={gameSystems}
      />

      {/* Model Form Dialog */}
      <ModelForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedModel(null);
          setFormError(null);
        }}
        onSubmit={handleFormSubmit}
        model={selectedModel}
        loading={formLoading}
        error={formError}
        collections={collections}
        gameSystems={gameSystems}
        factions={factions}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Model</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{modelToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ModelsPage;
