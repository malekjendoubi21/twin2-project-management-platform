const Skill = require('../../models/Skills');
const skillsValidator = require('../../validators/SkillsValidators');
const SkillsController = require('../../controllers/SkillsController');

// Mock dependencies
jest.mock('../../models/Skills');
jest.mock('../../validators/SkillsValidators');

describe('SkillsController', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  // Tests for getAllSkills
  describe('getAllSkills', () => {
    it('should get all skills', async () => {
      // Arrange
      const mockSkills = [
        { _id: '1', name: 'JavaScript', level: 'Advanced' },
        { _id: '2', name: 'Python', level: 'Intermediate' }
      ];

      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Skill.find.mockResolvedValue(mockSkills);

      // Act
      await SkillsController.getAllSkills(mockReq, mockRes);

      // Assert
      expect(Skill.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSkills);
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Skill.find.mockRejectedValue(mockError);

      // Act
      await SkillsController.getAllSkills(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests for getSkillById
  describe('getSkillById', () => {
    it('should get a skill by ID', async () => {
      // Arrange
      const mockSkill = {
        _id: 'skill123',
        name: 'JavaScript',
        level: 'Advanced',
        userId: 'user123'
      };

      const mockReq = {
        params: { id: 'skill123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Skill.findOne.mockResolvedValue(mockSkill);

      // Act
      await SkillsController.getSkillById(mockReq, mockRes);

      // Assert
      expect(Skill.findOne).toHaveBeenCalledWith({
        _id: 'skill123',
        userId: 'user123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSkill);
    });

    it('should return 404 if skill not found', async () => {
      // Arrange
      const mockReq = {
        params: { id: 'nonexistent' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Skill.findOne.mockResolvedValue(null);

      // Act
      await SkillsController.getSkillById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Skill not found or unauthorized'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {
        params: { id: 'skill123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Skill.findOne.mockRejectedValue(mockError);

      // Act
      await SkillsController.getSkillById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests for createSkill
  describe('createSkill', () => {
    it('should create a skill successfully', async () => {
      // Arrange
      const mockSkillData = {
        name: 'JavaScript',
        level: 'Advanced',
        category: 'Programming'
      };

      const mockReq = {
        body: mockSkillData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNewSkill = {
        _id: 'skill123',
        ...mockSkillData,
        userId: 'user123',
        save: jest.fn().mockResolvedValue()
      };

      skillsValidator.validateSkill = jest.fn().mockReturnValue({ error: null });
      Skill.mockImplementation(() => mockNewSkill);

      // Act
      await SkillsController.createSkill(mockReq, mockRes);

      // Assert
      expect(skillsValidator.validateSkill).toHaveBeenCalledWith(mockSkillData);
      expect(Skill).toHaveBeenCalledWith({
        ...mockSkillData,
        userId: 'user123'
      });
      expect(mockNewSkill.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockNewSkill);
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const mockSkillData = {
        name: '', // Invalid empty name
        level: 'Invalid-Level'
      };

      const mockReq = {
        body: mockSkillData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const validationError = {
        details: [
          { message: 'Name is required' },
          { message: 'Level must be one of: Beginner, Intermediate, Advanced' }
        ]
      };

      skillsValidator.validateSkill = jest.fn().mockReturnValue({ error: validationError });

      // Act
      await SkillsController.createSkill(mockReq, mockRes);

      // Assert
      expect(skillsValidator.validateSkill).toHaveBeenCalledWith(mockSkillData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: ['Name is required', 'Level must be one of: Beginner, Intermediate, Advanced']
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      const mockSkillData = {
        name: 'JavaScript',
        level: 'Advanced'
      };

      const mockReq = {
        body: mockSkillData,
        user: null // No user
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      skillsValidator.validateSkill = jest.fn().mockReturnValue({ error: null });

      // Act
      await SkillsController.createSkill(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not authenticated'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockSkillData = {
        name: 'JavaScript',
        level: 'Advanced'
      };

      const mockReq = {
        body: mockSkillData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNewSkill = {
        _id: 'skill123',
        ...mockSkillData,
        userId: 'user123',
        save: jest.fn().mockRejectedValue(mockError)
      };

      skillsValidator.validateSkill = jest.fn().mockReturnValue({ error: null });
      Skill.mockImplementation(() => mockNewSkill);

      // Act
      await SkillsController.createSkill(mockReq, mockRes);

      // Assert
      expect(mockNewSkill.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to create skill',
        error: mockError.message
      });
    });
  });

  // Tests for updateSkill
  describe('updateSkill', () => {
    it('should update a skill successfully', async () => {
      // Arrange
      const mockSkillData = {
        name: 'Updated JavaScript',
        level: 'Expert'
      };

      const mockUpdatedSkill = {
        _id: 'skill123',
        ...mockSkillData,
        userId: 'user123'
      };

      const mockReq = {
        params: { id: 'skill123' },
        body: mockSkillData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      skillsValidator.validateSkillUpdate = jest.fn().mockReturnValue({ error: null });
      Skill.findOne.mockResolvedValue({ _id: 'skill123', userId: 'user123' });
      Skill.findByIdAndUpdate.mockResolvedValue(mockUpdatedSkill);

      // Act
      await SkillsController.updateSkill(mockReq, mockRes);

      // Assert
      expect(skillsValidator.validateSkillUpdate).toHaveBeenCalledWith(mockSkillData);
      expect(Skill.findOne).toHaveBeenCalledWith({
        _id: 'skill123',
        userId: 'user123'
      });
      expect(Skill.findByIdAndUpdate).toHaveBeenCalledWith(
        'skill123',
        { $set: mockSkillData },
        { new: true }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedSkill);
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const mockSkillData = {
        name: '', // Invalid empty name
        level: 'Invalid-Level'
      };

      const mockReq = {
        params: { id: 'skill123' },
        body: mockSkillData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const validationError = {
        details: [
          { message: 'Name is required' },
          { message: 'Level must be one of: Beginner, Intermediate, Advanced, Expert' }
        ]
      };

      skillsValidator.validateSkillUpdate = jest.fn().mockReturnValue({ error: validationError });

      // Act
      await SkillsController.updateSkill(mockReq, mockRes);

      // Assert
      expect(skillsValidator.validateSkillUpdate).toHaveBeenCalledWith(mockSkillData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: [
          'Name is required',
          'Level must be one of: Beginner, Intermediate, Advanced, Expert'
        ]
      });
    });

    it('should return 404 if skill not found', async () => {
      // Arrange
      const mockSkillData = {
        name: 'Updated JavaScript',
        level: 'Expert'
      };

      const mockReq = {
        params: { id: 'nonexistent' },
        body: mockSkillData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      skillsValidator.validateSkillUpdate = jest.fn().mockReturnValue({ error: null });
      Skill.findOne.mockResolvedValue(null);

      // Act
      await SkillsController.updateSkill(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Skill not found or unauthorized'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockSkillData = {
        name: 'Updated JavaScript',
        level: 'Expert'
      };

      const mockReq = {
        params: { id: 'skill123' },
        body: mockSkillData,
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      skillsValidator.validateSkillUpdate = jest.fn().mockReturnValue({ error: null });
      Skill.findOne.mockResolvedValue({ _id: 'skill123', userId: 'user123' });
      Skill.findByIdAndUpdate.mockRejectedValue(mockError);

      // Act
      await SkillsController.updateSkill(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to update skill',
        error: mockError.message
      });
    });
  });

  // Tests for deleteSkill
  describe('deleteSkill', () => {
    it('should delete a skill successfully', async () => {
      // Arrange
      const mockSkill = {
        _id: 'skill123',
        name: 'JavaScript',
        userId: 'user123'
      };

      const mockReq = {
        params: { id: 'skill123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Skill.findOne.mockResolvedValue(mockSkill);

      // Act
      await SkillsController.deleteSkill(mockReq, mockRes);

      // Assert
      expect(Skill.findOne).toHaveBeenCalledWith({
        _id: 'skill123',
        userId: 'user123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Skill deleted successfully'
      });
    });

    it('should return 404 if skill not found', async () => {
      // Arrange
      const mockReq = {
        params: { id: 'nonexistent' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Skill.findOne.mockResolvedValue(null);

      // Act
      await SkillsController.deleteSkill(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Skill not found or unauthorized'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {
        params: { id: 'skill123' },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Skill.findOne.mockRejectedValue(mockError);

      // Act
      await SkillsController.deleteSkill(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to delete skill',
        error: mockError.message
      });
    });
  });

  // Tests for getUserSkills
  describe('getUserSkills', () => {
    it('should get all skills for a user', async () => {
      // Arrange
      const mockSkills = [
        { _id: '1', name: 'JavaScript', level: 'Advanced', userId: 'user123' },
        { _id: '2', name: 'Python', level: 'Intermediate', userId: 'user123' }
      ];

      const mockReq = {
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Skill.find.mockResolvedValue(mockSkills);

      // Act
      await SkillsController.getUserSkills(mockReq, mockRes);

      // Assert
      expect(Skill.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSkills);
    });

    it('should return empty array if no skills found', async () => {
      // Arrange
      const mockReq = {
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Skill.find.mockResolvedValue([]);

      // Act
      await SkillsController.getUserSkills(mockReq, mockRes);

      // Assert
      expect(Skill.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'No skills found for this user',
        skills: []
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
      await SkillsController.getUserSkills(mockReq, mockRes);

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

      Skill.find.mockRejectedValue(mockError);

      // Act
      await SkillsController.getUserSkills(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });
});
