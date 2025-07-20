import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Skeleton,
  IconButton,
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight,
  Groups as FactionIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';
import { CollectionService } from '../services/collectionService';
import type { Collection } from '../types';

interface CollectionCarouselProps {
  /** Number of collections to fetch and display */
  limit?: number;
  /** Manual scroll step size */
  scrollStep?: number;
  /** Auto-scroll interval in milliseconds */
  autoScrollInterval?: number;
}

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  const theme = useTheme();

  // Don't render if essential data is missing
  if (!collection.user || !collection.gameSystem) {
    return null;
  }

  return (
    <Card
      sx={{
        minWidth: 280,
        maxWidth: 320,
        height: 200,
        mr: 2,
        flexShrink: 0,
        transition: 'all 0.3s ease-in-out',
        cursor: 'default',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with user info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={collection.user.profileImageUrl || undefined}
            sx={{ width: 32, height: 32, mr: 1.5 }}
          >
            {collection.user.displayName?.[0] || collection.user.username[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {collection.user.displayName || collection.user.username}
            </Typography>
          </Box>
        </Box>

        {/* Collection name */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {collection.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            flexGrow: 1,
            mb: 2,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
          }}
        >
          {collection.description}
        </Typography>

        {/* Game system */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center', mb: 1 }}>
          <Chip
            label={collection.gameSystem.shortName}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>

        {/* Factions */}
        {collection.factions && collection.factions.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center', mb: 1 }}>
            {collection.factions.slice(0, 2).map((faction) => (
              <Chip
                key={faction.id}
                icon={<FactionIcon sx={{ fontSize: '0.6rem' }} />}
                label={faction.name}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {collection.factions.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{collection.factions.length - 2} more factions
              </Typography>
            )}
          </Box>
        )}

        {/* Tags */}
        {collection.tags && collection.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
            {collection.tags.slice(0, 2).map((tag, index) => (
              <Chip
                key={index}
                icon={<TagIcon sx={{ fontSize: '0.6rem' }} />}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  backgroundColor: alpha(theme.palette.grey[500], 0.1),
                }}
              />
            ))}
            {collection.tags.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{collection.tags.length - 2} more tags
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const SkeletonCard: React.FC = () => (
  <Card
    sx={{
      minWidth: 280,
      maxWidth: 320,
      height: 200,
      mr: 2,
      flexShrink: 0,
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1.5 }} />
        <Skeleton variant="text" width={100} />
      </Box>
      <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Box>
    </CardContent>
  </Card>
);

export const CollectionCarousel: React.FC<CollectionCarouselProps> = ({
  limit = 50, // Limit to most recent 50 collections
  scrollStep = 320, // Width of one card + margin
  autoScrollInterval = 4000, // Auto-scroll every 4 seconds
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Fetch recent collections from public profiles only
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await CollectionService.getPublicCollections(1, limit, {
          // Sort by creation date (most recent first) - this happens by default in the API
        });
        
        // Filter to only show collections from users with public profiles and public collections
        const publicCollections = response.data.filter(collection => 
          collection.user && 
          collection.gameSystem && 
          collection.isPublic === true
        );
        
        setCollections(publicCollections);
        
        // Calculate max scroll based on number of collections
        const cardWidth = 320; // minWidth + margin
        const containerWidth = 1200; // Approximate container width
        const visibleCards = Math.floor(containerWidth / cardWidth);
        const totalScrollableWidth = Math.max(0, (publicCollections.length - visibleCards) * cardWidth);
        setMaxScroll(totalScrollableWidth);
      } catch (err) {
        console.error('Failed to fetch collections:', err);
        setError('Failed to load collections');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [limit]);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || isUserInteracting || collections.length === 0 || maxScroll === 0) {
      return;
    }

    const interval = setInterval(() => {
      setScrollPosition(prev => {
        const newPosition = prev + scrollStep;
        // Reset to beginning when we reach the end
        if (newPosition >= maxScroll) {
          return 0;
        }
        return newPosition;
      });
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [isPaused, isUserInteracting, collections.length, autoScrollInterval, scrollStep, maxScroll]);

  const scrollLeft = () => {
    setIsUserInteracting(true);
    setScrollPosition(prev => Math.max(0, prev - scrollStep));
    
    // Reset user interaction after a delay to resume auto-scroll
    setTimeout(() => setIsUserInteracting(false), 5000);
  };

  const scrollRight = () => {
    setIsUserInteracting(true);
    setScrollPosition(prev => Math.min(maxScroll, prev + scrollStep));
    
    // Reset user interaction after a delay to resume auto-scroll
    setTimeout(() => setIsUserInteracting(false), 5000);
  };

  if (error) {
    return null; // Silently fail for homepage
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          overflowX: 'hidden',
          py: 2,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </Box>
    );
  }

  if (collections.length === 0) {
    return null; // Don't show anything if no collections
  }

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        py: 2,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left scroll button */}
      <IconButton
        onClick={scrollLeft}
        disabled={scrollPosition === 0}
        sx={{
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          backgroundColor: 'background.paper',
          boxShadow: 2,
          width: 40,
          height: 40,
          '&:hover': {
            backgroundColor: 'grey.100',
          },
          '&.Mui-disabled': {
            opacity: 0.3,
          },
        }}
      >
        <ChevronLeft />
      </IconButton>

      {/* Right scroll button */}
      <IconButton
        onClick={scrollRight}
        disabled={scrollPosition >= maxScroll}
        sx={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          backgroundColor: 'background.paper',
          boxShadow: 2,
          width: 40,
          height: 40,
          '&:hover': {
            backgroundColor: 'grey.100',
          },
          '&.Mui-disabled': {
            opacity: 0.3,
          },
        }}
      >
        <ChevronRight />
      </IconButton>

      <Box
        sx={{
          display: 'flex',
          transition: 'transform 0.3s ease-in-out',
          transform: `translateX(-${scrollPosition}px)`,
          px: 6, // Add padding to account for scroll buttons
        }}
      >
        {collections
          .filter(collection => collection.user && collection.gameSystem) // Only show collections with complete data
          .map((collection, index) => (
            <CollectionCard
              key={`${collection.id}-${index}`}
              collection={collection}
            />
          ))}
      </Box>
    </Box>
  );
};
