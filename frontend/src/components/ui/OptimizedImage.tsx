import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import { ImageNotSupported } from '@mui/icons-material';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  lazy?: boolean;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  lazy = true,
  placeholder,
  fallback,
  className,
  style,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [inView, setInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, inView]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  const defaultPlaceholder = (
    <Skeleton
      variant='rectangular'
      width={width || '100%'}
      height={height || 200}
      animation='wave'
    />
  );

  const defaultFallback = (
    <Box
      sx={{
        width: width || '100%',
        height: height || 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'grey.100',
        color: 'grey.400',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <ImageNotSupported sx={{ fontSize: 48 }} />
      <Box sx={{ fontSize: '0.875rem', textAlign: 'center' }}>
        Unable to load image
      </Box>
    </Box>
  );

  return (
    <Box
      ref={containerRef}
      className={className}
      style={style}
      sx={{
        position: 'relative',
        width: width || '100%',
        height: height || 'auto',
        overflow: 'hidden',
      }}
    >
      {/* Show placeholder while not loaded */}
      {!isLoaded && !hasError && (placeholder || defaultPlaceholder)}

      {/* Show fallback on error */}
      {hasError && (fallback || defaultFallback)}

      {/* Actual image */}
      {inView && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isLoaded ? 'block' : 'none',
          }}
        />
      )}
    </Box>
  );
};

// Higher-order component for responsive images
interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'src'> {
  srcSet: {
    small: string;
    medium: string;
    large: string;
  };
  sizes?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  srcSet,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(srcSet.medium);

  useEffect(() => {
    const updateImageSrc = () => {
      const width = window.innerWidth;
      if (width <= 600) {
        setCurrentSrc(srcSet.small);
      } else if (width <= 1200) {
        setCurrentSrc(srcSet.medium);
      } else {
        setCurrentSrc(srcSet.large);
      }
    };

    updateImageSrc();
    window.addEventListener('resize', updateImageSrc);
    return () => window.removeEventListener('resize', updateImageSrc);
  }, [srcSet]);

  return <OptimizedImage src={currentSrc} {...props} />;
};
