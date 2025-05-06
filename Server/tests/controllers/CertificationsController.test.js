const Certification = require('../../models/Certifications');
const certificationValidator = require('../../validators/CertificationsValidators');
const CertificationController = require('../../controllers/CertifiacationsController');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Mock dependencies
jest.mock('../../models/Certifications');
jest.mock('../../validators/CertificationsValidators');
jest.mock('cloudinary').v2;
jest.mock('multer');

describe('CertificationController', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  // Tests for getUserCertifications
  describe('getUserCertifications', () => {
    it('should get all certifications for a user', async () => {
      // Arrange
      const mockCertifications = [
        { _id: '1', title: 'AWS Developer', userId: 'user123' },
        { _id: '2', title: 'Google Cloud', userId: 'user123' }
      ];

      const mockReq = {
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Certification.find.mockResolvedValue(mockCertifications);

      // Act
      await CertificationController.getUserCertifications(mockReq, mockRes);

      // Assert
      expect(Certification.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockCertifications);
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Certification.find.mockRejectedValue(mockError);

      // Act
      await CertificationController.getUserCertifications(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests for getCertificationById
  describe('getCertificationById', () => {
    it('should get a certification by ID', async () => {
      // Arrange
      const mockCertification = {
        _id: 'cert123',
        title: 'AWS Developer',
        userId: 'user123'
      };

      const mockReq = {
        params: { id: 'cert123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Certification.findOne.mockResolvedValue(mockCertification);

      // Act
      await CertificationController.getCertificationById(mockReq, mockRes);

      // Assert
      expect(Certification.findOne).toHaveBeenCalledWith({
        _id: 'cert123',
        userId: 'user123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockCertification);
    });

    it('should return 404 if certification not found', async () => {
      // Arrange
      const mockReq = {
        params: { id: 'nonexistent' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Certification.findOne.mockResolvedValue(null);

      // Act
      await CertificationController.getCertificationById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Certification not found or unauthorized'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {
        params: { id: 'cert123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Certification.findOne.mockRejectedValue(mockError);

      // Act
      await CertificationController.getCertificationById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests for createCertification
  describe('createCertification', () => {
    it('should create a certification successfully', async () => {
      // Arrange
      const mockCertificationData = {
        title: 'AWS Developer',
        description: 'AWS Certified Developer Associate',
        date: '2023-05-15'
      };

      const mockCreatedCertification = {
        _id: 'cert123',
        ...mockCertificationData,
        userId: 'user123',
        image: 'cloudinary.com/certifications/image.jpg'
      };

      const mockReq = {
        body: mockCertificationData,
        user: { _id: 'user123' },
        file: { path: 'cloudinary.com/certifications/image.jpg' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      certificationValidator.validateCertification = jest.fn().mockReturnValue({ error: null });
      Certification.create.mockResolvedValue(mockCreatedCertification);

      // Act
      await CertificationController.createCertification(mockReq, mockRes);

      // Assert
      expect(certificationValidator.validateCertification).toHaveBeenCalledWith(mockCertificationData);
      expect(Certification.create).toHaveBeenCalledWith({
        ...mockCertificationData,
        userId: 'user123',
        image: 'cloudinary.com/certifications/image.jpg'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCreatedCertification);
    });

    it('should create a certification without image', async () => {
      // Arrange
      const mockCertificationData = {
        title: 'AWS Developer',
        description: 'AWS Certified Developer Associate',
        date: '2023-05-15'
      };

      const mockCreatedCertification = {
        _id: 'cert123',
        ...mockCertificationData,
        userId: 'user123',
        image: null
      };

      const mockReq = {
        body: mockCertificationData,
        user: { _id: 'user123' }
        // No file
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      certificationValidator.validateCertification = jest.fn().mockReturnValue({ error: null });
      Certification.create.mockResolvedValue(mockCreatedCertification);

      // Act
      await CertificationController.createCertification(mockReq, mockRes);

      // Assert
      expect(Certification.create).toHaveBeenCalledWith({
        ...mockCertificationData,
        userId: 'user123',
        image: null
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCreatedCertification);
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const mockCertificationData = {
        title: '', // Invalid empty title
        date: 'invalid-date'
      };

      const mockReq = {
        body: mockCertificationData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const validationError = {
        details: [
          { message: 'Title is required' },
          { message: 'Invalid date format' }
        ]
      };

      certificationValidator.validateCertification = jest.fn().mockReturnValue({ error: validationError });

      // Act
      await CertificationController.createCertification(mockReq, mockRes);

      // Assert
      expect(certificationValidator.validateCertification).toHaveBeenCalledWith(mockCertificationData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: ['Title is required', 'Invalid date format']
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockCertificationData = {
        title: 'AWS Developer',
        description: 'AWS Certified Developer Associate',
        date: '2023-05-15'
      };

      const mockReq = {
        body: mockCertificationData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      certificationValidator.validateCertification = jest.fn().mockReturnValue({ error: null });
      Certification.create.mockRejectedValue(mockError);

      // Act
      await CertificationController.createCertification(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to create certification',
        error: mockError.message
      });
    });
  });

  // Tests for updateCertification
  describe('updateCertification', () => {
    it('should update a certification successfully', async () => {
      // Arrange
      const mockCertificationData = {
        title: 'Updated AWS Developer',
        description: 'Updated Description',
        date: '2023-06-20'
      };

      const mockExistingCertification = {
        _id: 'cert123',
        title: 'AWS Developer',
        description: 'Original Description',
        date: '2023-05-15',
        userId: 'user123',
        image: 'old-image-path.jpg',
        save: jest.fn().mockResolvedValue()
      };

      const mockReq = {
        params: { id: 'cert123' },
        body: mockCertificationData,
        user: { _id: 'user123' },
        file: { path: 'new-image-path.jpg' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      certificationValidator.validateCertification = jest.fn().mockReturnValue({ error: null });
      Certification.findOne.mockResolvedValue(mockExistingCertification);

      // Act
      await CertificationController.updateCertification(mockReq, mockRes);

      // Assert
      expect(certificationValidator.validateCertification).toHaveBeenCalledWith(mockCertificationData);
      expect(Certification.findOne).toHaveBeenCalledWith({
        _id: 'cert123',
        userId: 'user123'
      });
      
      expect(mockExistingCertification.title).toBe('Updated AWS Developer');
      expect(mockExistingCertification.description).toBe('Updated Description');
      expect(mockExistingCertification.date).toBe('2023-06-20');
      expect(mockExistingCertification.image).toBe('new-image-path.jpg');
      expect(mockExistingCertification.save).toHaveBeenCalled();
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockExistingCertification);
    });

    it('should update a certification without changing the image', async () => {
      // Arrange
      const mockCertificationData = {
        title: 'Updated AWS Developer',
        description: 'Updated Description',
        date: '2023-06-20'
      };

      const mockExistingCertification = {
        _id: 'cert123',
        title: 'AWS Developer',
        description: 'Original Description',
        date: '2023-05-15',
        userId: 'user123',
        image: 'original-image-path.jpg',
        save: jest.fn().mockResolvedValue()
      };

      const mockReq = {
        params: { id: 'cert123' },
        body: mockCertificationData,
        user: { _id: 'user123' }
        // No file
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      certificationValidator.validateCertification = jest.fn().mockReturnValue({ error: null });
      Certification.findOne.mockResolvedValue(mockExistingCertification);

      // Act
      await CertificationController.updateCertification(mockReq, mockRes);

      // Assert
      expect(mockExistingCertification.title).toBe('Updated AWS Developer');
      expect(mockExistingCertification.description).toBe('Updated Description');
      expect(mockExistingCertification.date).toBe('2023-06-20');
      expect(mockExistingCertification.image).toBe('original-image-path.jpg'); // Unchanged
      expect(mockExistingCertification.save).toHaveBeenCalled();
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockExistingCertification);
    });

    it('should return 404 if certification not found', async () => {
      // Arrange
      const mockCertificationData = {
        title: 'Updated AWS Developer',
        description: 'Updated Description',
        date: '2023-06-20'
      };

      const mockReq = {
        params: { id: 'nonexistent' },
        body: mockCertificationData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      certificationValidator.validateCertification = jest.fn().mockReturnValue({ error: null });
      Certification.findOne.mockResolvedValue(null);

      // Act
      await CertificationController.updateCertification(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Certification not found or unauthorized'
      });
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const mockCertificationData = {
        title: '', // Invalid empty title
        date: 'invalid-date'
      };

      const mockReq = {
        params: { id: 'cert123' },
        body: mockCertificationData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const validationError = {
        details: [
          { message: 'Title is required' },
          { message: 'Invalid date format' }
        ]
      };

      certificationValidator.validateCertification = jest.fn().mockReturnValue({ error: validationError });

      // Act
      await CertificationController.updateCertification(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: ['Title is required', 'Invalid date format']
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockCertificationData = {
        title: 'Updated AWS Developer',
        description: 'Updated Description',
        date: '2023-06-20'
      };

      const mockReq = {
        params: { id: 'cert123' },
        body: mockCertificationData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      certificationValidator.validateCertification = jest.fn().mockReturnValue({ error: null });
      Certification.findOne.mockRejectedValue(mockError);

      // Act
      await CertificationController.updateCertification(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to update certification',
        error: mockError.message
      });
    });
  });

  // Tests for deleteCertification
  describe('deleteCertification', () => {
    it('should delete a certification successfully', async () => {
      // Arrange
      const mockCertification = {
        _id: 'cert123',
        title: 'AWS Developer',
        userId: 'user123'
      };

      const mockReq = {
        params: { id: 'cert123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Certification.findOneAndDelete.mockResolvedValue(mockCertification);

      // Act
      await CertificationController.deleteCertification(mockReq, mockRes);

      // Assert
      expect(Certification.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'cert123',
        userId: 'user123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Certification deleted successfully'
      });
    });

    it('should return 404 if certification not found', async () => {
      // Arrange
      const mockReq = {
        params: { id: 'nonexistent' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Certification.findOneAndDelete.mockResolvedValue(null);

      // Act
      await CertificationController.deleteCertification(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Certification not found or unauthorized'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {
        params: { id: 'cert123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Certification.findOneAndDelete.mockRejectedValue(mockError);

      // Act
      await CertificationController.deleteCertification(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to delete certification',
        error: mockError.message
      });
    });
  });
});