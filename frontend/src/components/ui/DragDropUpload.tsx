import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  LinearProgress,
  Chip,
  Alert,
  Stack,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  DeleteOutline as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import uploadService, {
  type UploadResponse,
} from '../../services/uploadService';

// Upload status for individual files
export interface UploadFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: {
    url: string;
    filename: string;
    size: number;
    dimensions?: { width: number; height: number };
  };
  description?: string;
}

export interface DragDropUploadProps {
  // Upload configuration
  uploadType: 'avatar' | 'collection-thumbnail' | 'model-image';
  collectionId?: string;
  modelId?: string;

  // UI configuration
  multiple?: boolean;
  maxFiles?: number;
  showPreviews?: boolean;
  showDescriptions?: boolean;
  disabled?: boolean;

  // File restrictions
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[]; // MIME types

  // Callbacks
  onUploadStart?: () => void;
  onUploadComplete?: (results: UploadFile[]) => void;
  onUploadError?: (error: string) => void;
  onFilesChange?: (files: UploadFile[]) => void;

  // Styling
  className?: string;
  height?: number | string;
  variant?: 'dropzone' | 'button' | 'compact';
}

const defaultAcceptedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const defaultMaxFileSize = 10 * 1024 * 1024; // 10MB

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  uploadType,
  collectionId,
  modelId,
  multiple = true,
  maxFiles = 10,
  showPreviews = true,
  showDescriptions = false,
  disabled = false,
  maxFileSize = defaultMaxFileSize,
  acceptedFileTypes = defaultAcceptedTypes,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  onFilesChange,
  className,
  height = 200,
  variant = 'dropzone',
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<UploadFile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const createFileObject = useCallback((file: File): UploadFile => {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
      description: '',
    };
  }, []);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedFileTypes.includes(file.type)) {
        return `File type ${file.type} is not supported. Accepted types: ${acceptedFileTypes.join(', ')}`;
      }

      if (file.size > maxFileSize) {
        return `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum size of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
      }

      return null;
    },
    [acceptedFileTypes, maxFileSize]
  );

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: UploadFile[] = [];
      const errors: string[] = [];

      // Check if we're exceeding max files
      if (!multiple && fileArray.length > 1) {
        setError('Only one file can be uploaded at a time');
        return;
      }

      const totalFiles = files.length + fileArray.length;
      if (totalFiles > maxFiles) {
        setError(
          `Cannot upload more than ${maxFiles} files. Currently have ${files.length} files.`
        );
        return;
      }

      fileArray.forEach(file => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
        } else {
          validFiles.push(createFileObject(file));
        }
      });

      if (errors.length > 0) {
        setError(errors.join('\n'));
        return;
      }

      setError(null);
      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    },
    [files, multiple, maxFiles, validateFile, createFileObject, onFilesChange]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounterRef.current = 0;

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [disabled, handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        handleFiles(selectedFiles);
      }
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (fileId: string) => {
      setFiles(prevFiles => {
        const updatedFiles = prevFiles.filter(f => f.id !== fileId);
        onFilesChange?.(updatedFiles);
        return updatedFiles;
      });
    },
    [onFilesChange]
  );

  const updateFileDescription = useCallback(
    (fileId: string, description: string) => {
      setFiles(prevFiles =>
        prevFiles.map(f => (f.id === fileId ? { ...f, description } : f))
      );
    },
    []
  );

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Upload implementation
  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    onUploadStart?.();

    // Update all files to uploading status
    setFiles(prevFiles =>
      prevFiles.map(f => ({ ...f, status: 'uploading' as const, progress: 0 }))
    );

    const metadata = {
      type: uploadType,
      collectionId,
      modelId,
    };

    try {
      await uploadService.uploadMultipleFiles(
        files,
        metadata,
        false, // Use regular upload, not responsive
        // On file progress
        (fileId, progress) => {
          setFiles(prevFiles =>
            prevFiles.map(f => (f.id === fileId ? { ...f, progress } : f))
          );
        },
        // On file complete
        (fileId, result) => {
          const uploadResult = result as UploadResponse;
          setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === fileId
                ? {
                    ...f,
                    status: 'success' as const,
                    progress: 100,
                    result: uploadResult.data,
                  }
                : f
            )
          );
        },
        // On file error
        (fileId, errorMessage) => {
          setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === fileId
                ? {
                    ...f,
                    status: 'error' as const,
                    error: errorMessage,
                  }
                : f
            )
          );
        }
      );

      // Use a longer delay and proper scheduling to ensure all state updates have been processed
      // This prevents the React setState warning
      setTimeout(() => {
        // Use requestAnimationFrame to ensure React rendering cycle is complete
        requestAnimationFrame(() => {
          setFiles(currentFiles => {
            // Check if all uploads were successful using current state
            const successfulUploads = currentFiles.filter(
              f => f.status === 'success'
            );

            // Schedule callbacks to run after this state update is complete
            setTimeout(() => {
              if (successfulUploads.length === currentFiles.length) {
                onUploadComplete?.(currentFiles);
              } else {
                onUploadError?.('Some files failed to upload');
              }
            }, 0);

            return currentFiles;
          });
        });
      }, 200);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);

      // Mark all files as failed
      setFiles(prevFiles =>
        prevFiles.map(f => ({
          ...f,
          status: 'error' as const,
          error: errorMessage,
        }))
      );

      // Call error callback after state update
      setTimeout(() => {
        onUploadError?.(errorMessage);
      }, 0);
    } finally {
      setIsUploading(false);
    }
  }, [
    files,
    uploadType,
    collectionId,
    modelId,
    onUploadStart,
    onUploadComplete,
    onUploadError,
  ]);

  // Render different variants
  const renderDropzone = () => (
    <Paper
      className={className}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        position: 'relative',
        height,
        border: 2,
        borderStyle: 'dashed',
        borderColor: isDragOver
          ? 'primary.main'
          : disabled
            ? 'grey.300'
            : 'grey.400',
        backgroundColor: isDragOver
          ? 'primary.50'
          : disabled
            ? 'grey.50'
            : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': disabled
          ? {}
          : {
              borderColor: 'primary.main',
              backgroundColor: 'primary.50',
            },
      }}
      onClick={openFileDialog}
    >
      <CloudUploadIcon
        sx={{
          fontSize: 48,
          color: disabled ? 'grey.400' : 'primary.main',
          mb: 2,
        }}
      />
      <Typography
        variant='h6'
        align='center'
        color={disabled ? 'text.disabled' : 'text.primary'}
        gutterBottom
      >
        {isDragOver
          ? 'Drop files here'
          : `Drag and drop ${multiple ? 'files' : 'a file'} here`}
      </Typography>
      <Typography variant='body2' align='center' color='text.secondary'>
        or click to browse files
      </Typography>
      <Typography
        variant='caption'
        align='center'
        color='text.secondary'
        sx={{ mt: 1 }}
      >
        Max file size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB
        {multiple && ` • Max ${maxFiles} files`}
      </Typography>
    </Paper>
  );

  const renderButton = () => (
    <Button
      variant='outlined'
      startIcon={<CloudUploadIcon />}
      onClick={openFileDialog}
      disabled={disabled}
      className={className}
    >
      {multiple ? 'Upload Files' : 'Upload File'}
    </Button>
  );

  const renderCompact = () => (
    <Box className={className}>
      <Button
        variant='contained'
        size='small'
        startIcon={<AddIcon />}
        onClick={openFileDialog}
        disabled={disabled}
      >
        Add Images
      </Button>
    </Box>
  );

  const renderPreviews = () => {
    if (!showPreviews || files.length === 0) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant='subtitle2' gutterBottom>
          Selected Files ({files.length}/{maxFiles})
        </Typography>
        <Stack spacing={2}>
          {files.map(uploadFile => (
            <Card key={uploadFile.id} variant='outlined'>
              <Box sx={{ display: 'flex' }}>
                <CardMedia
                  component='img'
                  sx={{ width: 120, height: 80, objectFit: 'cover' }}
                  image={uploadFile.preview}
                  alt={uploadFile.file.name}
                />
                <CardContent sx={{ flex: 1, py: 1 }}>
                  <Typography variant='body2' noWrap>
                    {uploadFile.file.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {(uploadFile.file.size / 1024 / 1024).toFixed(1)}MB
                  </Typography>
                  {uploadFile.status === 'uploading' && (
                    <LinearProgress
                      variant='determinate'
                      value={uploadFile.progress}
                      sx={{ mt: 1 }}
                    />
                  )}
                  {uploadFile.status === 'error' && (
                    <Typography variant='caption' color='error' sx={{ mt: 1 }}>
                      {uploadFile.error}
                    </Typography>
                  )}
                  {uploadFile.status === 'success' && (
                    <Chip
                      label='Uploaded'
                      color='success'
                      size='small'
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                <CardActions sx={{ flexDirection: 'column', py: 1 }}>
                  {showDescriptions && (
                    <IconButton
                      size='small'
                      onClick={() => setEditingFile(uploadFile)}
                      disabled={disabled}
                    >
                      <EditIcon fontSize='small' />
                    </IconButton>
                  )}
                  <IconButton
                    size='small'
                    onClick={() => removeFile(uploadFile.id)}
                    disabled={disabled || uploadFile.status === 'uploading'}
                    color='error'
                  >
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </CardActions>
              </Box>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  };

  const renderUploadActions = () => {
    if (files.length === 0) return null;

    return (
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant='contained'
          onClick={uploadFiles}
          disabled={
            disabled || isUploading || files.some(f => f.status === 'uploading')
          }
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Button>
        <Button
          variant='outlined'
          onClick={() => {
            setFiles([]);
            onFilesChange?.([]);
          }}
          disabled={disabled || isUploading}
        >
          Clear All
        </Button>
      </Box>
    );
  };

  return (
    <Box>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        multiple={multiple}
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Error display */}
      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          <pre
            style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}
          >
            {error}
          </pre>
        </Alert>
      )}

      {/* Main upload interface */}
      {variant === 'dropzone' && renderDropzone()}
      {variant === 'button' && renderButton()}
      {variant === 'compact' && renderCompact()}

      {/* File previews */}
      {renderPreviews()}

      {/* Upload actions */}
      {renderUploadActions()}

      {/* Edit description dialog */}
      {editingFile && (
        <Dialog
          open={Boolean(editingFile)}
          onClose={() => setEditingFile(null)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>
            Edit Image Description
            <IconButton
              onClick={() => setEditingFile(null)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              label='Description'
              value={editingFile.description || ''}
              onChange={e =>
                setEditingFile({ ...editingFile, description: e.target.value })
              }
              placeholder='Add a description for this image...'
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingFile(null)}>Cancel</Button>
            <Button
              variant='contained'
              onClick={() => {
                if (editingFile) {
                  updateFileDescription(
                    editingFile.id,
                    editingFile.description || ''
                  );
                  setEditingFile(null);
                }
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default DragDropUpload;
