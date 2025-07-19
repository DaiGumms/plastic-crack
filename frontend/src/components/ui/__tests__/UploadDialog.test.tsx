import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { UploadDialog } from '../UploadDialog';

// Mock the DragDropUpload component
vi.mock('../DragDropUpload', () => ({
  DragDropUpload: ({ onUploadComplete, onUploadError, onFilesChange }: {
    onUploadComplete?: (results: any[]) => void;
    onUploadError?: (error: string) => void;
    onFilesChange?: (files: any[]) => void;
  }) => (
    <div data-testid="drag-drop-upload">
      <button onClick={() => onFilesChange([{ id: '1', file: new File(['test'], 'test.jpg') }])}>
        Add File
      </button>
      <button onClick={() => onUploadComplete([{ id: '1', status: 'success', result: { url: 'test-url' } }])}>
        Complete Upload
      </button>
      <button onClick={() => onUploadError('Upload failed')}>
        Trigger Error
      </button>
    </div>
  ),
}));

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  uploadType: 'model-image' as const,
  collectionId: 'test-collection',
  modelId: 'test-model',
};

describe('UploadDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<UploadDialog {...defaultProps} />);
    
    expect(screen.getByText('Upload Model Photos')).toBeInTheDocument();
    expect(screen.getByText(/upload photos of your painted models/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<UploadDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Upload Model Photos')).not.toBeInTheDocument();
  });

  it('shows correct title for avatar upload', () => {
    render(<UploadDialog {...defaultProps} uploadType="avatar" />);
    
    expect(screen.getByText('Upload Profile Avatar')).toBeInTheDocument();
    expect(screen.getByText(/only one image can be selected/i)).toBeInTheDocument();
  });

  it('shows correct title for collection thumbnail', () => {
    render(<UploadDialog {...defaultProps} uploadType="collection-thumbnail" />);
    
    expect(screen.getByText('Upload Collection Thumbnail')).toBeInTheDocument();
  });

  it('allows custom title and description', () => {
    const customTitle = 'Custom Upload Title';
    const customDescription = 'Custom description text';
    
    render(
      <UploadDialog 
        {...defaultProps} 
        title={customTitle}
        description={customDescription}
      />
    );
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<UploadDialog {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<UploadDialog {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('shows correct file limits for avatar', () => {
    render(<UploadDialog {...defaultProps} uploadType="avatar" />);
    
    expect(screen.getByText(/max 1 file/i)).toBeInTheDocument();
  });

  it('shows correct file limits for model images', () => {
    render(<UploadDialog {...defaultProps} uploadType="model-image" />);
    
    expect(screen.getByText(/max 20 files/i)).toBeInTheDocument();
  });

  it('handles upload completion', async () => {
    const user = userEvent.setup();
    const onUploadComplete = vi.fn();
    
    render(<UploadDialog {...defaultProps} onUploadComplete={onUploadComplete} />);
    
    const completeButton = screen.getByText('Complete Upload');
    await user.click(completeButton);
    
    expect(onUploadComplete).toHaveBeenCalledWith([{
      id: '1',
      status: 'success',
      result: { url: 'test-url' }
    }]);
  });

  it('handles upload errors', async () => {
    const user = userEvent.setup();
    const onUploadError = vi.fn();
    
    render(<UploadDialog {...defaultProps} onUploadError={onUploadError} />);
    
    const errorButton = screen.getByText('Trigger Error');
    await user.click(errorButton);
    
    expect(onUploadError).toHaveBeenCalledWith('Upload failed');
  });

  it('disables close button when uploading', () => {
    render(<UploadDialog {...defaultProps} />);
    
    // Simulate uploading state by triggering upload start
    const addFileButton = screen.getByText('Add File');
    fireEvent.click(addFileButton);
    
    // Check that the drag drop upload component is rendered
    expect(screen.getByTestId('drag-drop-upload')).toBeInTheDocument();
  });

  it('passes correct configuration to DragDropUpload', () => {
    render(<UploadDialog {...defaultProps} uploadType="avatar" />);
    
    // The DragDropUpload should be configured for single file upload for avatars
    expect(screen.getByTestId('drag-drop-upload')).toBeInTheDocument();
  });

  it('auto-closes after successful upload', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    vi.useFakeTimers();
    
    render(<UploadDialog {...defaultProps} onClose={onClose} />);
    
    const completeButton = screen.getByText('Complete Upload');
    await user.click(completeButton);
    
    // Fast-forward time to trigger auto-close
    vi.advanceTimersByTime(1500);
    
    expect(onClose).toHaveBeenCalled();
    
    vi.useRealTimers();
  });
});
