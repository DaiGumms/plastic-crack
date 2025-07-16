import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  Skeleton,
  Alert,
  Pagination,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  ViewModule as GridViewIcon,
} from '@mui/icons-material';
import type { UserModel } from '../../types';
import ModelCard from './ModelCard';

export interface ModelGridProps {
  models: UserModel[];
  loading?: boolean;
  error?: string | null;
  showAddButton?: boolean;
  showOwner?: boolean;
  showCollectionFilter?: boolean;
  onAddModel?: () => void;
  onEditModel?: (model: UserModel) => void;
  onDeleteModel?: (model: UserModel) => void;
  onModelClick?: (model: UserModel) => void;

  // Pagination
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  // Filtering
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  paintingStatusFilter?: string;
  onPaintingStatusFilterChange?: (status: string) => void;
  gameSystemFilter?: string;
  onGameSystemFilterChange?: (gameSystem: string) => void;
  tagFilter?: string[];
  onTagFilterChange?: (tags: string[]) => void;

  // Available filter options
  availableGameSystems?: Array<{ id: string; name: string }>;
  availableTags?: string[];
}

const ModelGrid: React.FC<ModelGridProps> = ({
  models,
  loading = false,
  error = null,
  showAddButton = false,
  showOwner = false,
  showCollectionFilter = false,
  onAddModel,
  onEditModel,
  onDeleteModel,
  onModelClick,

  // Pagination
  page = 1,
  totalPages = 1,
  onPageChange,

  // Filtering
  searchQuery = '',
  onSearchChange,
  paintingStatusFilter = '',
  onPaintingStatusFilterChange,
  gameSystemFilter = '',
  onGameSystemFilterChange,
  tagFilter = [],
  onTagFilterChange,

  // Available filter options
  availableGameSystems = [],
  // availableTags = [], // Commented out as it's not used yet
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange?.(event.target.value);
    },
    [onSearchChange]
  );

  const handlePaintingStatusFilterChange = useCallback(
    (event: SelectChangeEvent) => {
      onPaintingStatusFilterChange?.(event.target.value as string);
    },
    [onPaintingStatusFilterChange]
  );

  const handleGameSystemFilterChange = useCallback(
    (event: SelectChangeEvent) => {
      onGameSystemFilterChange?.(event.target.value as string);
    },
    [onGameSystemFilterChange]
  );

  const handleTagRemove = useCallback(
    (tagToRemove: string) => {
      onTagFilterChange?.(tagFilter.filter(tag => tag !== tagToRemove));
    },
    [tagFilter, onTagFilterChange]
  );

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, newPage: number) => {
      onPageChange?.(newPage);
    },
    [onPageChange]
  );

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h5' component='h2'>
          Models
          {!loading && (
            <Typography component='span' color='text.secondary' ml={1}>
              ({models.length})
            </Typography>
          )}
        </Typography>

        {showAddButton && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={onAddModel}
            disabled={loading}
          >
            Add Model
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Box mb={3}>
        <Box display='flex' flexWrap='wrap' gap={2} alignItems='center'>
          {/* Search */}
          <Box flex='1' minWidth='200px'>
            <TextField
              fullWidth
              size='small'
              placeholder='Search models...'
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={loading}
            />
          </Box>

          {/* Painting Status Filter */}
          <Box minWidth='120px'>
            <FormControl fullWidth size='small'>
              <InputLabel>Status</InputLabel>
              <Select
                value={paintingStatusFilter}
                label='Status'
                onChange={handlePaintingStatusFilterChange}
                disabled={loading}
              >
                <MenuItem value=''>All</MenuItem>
                <MenuItem value='UNPAINTED'>Unpainted</MenuItem>
                <MenuItem value='IN_PROGRESS'>In Progress</MenuItem>
                <MenuItem value='COMPLETED'>Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Game System Filter */}
          {showCollectionFilter && availableGameSystems.length > 0 && (
            <Box minWidth='150px'>
              <FormControl fullWidth size='small'>
                <InputLabel>Game System</InputLabel>
                <Select
                  value={gameSystemFilter}
                  label='Game System'
                  onChange={handleGameSystemFilterChange}
                  disabled={loading}
                >
                  <MenuItem value=''>All</MenuItem>
                  {availableGameSystems.map(gameSystem => (
                    <MenuItem key={gameSystem.id} value={gameSystem.id}>
                      {gameSystem.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* View Mode Toggle */}
          <Box>
            <Button
              variant='outlined'
              startIcon={<GridViewIcon />}
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              disabled={loading}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
          </Box>
        </Box>

        {/* Active Tag Filters */}
        {tagFilter.length > 0 && (
          <Box mt={2}>
            <Typography variant='body2' color='text.secondary' mb={1}>
              Active filters:
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              {tagFilter.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size='small'
                  onDelete={() => handleTagRemove(tag)}
                  disabled={loading}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Models Grid */}
      {loading ? (
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
          {Array.from({ length: 8 }).map((_, index) => (
            <Box key={index}>
              <Skeleton
                variant='rectangular'
                height={300}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          ))}
        </Box>
      ) : models.length === 0 ? (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          py={8}
          textAlign='center'
        >
          <Typography variant='h6' color='text.secondary' mb={2}>
            No models found
          </Typography>
          <Typography variant='body2' color='text.secondary' mb={3}>
            {searchQuery ||
            paintingStatusFilter ||
            gameSystemFilter ||
            tagFilter.length > 0
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by adding your first model.'}
          </Typography>
          {showAddButton &&
            !searchQuery &&
            !paintingStatusFilter &&
            !gameSystemFilter &&
            tagFilter.length === 0 && (
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={onAddModel}
              >
                Add Your First Model
              </Button>
            )}
        </Box>
      ) : (
        <Box
          sx={{
            mt: 2,
            display: viewMode === 'grid' ? 'grid' : 'flex',
            flexDirection: viewMode === 'list' ? 'column' : undefined,
            gridTemplateColumns:
              viewMode === 'grid'
                ? {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  }
                : undefined,
            gap: viewMode === 'grid' ? 3 : 2,
          }}
        >
          {models.map(model => (
            <ModelCard
              key={model.id}
              model={model}
              showOwner={showOwner}
              onClick={() => onModelClick?.(model)}
              onEdit={() => onEditModel?.(model)}
              onDelete={() => onDeleteModel?.(model)}
            />
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display='flex' justifyContent='center' mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color='primary'
            size='large'
            disabled={loading}
          />
        </Box>
      )}
    </Box>
  );
};

export default ModelGrid;
