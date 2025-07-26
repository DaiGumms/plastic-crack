import { useAuthStore } from '../store/authStore';

class TokenRefreshService {
  private intervalId: number | null = null;
  private readonly REFRESH_INTERVAL = 15 * 60 * 1000; // Check every 15 minutes

  public start(): void {
    if (this.intervalId) {
      return; // Already running
    }

    this.intervalId = setInterval(() => {
      this.checkAndRefreshToken();
    }, this.REFRESH_INTERVAL);

    // Also check immediately on start
    this.checkAndRefreshToken();
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkAndRefreshToken(): Promise<void> {
    const {
      isAuthenticated,
      shouldRefreshToken,
      refreshAccessToken,
      accessToken,
    } = useAuthStore.getState();

    // Only refresh if user is authenticated and has a token
    if (!isAuthenticated || !accessToken) {
      return;
    }

    // Check if token should be refreshed
    if (shouldRefreshToken()) {
      try {
        await refreshAccessToken();
        console.debug('Token refreshed successfully in background');
      } catch (error) {
        console.error('Background token refresh failed:', error);
      }
    }
  }
}

export const tokenRefreshService = new TokenRefreshService();
export default tokenRefreshService;
