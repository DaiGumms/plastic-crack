// Utility for persisting view mode preference
const VIEW_MODE_STORAGE_KEY = 'collections-view-mode';

export type ViewMode = 'grid' | 'list';

export const getPersistedViewMode = (): ViewMode => {
  try {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return (stored === 'list' || stored === 'grid') ? stored : 'grid';
  } catch {
    return 'grid';
  }
};

export const setPersistedViewMode = (viewMode: ViewMode): void => {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  } catch {
    // Silently fail if localStorage is not available
  }
};
