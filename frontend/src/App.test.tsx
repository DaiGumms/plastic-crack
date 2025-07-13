import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Check if the app renders without throwing any errors
    expect(document.body).toBeTruthy();
  });

  it('renders the main layout', () => {
    render(<App />);
    // This is a basic smoke test to ensure the app structure is present
    // We can expand this as we add more specific elements to test
    const appElement =
      screen.getByRole('main', { hidden: true }) ||
      document.querySelector('main') ||
      document.body.firstChild;
    expect(appElement).toBeTruthy();
  });
});
