const Message = require('../../models/Message');
const Workspace = require('../../models/Workspace');
const socketUtils = require('../../Socket');
const messageController = require('../../controllers/messageController');

// Mock dependencies
jest.mock('../../models/Message');
jest.mock('../../models/Workspace');
jest.mock('../../Socket');

describe('messageController', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Mock socket.io instance
    socketUtils.getIO.mockReturnValue({
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    });
  });

  // Tests for getWorkspaceMessages
  describe('getWorkspaceMessages', () => {
    it('should get messages for a workspace successfully', async () => {
      // Arrange
      const mockWorkspaceId = 'workspace123';
      const mockUserId = 'user123';
      
      const mockWorkspace = {
        _id: mockWorkspaceId,
        owner: 'owner123',
        members: [{ user: mockUserId }]
      };
      
      const mockMessages = [
        { 
          _id: 'msg1', 
          content: 'Hello', 
          sender: { 
            _id: 'user1', 
            name: 'User 1', 
            email: 'user1@example.com' 
          },
          createdAt: new Date('2023-01-01')
        },
        { 
          _id: 'msg2', 
          content: 'Hi there', 
          sender: { 
            _id: 'user2', 
            name: 'User 2', 
            email: 'user2@example.com' 
          },
          createdAt: new Date('2023-01-02')
        }
      ];

      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        query: { limit: '20' },
        user: { id: mockUserId }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockResolvedValue(mockWorkspace);
      
      const mockSort = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockReturnThis();
      const mockLean = jest.fn().mockResolvedValue(mockMessages);
      
      Message.find.mockReturnValue({
        sort: mockSort,
        limit: mockLimit,
        populate: mockPopulate,
        lean: mockLean
      });

      // Act
      await messageController.getWorkspaceMessages(mockReq, mockRes);

      // Assert
      expect(Workspace.findById).toHaveBeenCalledWith(mockWorkspaceId);
      expect(Message.find).toHaveBeenCalledWith({ workspace: mockWorkspaceId });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockLimit).toHaveBeenCalledWith(20);
      expect(mockPopulate).toHaveBeenCalledWith('sender', 'name email profile_picture');
      expect(mockRes.json).toHaveBeenCalledWith(mockMessages.reverse());
    });

    it('should get messages with "before" parameter', async () => {
      // Arrange
      const mockWorkspaceId = 'workspace123';
      const mockUserId = 'user123';
      const mockBeforeDate = '2023-01-15T00:00:00Z';
      
      const mockWorkspace = {
        _id: mockWorkspaceId,
        owner: 'owner123',
        members: [{ user: mockUserId }]
      };
      
      const mockMessages = [
        { _id: 'msg1', content: 'Hello', createdAt: new Date('2023-01-01') }
      ];

      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        query: { 
          limit: '20',
          before: mockBeforeDate
        },
        user: { id: mockUserId }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockResolvedValue(mockWorkspace);
      
      const mockSort = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockReturnThis();
      const mockLean = jest.fn().mockResolvedValue(mockMessages);
      
      Message.find.mockReturnValue({
        sort: mockSort,
        limit: mockLimit,
        populate: mockPopulate,
        lean: mockLean
      });

      // Act
      await messageController.getWorkspaceMessages(mockReq, mockRes);

      // Assert
      expect(Message.find).toHaveBeenCalledWith({
        workspace: mockWorkspaceId,
        createdAt: { $lt: new Date(mockBeforeDate) }
      });
    });

    it('should return 404 if workspace not found', async () => {
      // Arrange
      const mockWorkspaceId = 'nonexistent';
      
      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        query: { limit: '20' },
        user: { id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockResolvedValue(null);

      // Act
      await messageController.getWorkspaceMessages(mockReq, mockRes);

      // Assert
      expect(Workspace.findById).toHaveBeenCalledWith(mockWorkspaceId);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Workspace not found' });
    });

    it('should return 403 if user is not a member or owner', async () => {
      // Arrange
      const mockWorkspaceId = 'workspace123';
      const mockUserId = 'user123';
      
      const mockWorkspace = {
        _id: mockWorkspaceId,
        owner: 'owner123',
        members: [{ user: 'otheruser456' }] // User not in members
      };

      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        query: { limit: '20' },
        user: { id: mockUserId }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockResolvedValue(mockWorkspace);

      // Act
      await messageController.getWorkspaceMessages(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'You are not a member of this workspace' 
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockWorkspaceId = 'workspace123';
      
      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        query: { limit: '20' },
        user: { id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockRejectedValue(mockError);

      // Act
      await messageController.getWorkspaceMessages(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests for sendMessage
  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      // Arrange
      const mockWorkspaceId = 'workspace123';
      const mockUserId = 'user123';
      const mockContent = 'Hello, this is a test message';
      
      const mockWorkspace = {
        _id: mockWorkspaceId,
        owner: 'owner123',
        members: [{ user: mockUserId }]
      };
      
      const mockNewMessage = {
        _id: 'msg123',
        workspace: mockWorkspaceId,
        sender: { _id: mockUserId, name: 'John Doe' },
        content: mockContent,
        read_by: [{ user: mockUserId }],
        createdAt: new Date(),
        populate: jest.fn().mockResolvedValueOnce({
          _id: 'msg123',
          workspace: mockWorkspaceId,
          sender: { _id: mockUserId, name: 'John Doe' },
          content: mockContent,
          read_by: [{ user: mockUserId }],
          createdAt: new Date(),
          toObject: jest.fn().mockReturnValue({
            _id: 'msg123',
            workspace: mockWorkspaceId,
            sender: { _id: mockUserId, name: 'John Doe' },
            content: mockContent,
            read_by: [{ user: mockUserId }],
            createdAt: new Date()
          })
        }),
        toObject: jest.fn().mockReturnValue({
          _id: 'msg123',
          workspace: mockWorkspaceId,
          sender: { _id: mockUserId, name: 'John Doe' },
          content: mockContent,
          read_by: [{ user: mockUserId }],
          createdAt: new Date()
        }),
        save: jest.fn().mockResolvedValue()
      };

      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        body: { content: mockContent },
        user: { _id: mockUserId }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockResolvedValue(mockWorkspace);
      Message.mockImplementation(() => mockNewMessage);

      // Act
      await messageController.sendMessage(mockReq, mockRes);

      // Assert
      expect(Workspace.findById).toHaveBeenCalledWith(mockWorkspaceId);
      expect(Message).toHaveBeenCalledWith({
        workspace: mockWorkspaceId,
        sender: mockUserId,
        content: mockContent,
        read_by: [{ user: mockUserId }]
      });
      
      expect(mockNewMessage.save).toHaveBeenCalled();
      expect(mockNewMessage.populate).toHaveBeenCalledWith('sender', 'name email profile_picture');
      
      expect(socketUtils.getIO().to).toHaveBeenCalledWith(`workspace-chat:${mockWorkspaceId}`);
      expect(socketUtils.getIO().to().emit).toHaveBeenCalledWith('new-message', expect.any(Object));
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'msg123',
        content: mockContent
      }));
    });

    it('should return 400 if content is empty', async () => {
      // Arrange
      const mockWorkspaceId = 'workspace123';
      
      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        body: { content: '' }, // Empty content
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Act
      await messageController.sendMessage(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Message content is required' 
      });
    });

    it('should return 404 if workspace not found', async () => {
      // Arrange
      const mockWorkspaceId = 'nonexistent';
      const mockContent = 'Hello, this is a test message';
      
      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        body: { content: mockContent },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockResolvedValue(null);

      // Act
      await messageController.sendMessage(mockReq, mockRes);

      // Assert
      expect(Workspace.findById).toHaveBeenCalledWith(mockWorkspaceId);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Workspace not found' 
      });
    });

    it('should return 403 if user is not a member or owner', async () => {
      // Arrange
      const mockWorkspaceId = 'workspace123';
      const mockUserId = 'user123';
      const mockContent = 'Hello, this is a test message';
      
      const mockWorkspace = {
        _id: mockWorkspaceId,
        owner: 'owner123',
        members: [{ user: 'otheruser456' }] // User not in members
      };

      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        body: { content: mockContent },
        user: { _id: mockUserId }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockResolvedValue(mockWorkspace);

      // Act
      await messageController.sendMessage(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'You are not a member of this workspace' 
      }));
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockWorkspaceId = 'workspace123';
      const mockContent = 'Hello, this is a test message';
      
      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        body: { content: mockContent },
        user: { _id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockRejectedValue(mockError);

      // Act
      await messageController.sendMessage(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests for markAsRead
  describe('markAsRead', () => {
    it('should mark messages as read successfully', async () => {
      // Arrange
      const mockWorkspaceId = 'workspace123';
      const mockUserId = 'user123';
      const mockMessageIds = ['msg1', 'msg2', 'msg3'];
      
      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        body: { messageIds: mockMessageIds },
        user: { id: mockUserId }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Message.updateMany.mockResolvedValue({ nModified: 3 });

      // Act
      await messageController.markAsRead(mockReq, mockRes);

      // Assert
      expect(Message.updateMany).toHaveBeenCalledWith(
        {
          _id: { $in: mockMessageIds },
          workspace: mockWorkspaceId,
          'read_by.user': { $ne: mockUserId }
        },
        {
          $push: { read_by: { user: mockUserId, read_at: expect.any(Date) } }
        }
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Messages marked as read' 
      });
    });

    it('should return 400 if messageIds is not provided', async () => {
      // Arrange
      const mockWorkspaceId = 'workspace123';
      
      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        body: { }, // No messageIds
        user: { id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Act
      await messageController.markAsRead(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Message IDs are required' 
      });
    });

    it('should return 400 if messageIds is empty array', async () => {
      // Arrange
      const mockWorkspaceId = 'workspace123';
      
      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        body: { messageIds: [] }, // Empty array
        user: { id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Act
      await messageController.markAsRead(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Message IDs are required' 
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockWorkspaceId = 'workspace123';
      const mockMessageIds = ['msg1', 'msg2', 'msg3'];
      
      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        body: { messageIds: mockMessageIds },
        user: { id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Message.updateMany.mockRejectedValue(mockError);

      // Act
      await messageController.markAsRead(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Server error',
        error: mockError.message
      });
    });
  });

  // Tests for getUnreadCount
  describe('getUnreadCount', () => {
    it('should get unread message count successfully', async () => {
      // Arrange
      const mockWorkspaceId = 'workspace123';
      const mockUserId = 'user123';
      const mockCount = 5;
      
      const mockWorkspace = {
        _id: mockWorkspaceId,
        owner: 'owner123',
        members: [{ user: mockUserId }]
      };

      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        user: { id: mockUserId }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockResolvedValue(mockWorkspace);
      Message.countDocuments.mockResolvedValue(mockCount);

      // Act
      await messageController.getUnreadCount(mockReq, mockRes);

      // Assert
      expect(Workspace.findById).toHaveBeenCalledWith(mockWorkspaceId);
      expect(Message.countDocuments).toHaveBeenCalledWith({
        workspace: mockWorkspaceId,
        sender: { $ne: mockUserId },
        'read_by.user': { $ne: mockUserId }
      });
      
      expect(mockRes.json).toHaveBeenCalledWith({ count: mockCount });
    });

    it('should return 404 if workspace not found', async () => {
      // Arrange
      const mockWorkspaceId = 'nonexistent';
      
      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        user: { id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockResolvedValue(null);

      // Act
      await messageController.getUnreadCount(mockReq, mockRes);

      // Assert
      expect(Workspace.findById).toHaveBeenCalledWith(mockWorkspaceId);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Workspace not found' 
      });
    });

    it('should return 403 if user is not a member or owner', async () => {
      // Arrange
      const mockWorkspaceId = 'workspace123';
      const mockUserId = 'user123';
      
      const mockWorkspace = {
        _id: mockWorkspaceId,
        owner: 'owner123',
        members: [{ user: 'otheruser456' }] // User not in members
      };

      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        user: { id: mockUserId }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockResolvedValue(mockWorkspace);

      // Act
      await messageController.getUnreadCount(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'You are not a member of this workspace' 
      });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockWorkspaceId = 'workspace123';
      
      const mockReq = {
        params: { workspaceId: mockWorkspaceId },
        user: { id: 'user123' }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Setup mocks
      Workspace.findById.mockRejectedValue(mockError);

      // Act
      await messageController.getUnreadCount(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Server error',
        error: mockError.message
      });
    });
  });
});