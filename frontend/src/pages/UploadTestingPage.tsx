import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { UploadExamples } from '../components';

const UploadTestingPage: React.FC = () => {
  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h3' component='h1' gutterBottom align='center'>
        Drag & Drop Upload Testing
      </Typography>

      <Typography
        variant='h6'
        color='text.secondary'
        align='center'
        sx={{ mb: 4 }}
      >
        Manual Testing Interface for Issue #27 Implementation
      </Typography>

      <Alert severity='info' sx={{ mb: 4 }}>
        <Typography variant='body2'>
          <strong>Testing Instructions:</strong> This page demonstrates all
          three upload types with proper configuration. Use this page to test
          the drag-and-drop functionality, file validation, progress tracking,
          and error handling.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Test Scenarios Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant='h5' gutterBottom>
            🧪 Test Scenarios
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' color='primary' gutterBottom>
              1. Avatar Upload Test (Single File)
            </Typography>
            <Typography variant='body2' sx={{ mb: 2 }}>
              • Upload limit: 1 file only
              <br />
              • Supported formats: JPEG, PNG, WebP
              <br />
              • Max size: 10MB
              <br />• Auto-close dialog after upload
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' color='primary' gutterBottom>
              2. Model Images Upload Test (Batch)
            </Typography>
            <Typography variant='body2' sx={{ mb: 2 }}>
              • Upload limit: Up to 10 files
              <br />
              • Batch processing with individual progress
              <br />
              • File removal before upload
              <br />• Individual error handling
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' color='primary' gutterBottom>
              3. Collection Thumbnails Upload Test (Batch)
            </Typography>
            <Typography variant='body2' sx={{ mb: 2 }}>
              • Upload limit: Up to 5 files
              <br />
              • Drag-and-drop functionality
              <br />
              • File validation feedback
              <br />• Progress indicators
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant='h6' color='error' gutterBottom>
              🚨 Error Testing Scenarios
            </Typography>
            <Typography variant='body2'>
              • Try uploading .txt, .pdf, or other non-image files
              <br />
              • Upload files larger than 10MB
              <br />
              • Test drag-and-drop with unsupported formats
              <br />• Verify error messages are user-friendly
            </Typography>
          </Box>
        </Paper>

        {/* Upload Examples Component */}
        <Paper sx={{ p: 3 }}>
          <Typography variant='h5' gutterBottom>
            🎯 Upload Components Demo
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Test all upload functionality below. Each component demonstrates
            different upload types and behaviors.
          </Typography>

          <UploadExamples />
        </Paper>

        {/* Testing Checklist */}
        <Paper sx={{ p: 3 }}>
          <Typography variant='h5' gutterBottom>
            ✅ Testing Checklist
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant='h6' gutterBottom>
                Functionality Tests
              </Typography>
              <Typography variant='body2' component='div'>
                □ Avatar upload (single file)
                <br />
                □ Model images upload (batch)
                <br />
                □ Collection thumbnails upload (batch)
                <br />
                □ Drag-and-drop visual feedback
                <br />
                □ File preview thumbnails
                <br />
                □ Progress bars display
                <br />□ Auto-close after upload
              </Typography>
            </Box>

            <Box>
              <Typography variant='h6' gutterBottom>
                Validation Tests
              </Typography>
              <Typography variant='body2' component='div'>
                □ JPEG files accepted
                <br />
                □ PNG files accepted
                <br />
                □ WebP files accepted
                <br />
                □ .txt files rejected
                <br />
                □ .pdf files rejected
                <br />□ Large files ({'>'}10MB) rejected
                <br />□ Empty files rejected
              </Typography>
            </Box>

            <Box>
              <Typography variant='h6' gutterBottom>
                Error Handling Tests
              </Typography>
              <Typography variant='body2' component='div'>
                □ Invalid file type errors
                <br />
                □ File size limit errors
                <br />
                □ Network error handling
                <br />
                □ Individual file errors in batch
                <br />
                □ User-friendly error messages
                <br />
                □ Graceful failure recovery
                <br />□ File removal functionality
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default UploadTestingPage;
