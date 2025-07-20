import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Skeleton,
  Alert,
  Button,
  List,
  ListItem,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  InputAdornment,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Search as SearchIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';
import type { LibraryModel, GameSystem, Faction } from '../../types';

export interface LibraryModelListProps {
  models: LibraryModel[];
  loading?: boolean;
  error?: string | null;
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

interface GroupedModels {
  [gameSystemId: string]: {
    gameSystem: GameSystem;
    factions: {
      [factionId: string]: {
        faction: Faction;
        models: LibraryModel[];
      };
    };
  };
}

const LibraryModelList: React.FC<LibraryModelListProps> = ({
  models,
  loading = false,
  error = null,
  onSearch,
  onFilterChange,
  onAddToCollection,
  gameSystems = [],
  factions = [],
  showAddButtons = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameSystem, setSelectedGameSystem] = useState<string>('');
  const [selectedFaction, setSelectedFaction] = useState<string>('');
  const [selectedOfficial, setSelectedOfficial] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [filters, setFilters] = useState<LibraryModelFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(
    new Set()
  );
  const [expandedFactions, setExpandedFactions] = useState<Set<string>>(
    new Set()
  );

  // Filter factions based on selected game system
  const availableFactions = selectedGameSystem
    ? factions.filter(faction => faction.gameSystemId === selectedGameSystem)
    : factions;

  // Group models by game system and faction
  const groupedModels: GroupedModels = React.useMemo(() => {
    const grouped: GroupedModels = {};

    models.forEach(model => {
      // Skip models without proper game system/faction data
      if (!model.gameSystem || !model.faction) {
        return;
      }

      const gameSystemId = model.gameSystem.id;
      const factionId = model.faction.id;

      if (!grouped[gameSystemId]) {
        grouped[gameSystemId] = {
          gameSystem: model.gameSystem as GameSystem,
          factions: {},
        };
      }

      if (!grouped[gameSystemId].factions[factionId]) {
        grouped[gameSystemId].factions[factionId] = {
          faction: model.faction as Faction,
          models: [],
        };
      }

      grouped[gameSystemId].factions[factionId].models.push(model);
    });

    return grouped;
  }, [models]);

  // Handle search input change
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchQuery(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters?: Partial<LibraryModelFilters>) => {
      const updatedFilters: LibraryModelFilters = {
        search: searchQuery || undefined,
        gameSystemId: selectedGameSystem || undefined,
        factionId: selectedFaction || undefined,
        isOfficial: selectedOfficial ? selectedOfficial === 'true' : undefined,
        tags: filters.tags,
        ...newFilters,
      };
      setFilters(updatedFilters);
      onFilterChange?.(updatedFilters);
    },
    [
      searchQuery,
      selectedGameSystem,
      selectedFaction,
      selectedOfficial,
      filters.tags,
      onFilterChange,
    ]
  );

  // Apply filters when they change
  useEffect(() => {
    handleFilterChange();
  }, [handleFilterChange]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedGameSystem('');
    setSelectedFaction('');
    setSelectedOfficial('');
    setTagInput('');
    setFilters({});
  };

  // Handle game system accordion toggle
  const handleSystemToggle = (systemId: string) => {
    const newExpanded = new Set(expandedSystems);
    if (newExpanded.has(systemId)) {
      newExpanded.delete(systemId);
    } else {
      newExpanded.add(systemId);
    }
    setExpandedSystems(newExpanded);
  };

  // Handle faction accordion toggle
  const handleFactionToggle = (factionId: string) => {
    const newExpanded = new Set(expandedFactions);
    if (newExpanded.has(factionId)) {
      newExpanded.delete(factionId);
    } else {
      newExpanded.add(factionId);
    }
    setExpandedFactions(newExpanded);
  };

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder='Search models...'
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={() => setSearchQuery('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant='outlined'
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </Stack>

        {/* Filter Controls */}
        {showFilters && (
          <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
            <FormControl size='small' sx={{ minWidth: 160 }}>
              <InputLabel>Game System</InputLabel>
              <Select
                value={selectedGameSystem}
                label='Game System'
                onChange={(e: SelectChangeEvent) =>
                  setSelectedGameSystem(e.target.value)
                }
              >
                <MenuItem value=''>All Systems</MenuItem>
                {gameSystems.map(system => (
                  <MenuItem key={system.id} value={system.id}>
                    {system.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size='small' sx={{ minWidth: 160 }}>
              <InputLabel>Faction</InputLabel>
              <Select
                value={selectedFaction}
                label='Faction'
                onChange={(e: SelectChangeEvent) =>
                  setSelectedFaction(e.target.value)
                }
                disabled={!selectedGameSystem}
              >
                <MenuItem value=''>All Factions</MenuItem>
                {availableFactions.map(faction => (
                  <MenuItem key={faction.id} value={faction.id}>
                    {faction.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size='small' sx={{ minWidth: 120 }}>
              <InputLabel>Official</InputLabel>
              <Select
                value={selectedOfficial}
                label='Official'
                onChange={(e: SelectChangeEvent) =>
                  setSelectedOfficial(e.target.value)
                }
              >
                <MenuItem value=''>All</MenuItem>
                <MenuItem value='true'>Official Only</MenuItem>
                <MenuItem value='false'>Community</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size='small'
              label='Tags'
              placeholder='Enter tags separated by commas'
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const newTags = tagInput
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0);
                  if (newTags.length > 0) {
                    const existingTags = filters.tags || [];
                    const uniqueTags = [
                      ...new Set([...existingTags, ...newTags]),
                    ];
                    handleFilterChange({ tags: uniqueTags });
                    setTagInput('');
                  }
                }
              }}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <TagIcon fontSize='small' />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant='outlined'
              size='small'
              onClick={clearAllFilters}
              startIcon={<ClearIcon />}
            >
              Clear
            </Button>
          </Stack>
        )}

        {/* Active filters */}
        {(searchQuery ||
          selectedGameSystem ||
          selectedFaction ||
          selectedOfficial ||
          (filters.tags && filters.tags.length > 0)) && (
          <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
            {searchQuery && (
              <Chip
                label={`Search: ${searchQuery}`}
                onDelete={() => setSearchQuery('')}
                size='small'
              />
            )}
            {filters.tags &&
              filters.tags.length > 0 &&
              filters.tags.map(tag => (
                <Chip
                  key={tag}
                  label={`Tag: ${tag}`}
                  onDelete={() => {
                    handleFilterChange({
                      tags: filters.tags?.filter(t => t !== tag),
                    });
                  }}
                  size='small'
                  color='secondary'
                />
              ))}
            {selectedGameSystem && (
              <Chip
                label={`System: ${gameSystems.find(s => s.id === selectedGameSystem)?.name}`}
                onDelete={() => setSelectedGameSystem('')}
                size='small'
              />
            )}
            {selectedFaction && (
              <Chip
                label={`Faction: ${factions.find(f => f.id === selectedFaction)?.name}`}
                onDelete={() => setSelectedFaction('')}
                size='small'
              />
            )}
            {selectedOfficial && (
              <Chip
                label={`${selectedOfficial === 'true' ? 'Official' : 'Community'}`}
                onDelete={() => setSelectedOfficial('')}
                size='small'
              />
            )}
          </Stack>
        )}
      </Box>

      {/* Loading State */}
      {loading && (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant='rectangular' height={60} />
          ))}
        </Stack>
      )}

      {/* Models List */}
      {!loading && (
        <>
          {Object.keys(groupedModels).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant='h6' color='text.secondary' gutterBottom>
                No models found
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          ) : (
            <Box>
              {Object.entries(groupedModels).map(
                ([gameSystemId, systemData]) => (
                  <Accordion
                    key={gameSystemId}
                    expanded={expandedSystems.has(gameSystemId)}
                    onChange={() => handleSystemToggle(gameSystemId)}
                    sx={{
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:before': {
                        display: 'none',
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: 'action.hover',
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                        },
                      }}
                    >
                      <Typography
                        variant='h6'
                        component='div'
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {systemData.gameSystem.name}
                        <Chip
                          size='small'
                          label={Object.values(systemData.factions).reduce(
                            (total, faction) => total + faction.models.length,
                            0
                          )}
                          variant='outlined'
                        />
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      {Object.entries(systemData.factions).map(
                        ([factionId, factionData]) => (
                          <Accordion
                            key={factionId}
                            expanded={expandedFactions.has(factionId)}
                            onChange={() => handleFactionToggle(factionId)}
                            sx={{
                              boxShadow: 'none',
                              border: 'none',
                              borderBottom: '1px solid',
                              borderBottomColor: 'divider',
                              '&:before': {
                                display: 'none',
                              },
                              '&.Mui-expanded': {
                                margin: 'auto',
                              },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{
                                backgroundColor: 'background.default',
                                minHeight: 40,
                                '&.Mui-expanded': {
                                  minHeight: 40,
                                },
                                '& .MuiAccordionSummary-content': {
                                  alignItems: 'center',
                                  '&.Mui-expanded': {
                                    margin: '8px 0',
                                  },
                                },
                              }}
                            >
                              <Typography
                                variant='subtitle1'
                                sx={{
                                  fontWeight: 'medium',
                                  color: 'primary.main',
                                }}
                              >
                                {factionData.faction.name}
                              </Typography>
                              <Chip
                                size='small'
                                label={factionData.models.length}
                                variant='outlined'
                                sx={{ ml: 1 }}
                              />
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                              <List dense>
                                {factionData.models.map(model => (
                                  <ListItem
                                    key={model.id}
                                    sx={{
                                      pl: 3,
                                      border: 1,
                                      borderColor: 'divider',
                                      borderRadius: 1,
                                      mb: 1,
                                      mx: 1,
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      '&:hover': {
                                        backgroundColor: 'action.hover',
                                      },
                                    }}
                                  >
                                    <Box sx={{ flexGrow: 1, py: 1 }}>
                                      {/* Primary content */}
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                          mb: 0.5,
                                        }}
                                      >
                                        <Typography
                                          variant='body1'
                                          component='div'
                                        >
                                          {model.name}
                                        </Typography>
                                        {model.isOfficial && (
                                          <Chip
                                            size='small'
                                            label='Official'
                                            color='primary'
                                            variant='outlined'
                                          />
                                        )}
                                      </Box>

                                      {/* Secondary content */}
                                      <Box>
                                        {model.description && (
                                          <Typography
                                            variant='body2'
                                            color='text.secondary'
                                            component='div'
                                            sx={{ mb: 0.5 }}
                                          >
                                            {model.description}
                                          </Typography>
                                        )}
                                        {model.tags &&
                                          model.tags.length > 0 && (
                                            <Stack
                                              direction='row'
                                              spacing={0.5}
                                              sx={{ mt: 0.5 }}
                                            >
                                              {model.tags
                                                .slice(0, 3)
                                                .map(tag => (
                                                  <Chip
                                                    key={tag}
                                                    size='small'
                                                    label={tag}
                                                    variant='outlined'
                                                  />
                                                ))}
                                              {model.tags.length > 3 && (
                                                <Chip
                                                  size='small'
                                                  label={`+${model.tags.length - 3} more`}
                                                  variant='outlined'
                                                />
                                              )}
                                            </Stack>
                                          )}
                                      </Box>
                                    </Box>

                                    {showAddButtons && (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          pl: 2,
                                        }}
                                      >
                                        <IconButton
                                          onClick={() =>
                                            onAddToCollection?.(model)
                                          }
                                          color='primary'
                                          size='small'
                                        >
                                          <AddIcon />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        )
                      )}
                    </AccordionDetails>
                  </Accordion>
                )
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default LibraryModelList;
