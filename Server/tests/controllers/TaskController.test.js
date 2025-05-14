const Task = require('../../models/Task');
const Project = require('../../models/Project');
const taskValidator = require('../../validators/taskValidator');
const TaskController = require('../../controllers/TaskController');
const mongoose = require('mongoose');

// Mock des dépendances
jest.mock('../../models/Task');
jest.mock('../../models/Project');
jest.mock('../../validators/taskValidator');

describe('TaskController', () => {
  // Configuration avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Mock console.log
    console.error = jest.fn(); // Mock console.error
  });

  // Tests pour createTask
  describe('createTask', () => {
    it('should create a task successfully', async () => {
      // Arrange
      const mockTaskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'medium'
      };
      
      const mockReq = { 
        params: { projectId: '123' },
        body: mockTaskData 
      };
      
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      const mockSavedTask = { 
        _id: '789', 
        ...mockTaskData, 
        project_id: '123' 
      };
      
      const mockPopulatedTask = { 
        ...mockSavedTask, 
        assigned_to: { name: 'John Doe', email: 'john@example.com' }
      };
      
      const mockSave = jest.fn().mockResolvedValue(mockSavedTask);
      Task.mockImplementation(() => ({
        save: mockSave
      }));
      
      Task.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPopulatedTask)
      });
      
      Project.findByIdAndUpdate.mockResolvedValue({});

      // Act
      await TaskController.createTask(mockReq, mockRes);

      // Assert
      expect(Task).toHaveBeenCalledWith({
        ...mockTaskData,
        project_id: '123'
      });
      expect(mockSave).toHaveBeenCalled();
      expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        { $push: { id_tasks: mockSavedTask._id } }
      );
      expect(Task.findById).toHaveBeenCalledWith(mockSavedTask._id);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockPopulatedTask);
    });

    it('should return 500 on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = { 
        params: { projectId: '123' },
        body: { title: 'Test Task' } 
      };
      
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      const mockSave = jest.fn().mockRejectedValue(mockError);
      Task.mockImplementation(() => ({
        save: mockSave
      }));

      // Act
      await TaskController.createTask(mockReq, mockRes);

      // Assert
      expect(mockSave).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests pour getTasksByProject
  describe('getTasksByProject', () => {
    it('should return tasks for a project', async () => {
      // Arrange
      const mockTasks = [
        { _id: '1', title: 'Task 1' },
        { _id: '2', title: 'Task 2' }
      ];
      
      const mockReq = { params: { projectId: '123' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      const mockSort = jest.fn().mockResolvedValue(mockTasks);
      const mockPopulate = jest.fn().mockReturnThis();
      
      Task.find.mockReturnValue({
        populate: mockPopulate,
        sort: mockSort
      });

      // Act
      await TaskController.getTasksByProject(mockReq, mockRes);

      // Assert
      expect(Task.find).toHaveBeenCalledWith({ project_id: '123' });
      expect(mockPopulate).toHaveBeenCalledWith('assigned_to', 'name email profile_picture');
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
    });

    it('should return 500 on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = { params: { projectId: '123' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      Task.find.mockImplementation(() => {
        throw mockError;
      });

      // Act
      await TaskController.getTasksByProject(mockReq, mockRes);

      // Assert
      expect(Task.find).toHaveBeenCalledWith({ project_id: '123' });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests pour updateTask
describe('updateTask', () => {
  it('should update a task successfully', async () => {
    // Arrange
    const mockTaskData = {
      title: 'Updated Task',
      description: 'Updated Description'
    };

    const updatedTask = {
      _id: '123',
      ...mockTaskData,
      status: 'in_progress'
    };

    const mockReq = {
      params: { id: '123' },
      body: mockTaskData
    };

    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    taskValidator.updateTask = {
      validate: jest.fn().mockReturnValue({ error: null })
    };

    // Chaînage des appels populate().populate().then(...)
   const mockPopulateChain = {
  populate: jest.fn().mockReturnThis(),
  then: jest.fn((resolve) => resolve(updatedTask)) // 👈 Corrige ici
};
Task.findByIdAndUpdate.mockReturnValue(mockPopulateChain);


    // Act
    await TaskController.updateTask(mockReq, mockRes);

    // Assert
    expect(taskValidator.updateTask.validate).toHaveBeenCalledWith(mockTaskData, { abortEarly: false });
    expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
      '123',
      mockTaskData,
      { new: true, runValidators: true }
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    });
  });

  it('should return 400 if validation fails', async () => {
    // Arrange
    const mockTaskData = {
      title: '', // Invalid title
      description: 'Updated Description'
    };

    const mockReq = {
      params: { id: '123' },
      body: mockTaskData
    };

    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    const validationError = {
      details: [{ path: ['title'], message: 'Title is required' }]
    };

    taskValidator.updateTask = {
      validate: jest.fn().mockReturnValue({ error: validationError })
    };

    // Act
    await TaskController.updateTask(mockReq, mockRes);

    // Assert
    expect(taskValidator.updateTask.validate).toHaveBeenCalledWith(mockTaskData, { abortEarly: false });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      errors: [{ field: 'title', message: 'Title is required' }]
    });
  });

  it('should return 404 if task not found', async () => {
    // Arrange
    const mockTaskData = {
      title: 'Updated Task',
      description: 'Updated Description'
    };

    const mockReq = {
      params: { id: '123' },
      body: mockTaskData
    };

    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    taskValidator.updateTask = {
      validate: jest.fn().mockReturnValue({ error: null })
    };

    // Chaînage mais retourne null (task non trouvée)
    const mockPopulateChain = {
  populate: jest.fn().mockReturnThis(),
  then: jest.fn((resolve) => resolve(null)) // 👈 Corrige ici
};
Task.findByIdAndUpdate.mockReturnValue(mockPopulateChain);


    // Act
    await TaskController.updateTask(mockReq, mockRes);

    // Assert
    expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
      '123',
      mockTaskData,
      { new: true, runValidators: true }
    );
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Task not found'
    });
  });

  it('should return 400 on validation error', async () => {
    // Arrange
    const mockError = new Error('Validation error');
    mockError.name = 'ValidationError';

    const mockTaskData = {
      title: 'Updated Task',
      description: 'Updated Description'
    };

    const mockReq = {
      params: { id: '123' },
      body: mockTaskData
    };

    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    taskValidator.updateTask = {
      validate: jest.fn().mockReturnValue({ error: null })
    };

    Task.findByIdAndUpdate.mockImplementation(() => {
      throw mockError;
    });

    // Act
    await TaskController.updateTask(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: mockError.message
    });
  });
});


  // Tests pour deleteTask
  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      // Arrange
      const mockTaskId = '123';
      const mockTaskWithProjectId = { 
        _id: mockTaskId, 
        project_id: '456',
        title: 'Task to delete' 
      };
      
      const mockReq = { params: { id: mockTaskId } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      Task.findById.mockResolvedValue(mockTaskWithProjectId);
      Project.findByIdAndUpdate.mockResolvedValue({});
      Task.findByIdAndDelete.mockResolvedValue(mockTaskWithProjectId);

      // Act
      await TaskController.deleteTask(mockReq, mockRes);

      // Assert
      expect(Task.findById).toHaveBeenCalledWith(mockTaskId);
      expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTaskWithProjectId.project_id,
        { $pull: { id_tasks: mockTaskId } }
      );
      expect(Task.findByIdAndDelete).toHaveBeenCalledWith(mockTaskId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Task deleted successfully'
      });
    });

    it('should return 404 if task not found', async () => {
      // Arrange
      const mockTaskId = '123';
      const mockReq = { params: { id: mockTaskId } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      Task.findById.mockResolvedValue(null);

      // Act
      await TaskController.deleteTask(mockReq, mockRes);

      // Assert
      expect(Task.findById).toHaveBeenCalledWith(mockTaskId);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Task not found'
      });
    });

    it('should return 500 on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockTaskId = '123';
      const mockReq = { params: { id: mockTaskId } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      Task.findById.mockImplementation(() => {
        throw mockError;
      });

      // Act
      await TaskController.deleteTask(mockReq, mockRes);

      // Assert
      expect(Task.findById).toHaveBeenCalledWith(mockTaskId);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: mockError.message
      });
    });
  });
});
