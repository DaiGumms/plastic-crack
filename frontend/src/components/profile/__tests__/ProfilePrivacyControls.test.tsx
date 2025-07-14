import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { vi } from 'vitest';
import { ProfilePrivacyControls } from '../ProfilePrivacyControls';
import type { PrivacySettings } from '../ProfilePrivacyControls';

const renderWithTheme = (component: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const defaultSettings: PrivacySettings = {
  showEmail: false,
  showLocation: true,
  showWebsite: true,
  showBio: true,
  allowFollowers: true,
  showFollowersCount: true,
  showFollowingCount: true,
  showModelsCount: true,
  showCollectionsCount: true,
};

describe('ProfilePrivacyControls', () => {
  it('renders all privacy control options', () => {
    const mockOnChange = vi.fn();

    renderWithTheme(
      <ProfilePrivacyControls
        settings={defaultSettings}
        onSettingsChange={mockOnChange}
      />
    );

    expect(screen.getByText('Privacy Controls')).toBeInTheDocument();
    expect(screen.getByTestId('privacy-show-email')).toBeInTheDocument();
    expect(screen.getByTestId('privacy-show-location')).toBeInTheDocument();
    expect(screen.getByTestId('privacy-show-website')).toBeInTheDocument();
    expect(screen.getByTestId('privacy-show-bio')).toBeInTheDocument();
    expect(screen.getByTestId('privacy-allow-followers')).toBeInTheDocument();
    expect(
      screen.getByTestId('privacy-show-followers-count')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('privacy-show-following-count')
    ).toBeInTheDocument();
    expect(screen.getByTestId('privacy-show-models-count')).toBeInTheDocument();
    expect(
      screen.getByTestId('privacy-show-collections-count')
    ).toBeInTheDocument();
  });

  it('reflects current settings state', () => {
    const mockOnChange = vi.fn();

    renderWithTheme(
      <ProfilePrivacyControls
        settings={defaultSettings}
        onSettingsChange={mockOnChange}
      />
    );

    expect(
      screen.getByTestId('privacy-show-email').querySelector('input')
    ).not.toBeChecked();
    expect(
      screen.getByTestId('privacy-show-location').querySelector('input')
    ).toBeChecked();
    expect(
      screen.getByTestId('privacy-show-website').querySelector('input')
    ).toBeChecked();
    expect(
      screen.getByTestId('privacy-show-bio').querySelector('input')
    ).toBeChecked();
    expect(
      screen.getByTestId('privacy-allow-followers').querySelector('input')
    ).toBeChecked();
    expect(
      screen.getByTestId('privacy-show-followers-count').querySelector('input')
    ).toBeChecked();
    expect(
      screen.getByTestId('privacy-show-following-count').querySelector('input')
    ).toBeChecked();
    expect(
      screen.getByTestId('privacy-show-models-count').querySelector('input')
    ).toBeChecked();
    expect(
      screen
        .getByTestId('privacy-show-collections-count')
        .querySelector('input')
    ).toBeChecked();
  });

  it('calls onSettingsChange when a setting is toggled', () => {
    const mockOnChange = vi.fn();

    renderWithTheme(
      <ProfilePrivacyControls
        settings={defaultSettings}
        onSettingsChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByTestId('privacy-show-email'));

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultSettings,
      showEmail: true,
    });
  });

  it('disables followers count when allow followers is disabled', () => {
    const settingsWithoutFollowers: PrivacySettings = {
      ...defaultSettings,
      allowFollowers: false,
    };
    const mockOnChange = vi.fn();

    renderWithTheme(
      <ProfilePrivacyControls
        settings={settingsWithoutFollowers}
        onSettingsChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('privacy-show-followers-count')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('disables all controls when loading', () => {
    const mockOnChange = vi.fn();

    renderWithTheme(
      <ProfilePrivacyControls
        settings={defaultSettings}
        onSettingsChange={mockOnChange}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('privacy-show-email')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByTestId('privacy-show-location')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByTestId('privacy-show-website')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByTestId('privacy-show-bio')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByTestId('privacy-allow-followers')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByTestId('privacy-show-followers-count')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByTestId('privacy-show-following-count')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByTestId('privacy-show-models-count')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(
      screen.getByTestId('privacy-show-collections-count')
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles multiple setting changes correctly', () => {
    const mockOnChange = vi.fn();

    renderWithTheme(
      <ProfilePrivacyControls
        settings={defaultSettings}
        onSettingsChange={mockOnChange}
      />
    );

    // Toggle email
    fireEvent.click(screen.getByTestId('privacy-show-email'));
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultSettings,
      showEmail: true,
    });

    // Toggle location
    fireEvent.click(screen.getByTestId('privacy-show-location'));
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultSettings,
      showLocation: false,
    });

    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('shows informational alert about privacy settings', () => {
    const mockOnChange = vi.fn();

    renderWithTheme(
      <ProfilePrivacyControls
        settings={defaultSettings}
        onSettingsChange={mockOnChange}
      />
    );

    expect(
      screen.getByText(/These settings only affect your public profile/)
    ).toBeInTheDocument();
  });
});
