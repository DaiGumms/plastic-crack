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
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import type { UserModel } from '../../types';

export interface ModelCardProps {
  model: UserModel;
  showOwner?: boolean;
  currentUserId?: string;
  onClick?: (model: UserModel) => void;
  onEdit?: (model: UserModel) => void;
  onDelete?: (model: UserModel) => void;
  onView?: (model: UserModel) => void;
  viewMode?: 'grid' | 'list';
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  showOwner = true,
  currentUserId,
  onClick,
  onEdit,
  onDelete,
  onView,
  viewMode = 'grid',
}) => {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  const isOwner = currentUserId === model.userId;
  const canEdit = isOwner && onEdit;
  const canDelete = isOwner && onDelete;
  const showMenu = canEdit || canDelete;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onEdit?.(model);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete?.(model);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(model);
    } else if (onView) {
      onView(model);
    }
  };

  const getPaintingStatusColor = (
    status: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (status) {
      case 'UNPAINTED':
        return 'default';
      case 'PRIMED':
        return 'secondary';
      case 'BASE_COATED':
        return 'info';
      case 'IN_PROGRESS':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'SHOWCASE':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatPaintingStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const primaryImageUrl =
    model.photos?.find(p => p.isPrimary)?.originalUrl ||
    model.photos?.[0]?.originalUrl;

  return (
    <Card
      sx={{
        cursor: onView ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: onView ? 'translateY(-2px)' : 'none',
          boxShadow: onView ? 3 : 1,
        },
        height: '100%',
        display: 'flex',
        flexDirection: viewMode === 'list' ? 'row' : 'column',
      }}
      onClick={handleCardClick}
    >
      {/* Model Image */}
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        {primaryImageUrl ? (
          <CardMedia
            component='img'
            sx={{
              height: viewMode === 'grid' ? 200 : 120,
              width: viewMode === 'list' ? 120 : '100%',
              objectFit: 'cover',
            }}
            image={primaryImageUrl}
            alt={model.name}
          />
        ) : (
          <Box
            sx={{
              height: viewMode === 'grid' ? 200 : 120,
              width: viewMode === 'list' ? 120 : '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'grey.100',
              color: 'grey.500',
            }}
          >
            <Typography variant='body2'>No Image</Typography>
          </Box>
        )}

        {/* Privacy Indicator */}
        <Tooltip title={model.isPublic ? 'Public Model' : 'Private Model'}>
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '50%',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {model.isPublic ? (
              <PublicIcon sx={{ fontSize: 16, color: 'white' }} />
            ) : (
              <PrivateIcon sx={{ fontSize: 16, color: 'white' }} />
            )}
          </Box>
        </Tooltip>

        {/* Action Menu */}
        {showMenu && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          >
            <IconButton
              size='small'
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <MoreVertIcon fontSize='small' />
            </IconButton>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        {/* Model Title */}
        <Typography
          variant='h6'
          component='h3'
          gutterBottom
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

        {/* Game System & Faction */}
        <Box sx={{ mb: 1 }}>
          {model.gameSystem && (
            <Typography
              variant='caption'
              color='text.secondary'
              display='block'
            >
              {model.gameSystem.name}
              {model.faction && ` • ${model.faction.name}`}
            </Typography>
          )}
        </Box>

        {/* Model Description */}
        {model.description && (
          <Typography
            variant='body2'
            color='text.secondary'
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

        {/* Painting Status */}
        <Box sx={{ mb: 1 }}>
          <Chip
            label={formatPaintingStatus(model.paintingStatus)}
            size='small'
            color={getPaintingStatusColor(model.paintingStatus)}
            variant='outlined'
          />
        </Box>

        {/* Model Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
          {model.pointsCost && (
            <Typography variant='caption' color='text.secondary'>
              {model.pointsCost} pts
            </Typography>
          )}
          {model.purchasePrice && (
            <Typography variant='caption' color='text.secondary'>
              ${model.purchasePrice.toFixed(2)}
            </Typography>
          )}
        </Box>

        {/* Tags */}
        {model.tags && model.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
            {model.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size='small'
                variant='outlined'
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            ))}
            {model.tags.length > 3 && (
              <Chip
                label={`+${model.tags.length - 3} more`}
                size='small'
                variant='outlined'
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        )}

        {/* Owner Information */}
        {showOwner && model.collection?.user && (
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}
          >
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
              {model.collection.user.displayName?.[0] ||
                model.collection.user.username?.[0] ||
                '?'}
            </Avatar>
            <Typography variant='caption' color='text.secondary'>
              {model.collection.user.displayName ||
                model.collection.user.username}
            </Typography>
          </Box>
        )}

        {/* Created Date */}
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ mt: 1, display: 'block' }}
        >
          Added{' '}
          {formatDistanceToNow(new Date(model.createdAt), { addSuffix: true })}
        </Typography>
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={e => e.stopPropagation()}
      >
        {onView && (
          <MenuItem onClick={handleCardClick}>
            <ViewIcon sx={{ mr: 1 }} fontSize='small' />
            View Details
          </MenuItem>
        )}
        {canEdit && (
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} fontSize='small' />
            Edit Model
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={handleDelete}>
            <DeleteIcon sx={{ mr: 1 }} fontSize='small' />
            Delete Model
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default ModelCard;
