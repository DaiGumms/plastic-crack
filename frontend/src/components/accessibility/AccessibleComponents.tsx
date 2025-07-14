import React, { useId } from 'react';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';

interface AccessibleFormFieldProps extends Omit<TextFieldProps, 'id'> {
  label: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  description?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  helperText,
  errorText,
  required = false,
  description,
  error,
  ...textFieldProps
}) => {
  const id = useId();
  const helperTextId = helperText ? `${id}-helper` : undefined;
  const errorTextId = errorText ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  const ariaDescribedBy =
    [helperTextId, errorTextId, descriptionId].filter(Boolean).join(' ') ||
    undefined;

  return (
    <FormControl fullWidth error={error || !!errorText}>
      <FormLabel htmlFor={id} required={required}>
        {label}
      </FormLabel>

      {description && (
        <Typography
          id={descriptionId}
          variant='body2'
          color='text.secondary'
          sx={{ mt: 0.5, mb: 1 }}
        >
          {description}
        </Typography>
      )}

      <TextField
        {...textFieldProps}
        id={id}
        error={error || !!errorText}
        aria-describedby={ariaDescribedBy}
        aria-required={required}
        InputLabelProps={{
          shrink: true,
          ...textFieldProps.InputLabelProps,
        }}
      />

      {helperText && (
        <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
      )}

      {errorText && (
        <FormHelperText id={errorTextId} error>
          {errorText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

// Skip link component for keyboard navigation
export const SkipLink: React.FC<{
  href: string;
  children: React.ReactNode;
}> = ({ href, children }) => {
  return (
    <Box
      component='a'
      href={href}
      sx={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
        padding: '8px 16px',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        textDecoration: 'none',
        borderRadius: 1,
        '&:focus': {
          left: '16px',
          top: '16px',
        },
      }}
    >
      {children}
    </Box>
  );
};

// Screen reader only text
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Box
      component='span'
      sx={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }}
    >
      {children}
    </Box>
  );
};
