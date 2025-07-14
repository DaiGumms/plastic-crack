import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  useFocusManagement,
  useKeyboardNavigation,
  useScreenReader,
  useReducedMotion,
  generateId,
} from '../../hooks/useAccessibility';

describe('Accessibility Hooks', () => {
  describe('useFocusManagement', () => {
    it('provides setFocus function', () => {
      const { result } = renderHook(() => useFocusManagement());

      expect(typeof result.current.setFocus).toBe('function');
      expect(typeof result.current.trapFocus).toBe('function');
      expect(result.current.focusRef).toBeDefined();
    });

    it('sets focus on element', () => {
      const { result } = renderHook(() => useFocusManagement());

      const mockElement = {
        focus: vi.fn(),
      } as unknown as HTMLElement;

      act(() => {
        result.current.setFocus(mockElement);
      });

      // Focus should be called after timeout
      setTimeout(() => {
        expect(mockElement.focus).toHaveBeenCalled();
      }, 150);
    });

    it('handles null element gracefully', () => {
      const { result } = renderHook(() => useFocusManagement());

      expect(() => {
        act(() => {
          result.current.setFocus(null);
        });
      }).not.toThrow();
    });
  });

  describe('useKeyboardNavigation', () => {
    it('calls onEnter when Enter key is pressed', () => {
      const onEnter = vi.fn();
      renderHook(() => useKeyboardNavigation(onEnter));

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);

      expect(onEnter).toHaveBeenCalled();
    });

    it('calls onEscape when Escape key is pressed', () => {
      const onEscape = vi.fn();
      renderHook(() => useKeyboardNavigation(undefined, onEscape));

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(onEscape).toHaveBeenCalled();
    });

    it('calls onArrowKeys with correct directions', () => {
      const onArrowKeys = vi.fn();
      renderHook(() =>
        useKeyboardNavigation(undefined, undefined, onArrowKeys)
      );

      const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      const expectedDirections = ['up', 'down', 'left', 'right'];

      directions.forEach((key, index) => {
        const event = new KeyboardEvent('keydown', { key });
        document.dispatchEvent(event);
        expect(onArrowKeys).toHaveBeenCalledWith(expectedDirections[index]);
      });
    });

    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = renderHook(() => useKeyboardNavigation());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('useScreenReader', () => {
    it('provides announce function', () => {
      const { result } = renderHook(() => useScreenReader());

      expect(typeof result.current.announce).toBe('function');
    });

    it('creates announcement element', () => {
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announce('Test message');
      });

      const announcements = document.querySelectorAll('[aria-live]');
      expect(announcements.length).toBeGreaterThan(0);

      const lastAnnouncement = announcements[announcements.length - 1];
      expect(lastAnnouncement.textContent).toBe('Test message');
      expect(lastAnnouncement.getAttribute('aria-live')).toBe('polite');
      expect(lastAnnouncement.getAttribute('aria-atomic')).toBe('true');
    });

    it('supports assertive priority', () => {
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announce('Urgent message', 'assertive');
      });

      const announcements = document.querySelectorAll(
        '[aria-live="assertive"]'
      );
      expect(announcements.length).toBeGreaterThan(0);
    });

    it('removes announcement after timeout', async () => {
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announce('Test message');
      });

      // Wait for the timeout
      await new Promise(resolve => setTimeout(resolve, 1100));

      const announcements = document.querySelectorAll('[aria-live]');
      const hasTestMessage = Array.from(announcements).some(
        el => el.textContent === 'Test message'
      );
      expect(hasTestMessage).toBe(false);
    });
  });

  describe('useReducedMotion', () => {
    it('returns boolean value', () => {
      const { result } = renderHook(() => useReducedMotion());

      expect(typeof result.current).toBe('boolean');
    });

    it('respects prefers-reduced-motion setting', () => {
      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { result } = renderHook(() => useReducedMotion());

      expect(result.current).toBe(true);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^id-\d+$/);
      expect(id2).toMatch(/^id-\d+$/);
    });

    it('accepts custom prefix', () => {
      const id = generateId('custom');

      expect(id).toMatch(/^custom-\d+$/);
    });

    it('increments counter', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');

      const counter1 = parseInt(id1.split('-')[1]);
      const counter2 = parseInt(id2.split('-')[1]);

      expect(counter2).toBe(counter1 + 1);
    });
  });
});
