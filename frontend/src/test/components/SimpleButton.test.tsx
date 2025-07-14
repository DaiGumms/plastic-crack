import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Simple button component test that doesn't rely on external dependencies
describe('Basic Button Component', () => {
  // Test a simple button implementation
  const SimpleButton = ({
    children,
    onClick,
    disabled = false,
    variant = 'primary',
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      data-testid='simple-button'
    >
      {children}
    </button>
  );

  it('renders button with text', () => {
    render(<SimpleButton>Click me</SimpleButton>);

    expect(screen.getByText('Click me')).toBeDefined();
    expect(screen.getByTestId('simple-button')).toBeDefined();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };

    render(<SimpleButton onClick={handleClick}>Click me</SimpleButton>);

    const button = screen.getByTestId('simple-button');
    await user.click(button);

    expect(clicked).toBe(true);
  });

  it('can be disabled', () => {
    render(<SimpleButton disabled>Disabled Button</SimpleButton>);

    const button = screen.getByTestId('simple-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(
      <SimpleButton variant='primary'>Primary</SimpleButton>
    );

    let button = screen.getByTestId('simple-button');
    expect(button.className).toContain('btn-primary');

    rerender(<SimpleButton variant='secondary'>Secondary</SimpleButton>);

    button = screen.getByTestId('simple-button');
    expect(button.className).toContain('btn-secondary');
  });

  it('prevents click when disabled', async () => {
    const user = userEvent.setup();
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };

    render(
      <SimpleButton onClick={handleClick} disabled>
        Disabled
      </SimpleButton>
    );

    const button = screen.getByTestId('simple-button');
    await user.click(button);

    expect(clicked).toBe(false);
  });
});
