import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Button,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import LibraryModelCard from './LibraryModelCard';
import type { LibraryModel, GameSystem, Faction } from '../../types';

export interface LibraryModelGridProps {
  models: LibraryModel[];
  loading?: boolean;
  error?: string | null;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: LibraryModelFilters) => void;
  onAddToCollection?: (model: LibraryModel) => void;
  onViewDetails?: (model: LibraryModel) => void;
  
  // Filter options
  gameSystems?: GameSystem[];
  factions?: Faction[];
  showAddButtons?: boolean;
}

export interface LibraryModelFilters {
  search?: string;
  gameSystemId?: string;
  factionId?: string;
  isOfficial?: boolean;
  tags?: string[];
}

const LibraryModelGrid: React.FC<LibraryModelGridProps> = ({
  models,
  loading = false,
  error = null,
  totalCount = 0,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
  onSearch,
  onFilterChange,
  onAddToCollection,
  onViewDetails,
  gameSystems = [],
  factions = [],
  showAddButtons = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameSystem, setSelectedGameSystem] = useState<string>('');
  const [selectedFaction, setSelectedFaction] = useState<string>('');
  const [selectedOfficial, setSelectedOfficial] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter factions based on selected game system
  const availableFactions = selectedGameSystem
    ? factions.filter(faction => faction.gameSystemId === selectedGameSystem)
    : factions;

  // Handle search input change
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  }, [onSearch]);

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    const filters: LibraryModelFilters = {
      search: searchQuery || undefined,
      gameSystemId: selectedGameSystem || undefined,
      factionId: selectedFaction || undefined,
      isOfficial: selectedOfficial ? selectedOfficial === 'true' : undefined,
    };
    onFilterChange?.(filters);
  }, [searchQuery, selectedGameSystem, selectedFaction, selectedOfficial, onFilterChange]);

  // Apply filters when they change
  useEffect(() => {
    handleFilterChange();
  }, [handleFilterChange]);

  // Handle game system change
  const handleGameSystemChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedGameSystem(value);
    
    // Reset faction if it's not available for the new game system
    if (value && availableFactions.length === 0) {
      setSelectedFaction('');
    } else if (value && selectedFaction) {
      const factionExists = availableFactions.some(f => f.id === selectedFaction);
      if (!factionExists) {
        setSelectedFaction('');
      }
    }
  };

  // Handle faction change
  const handleFactionChange = (event: SelectChangeEvent<string>) => {
    setSelectedFaction(event.target.value);
  };

  // Handle official filter change
  const handleOfficialChange = (event: SelectChangeEvent<string>) => {
    setSelectedOfficial(event.target.value);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGameSystem('');
    setSelectedFaction('');
    setSelectedOfficial('');
    onSearch?.('');
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedGameSystem || selectedFaction || selectedOfficial;

  const totalPages = Math.ceil(totalCount / pageSize);

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3 }}>
        <Stack spacing={2}>
          {/* Search Bar */}
          <TextField
            fullWidth
            label="Search models..."
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name, description, or tags"
            disabled={loading}
          />

          {/* Filter Toggle and Clear */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "contained" : "outlined"}
              size="small"
            >
              Filters
            </Button>
            
            {hasActiveFilters && (
              <Button
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                variant="outlined"
                size="small"
                color="secondary"
              >
                Clear Filters
              </Button>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              {totalCount} models found
            </Typography>
          </Stack>

          {/* Filter Controls */}
          {showFilters && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Game System</InputLabel>
                <Select
                  value={selectedGameSystem}
                  label="Game System"
                  onChange={handleGameSystemChange}
                  disabled={loading}
                >
                  <MenuItem value="">All Game Systems</MenuItem>
                  {gameSystems.map((gameSystem) => (
                    <MenuItem key={gameSystem.id} value={gameSystem.id}>
                      {gameSystem.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }} disabled={!selectedGameSystem || availableFactions.length === 0}>
                <InputLabel>Faction</InputLabel>
                <Select
                  value={selectedFaction}
                  label="Faction"
                  onChange={handleFactionChange}
                  disabled={loading || !selectedGameSystem || availableFactions.length === 0}
                >
                  <MenuItem value="">All Factions</MenuItem>
                  {availableFactions.map((faction) => (
                    <MenuItem key={faction.id} value={faction.id}>
                      {faction.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedOfficial}
                  label="Type"
                  onChange={handleOfficialChange}
                  disabled={loading}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="true">Official Only</MenuItem>
                  <MenuItem value="false">Community Only</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  onDelete={() => {
                    setSearchQuery('');
                    onSearch?.('');
                  }}
                  size="small"
                />
              )}
              {selectedGameSystem && (
                <Chip
                  label={`Game System: ${gameSystems.find(g => g.id === selectedGameSystem)?.name}`}
                  onDelete={() => setSelectedGameSystem('')}
                  size="small"
                />
              )}
              {selectedFaction && (
                <Chip
                  label={`Faction: ${factions.find(f => f.id === selectedFaction)?.name}`}
                  onDelete={() => setSelectedFaction('')}
                  size="small"
                />
              )}
              {selectedOfficial && (
                <Chip
                  label={`Type: ${selectedOfficial === 'true' ? 'Official' : 'Community'}`}
                  onDelete={() => setSelectedOfficial('')}
                  size="small"
                />
              )}
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Models Grid */}
      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      ) : models.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6" gutterBottom>
            No models found
          </Typography>
          <Typography variant="body2">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more models.'
              : 'No models are available in the library yet.'}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {models.map((model) => (
            <LibraryModelCard
              key={model.id}
              model={model}
              onAddToCollection={onAddToCollection}
              onViewDetails={onViewDetails}
              showAddButton={showAddButtons}
            />
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange?.(page)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            disabled={loading}
          />
        </Box>
      )}
    </Box>
  );
};

export default LibraryModelGrid;
