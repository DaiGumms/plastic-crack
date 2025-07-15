import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Stack,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Info as InfoIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import type { LibraryModel } from '../../types';

export interface LibraryModelCardProps {
  model: LibraryModel;
  onAddToCollection?: (model: LibraryModel) => void;
  onViewDetails?: (model: LibraryModel) => void;
  showAddButton?: boolean;
  compact?: boolean;
}

const LibraryModelCard: React.FC<LibraryModelCardProps> = ({
  model,
  onAddToCollection,
  onViewDetails,
  showAddButton = true,
  compact = false,
}) => {
  const handleAddToCollection = (event: React.MouseEvent) => {
    event.stopPropagation();
    onAddToCollection?.(model);
  };

  const handleViewDetails = () => {
    onViewDetails?.(model);
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      handleViewDetails();
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        cursor: onViewDetails ? 'pointer' : 'default',
        '&:hover': onViewDetails ? {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        } : {},
      }}
      onClick={handleCardClick}
    >
      {/* Model Image */}
      <CardMedia
        component="div"
        sx={{
          height: compact ? 120 : 200,
          backgroundImage: model.officialImageUrl 
            ? `url(${model.officialImageUrl})`
            : 'linear-gradient(45deg, #f5f5f5 25%, #e0e0e0 25%, #e0e0e0 50%, #f5f5f5 50%, #f5f5f5 75%, #e0e0e0 75%)',
          backgroundSize: model.officialImageUrl ? 'cover' : '20px 20px',
          backgroundPosition: 'center',
          backgroundRepeat: model.officialImageUrl ? 'no-repeat' : 'repeat',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!model.officialImageUrl && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: 1,
              borderRadius: 1,
            }}
          >
            No Image
          </Typography>
        )}
        
        {/* Official Badge */}
        {model.isOfficial && (
          <Chip
            icon={<StarIcon sx={{ fontSize: 16 }} />}
            label="Official"
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontSize: '0.75rem',
            }}
          />
        )}

        {/* Quick Actions */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 0.5,
          }}
        >
          {onViewDetails && (
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardMedia>

      {/* Model Content */}
      <CardContent sx={{ flexGrow: 1, p: compact ? 1.5 : 2 }}>
        <Stack spacing={1}>
          {/* Model Name */}
          <Typography
            variant={compact ? "subtitle2" : "h6"}
            component="h3"
            sx={{
              fontWeight: 600,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {model.name}
          </Typography>

          {/* Game System and Faction */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {model.gameSystem && (
              <Chip
                label={model.gameSystem.shortName || model.gameSystem.name}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
            {model.faction && (
              <Chip
                label={model.faction.name}
                size="small"
                variant="outlined"
                color="secondary"
              />
            )}
          </Stack>

          {/* Points Cost */}
          {model.pointsCost && (
            <Typography variant="body2" color="text.secondary">
              <strong>{model.pointsCost} pts</strong>
            </Typography>
          )}

          {/* Description */}
          {model.description && !compact && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.4,
              }}
            >
              {model.description}
            </Typography>
          )}

          {/* Tags */}
          {model.tags && model.tags.length > 0 && !compact && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {model.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              ))}
              {model.tags.length > 3 && (
                <Chip
                  label={`+${model.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>

      {/* Actions */}
      {showAddButton && onAddToCollection && (
        <Box sx={{ p: compact ? 1 : 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddToCollection}
            size={compact ? "small" : "medium"}
          >
            Add to Collection
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default LibraryModelCard;
