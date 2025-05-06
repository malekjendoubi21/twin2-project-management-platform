const User = require('../../models/User');
const bcrypt = require('bcrypt');
const { getUserById, getAllUsers, addUser, updateUser, dropUser, changePassword, getUserCount } = require('../../controllers/UserController');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mock des dépendances
jest.mock('../../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UserController', () => {
  // Configuration avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests pour getAllUsers
  describe('getAllUsers', () => {
    it('should return all users on successful query', async () => {
      // Arrange
      const mockUsers = [{ name: 'User1' }, { name: 'User2' }];
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      User.find.mockResolvedValue(mockUsers);

      // Act
      await getAllUsers(mockReq, mockRes);

      // Assert
      expect(User.find).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return 500 status on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      User.find.mockRejectedValue(mockError);

      // Act
      await getAllUsers(mockReq, mockRes);

      // Assert
      expect(User.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve users",
        details: mockError
      });
    });
  });

  // Tests pour getUserById
  describe('getUserById', () => {
    it('should return user by id on successful query', async () => {
      // Arrange
      const mockUser = { _id: '123', name: 'Test User' };
      const mockPopulateObject = {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser)
      };
      const mockReq = { params: { id: '123' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      // Setup pour le chaînage des méthodes
      User.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue(mockPopulateObject)
      });

      // Act
      await getUserById(mockReq, mockRes);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user not found', async () => {
      // Arrange
      const mockPopulateObject = {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      };
      const mockReq = { params: { id: '123' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      User.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue(mockPopulateObject)
      });

      // Act
      await getUserById(mockReq, mockRes);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it('should return 500 on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = { params: { id: '123' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      User.findById.mockRejectedValue(mockError);

      // Act
      await getUserById(mockReq, mockRes);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve user",
        details: mockError.message
      });
    });
  });

  // Tests pour addUser
  describe('addUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const mockUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user'
      };
      const mockNewUser = { ...mockUserData, _id: '123' };
      
      const mockReq = { body: mockUserData };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      // Mock des validateurs et autres fonctions
      jest.requireMock('../../validators/validators').validateUser = jest.fn().mockReturnValue({ value: mockUserData });
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      const mockSave = jest.fn().mockResolvedValue(mockNewUser);
      User.mockImplementation(() => ({
        save: mockSave
      }));

      // Act
      await addUser(mockReq, mockRes);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: mockUserData.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(mockSave).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User created successfully',
        user: expect.any(Object)
      });
    });
    
    // Add more tests for error cases...
  });

  // Tests pour getUserCount
  describe('getUserCount', () => {
    it('should return the count of users', async () => {
      // Arrange
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      User.countDocuments.mockResolvedValue(10);

      // Act
      await getUserCount(mockReq, mockRes);

      // Assert
      expect(User.countDocuments).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ count: 10 });
    });

    it('should return 500 on error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      User.countDocuments.mockRejectedValue(mockError);

      // Act
      await getUserCount(mockReq, mockRes);

      // Assert
      expect(User.countDocuments).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve user count",
        details: mockError
      });
    });
  });
  
  // Vous pouvez ajouter des tests similaires pour les autres méthodes du contrôleur
});