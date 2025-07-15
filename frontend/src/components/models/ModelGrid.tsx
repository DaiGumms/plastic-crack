import React from 'react';
import {
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ModelCard } from './ModelCard';
import type { Model } from '../../types';

interface ModelGridProps {
  models: Model[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (model: Model) => void;
  onDelete?: (model: Model) => void;
  onAddModel?: () => void;
  currentUserId?: string;
  showOwner?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
  canAddModel?: boolean;
}

export const ModelGrid: React.FC<ModelGridProps> = ({
  models,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onAddModel,
  currentUserId,
  showOwner = false,
  emptyMessage = 'No models found',
  emptySubMessage = 'Add some models to get started',
  canAddModel = false,
}) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (models.length === 0) {
    return (
      <Card
        sx={{
          textAlign: 'center',
          py: 8,
          px: 4,
          backgroundColor: 'grey.50',
          border: '2px dashed',
          borderColor: 'grey.300',
        }}
      >
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {emptyMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {emptySubMessage}
          </Typography>
          {canAddModel && onAddModel && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddModel}
              color="primary"
            >
              Add Your First Model
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {models.map((model) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={model.id}>
          <ModelCard
            model={model}
            onEdit={onEdit}
            onDelete={onDelete}
            currentUserId={currentUserId}
            showOwner={showOwner}
          />
        </Grid>
      ))}
    </Grid>
  );
};