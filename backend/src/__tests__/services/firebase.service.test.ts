import { FirebaseService } from '../../services/firebase.service';

// Mock Firebase Admin SDK
const mockMakePublic = jest.fn();
const mockDelete = jest.fn();
const mockExists = jest.fn();
const mockCreateWriteStream = jest.fn();

const mockFile = {
  createWriteStream: mockCreateWriteStream,
  makePublic: mockMakePublic,
  delete: mockDelete,
  exists: mockExists,
};

const mockBucket = {
  file: jest.fn(() => mockFile),
  name: 'test-bucket',
};

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  storage: jest.fn(() => ({
    bucket: jest.fn(() => mockBucket),
  })),
}));

describe('FirebaseService', () => {
  let firebaseService: FirebaseService;
  let mockWriteStream: any;

  beforeEach(() => {
    jest.clearAllMocks();
    firebaseService = new FirebaseService();

    // Mock write stream
    mockWriteStream = {
      on: jest.fn(),
      end: jest.fn(),
    };

    mockCreateWriteStream.mockReturnValue(mockWriteStream);

    // Reset mock implementations
    mockMakePublic.mockImplementation(() => Promise.resolve());
    mockDelete.mockImplementation(() => Promise.resolve());
    mockExists.mockImplementation(() => Promise.resolve([true]));
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const buffer = Buffer.from('test image data');
      const filePath = 'test-path/test-image.jpg';
      const contentType = 'image/jpeg';

      // Mock successful upload
      mockWriteStream.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'finish') {
          setTimeout(callback, 0);
        }
        return mockWriteStream;
      });

      const result = await firebaseService.uploadFile(buffer, filePath, contentType);

      expect(result).toBe(`https://storage.googleapis.com/${mockBucket.name}/${filePath}`);
      expect(mockBucket.file).toHaveBeenCalledWith(filePath);
      expect(mockCreateWriteStream).toHaveBeenCalledWith({
        metadata: {
          contentType,
          metadata: {},
        },
      });
      expect(mockMakePublic).toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      const buffer = Buffer.from('test image data');
      const filePath = 'test-path/test-image.jpg';
      const contentType = 'image/jpeg';

      // Mock upload error
      mockWriteStream.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'error') {
          setTimeout(() => callback(new Error('Upload failed')), 0);
        }
        return mockWriteStream;
      });

      await expect(firebaseService.uploadFile(buffer, filePath, contentType))
        .rejects.toThrow('Upload failed');
    });

    it('should handle make public errors', async () => {
      const buffer = Buffer.from('test image data');
      const filePath = 'test-path/test-image.jpg';
      const contentType = 'image/jpeg';

      // Mock successful upload but failed make public
      mockWriteStream.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'finish') {
          setTimeout(callback, 0);
        }
        return mockWriteStream;
      });

      mockMakePublic.mockImplementation(() => Promise.reject(new Error('Make public failed')));

      await expect(firebaseService.uploadFile(buffer, filePath, contentType))
        .rejects.toThrow('Make public failed');
    });

    it('should include custom metadata', async () => {
      const buffer = Buffer.from('test image data');
      const filePath = 'test-path/test-image.jpg';
      const contentType = 'image/jpeg';
      const metadata = { userId: 'user123', type: 'avatar' };

      mockWriteStream.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'finish') {
          setTimeout(callback, 0);
        }
        return mockWriteStream;
      });

      await firebaseService.uploadFile(buffer, filePath, contentType, metadata);

      expect(mockCreateWriteStream).toHaveBeenCalledWith({
        metadata: {
          contentType,
          metadata,
        },
      });
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const filePath = 'test-path/test-image.jpg';

      await firebaseService.deleteFile(filePath);

      expect(mockBucket.file).toHaveBeenCalledWith(filePath);
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      const filePath = 'test-path/test-image.jpg';

      mockDelete.mockImplementation(() => Promise.reject(new Error('Delete failed')));

      await expect(firebaseService.deleteFile(filePath))
        .rejects.toThrow('Delete failed');
    });
  });

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      const filePath = 'test-path/test-image.jpg';

      const exists = await firebaseService.fileExists(filePath);

      expect(exists).toBe(true);
      expect(mockBucket.file).toHaveBeenCalledWith(filePath);
      expect(mockExists).toHaveBeenCalled();
    });

    it('should return false when file does not exist', async () => {
      const filePath = 'test-path/test-image.jpg';

      mockExists.mockImplementation(() => Promise.resolve([false]));

      const exists = await firebaseService.fileExists(filePath);

      expect(exists).toBe(false);
    });

    it('should handle check errors', async () => {
      const filePath = 'test-path/test-image.jpg';

      mockExists.mockImplementation(() => Promise.reject(new Error('Check failed')));

      const exists = await firebaseService.fileExists(filePath);

      expect(exists).toBe(false);
    });
  });

  describe('generateFilePath', () => {
    it('should generate correct path for avatar file', () => {
      const path = firebaseService.generateFilePath('avatar', {
        userId: 'user123',
        filename: 'profile.jpg',
      });
      expect(path).toBe('users/user123/avatar/profile.jpg');
    });

    it('should generate correct path for collection thumbnail', () => {
      const path = firebaseService.generateFilePath('collection-thumbnail', {
        userId: 'user123',
        collectionId: 'collection456',
        filename: 'thumbnail.jpg',
      });
      expect(path).toBe('users/user123/collections/collection456/thumbnail/thumbnail.jpg');
    });

    it('should generate correct path for model image', () => {
      const path = firebaseService.generateFilePath('model-image', {
        userId: 'user123',
        collectionId: 'collection456',
        modelId: 'model789',
        filename: 'showcase.jpg',
      });
      expect(path).toBe('users/user123/collections/collection456/models/model789/showcase.jpg');
    });

    it('should throw error for collection thumbnail without collectionId', () => {
      expect(() => {
        firebaseService.generateFilePath('collection-thumbnail', {
          userId: 'user123',
          filename: 'thumbnail.jpg',
        });
      }).toThrow('Collection ID required for collection thumbnail');
    });

    it('should throw error for model image without collectionId or modelId', () => {
      expect(() => {
        firebaseService.generateFilePath('model-image', {
          userId: 'user123',
          filename: 'showcase.jpg',
        });
      }).toThrow('Collection ID and Model ID required for model image');
    });
  });
});
