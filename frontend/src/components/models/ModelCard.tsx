import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import type { Model, PaintingStatus } from '../../types';

interface ModelCardProps {
  model: Model;
  onEdit?: (model: Model) => void;
  onDelete?: (model: Model) => void;
  currentUserId?: string;
  showOwner?: boolean;
}

const paintingStatusColors: Record<PaintingStatus, string> = {
  UNPAINTED: '#9e9e9e',
  PRIMED: '#795548',
  BASE_COATED: '#ff9800',
  IN_PROGRESS: '#2196f3',
  COMPLETED: '#4caf50',
  SHOWCASE: '#9c27b0',
};

const paintingStatusLabels: Record<PaintingStatus, string> = {
  UNPAINTED: 'Unpainted',
  PRIMED: 'Primed',
  BASE_COATED: 'Base Coated',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  SHOWCASE: 'Showcase',
};

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onEdit,
  onDelete,
  currentUserId,
  showOwner = false,
}) => {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  
  const isOwner = currentUserId === model.userId;
  const canEdit = isOwner;
  const canDelete = isOwner;
  
  const primaryPhoto = model.photos?.find(photo => photo.isPrimary) || model.photos?.[0];
  const imageUrl = primaryPhoto?.thumbnailUrl || primaryPhoto?.originalUrl || '/placeholder-model.jpg';

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleMenuClose();
    onEdit?.(model);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleMenuClose();
    onDelete?.(model);
  };

  const handleView = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleMenuClose();
    window.open(`/models/${model.id}`, '_blank');
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component={Link}
          to={`/models/${model.id}`}
          sx={{
            height: 200,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            textDecoration: 'none',
          }}
          image={imageUrl}
          title={model.name}
        />
        
        {/* Actions Menu */}
        {(canEdit || canDelete) && (
          <>
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
              }}
              size="small"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleView}>
                <ViewIcon fontSize="small" sx={{ mr: 1 }} />
                View Details
              </MenuItem>
              {canEdit && (
                <MenuItem onClick={handleEdit}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit
                </MenuItem>
              )}
              {canDelete && (
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              )}
            </Menu>
          </>
        )}

        {/* Painting Status Chip */}
        <Chip
          label={paintingStatusLabels[model.paintingStatus]}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            bgcolor: paintingStatusColors[model.paintingStatus],
            color: 'white',
            fontWeight: 'bold',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="h6"
          component={Link}
          to={`/models/${model.id}`}
          sx={{
            mb: 1,
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { color: 'primary.main' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {model.name}
        </Typography>

        {model.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {model.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
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
          {model.pointsCost && (
            <Chip
              label={`${model.pointsCost} pts`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {model.tags && model.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {model.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {model.tags.length > 3 && (
              <Chip
                label={`+${model.tags.length - 3} more`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        )}

        {showOwner && model.user && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Avatar sx={{ width: 20, height: 20, mr: 1, fontSize: '0.7rem' }}>
              {model.user.displayName?.[0] || model.user.username?.[0] || '?'}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {model.user.displayName || model.user.username}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};