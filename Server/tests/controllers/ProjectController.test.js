const Project = require('../../models/Project');
const projectValidator = require('../../validators/validatorProject');
const ProjectController = require('../../controllers/ProjectController');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../../models/Project');
jest.mock('../../validators/validatorProject');
jest.mock('mongoose');

describe('ProjectController', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  // Tests for getAllProjects
  describe('getAllProjects', () => {
    it('should get all projects successfully', async () => {
      // Arrange
      const mockProjects = [
        { _id: '1', project_name: 'Project 1', status: 'in progress' },
        { _id: '2', project_name: 'Project 2', status: 'completed' }
      ];

      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mock for chained methods
      const mockPopulate1 = jest.fn().mockReturnThis();
      const mockPopulate2 = jest.fn().mockResolvedValue(mockProjects);

      Project.find.mockReturnValue({
        populate: mockPopulate1
      });
      mockPopulate1.mockReturnValue({
        populate: mockPopulate2
      });

      // Act
      await ProjectController.getAllProjects(mockReq, mockRes);

      // Assert
      expect(Project.find).toHaveBeenCalled();
      expect(mockPopulate1).toHaveBeenCalledWith('id_teamMembre');
      expect(mockPopulate2).toHaveBeenCalledWith('id_tasks');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockProjects);
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Project.find.mockRejectedValue(mockError);

      // Act
      await ProjectController.getAllProjects(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError
      });
    });
  });

  // Tests for getProjectById
  describe('getProjectById', () => {
    it('should get a project by ID successfully', async () => {
      // Arrange
      const mockProject = {
        _id: 'project123',
        project_name: 'Test Project',
        description: 'Test Description',
        status: 'in progress'
      };

      const mockReq = {
        params: { id: 'project123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);

      // Setup mock for chained methods
      const mockPopulate1 = jest.fn().mockReturnThis();
      const mockPopulate2 = jest.fn().mockResolvedValue(mockProject);

      Project.findById.mockReturnValue({
        populate: mockPopulate1
      });
      mockPopulate1.mockReturnValue({
        populate: mockPopulate2
      });

      // Act
      await ProjectController.getProjectById(mockReq, mockRes);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('project123');
      expect(Project.findById).toHaveBeenCalledWith('project123');
      expect(mockPopulate1).toHaveBeenCalledWith('id_teamMembre');
      expect(mockPopulate2).toHaveBeenCalledWith({
        path: 'id_tasks',
        select: 'title description status priority estimated_time actual_time deadline assigned_to'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockProject);
    });

    it('should return 400 for invalid project ID format', async () => {
      // Arrange
      const mockReq = {
        params: { id: 'invalid-id' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      // Act
      await ProjectController.getProjectById(mockReq, mockRes);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('invalid-id');
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid project ID format'
      });
    });

    it('should return 404 if project not found', async () => {
      // Arrange
      const mockReq = {
        params: { id: 'project123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);

      // Setup mock for chained methods
      const mockPopulate1 = jest.fn().mockReturnThis();
      const mockPopulate2 = jest.fn().mockResolvedValue(null);

      Project.findById.mockReturnValue({
        populate: mockPopulate1
      });
      mockPopulate1.mockReturnValue({
        populate: mockPopulate2
      });

      // Act
      await ProjectController.getProjectById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Project not found'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {
        params: { id: 'project123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Project.findById.mockRejectedValue(mockError);

      // Act
      await ProjectController.getProjectById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests for updateProject
  describe('updateProject', () => {
    it('should update a project successfully', async () => {
      // Arrange
      const mockProjectData = {
        project_name: 'Updated Project',
        description: 'Updated Description',
        status: 'completed'
      };

      const mockUpdatedProject = {
        _id: 'project123',
        ...mockProjectData
      };

      const mockReq = {
        params: { id: 'project123' },
        body: mockProjectData
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      projectValidator.validateProject = jest.fn().mockReturnValue({ error: null });
      Project.findByIdAndUpdate.mockResolvedValue(mockUpdatedProject);

      // Act
      await ProjectController.updateProject(mockReq, mockRes);

      // Assert
      expect(projectValidator.validateProject).toHaveBeenCalledWith(mockProjectData);
      expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
        'project123',
        mockProjectData,
        { new: true }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedProject);
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const mockProjectData = {
        project_name: '', // Invalid empty name
        status: 'invalid-status'
      };

      const mockReq = {
        params: { id: 'project123' },
        body: mockProjectData
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const validationError = {
        details: [
          { message: 'Project name is required' },
          { message: 'Status must be one of: not started, in progress, completed' }
        ]
      };

      projectValidator.validateProject = jest.fn().mockReturnValue({ error: validationError });

      // Act
      await ProjectController.updateProject(mockReq, mockRes);

      // Assert
      expect(projectValidator.validateProject).toHaveBeenCalledWith(mockProjectData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: [
          'Project name is required',
          'Status must be one of: not started, in progress, completed'
        ]
      });
    });

    it('should return 404 if project not found', async () => {
      // Arrange
      const mockProjectData = {
        project_name: 'Updated Project',
        description: 'Updated Description'
      };

      const mockReq = {
        params: { id: 'nonexistent' },
        body: mockProjectData
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      projectValidator.validateProject = jest.fn().mockReturnValue({ error: null });
      Project.findByIdAndUpdate.mockResolvedValue(null);

      // Act
      await ProjectController.updateProject(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Project not found'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockProjectData = {
        project_name: 'Updated Project',
        description: 'Updated Description'
      };

      const mockReq = {
        params: { id: 'project123' },
        body: mockProjectData
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      projectValidator.validateProject = jest.fn().mockReturnValue({ error: null });
      Project.findByIdAndUpdate.mockRejectedValue(mockError);

      // Act
      await ProjectController.updateProject(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to update project',
        error: mockError
      });
    });
  });

  // Tests for deleteProject
  describe('deleteProject', () => {
    it('should delete a project successfully', async () => {
      // Arrange
      const mockProject = {
        _id: 'project123',
        project_name: 'Test Project'
      };

      const mockReq = {
        params: { id: 'project123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Project.findByIdAndDelete.mockResolvedValue(mockProject);

      // Act
      await ProjectController.deleteProject(mockReq, mockRes);

      // Assert
      expect(Project.findByIdAndDelete).toHaveBeenCalledWith('project123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Project deleted successfully'
      });
    });

    it('should return 404 if project not found', async () => {
      // Arrange
      const mockReq = {
        params: { id: 'nonexistent' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Project.findByIdAndDelete.mockResolvedValue(null);

      // Act
      await ProjectController.deleteProject(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Project not found'
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {
        params: { id: 'project123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Project.findByIdAndDelete.mockRejectedValue(mockError);

      // Act
      await ProjectController.deleteProject(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to delete project',
        error: mockError
      });
    });
  });

  // Tests for getProjectCount
  describe('getProjectCount', () => {
    it('should get project count successfully', async () => {
      // Arrange
      const mockCount = 5;
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Project.countDocuments.mockResolvedValue(mockCount);

      // Act
      await ProjectController.getProjectCount(mockReq, mockRes);

      // Assert
      expect(Project.countDocuments).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ count: mockCount });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Project.countDocuments.mockRejectedValue(mockError);

      // Act
      await ProjectController.getProjectCount(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError
      });
    });
  });
});