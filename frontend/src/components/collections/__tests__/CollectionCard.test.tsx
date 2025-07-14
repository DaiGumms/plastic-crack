import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CollectionCard } from '../CollectionCard';
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
  user: {
    id: 'user-1',
    username: 'testuser',
    displayName: 'Test User',
    profileImageUrl: 'https://example.com/avatar.jpg',
  },
  _count: {
    models: 5,
  },
};

const mockProps = {
  collection: mockCollection,
  showOwner: true,
  currentUserId: 'user-1',
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onView: vi.fn(),
};

describe('CollectionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders collection information correctly', () => {
    render(<CollectionCard {...mockProps} />);

    expect(screen.getByText('Test Collection')).toBeInTheDocument();
    expect(screen.getByText('A test collection for unit testing')).toBeInTheDocument();
    expect(screen.getByText('5 models')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays collection image when provided', () => {
    render(<CollectionCard {...mockProps} />);

    const image = screen.getByRole('img', { name: 'Test Collection' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('displays default icon when no image provided', () => {
    const collectionWithoutImage = { ...mockCollection, imageUrl: undefined };
    render(<CollectionCard {...mockProps} collection={collectionWithoutImage} />);

    expect(screen.queryByRole('img', { name: 'Test Collection' })).not.toBeInTheDocument();
  });

  it('shows public indicator for public collections', () => {
    render(<CollectionCard {...mockProps} />);

    expect(screen.getByTitle('Public Collection')).toBeInTheDocument();
  });

  it('shows private indicator for private collections', () => {
    const privateCollection = { ...mockCollection, isPublic: false };
    render(<CollectionCard {...mockProps} collection={privateCollection} />);

    expect(screen.getByTitle('Private Collection')).toBeInTheDocument();
  });

  it('displays tags correctly', () => {
    render(<CollectionCard {...mockProps} />);

    expect(screen.getByText('warhammer')).toBeInTheDocument();
    expect(screen.getByText('painting')).toBeInTheDocument();
  });

  it('shows "+X more" when there are more than 3 tags', () => {
    const collectionWithManyTags = {
      ...mockCollection,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };
    render(<CollectionCard {...mockProps} collection={collectionWithManyTags} />);

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('calls onView when card is clicked', async () => {
    const user = userEvent.setup();
    render(<CollectionCard {...mockProps} />);

    await user.click(screen.getByText('Test Collection'));
    expect(mockProps.onView).toHaveBeenCalledWith(mockCollection);
  });

  it('shows edit and delete options for collection owner', async () => {
    const user = userEvent.setup();
    render(<CollectionCard {...mockProps} />);

    // Click the menu button
    await user.click(screen.getByRole('button', { name: /more/i }));

    expect(screen.getByText('Edit Collection')).toBeInTheDocument();
    expect(screen.getByText('Delete Collection')).toBeInTheDocument();
  });

  it('does not show menu for non-owners', () => {
    const nonOwnerProps = { ...mockProps, currentUserId: 'different-user' };
    render(<CollectionCard {...nonOwnerProps} />);

    expect(screen.queryByRole('button', { name: /more/i })).not.toBeInTheDocument();
  });

  it('calls onEdit when edit menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<CollectionCard {...mockProps} />);

    await user.click(screen.getByRole('button', { name: /more/i }));
    await user.click(screen.getByText('Edit Collection'));

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockCollection);
  });

  it('calls onDelete when delete menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<CollectionCard {...mockProps} />);

    await user.click(screen.getByRole('button', { name: /more/i }));
    await user.click(screen.getByText('Delete Collection'));

    expect(mockProps.onDelete).toHaveBeenCalledWith(mockCollection);
  });

  it('prevents event propagation when menu is clicked', async () => {
    const user = userEvent.setup();
    render(<CollectionCard {...mockProps} />);

    await user.click(screen.getByRole('button', { name: /more/i }));

    // onView should not be called when clicking the menu
    expect(mockProps.onView).not.toHaveBeenCalled();
  });

  it('handles missing user information gracefully', () => {
    const collectionWithoutUser = { ...mockCollection, user: undefined };
    render(<CollectionCard {...mockProps} collection={collectionWithoutUser} showOwner={true} />);

    expect(screen.getByText('Test Collection')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('shows model count of 1 with singular form', () => {
    const collectionWithOneModel = { ...mockCollection, _count: { models: 1 } };
    render(<CollectionCard {...mockProps} collection={collectionWithOneModel} />);

    expect(screen.getByText('1 model')).toBeInTheDocument();
  });

  it('hides owner information when showOwner is false', () => {
    render(<CollectionCard {...mockProps} showOwner={false} />);

    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });
});
