import { useEffect, useRef } from 'react';

// Hook for managing focus
export const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement | null>(null);

  const setFocus = (element: HTMLElement | null) => {
    if (element && element.focus) {
      // Small delay to ensure element is ready
      setTimeout(() => {
        element.focus();
      }, 100);
    }
  };

  const trapFocus = (containerElement: HTMLElement) => {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    containerElement.addEventListener('keydown', handleTabKey);
    return () => containerElement.removeEventListener('keydown', handleTabKey);
  };

  return { setFocus, trapFocus, focusRef };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          if (onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case 'ArrowUp':
          if (onArrowKeys) {
            event.preventDefault();
            onArrowKeys('up');
          }
          break;
        case 'ArrowDown':
          if (onArrowKeys) {
            event.preventDefault();
            onArrowKeys('down');
          }
          break;
        case 'ArrowLeft':
          if (onArrowKeys) {
            event.preventDefault();
            onArrowKeys('left');
          }
          break;
        case 'ArrowRight':
          if (onArrowKeys) {
            event.preventDefault();
            onArrowKeys('right');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onEscape, onArrowKeys]);
};

// Hook for screen reader announcements
export const useScreenReader = () => {
  const announce = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after a short delay
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
};

// Hook for reduced motion preferences
export const useReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  return prefersReducedMotion;
};

// Utility for generating accessible IDs
let idCounter = 0;
export const generateId = (prefix = 'id') => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};
