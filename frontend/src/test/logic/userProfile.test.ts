import { describe, it, expect } from 'vitest';

// User Profile Management Logic
describe('User Profile Logic', () => {
  describe('Profile Validation', () => {
    it('should validate profile update data', () => {
      const validateProfileUpdate = (data: {
        firstName: string;
        lastName: string;
        email: string;
        bio?: string;
      }) => {
        const errors: Record<string, string> = {};

        if (!data.firstName?.trim()) {
          errors.firstName = 'First name is required';
        }

        if (!data.lastName?.trim()) {
          errors.lastName = 'Last name is required';
        }

        if (!data.email?.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.email = 'Invalid email format';
        }

        if (data.bio && data.bio.length > 500) {
          errors.bio = 'Bio must be 500 characters or less';
        }

        return {
          isValid: Object.keys(errors).length === 0,
          errors,
        };
      };

      // Valid profile data
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        bio: 'Warhammer enthusiast',
      };

      const validResult = validateProfileUpdate(validData);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toEqual({});

      // Invalid profile data
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        email: 'invalid-email',
        bio: 'A'.repeat(501), // Too long
      };

      const invalidResult = validateProfileUpdate(invalidData);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.firstName).toBe('First name is required');
      expect(invalidResult.errors.email).toBe('Invalid email format');
      expect(invalidResult.errors.bio).toBe(
        'Bio must be 500 characters or less'
      );
    });

    it('should validate avatar upload requirements', () => {
      const validateAvatarFile = (file: {
        type: string;
        size: number;
        name: string;
      }) => {
        const errors: string[] = [];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
          errors.push('File must be JPEG, PNG, or WebP format');
        }

        if (file.size > maxSize) {
          errors.push('File size must be less than 5MB');
        }

        if (file.name.length > 255) {
          errors.push('Filename too long');
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      // Valid file
      const validFile = {
        type: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        name: 'avatar.jpg',
      };

      const validResult = validateAvatarFile(validFile);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toEqual([]);

      // Invalid file - wrong type
      const invalidType = {
        type: 'image/gif',
        size: 1024 * 1024,
        name: 'avatar.gif',
      };

      const typeResult = validateAvatarFile(invalidType);
      expect(typeResult.isValid).toBe(false);
      expect(typeResult.errors).toContain(
        'File must be JPEG, PNG, or WebP format'
      );

      // Invalid file - too large
      const tooLarge = {
        type: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB
        name: 'avatar.jpg',
      };

      const sizeResult = validateAvatarFile(tooLarge);
      expect(sizeResult.isValid).toBe(false);
      expect(sizeResult.errors).toContain('File size must be less than 5MB');
    });
  });

  describe('Profile Data Processing', () => {
    it('should format display name correctly', () => {
      const formatDisplayName = (firstName: string, lastName: string) => {
        const cleanFirst = firstName?.trim() || '';
        const cleanLast = lastName?.trim() || '';

        if (!cleanFirst && !cleanLast) return 'Anonymous User';
        if (!cleanLast) return cleanFirst;
        if (!cleanFirst) return cleanLast;

        return `${cleanFirst} ${cleanLast}`;
      };

      expect(formatDisplayName('John', 'Doe')).toBe('John Doe');
      expect(formatDisplayName('John', '')).toBe('John');
      expect(formatDisplayName('', 'Doe')).toBe('Doe');
      expect(formatDisplayName('', '')).toBe('Anonymous User');
      expect(formatDisplayName('  John  ', '  Doe  ')).toBe('John Doe');
    });

    it('should generate user initials', () => {
      const generateInitials = (firstName: string, lastName: string) => {
        const first = firstName?.trim()[0]?.toUpperCase() || '';
        const last = lastName?.trim()[0]?.toUpperCase() || '';

        if (!first && !last) return '??';
        if (!last) return first + first;
        if (!first) return last + last;

        return first + last;
      };

      expect(generateInitials('John', 'Doe')).toBe('JD');
      expect(generateInitials('John', '')).toBe('JJ');
      expect(generateInitials('', 'Doe')).toBe('DD');
      expect(generateInitials('', '')).toBe('??');
      expect(generateInitials('alice', 'smith')).toBe('AS');
    });

    it('should handle profile data merging', () => {
      const mergeProfileData = (
        existingProfile: Record<string, unknown>,
        updates: Record<string, unknown>
      ) => {
        const merged = { ...existingProfile };

        // Only update fields that are provided and different
        Object.keys(updates).forEach(key => {
          if (updates[key] !== undefined && updates[key] !== merged[key]) {
            merged[key] = updates[key];
          }
        });

        // Update timestamp
        merged.updatedAt = new Date().toISOString();

        return merged;
      };

      const existing = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: 'Old bio',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const updates = {
        firstName: 'Jonathan',
        bio: 'New bio',
        email: 'john@example.com', // Same value, shouldn't trigger update
      };

      const result = mergeProfileData(existing, updates);

      expect(result.firstName).toBe('Jonathan');
      expect(result.bio).toBe('New bio');
      expect(result.lastName).toBe('Doe'); // Unchanged
      expect(result.email).toBe('john@example.com'); // Same value
      expect(result.updatedAt).toBeDefined();
      expect(result.createdAt).toBe('2024-01-01T00:00:00Z'); // Preserved
    });
  });
});
