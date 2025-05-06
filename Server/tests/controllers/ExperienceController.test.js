const Experience = require('../../models/Experience');
const experienceValidator = require('../../validators/experienceValidator');
const ExperienceController = require('../../controllers/ExperienceController');

// Mock dependencies
jest.mock('../../models/Experience');
jest.mock('../../validators/experienceValidator');

describe('ExperienceController', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  // Tests for createExperience
  describe('createExperience', () => {
    it('should create an experience successfully', async () => {
      // Arrange
      const mockExperienceData = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Remote',
        startDate: '2021-01-01',
        endDate: '2022-12-31',
        description: 'Worked on various projects'
      };

      const mockReq = {
        body: mockExperienceData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNewExperience = {
        _id: 'exp123',
        ...mockExperienceData,
        userId: 'user123',
        save: jest.fn().mockResolvedValue()
      };

      experienceValidator.validateExperience = jest.fn().mockReturnValue({ error: null });
      Experience.mockImplementation(() => mockNewExperience);

      // Act
      await ExperienceController.createExperience(mockReq, mockRes);

      // Assert
      expect(experienceValidator.validateExperience).toHaveBeenCalledWith(mockExperienceData);
      expect(Experience).toHaveBeenCalledWith({
        ...mockExperienceData,
        userId: 'user123'
      });
      expect(mockNewExperience.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockNewExperience);
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const mockExperienceData = {
        title: '', // Invalid empty title
        company: ''
      };

      const mockReq = {
        body: mockExperienceData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const validationError = {
        details: [
          { message: 'Title is required' },
          { message: 'Company is required' }
        ]
      };

      experienceValidator.validateExperience = jest.fn().mockReturnValue({ error: validationError });

      // Act
      await ExperienceController.createExperience(mockReq, mockRes);

      // Assert
      expect(experienceValidator.validateExperience).toHaveBeenCalledWith(mockExperienceData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        errors: ['Title is required', 'Company is required'] 
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      const mockExperienceData = {
        title: 'Software Engineer',
        company: 'Tech Corp'
      };

      const mockReq = {
        body: mockExperienceData,
        user: null // No user
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      experienceValidator.validateExperience = jest.fn().mockReturnValue({ error: null });

      // Act
      await ExperienceController.createExperience(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'User not authenticated' 
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockExperienceData = {
        title: 'Software Engineer',
        company: 'Tech Corp'
      };

      const mockReq = {
        body: mockExperienceData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNewExperience = {
        _id: 'exp123',
        ...mockExperienceData,
        userId: 'user123',
        save: jest.fn().mockRejectedValue(mockError)
      };

      experienceValidator.validateExperience = jest.fn().mockReturnValue({ error: null });
      Experience.mockImplementation(() => mockNewExperience);

      // Act
      await ExperienceController.createExperience(mockReq, mockRes);

      // Assert
      expect(mockNewExperience.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to create experience',
        error: mockError.message
      });
    });
  });

  // Tests for getAllExperiences
  describe('getAllExperiences', () => {
    it('should get all experiences', async () => {
      // Arrange
      const mockExperiences = [
        { _id: '1', title: 'Software Engineer', company: 'Tech Corp' },
        { _id: '2', title: 'Web Developer', company: 'Web Inc' }
      ];

      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Experience.find.mockResolvedValue(mockExperiences);

      // Act
      await ExperienceController.getAllExperiences(mockReq, mockRes);

      // Assert
      expect(Experience.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockExperiences);
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Experience.find.mockRejectedValue(mockError);

      // Act
      await ExperienceController.getAllExperiences(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests for getUserExperiences
  describe('getUserExperiences', () => {
    it('should get all experiences for a user', async () => {
      // Arrange
      const mockExperiences = [
        { _id: '1', title: 'Software Engineer', company: 'Tech Corp', userId: 'user123' },
        { _id: '2', title: 'Web Developer', company: 'Web Inc', userId: 'user123' }
      ];

      const mockReq = {
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Experience.find.mockResolvedValue(mockExperiences);

      // Act
      await ExperienceController.getUserExperiences(mockReq, mockRes);

      // Assert
      expect(Experience.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockExperiences);
    });

    it('should return empty array if no experiences found', async () => {
      // Arrange
      const mockReq = {
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Experience.find.mockResolvedValue([]);

      // Act
      await ExperienceController.getUserExperiences(mockReq, mockRes);

      // Assert
      expect(Experience.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'No experiences found for this user',
        experiences: []
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      const mockReq = {
        user: null // No user
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Act
      await ExperienceController.getUserExperiences(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not authenticated'
      });
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

      Experience.find.mockRejectedValue(mockError);

      // Act
      await ExperienceController.getUserExperiences(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests for getExperienceById
  describe('getExperienceById', () => {
    it('should get an experience by ID', async () => {
      // Arrange
      const mockExperience = {
        _id: 'exp123',
        title: 'Software Engineer',
        company: 'Tech Corp',
        userId: 'user123'
      };

      const mockReq = {
        params: { id: 'exp123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Experience.findOne.mockResolvedValue(mockExperience);

      // Act
      await ExperienceController.getExperienceById(mockReq, mockRes);

      // Assert
      expect(Experience.findOne).toHaveBeenCalledWith({
        _id: 'exp123',
        userId: 'user123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockExperience);
    });

    it('should return 404 if experience not found', async () => {
      // Arrange
      const mockReq = {
        params: { id: 'nonexistent' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Experience.findOne.mockResolvedValue(null);

      // Act
      await ExperienceController.getExperienceById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Experience not found or unauthorized'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {
        params: { id: 'exp123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Experience.findOne.mockRejectedValue(mockError);

      // Act
      await ExperienceController.getExperienceById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests for updateExperience
  describe('updateExperience', () => {
    it('should update an experience successfully', async () => {
      // Arrange
      const mockExperienceData = {
        title: 'Updated Software Engineer',
        company: 'Updated Tech Corp',
        description: 'Updated description'
      };

      const mockUpdatedExperience = {
        _id: 'exp123',
        ...mockExperienceData,
        userId: 'user123'
      };

      const mockReq = {
        params: { id: 'exp123' },
        body: mockExperienceData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      experienceValidator.validateExperience = jest.fn().mockReturnValue({ error: null });
      Experience.findOne.mockResolvedValue({ _id: 'exp123', userId: 'user123' });
      Experience.findByIdAndUpdate.mockResolvedValue(mockUpdatedExperience);

      // Act
      await ExperienceController.updateExperience(mockReq, mockRes);

      // Assert
      expect(experienceValidator.validateExperience).toHaveBeenCalledWith(mockExperienceData);
      expect(Experience.findOne).toHaveBeenCalledWith({
        _id: 'exp123',
        userId: 'user123'
      });
      expect(Experience.findByIdAndUpdate).toHaveBeenCalledWith(
        'exp123',
        mockExperienceData,
        { new: true }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedExperience);
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const mockExperienceData = {
        title: '', // Invalid empty title
        company: ''
      };

      const mockReq = {
        params: { id: 'exp123' },
        body: mockExperienceData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const validationError = {
        details: [
          { message: 'Title is required' },
          { message: 'Company is required' }
        ]
      };

      experienceValidator.validateExperience = jest.fn().mockReturnValue({ error: validationError });

      // Act
      await ExperienceController.updateExperience(mockReq, mockRes);

      // Assert
      expect(experienceValidator.validateExperience).toHaveBeenCalledWith(mockExperienceData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: ['Title is required', 'Company is required']
      });
    });

    it('should return 404 if experience not found', async () => {
      // Arrange
      const mockExperienceData = {
        title: 'Updated Software Engineer',
        company: 'Updated Tech Corp'
      };

      const mockReq = {
        params: { id: 'nonexistent' },
        body: mockExperienceData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      experienceValidator.validateExperience = jest.fn().mockReturnValue({ error: null });
      Experience.findOne.mockResolvedValue(null);

      // Act
      await ExperienceController.updateExperience(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Experience not found or unauthorized'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockExperienceData = {
        title: 'Updated Software Engineer',
        company: 'Updated Tech Corp'
      };

      const mockReq = {
        params: { id: 'exp123' },
        body: mockExperienceData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      experienceValidator.validateExperience = jest.fn().mockReturnValue({ error: null });
      Experience.findOne.mockResolvedValue({ _id: 'exp123', userId: 'user123' });
      Experience.findByIdAndUpdate.mockRejectedValue(mockError);

      // Act
      await ExperienceController.updateExperience(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to update experience',
        error: mockError.message
      });
    });
  });

  // Tests for deleteExperience
  describe('deleteExperience', () => {
    it('should delete an experience successfully', async () => {
      // Arrange
      const mockExperience = {
        _id: 'exp123',
        title: 'Software Engineer',
        userId: 'user123'
      };

      const mockReq = {
        params: { id: 'exp123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Experience.findOne.mockResolvedValue(mockExperience);
      Experience.findByIdAndDelete.mockResolvedValue({});

      // Act
      await ExperienceController.deleteExperience(mockReq, mockRes);

      // Assert
      expect(Experience.findOne).toHaveBeenCalledWith({
        _id: 'exp123',
        userId: 'user123'
      });
      expect(Experience.findByIdAndDelete).toHaveBeenCalledWith('exp123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Experience deleted successfully'
      });
    });

    it('should return 404 if experience not found', async () => {
      // Arrange
      const mockReq = {
        params: { id: 'nonexistent' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Experience.findOne.mockResolvedValue(null);

      // Act
      await ExperienceController.deleteExperience(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Experience not found or unauthorized'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {
        params: { id: 'exp123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Experience.findOne.mockRejectedValue(mockError);

      // Act
      await ExperienceController.deleteExperience(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to delete experience',
        error: mockError.message
      });
    });
  });
});