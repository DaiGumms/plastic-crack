import React from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Alert,
} from '@mui/material';
import { CollectionCard } from './CollectionCard';
import type { Collection } from '../../types';

interface CollectionGridProps {
  collections: Collection[];
  loading?: boolean;
  error?: string | null;
  showOwner?: boolean;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collection: Collection) => void;
  onView?: (collection: Collection) => void;
  currentUserId?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export const CollectionGrid: React.FC<CollectionGridProps> = ({
  collections,
  loading = false,
  error = null,
  showOwner = true,
  onEdit,
  onDelete,
  onView,
  currentUserId,
  emptyMessage = "No collections found",
  emptySubMessage = "Create your first collection to get started",
}) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Box key={index}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
            <Box sx={{ pt: 2 }}>
              <Skeleton variant="text" height={28} />
              <Skeleton variant="text" height={20} width="80%" />
              <Skeleton variant="text" height={20} width="60%" />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Skeleton variant="rounded" width={60} height={24} />
                <Skeleton variant="rounded" width={80} height={24} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {emptySubMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: 2,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          showOwner={showOwner}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          currentUserId={currentUserId}
        />
      ))}
    </Box>
  );
};

export default CollectionGrid;
