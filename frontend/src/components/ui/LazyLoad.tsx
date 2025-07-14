import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Box, Skeleton } from '@mui/material';

interface LazyLoadProps {
  children: ReactNode;
  height?: number | string;
  placeholder?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  onIntersect?: () => void;
  className?: string;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  height = 200,
  placeholder,
  rootMargin = '50px',
  threshold = 0.1,
  onIntersect,
  className,
}) => {
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
          onIntersect?.();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin, threshold, hasIntersected, onIntersect]);

  const defaultPlaceholder = (
    <Skeleton
      variant='rectangular'
      width='100%'
      height={height}
      animation='wave'
    />
  );

  return (
    <Box
      ref={ref}
      className={className}
      sx={{
        width: '100%',
        minHeight: height,
      }}
    >
      {hasIntersected ? children : placeholder || defaultPlaceholder}
    </Box>
  );
};
