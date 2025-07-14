import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CollectionForm } from '../CollectionForm';
import type { Collection } from '../../../types';

const mockCollection: Collection = {
  id: 'test-collection-1',
  name: 'Test Collection',
  description: 'A test collection for unit testing',
  isPublic: true,
  userId: 'user-1',
  tags: ['warhammer', 'painting'],
  imageUrl: 'https://example.com/image.jpg',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

const mockProps = {
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  loading: false,
  error: null,
};

describe('CollectionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create form correctly', () => {
    render(<CollectionForm {...mockProps} />);

    expect(screen.getByText('Create New Collection')).toBeInTheDocument();
    expect(screen.getByLabelText(/collection name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cover image url/i)).toBeInTheDocument();
    expect(screen.getByText(/public collection/i)).toBeInTheDocument();
  });

  it('renders edit form correctly', () => {
    render(<CollectionForm {...mockProps} collection={mockCollection} />);

    expect(screen.getByText('Edit Collection')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Collection')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A test collection for unit testing')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/image.jpg')).toBeInTheDocument();
  });

  it('displays existing tags when editing', () => {
    render(<CollectionForm {...mockProps} collection={mockCollection} />);

    expect(screen.getByText('warhammer')).toBeInTheDocument();
    expect(screen.getByText('painting')).toBeInTheDocument();
  });

  it('allows adding new tags', async () => {
    const user = userEvent.setup();
    render(<CollectionForm {...mockProps} />);

    const tagInput = screen.getByPlaceholderText('Add a tag');
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(tagInput, 'test-tag');
    await user.click(addButton);

    expect(screen.getByText('test-tag')).toBeInTheDocument();
  });

  it('allows adding tags by pressing Enter', async () => {
    const user = userEvent.setup();
    render(<CollectionForm {...mockProps} />);

    const tagInput = screen.getByPlaceholderText('Add a tag');

    await user.type(tagInput, 'enter-tag');
    await user.keyboard('{Enter}');

    expect(screen.getByText('enter-tag')).toBeInTheDocument();
  });

  it('allows removing tags', async () => {
    const user = userEvent.setup();
    render(<CollectionForm {...mockProps} collection={mockCollection} />);

    const removeWarhammerTag = screen.getByLabelText(/remove warhammer/i);
    await user.click(removeWarhammerTag);

    expect(screen.queryByText('warhammer')).not.toBeInTheDocument();
    expect(screen.getByText('painting')).toBeInTheDocument();
  });

  it('prevents duplicate tags', async () => {
    const user = userEvent.setup();
    render(<CollectionForm {...mockProps} collection={mockCollection} />);

    const tagInput = screen.getByPlaceholderText('Add a tag');
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(tagInput, 'warhammer');
    await user.click(addButton);

    // Should still only have one "warhammer" tag
    expect(screen.getAllByText('warhammer')).toHaveLength(1);
  });

  it('enforces tag limit of 20', async () => {
    const user = userEvent.setup();
    const collectionWithMaxTags = {
      ...mockCollection,
      tags: Array.from({ length: 20 }, (_, i) => `tag-${i}`),
    };
    render(<CollectionForm {...mockProps} collection={collectionWithMaxTags} />);

    const tagInput = screen.getByPlaceholderText('Add a tag');
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(tagInput, 'extra-tag');

    expect(addButton).toBeDisabled();
    expect(tagInput).toBeDisabled();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<CollectionForm {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /create collection/i });
    
    // Submit button should be disabled when name is empty
    expect(submitButton).toBeDisabled();

    // Fill in the name
    await user.type(screen.getByLabelText(/collection name/i), 'New Collection');

    // Submit button should now be enabled
    expect(submitButton).not.toBeDisabled();
  });

  it('validates URL format for image URL', async () => {
    const user = userEvent.setup();
    render(<CollectionForm {...mockProps} />);

    const nameInput = screen.getByLabelText(/collection name/i);
    const imageUrlInput = screen.getByLabelText(/cover image url/i);

    await user.type(nameInput, 'Test Collection');
    await user.type(imageUrlInput, 'invalid-url');

    await waitFor(() => {
      expect(screen.getByText(/invalid url/i)).toBeInTheDocument();
    });
  });

  it('toggles privacy setting', async () => {
    const user = userEvent.setup();
    render(<CollectionForm {...mockProps} />);

    const privateSwitch = screen.getByRole('switch');
    expect(screen.getByText(/public collection/i)).toBeInTheDocument();

    await user.click(privateSwitch);

    expect(screen.getByText(/private collection/i)).toBeInTheDocument();
  });

  it('calls onSubmit with correct data when creating', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CollectionForm {...mockProps} onSubmit={mockOnSubmit} />);

    // Fill in form
    await user.type(screen.getByLabelText(/collection name/i), 'New Collection');
    await user.type(screen.getByLabelText(/description/i), 'Test description');
    
    // Add a tag
    await user.type(screen.getByPlaceholderText('Add a tag'), 'test-tag');
    await user.click(screen.getByRole('button', { name: /add/i }));

    // Submit form
    await user.click(screen.getByRole('button', { name: /create collection/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Collection',
        description: 'Test description',
        isPublic: true,
        tags: ['test-tag'],
        imageUrl: undefined,
      });
    });
  });

  it('calls onSubmit with correct data when editing', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CollectionForm {...mockProps} collection={mockCollection} onSubmit={mockOnSubmit} />);

    // Modify the name
    const nameInput = screen.getByDisplayValue('Test Collection');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Collection');

    // Submit form
    await user.click(screen.getByRole('button', { name: /update collection/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Updated Collection',
        description: 'A test collection for unit testing',
        isPublic: true,
        tags: ['warhammer', 'painting'],
        imageUrl: 'https://example.com/image.jpg',
      });
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CollectionForm {...mockProps} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    render(<CollectionForm {...mockProps} loading={true} />);

    expect(screen.getByText(/saving.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving.../i })).toBeDisabled();
  });

  it('displays error message', () => {
    render(<CollectionForm {...mockProps} error="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('resets form when closed', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CollectionForm {...mockProps} />);

    // Add some data
    await user.type(screen.getByLabelText(/collection name/i), 'Test');
    await user.type(screen.getByPlaceholderText('Add a tag'), 'test-tag');
    await user.click(screen.getByRole('button', { name: /add/i }));

    // Close and reopen
    rerender(<CollectionForm {...mockProps} open={false} />);
    rerender(<CollectionForm {...mockProps} open={true} />);

    // Form should be reset
    expect(screen.getByLabelText(/collection name/i)).toHaveValue('');
    expect(screen.queryByText('test-tag')).not.toBeInTheDocument();
  });
});
