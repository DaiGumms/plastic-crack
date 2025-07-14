import { describe, it, expect } from 'vitest';

// Profile validation utilities that would be extracted from UserProfilePage
export const validateProfileForm = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}): string | null => {
  if (!formData.firstName.trim()) return 'First name is required';
  if (!formData.lastName.trim()) return 'Last name is required';
  if (!formData.email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    return 'Invalid email format';
  }
  if (formData.bio.length > 500) {
    return 'Bio must be 500 characters or less';
  }
  return null;
};

export const validateAvatarFile = (file: File): string | null => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return 'File must be JPEG, PNG, or WebP format';
  }

  if (file.size > maxSize) {
    return 'File size must be less than 5MB';
  }

  return null;
};

export const getDisplayName = (user: {
  firstName?: string;
  lastName?: string;
}): string => {
  const firstName = user.firstName?.trim() || '';
  const lastName = user.lastName?.trim() || '';

  if (!firstName && !lastName) return 'Anonymous User';
  if (!lastName) return firstName;
  if (!firstName) return lastName;

  return `${firstName} ${lastName}`;
};

export const getInitials = (user: {
  firstName?: string;
  lastName?: string;
}): string => {
  const firstName = user.firstName?.trim()[0]?.toUpperCase() || '';
  const lastName = user.lastName?.trim()[0]?.toUpperCase() || '';

  if (!firstName && !lastName) return '??';
  if (!lastName) return firstName + firstName;
  if (!firstName) return lastName + lastName;

  return firstName + lastName;
};

describe('Profile Validation Logic', () => {
  describe('validateProfileForm', () => {
    it('should return null for valid profile data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        bio: 'Software developer with 5 years of experience.',
      };

      const result = validateProfileForm(validData);
      expect(result).toBeNull();
    });

    it('should validate required first name', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: '',
      };

      const result = validateProfileForm(invalidData);
      expect(result).toBe('First name is required');
    });

    it('should validate first name with only whitespace', () => {
      const invalidData = {
        firstName: '   ',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: '',
      };

      const result = validateProfileForm(invalidData);
      expect(result).toBe('First name is required');
    });

    it('should validate required last name', () => {
      const invalidData = {
        firstName: 'John',
        lastName: '',
        email: 'john@example.com',
        bio: '',
      };

      const result = validateProfileForm(invalidData);
      expect(result).toBe('Last name is required');
    });

    it('should validate required email', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '',
        bio: '',
      };

      const result = validateProfileForm(invalidData);
      expect(result).toBe('Email is required');
    });

    it('should validate email format', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        'test@.com',
        'test@com',
      ];

      invalidEmails.forEach(email => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Doe',
          email,
          bio: '',
        };

        const result = validateProfileForm(invalidData);
        expect(result).toBe('Invalid email format');
      });
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test123@sub.domain.com',
      ];

      validEmails.forEach(email => {
        const validData = {
          firstName: 'John',
          lastName: 'Doe',
          email,
          bio: '',
        };

        const result = validateProfileForm(validData);
        expect(result).toBeNull();
      });
    });

    it('should validate bio length', () => {
      const longBio = 'a'.repeat(501);
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: longBio,
      };

      const result = validateProfileForm(invalidData);
      expect(result).toBe('Bio must be 500 characters or less');
    });

    it('should accept bio at maximum length', () => {
      const maxLengthBio = 'a'.repeat(500);
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: maxLengthBio,
      };

      const result = validateProfileForm(validData);
      expect(result).toBeNull();
    });
  });

  describe('validateAvatarFile', () => {
    it('should accept valid image files', () => {
      const jpegFile = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      const pngFile = new File([''], 'avatar.png', { type: 'image/png' });
      const webpFile = new File([''], 'avatar.webp', { type: 'image/webp' });

      expect(validateAvatarFile(jpegFile)).toBeNull();
      expect(validateAvatarFile(pngFile)).toBeNull();
      expect(validateAvatarFile(webpFile)).toBeNull();
    });

    it('should reject invalid file types', () => {
      const invalidFiles = [
        new File([''], 'doc.pdf', { type: 'application/pdf' }),
        new File([''], 'doc.txt', { type: 'text/plain' }),
        new File([''], 'video.mp4', { type: 'video/mp4' }),
        new File([''], 'image.gif', { type: 'image/gif' }),
      ];

      invalidFiles.forEach(file => {
        const result = validateAvatarFile(file);
        expect(result).toBe('File must be JPEG, PNG, or WebP format');
      });
    });

    it('should reject files that are too large', () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const result = validateAvatarFile(largeFile);
      expect(result).toBe('File size must be less than 5MB');
    });

    it('should accept files at maximum size', () => {
      // Create a file just under 5MB
      const maxSizeFile = new File(
        ['x'.repeat(5 * 1024 * 1024 - 1)],
        'max.jpg',
        {
          type: 'image/jpeg',
        }
      );

      const result = validateAvatarFile(maxSizeFile);
      expect(result).toBeNull();
    });
  });

  describe('getDisplayName', () => {
    it('should return full name when both names are present', () => {
      const user = { firstName: 'John', lastName: 'Doe' };
      expect(getDisplayName(user)).toBe('John Doe');
    });

    it('should return first name only when last name is missing', () => {
      const user = { firstName: 'John', lastName: '' };
      expect(getDisplayName(user)).toBe('John');
    });

    it('should return last name only when first name is missing', () => {
      const user = { firstName: '', lastName: 'Doe' };
      expect(getDisplayName(user)).toBe('Doe');
    });

    it('should return Anonymous User when both names are missing', () => {
      const user = { firstName: '', lastName: '' };
      expect(getDisplayName(user)).toBe('Anonymous User');
    });

    it('should handle undefined names', () => {
      const user = {};
      expect(getDisplayName(user)).toBe('Anonymous User');
    });

    it('should trim whitespace from names', () => {
      const user = { firstName: '  John  ', lastName: '  Doe  ' };
      expect(getDisplayName(user)).toBe('John Doe');
    });
  });

  describe('getInitials', () => {
    it('should return initials for both names', () => {
      const user = { firstName: 'John', lastName: 'Doe' };
      expect(getInitials(user)).toBe('JD');
    });

    it('should return doubled initial for first name only', () => {
      const user = { firstName: 'John', lastName: '' };
      expect(getInitials(user)).toBe('JJ');
    });

    it('should return doubled initial for last name only', () => {
      const user = { firstName: '', lastName: 'Doe' };
      expect(getInitials(user)).toBe('DD');
    });

    it('should return ?? when both names are missing', () => {
      const user = { firstName: '', lastName: '' };
      expect(getInitials(user)).toBe('??');
    });

    it('should handle undefined names', () => {
      const user = {};
      expect(getInitials(user)).toBe('??');
    });

    it('should handle lowercase names', () => {
      const user = { firstName: 'john', lastName: 'doe' };
      expect(getInitials(user)).toBe('JD');
    });

    it('should handle names with multiple words', () => {
      const user = { firstName: 'John Michael', lastName: 'Van Doe' };
      expect(getInitials(user)).toBe('JV');
    });
  });
});
