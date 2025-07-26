import { prisma } from '../lib/database';

import { AuthService } from './auth.service';

export interface UserProfileData {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
}

export interface PrivacySettings {
  isProfilePublic?: boolean;
  allowFollowers?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  emailVerified: boolean;
  isProfilePublic: boolean;
  allowFollowers: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  createdAt: Date;
}

export class UserService {
  // Helper method to transform UserProfile for frontend compatibility
  private static transformUserProfileForFrontend(user: UserProfile): UserProfile & { avatarUrl?: string | null } {
    return {
      ...user,
      avatarUrl: user.profileImageUrl,
    };
  }
  // Get user profile (authenticated user's own profile)
  static async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        bio: true,
        location: true,
        website: true,
        emailVerified: true,
        isProfilePublic: true,
        allowFollowers: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.transformUserProfileForFrontend(user);
  }

  // Get public user profile (for viewing other users)
  static async getPublicUserProfile(
    username: string
  ): Promise<PublicUserProfile> {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        profileImageUrl: true,
        bio: true,
        location: true,
        website: true,
        isProfilePublic: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isProfilePublic) {
      throw new Error('Profile is private');
    }

    // Remove isProfilePublic from response
    const { isProfilePublic, ...publicProfile } = user;
    void isProfilePublic; // Mark as used for linting

    return publicProfile;
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    profileData: UserProfileData
  ): Promise<UserProfile> {
    // Validate website URL if provided
    if (profileData.website && !this.isValidUrl(profileData.website)) {
      throw new Error('Invalid website URL');
    }

    // Validate input lengths
    if (profileData.displayName && profileData.displayName.length > 50) {
      throw new Error('Display name must be 50 characters or less');
    }

    if (profileData.firstName && profileData.firstName.length > 30) {
      throw new Error('First name must be 30 characters or less');
    }

    if (profileData.lastName && profileData.lastName.length > 30) {
      throw new Error('Last name must be 30 characters or less');
    }

    if (profileData.bio && profileData.bio.length > 500) {
      throw new Error('Bio must be 500 characters or less');
    }

    if (profileData.location && profileData.location.length > 100) {
      throw new Error('Location must be 100 characters or less');
    }

    try {
      // Get current user data to merge with updates
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      if (!currentUser) {
        throw new Error('User not found');
      }

      // Auto-generate displayName from firstName and lastName only if not provided
      const updateData = { ...profileData };
      const firstName =
        (profileData.firstName ?? currentUser.firstName)?.trim() || '';
      const lastName =
        (profileData.lastName ?? currentUser.lastName)?.trim() || '';
      const fullName = `${firstName} ${lastName}`.trim();
      updateData.displayName = profileData.displayName || fullName || undefined;

      // Map avatarUrl to profileImageUrl for database
      const dbUpdateData: Record<string, unknown> = { ...updateData };
      if (updateData.avatarUrl !== undefined) {
        dbUpdateData.profileImageUrl = updateData.avatarUrl;
        delete dbUpdateData.avatarUrl;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...dbUpdateData,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          bio: true,
          location: true,
          website: true,
          emailVerified: true,
          isProfilePublic: true,
          allowFollowers: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      return this.transformUserProfileForFrontend(updatedUser);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.error('User profile update error:', error);
      }
      throw new Error('Failed to update user profile');
    }
  }

  // Update privacy settings
  static async updatePrivacySettings(
    userId: string,
    privacySettings: PrivacySettings
  ): Promise<UserProfile> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...privacySettings,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          bio: true,
          location: true,
          website: true,
          emailVerified: true,
          isProfilePublic: true,
          allowFollowers: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.error('Privacy settings update error:', error);
      }
      throw new Error('Failed to update privacy settings');
    }
  }

  // Update profile image URL
  static async updateProfileImage(
    userId: string,
    profileImageUrl: string
  ): Promise<UserProfile> {
    // Validate image URL
    if (!this.isValidUrl(profileImageUrl)) {
      throw new Error('Invalid profile image URL');
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profileImageUrl,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          bio: true,
          location: true,
          website: true,
          emailVerified: true,
          isProfilePublic: true,
          allowFollowers: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.error('Profile image update error:', error);
      }
      throw new Error('Failed to update profile image');
    }
  }

  // Delete user account
  static async deleteUserAccount(
    userId: string,
    password: string
  ): Promise<void> {
    // First, verify the user's password for security
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await AuthService.verifyPassword(
      password,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    try {
      // Delete user account (this will cascade delete related data due to DB constraints)
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.error('Account deletion error:', error);
      }
      throw new Error('Failed to delete account');
    }
  }

  // Change user password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get current password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await AuthService.verifyPassword(
      currentPassword,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation =
      AuthService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(
        `Password validation failed: ${passwordValidation.errors.join(', ')}`
      );
    }

    // Hash new password
    const newPasswordHash = await AuthService.hashPassword(newPassword);

    try {
      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.error('Password change error:', error);
      }
      throw new Error('Failed to change password');
    }
  }

  // Utility function to validate URLs
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Get user statistics (for dashboard/profile display)
  static async getUserStatistics(userId: string): Promise<{
    totalCollections: number;
    totalModelLikes: number;
    followerCount: number;
    followingCount: number;
  }> {
    try {
      const [totalCollections, totalModelLikes, followerCount, followingCount] =
        await Promise.all([
          prisma.collection.count({ where: { userId } }),
          prisma.userModelLike.count({ where: { userId } }),
          prisma.userRelationship.count({ where: { followingId: userId } }),
          prisma.userRelationship.count({ where: { followerId: userId } }),
        ]);

      return {
        totalCollections,
        totalModelLikes,
        followerCount,
        followingCount,
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.error('User statistics error:', error);
      }
      throw new Error('Failed to get user statistics');
    }
  }
}
