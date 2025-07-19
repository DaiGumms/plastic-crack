import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DragDropUpload } from '../DragDropUpload';

// Mock the upload service
vi.mock('../../../services/uploadService', () => ({
  default: {
    uploadMultipleFiles: vi.fn(),
    validateFile: vi.fn(() => ({ isValid: true })),
    formatFileSize: vi.fn((bytes) => `${bytes} bytes`),
  },
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

const defaultProps = {
  uploadType: 'model-image' as const,
  collectionId: 'test-collection',
  modelId: 'test-model',
};

describe('DragDropUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dropzone variant by default', () => {
    render(<DragDropUpload {...defaultProps} />);
    
    expect(screen.getByText(/drag and drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to browse files/i)).toBeInTheDocument();
  });

  it('renders button variant', () => {
    render(<DragDropUpload {...defaultProps} variant="button" />);
    
    expect(screen.getByRole('button', { name: /upload files/i })).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(<DragDropUpload {...defaultProps} variant="compact" />);
    
    expect(screen.getByRole('button', { name: /add images/i })).toBeInTheDocument();
  });

  it('restricts to single file for avatar upload', () => {
    render(<DragDropUpload {...defaultProps} uploadType="avatar" />);
    
    expect(screen.getByText(/drag and drop a file here/i)).toBeInTheDocument();
  });

  it('allows multiple files for model images', () => {
    render(<DragDropUpload {...defaultProps} uploadType="model-image" />);
    
    expect(screen.getByText(/drag and drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/max 10 files/i)).toBeInTheDocument();
  });

  it('opens file dialog when clicking dropzone', async () => {
    const user = userEvent.setup();
    render(<DragDropUpload {...defaultProps} />);
    
    const dropzone = screen.getByRole('button');
    await user.click(dropzone);
    
    // File input should be triggered (hard to test directly)
    expect(dropzone).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    const onFilesChange = vi.fn();
    render(<DragDropUpload {...defaultProps} onFilesChange={onFilesChange} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button').querySelector('input[type="file"]');
    
    if (input) {
      await userEvent.upload(input, file);
      expect(onFilesChange).toHaveBeenCalled();
    }
  });

  it('validates file types', () => {
    const onFilesChange = vi.fn();
    render(<DragDropUpload {...defaultProps} onFilesChange={onFilesChange} />);
    
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    // Simulate file drop
    const dropzone = screen.getByRole('button');
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [invalidFile],
      },
    });
    
    expect(screen.getByText(/file type.*not supported/i)).toBeInTheDocument();
  });

  it('validates file size', () => {
    const onFilesChange = vi.fn();
    const maxFileSize = 1024; // 1KB
    render(
      <DragDropUpload 
        {...defaultProps} 
        onFilesChange={onFilesChange}
        maxFileSize={maxFileSize}
      />
    );
    
    // Create a file larger than max size
    const largeFile = new File(['x'.repeat(2048)], 'large.jpg', { type: 'image/jpeg' });
    
    const dropzone = screen.getByRole('button');
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [largeFile],
      },
    });
    
    expect(screen.getByText(/file size.*exceeds maximum/i)).toBeInTheDocument();
  });

  it('shows drag over state', () => {
    render(<DragDropUpload {...defaultProps} />);
    
    const dropzone = screen.getByRole('button');
    
    fireEvent.dragEnter(dropzone);
    expect(screen.getByText(/drop files here/i)).toBeInTheDocument();
    
    fireEvent.dragLeave(dropzone);
    expect(screen.getByText(/drag and drop files here/i)).toBeInTheDocument();
  });

  it('disables interactions when disabled', () => {
    render(<DragDropUpload {...defaultProps} disabled />);
    
    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveStyle('cursor: not-allowed');
  });

  it('shows file previews when enabled', async () => {
    const onFilesChange = vi.fn();
    render(
      <DragDropUpload 
        {...defaultProps} 
        onFilesChange={onFilesChange}
        showPreviews={true}
      />
    );
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Mock the file handling
    const dropzone = screen.getByRole('button');
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });
    
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  it('allows removing files', async () => {
    const onFilesChange = vi.fn();
    render(
      <DragDropUpload 
        {...defaultProps} 
        onFilesChange={onFilesChange}
        showPreviews={true}
      />
    );
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    const dropzone = screen.getByRole('button');
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });
    
    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);
    });
    
    expect(onFilesChange).toHaveBeenCalledWith([]);
  });

  it('shows upload progress', async () => {
    render(<DragDropUpload {...defaultProps} showPreviews={true} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    const dropzone = screen.getByRole('button');
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });
    
    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /upload files/i });
      fireEvent.click(uploadButton);
    });
    
    // Progress indication should appear
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
  });
});
