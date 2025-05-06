const Workspace = require('../../models/Workspace');
const User = require('../../models/User');
const Invitation = require('../../models/Invitation');
const Project = require('../../models/Project');
const {
  addWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceCount
} = require('../../controllers/WorkspaceController');
const { validateWorkspace } = require('../../validators/WorkspaceValidator');
const mongoose = require('mongoose');

// Mock des dépendances
jest.mock('../../models/Workspace');
jest.mock('../../models/User');
jest.mock('../../models/Invitation');
jest.mock('../../models/Project');
jest.mock('../../validators/WorkspaceValidator');

describe('WorkspaceController', () => {
  // Configuration avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests pour addWorkspace
  describe('addWorkspace', () => {
    it('should create a workspace successfully', async () => {
      // Arrange
      const mockWorkspaceData = {
        name: 'Test Workspace',
        description: 'Test Description',
        owner: '123456'
      };
      
      const mockReq = { body: mockWorkspaceData };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      validateWorkspace.mockReturnValue({ error: null });
      
      const mockSavedWorkspace = { ...mockWorkspaceData, _id: '789' };
      const mockSave = jest.fn().mockResolvedValue(mockSavedWorkspace);
      Workspace.mockImplementation(() => ({
        save: mockSave
      }));

      // Act
      await addWorkspace(mockReq, mockRes);

      // Assert
      expect(validateWorkspace).toHaveBeenCalledWith(mockWorkspaceData);
      expect(mockSave).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockSavedWorkspace);
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const mockWorkspaceData = {
        name: '', // Invalid name
        description: 'Test Description'
      };
      
      const mockReq = { body: mockWorkspaceData };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      const validationError = {
        details: [{ message: 'Name is required' }]
      };
      
      validateWorkspace.mockReturnValue({ error: validationError });

      // Act
      await addWorkspace(mockReq, mockRes);

      // Assert
      expect(validateWorkspace).toHaveBeenCalledWith(mockWorkspaceData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ errors: ['Name is required'] });
    });

    it('should return 500 on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockWorkspaceData = {
        name: 'Test Workspace',
        description: 'Test Description'
      };
      
      const mockReq = { body: mockWorkspaceData };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      validateWorkspace.mockReturnValue({ error: null });
      
      const mockSave = jest.fn().mockRejectedValue(mockError);
      Workspace.mockImplementation(() => ({
        save: mockSave
      }));

      // Act
      await addWorkspace(mockReq, mockRes);

      // Assert
      expect(validateWorkspace).toHaveBeenCalledWith(mockWorkspaceData);
      expect(mockSave).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests pour getAllWorkspaces
  describe('getAllWorkspaces', () => {
    it('should return all workspaces on successful query', async () => {
      // Arrange
      const mockWorkspaces = [
        { _id: '1', name: 'Workspace 1' },
        { _id: '2', name: 'Workspace 2' }
      ];
      
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      const mockPopulate = jest.fn().mockResolvedValue(mockWorkspaces);
      Workspace.find.mockReturnValue({
        populate: mockPopulate
      });

      // Act
      await getAllWorkspaces(mockReq, mockRes);

      // Assert
      expect(Workspace.find).toHaveBeenCalled();
      expect(mockPopulate).toHaveBeenCalledWith('owner members.user projects');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockWorkspaces);
    });

    it('should return 500 on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      Workspace.find.mockImplementation(() => {
        throw mockError;
      });

      // Act
      await getAllWorkspaces(mockReq, mockRes);

      // Assert
      expect(Workspace.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests pour getWorkspaceById
  describe('getWorkspaceById', () => {
    it('should return workspace by id on successful query', async () => {
      // Arrange
      const mockWorkspace = { _id: '123', name: 'Test Workspace' };
      const mockReq = { 
        params: { id: '123' },
        query: {}
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      const mockExec = jest.fn().mockResolvedValue(mockWorkspace);
      const mockPopulate = jest.fn().mockReturnThis();
      
      Workspace.findById.mockReturnValue({
        populate: mockPopulate,
        exec: mockExec
      });

      // Act
      await getWorkspaceById(mockReq, mockRes);

      // Assert
      expect(Workspace.findById).toHaveBeenCalledWith('123');
      expect(mockPopulate).toHaveBeenCalledWith('owner', 'name email profile_picture');
      expect(mockExec).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockWorkspace);
    });

    it('should populate projects if populate=projects query param is present', async () => {
      // Arrange
      const mockWorkspace = { _id: '123', name: 'Test Workspace' };
      const mockReq = { 
        params: { id: '123' },
        query: { populate: 'projects' }
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      const mockExec = jest.fn().mockResolvedValue(mockWorkspace);
      const mockPopulate = jest.fn().mockReturnThis();
      
      Workspace.findById.mockReturnValue({
        populate: mockPopulate,
        exec: mockExec
      });

      // Act
      await getWorkspaceById(mockReq, mockRes);

      // Assert
      expect(Workspace.findById).toHaveBeenCalledWith('123');
      expect(mockPopulate).toHaveBeenCalledWith('owner', 'name email profile_picture');
      expect(mockPopulate).toHaveBeenCalledWith('projects.createdBy', 'name email');
      expect(mockExec).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockWorkspace);
    });

    it('should return 404 if workspace not found', async () => {
      // Arrange
      const mockReq = { 
        params: { id: '123' },
        query: {}
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockPopulate = jest.fn().mockReturnThis();
      
      Workspace.findById.mockReturnValue({
        populate: mockPopulate,
        exec: mockExec
      });

      // Act
      await getWorkspaceById(mockReq, mockRes);

      // Assert
      expect(Workspace.findById).toHaveBeenCalledWith('123');
      expect(mockExec).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Workspace not found' });
    });

    it('should return 500 on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = { 
        params: { id: '123' },
        query: {}
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      Workspace.findById.mockImplementation(() => {
        throw mockError;
      });

      // Act
      await getWorkspaceById(mockReq, mockRes);

      // Assert
      expect(Workspace.findById).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests pour updateWorkspace
  describe('updateWorkspace', () => {
    it('should update a workspace successfully', async () => {
      // Arrange
      const mockWorkspaceData = {
        name: 'Updated Workspace',
        description: 'Updated Description'
      };
      
      const mockUpdatedWorkspace = { _id: '123', ...mockWorkspaceData };
      
      const mockReq = { 
        params: { id: '123' },
        body: mockWorkspaceData
      };
      
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      validateWorkspace.mockReturnValue({ error: null });
      
      const mockPopulate = jest.fn().mockResolvedValue(mockUpdatedWorkspace);
      Workspace.findByIdAndUpdate.mockReturnValue({
        populate: mockPopulate
      });

      // Act
      await updateWorkspace(mockReq, mockRes);

      // Assert
      expect(validateWorkspace).toHaveBeenCalledWith(mockWorkspaceData);
      expect(Workspace.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        mockWorkspaceData,
        { new: true, runValidators: true }
      );
      expect(mockPopulate).toHaveBeenCalledWith('owner members.user projects');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedWorkspace);
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const mockWorkspaceData = {
        name: '', // Invalid name
        description: 'Updated Description'
      };
      
      const mockReq = { 
        params: { id: '123' },
        body: mockWorkspaceData
      };
      
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      const validationError = {
        details: [{ message: 'Name is required' }]
      };
      
      validateWorkspace.mockReturnValue({ error: validationError });

      // Act
      await updateWorkspace(mockReq, mockRes);

      // Assert
      expect(validateWorkspace).toHaveBeenCalledWith(mockWorkspaceData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ errors: ['Name is required'] });
    });

    it('should return 404 if workspace not found', async () => {
      // Arrange
      const mockWorkspaceData = {
        name: 'Updated Workspace',
        description: 'Updated Description'
      };
      
      const mockReq = { 
        params: { id: '123' },
        body: mockWorkspaceData
      };
      
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      validateWorkspace.mockReturnValue({ error: null });
      
      const mockPopulate = jest.fn().mockResolvedValue(null);
      Workspace.findByIdAndUpdate.mockReturnValue({
        populate: mockPopulate
      });

      // Act
      await updateWorkspace(mockReq, mockRes);

      // Assert
      expect(validateWorkspace).toHaveBeenCalledWith(mockWorkspaceData);
      expect(Workspace.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        mockWorkspaceData,
        { new: true, runValidators: true }
      );
      expect(mockPopulate).toHaveBeenCalledWith('owner members.user projects');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Workspace not found' });
    });

    it('should return 500 on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockWorkspaceData = {
        name: 'Updated Workspace',
        description: 'Updated Description'
      };
      
      const mockReq = { 
        params: { id: '123' },
        body: mockWorkspaceData
      };
      
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      validateWorkspace.mockReturnValue({ error: null });
      Workspace.findByIdAndUpdate.mockImplementation(() => {
        throw mockError;
      });

      // Act
      await updateWorkspace(mockReq, mockRes);

      // Assert
      expect(validateWorkspace).toHaveBeenCalledWith(mockWorkspaceData);
      expect(Workspace.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests pour deleteWorkspace
  describe('deleteWorkspace', () => {
    it('should delete a workspace successfully', async () => {
      // Arrange
      const mockDeletedWorkspace = { _id: '123', name: 'Test Workspace' };
      
      const mockReq = { params: { id: '123' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      Workspace.findByIdAndDelete.mockResolvedValue(mockDeletedWorkspace);

      // Act
      await deleteWorkspace(mockReq, mockRes);

      // Assert
      expect(Workspace.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Workspace deleted successfully' });
    });

    it('should return 404 if workspace not found', async () => {
      // Arrange
      const mockReq = { params: { id: '123' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      Workspace.findByIdAndDelete.mockResolvedValue(null);

      // Act
      await deleteWorkspace(mockReq, mockRes);

      // Assert
      expect(Workspace.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Workspace not found' });
    });

    it('should return 500 on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = { params: { id: '123' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      Workspace.findByIdAndDelete.mockRejectedValue(mockError);

      // Act
      await deleteWorkspace(mockReq, mockRes);

      // Assert
      expect(Workspace.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests pour getWorkspaceCount
  describe('getWorkspaceCount', () => {
    it('should return the count of workspaces', async () => {
      // Arrange
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      Workspace.countDocuments.mockResolvedValue(5);

      // Act
      await getWorkspaceCount(mockReq, mockRes);

      // Assert
      expect(Workspace.countDocuments).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ count: 5 });
    });

    it('should return 500 on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      Workspace.countDocuments.mockRejectedValue(mockError);

      // Act
      await getWorkspaceCount(mockReq, mockRes);

      // Assert
      expect(Workspace.countDocuments).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });
});