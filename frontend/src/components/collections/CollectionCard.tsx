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
  Palette as PaletteIcon,
  Category as CategoryIcon,
  Groups as FactionIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Collection } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { getGameSystemIconFromCollection } from '../../utils/gameSystems';

interface CollectionCardProps {
  collection: Collection;
  showOwner?: boolean;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collection: Collection) => void;
  onView?: (collection: Collection) => void;
  currentUserId?: string;
  viewMode?: 'grid' | 'list';
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  showOwner = true,
  onEdit,
  onDelete,
  onView,
  currentUserId,
  viewMode = 'grid',
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const isOwner = currentUserId === collection.userId;
  const canEdit = isOwner && onEdit;
  const canDelete = isOwner && onDelete;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    if (onView) {
      onView(collection);
    } else {
      navigate(`/collections/${collection.id}`);
    }
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit?.(collection);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete?.(collection);
  };

  const modelCount =
    collection._count?.userModels || collection.userModels?.length || 0;

  return (
    <Card
      sx={{
        height: viewMode === 'grid' ? '100%' : 'auto',
        display: 'flex',
        flexDirection: viewMode === 'grid' ? 'column' : 'row',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        ...(viewMode === 'list' && {
          mb: 2,
        }),
      }}
      onClick={handleCardClick}
    >
      {/* Collection Image */}
      {collection.imageUrl ? (
        <CardMedia
          component='img'
          height={viewMode === 'grid' ? '200' : '120'}
          image={collection.imageUrl}
          alt={collection.name}
          sx={{
            objectFit: 'cover',
            width: viewMode === 'list' ? 200 : '100%',
            flexShrink: 0,
          }}
        />
      ) : (
        <Box
          sx={{
            height: viewMode === 'grid' ? 200 : 120,
            width: viewMode === 'list' ? 200 : '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {viewMode === 'grid' ? (
            <CategoryIcon sx={{ fontSize: 64, color: 'grey.400' }} />
          ) : (
            getGameSystemIconFromCollection(collection, {
              sx: { fontSize: 48 },
            })
          )}
        </Box>
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          position: 'relative',
          ...(viewMode === 'list' && {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            py: 2,
          }),
        }}
      >
        {/* Header with title and menu */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexGrow: 1,
              mr: 1,
            }}
          >
            {viewMode === 'grid' &&
              getGameSystemIconFromCollection(collection, {
                sx: { fontSize: 20, flexShrink: 0 },
              })}
            <Typography
              variant='h6'
              component='h3'
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
              {collection.name}
            </Typography>
          </Box>

          {/* Privacy indicator and menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip
              title={
                collection.isPublic ? 'Public Collection' : 'Private Collection'
              }
            >
              {collection.isPublic ? (
                <PublicIcon sx={{ fontSize: 18, color: 'success.main' }} />
              ) : (
                <PrivateIcon sx={{ fontSize: 18, color: 'warning.main' }} />
              )}
            </Tooltip>

            {(canEdit || canDelete) && (
              <>
                <IconButton
                  size='small'
                  onClick={handleMenuClick}
                  sx={{ ml: 0.5 }}
                >
                  <MoreVertIcon fontSize='small' />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  onClick={e => e.stopPropagation()}
                >
                  {canEdit && (
                    <MenuItem onClick={handleEdit}>Edit Collection</MenuItem>
                  )}
                  {canDelete && (
                    <MenuItem
                      onClick={handleDelete}
                      sx={{ color: 'error.main' }}
                    >
                      Delete Collection
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Box>
        </Box>

        {/* Description */}
        {collection.description && (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {collection.description}
          </Typography>
        )}

        {/* Factions */}
        {collection.factions && collection.factions.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', mb: 0.5 }}
            >
              Factions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {collection.factions.slice(0, 3).map(faction => (
                <Chip
                  key={faction.id}
                  icon={<FactionIcon sx={{ fontSize: '0.7rem' }} />}
                  label={faction.name}
                  size='small'
                  color='secondary'
                  variant='outlined'
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
              {collection.factions.length > 3 && (
                <Chip
                  label={`+${collection.factions.length - 3} more`}
                  size='small'
                  variant='outlined'
                  sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Tags */}
        {collection.tags && collection.tags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', mb: 0.5 }}
            >
              Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {collection.tags.slice(0, 3).map(tag => (
                <Chip
                  key={tag}
                  icon={<TagIcon sx={{ fontSize: '0.7rem' }} />}
                  label={tag}
                  size='small'
                  variant='outlined'
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
              {collection.tags.length > 3 && (
                <Chip
                  label={`+${collection.tags.length - 3} more`}
                  size='small'
                  variant='outlined'
                  sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Stats */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PaletteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant='body2' color='text.secondary'>
              {modelCount} {modelCount === 1 ? 'model' : 'models'}
            </Typography>
          </Box>
        </Box>

        {/* Owner info and date */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {showOwner && collection.user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={collection.user.profileImageUrl}
                sx={{ width: 24, height: 24 }}
              >
                {collection.user.displayName?.[0] ||
                  collection.user.username[0]}
              </Avatar>
              <Typography variant='caption' color='text.secondary'>
                {collection.user.displayName || collection.user.username}
              </Typography>
            </Box>
          )}

          <Typography variant='caption' color='text.secondary'>
            {formatDistanceToNow(new Date(collection.updatedAt), {
              addSuffix: true,
            })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CollectionCard;
