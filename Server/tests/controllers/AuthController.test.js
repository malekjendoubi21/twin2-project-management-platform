const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthController = require('../../controllers/AuthController');
const sendEmail = require('../../utils/sendEmail');
const crypto = require('crypto');
const axios = require('axios');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../utils/sendEmail');
jest.mock('crypto');
jest.mock('axios');

describe('AuthController', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRE_TIME = '1h';
  });

  // Tests for login
  describe('login', () => {
    it('should login user successfully and set cookie', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'user'
      };

      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };

      const mockRes = {
        cookie: jest.fn().mockReturnThis(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock_token');

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '123', email: 'test@example.com' },
        'test-secret',
        { expiresIn: '1h' }
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        'mock_token',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Connexion réussie',
        user: {
          _id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        }
      });
    });

    it('should return 401 if email is incorrect', async () => {
      // Arrange
      const mockReq = {
        body: {
          email: 'wrong@example.com',
          password: 'password123'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      User.findOne.mockResolvedValue(null);

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'wrong@example.com' });
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email ou mot de passe incorrect' });
    });

    it('should return 401 if password is incorrect', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashed_password'
      };

      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'wrong_password'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', 'hashed_password');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email ou mot de passe incorrect' });
    });

    it('should return 500 if server error occurs', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      User.findOne.mockRejectedValue(mockError);

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        error: 'Erreur serveur', 
        details: mockError 
      });
    });
  });

  // Tests for register
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const mockUserData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'user'
      };

      const mockReq = {
        body: mockUserData
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockValidator = {
        error: null,
        value: mockUserData
      };

      const mockNewUser = {
        _id: '456',
        ...mockUserData,
        save: jest.fn().mockResolvedValue()
      };
      
      // Mock validator function
      const validators = require('../../validators/validators');
      validators.validateUser = jest.fn().mockReturnValue(mockValidator);
      
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_password');
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed_token')
      });
      
      // Mock User constructor
      User.mockImplementation(() => mockNewUser);
      
      // Act
      await AuthController.register(mockReq, mockRes);

      // Assert
      expect(validators.validateUser).toHaveBeenCalledWith(mockUserData);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'new@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New User',
        email: 'new@example.com',
        password: 'hashed_password',
        role: 'user',
        emailVerificationToken: 'hashed_token'
      }));
      expect(mockNewUser.save).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.stringContaining('Utilisateur créé avec succès'),
        userId: '456'
      });
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const mockUserData = {
        name: '', // Invalid name
        email: 'invalid-email',
        password: '123' // Too short
      };

      const mockReq = {
        body: mockUserData
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const validationError = {
        details: [
          { message: 'Name is required' },
          { message: 'Invalid email format' },
          { message: 'Password must be at least 6 characters' }
        ]
      };

      // Mock validator function
      const validators = require('../../validators/validators');
      validators.validateUser = jest.fn().mockReturnValue({
        error: validationError
      });

      // Act
      await AuthController.register(mockReq, mockRes);

      // Assert
      expect(validators.validateUser).toHaveBeenCalledWith(mockUserData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          'Name is required',
          'Invalid email format',
          'Password must be at least 6 characters'
        ])
      });
    });

    it('should return 400 if email already exists', async () => {
      // Arrange
      const mockUserData = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      };

      const mockReq = {
        body: mockUserData
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockValidator = {
        error: null,
        value: mockUserData
      };

      // Mock validator function
      const validators = require('../../validators/validators');
      validators.validateUser = jest.fn().mockReturnValue(mockValidator);
      
      // Mock existing user
      const existingUser = { _id: '789', email: 'existing@example.com' };
      User.findOne.mockResolvedValue(existingUser);

      // Act
      await AuthController.register(mockReq, mockRes);

      // Assert
      expect(validators.validateUser).toHaveBeenCalledWith(mockUserData);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email déjà utilisé.' });
    });

    it('should return 500 if server error occurs', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockUserData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      };

      const mockReq = {
        body: mockUserData
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockValidator = {
        error: null,
        value: mockUserData
      };

      // Mock validator function
      const validators = require('../../validators/validators');
      validators.validateUser = jest.fn().mockReturnValue(mockValidator);
      
      User.findOne.mockRejectedValue(mockError);

      // Act
      await AuthController.register(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });

  // Tests for logout
  describe('logout', () => {
    it('should clear cookie and return success message', () => {
      // Arrange
      const mockReq = {};
      const mockRes = {
        clearCookie: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Act
      AuthController.logout(mockReq, mockRes);

      // Assert
      expect(mockRes.clearCookie).toHaveBeenCalledWith('token', expect.objectContaining({
        path: '/',
      }));
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Déconnexion réussie' });
    });
  });

  // Tests for protection middleware
  describe('protection', () => {
    it('should authorize user with valid token in authorization header', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User'
      };

      const mockReq = {
        headers: {
          authorization: 'Bearer valid_token'
        },
        cookies: {}
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNext = jest.fn();

      jwt.verify.mockReturnValue({ id: '123' });
      User.findById.mockResolvedValue(mockUser);

      // Act
      await AuthController.protection(mockReq, mockRes, mockNext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test-secret');
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should authorize user with valid token in cookie', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User'
      };

      const mockReq = {
        headers: {},
        cookies: {
          token: 'valid_cookie_token'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNext = jest.fn();

      jwt.verify.mockReturnValue({ id: '123' });
      User.findById.mockResolvedValue(mockUser);

      // Act
      await AuthController.protection(mockReq, mockRes, mockNext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid_cookie_token', 'test-secret');
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', async () => {
      // Arrange
      const mockReq = {
        headers: {},
        cookies: {}
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNext = jest.fn();

      // Act
      await AuthController.protection(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Non authentifiéee. Veuillez vous connecter.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      // Arrange
      const mockReq = {
        headers: {
          authorization: 'Bearer invalid_token'
        },
        cookies: {}
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNext = jest.fn();

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      await AuthController.protection(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Non authentifié. Veuillez vous connecter.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not found', async () => {
      // Arrange
      const mockReq = {
        headers: {
          authorization: 'Bearer valid_token'
        },
        cookies: {}
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNext = jest.fn();

      jwt.verify.mockReturnValue({ id: '123' });
      User.findById.mockResolvedValue(null);

      // Act
      await AuthController.protection(mockReq, mockRes, mockNext);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Utilisateur non trouvé. Veuillez vous connecter.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // Tests for allowTo middleware
  describe('allowTo', () => {
    it('should allow access for user with correct role', () => {
      // Arrange
      const middleware = AuthController.allowTo('admin', 'superadmin');
      
      const mockReq = {
        user: {
          _id: '123',
          email: 'admin@example.com',
          role: 'admin'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNext = jest.fn();

      // Act
      middleware(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 for user with incorrect role', () => {
      // Arrange
      const middleware = AuthController.allowTo('admin', 'superadmin');
      
      const mockReq = {
        user: {
          _id: '123',
          email: 'user@example.com',
          role: 'user'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNext = jest.fn();

      // Act
      middleware(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Non autorisé.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if no user is provided', () => {
      // Arrange
      const middleware = AuthController.allowTo('admin');
      
      const mockReq = {};

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockNext = jest.fn();

      // Act
      middleware(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        error: 'Non authentifié. Veuillez vous connecter.' 
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // Tests for forgotPassword
  describe('forgotPassword', () => {
    it('should generate and send reset token', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        save: jest.fn().mockResolvedValue()
      };

      const mockReq = {
        body: {
          email: 'test@example.com'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      User.findOne.mockResolvedValue(mockUser);
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed_token')
      });

      // Act
      await AuthController.forgotPassword(mockReq, mockRes);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.passwordResetToken).toBe('hashed_token');
      expect(mockUser.passwordResetExpires).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          name: 'Test User',
          subject: expect.stringContaining('Réinitialisation')
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'succes',
        message: expect.stringContaining('Code de réinitialisation envoyé')
      });
    });

    it('should return 404 if user is not found', async () => {
      // Arrange
      const mockReq = {
        body: {
          email: 'nonexistent@example.com'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      User.findOne.mockResolvedValue(null);

      // Act
      await AuthController.forgotPassword(mockReq, mockRes);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Utilisateur non trouvé.' });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      
      const mockReq = {
        body: {
          email: 'test@example.com'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      User.findOne.mockRejectedValue(mockError);

      // Act
      await AuthController.forgotPassword(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });

  // Tests for verifyEmail
  describe('verifyEmail', () => {
    it('should verify user email successfully', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        save: jest.fn().mockResolvedValue()
      };

      const mockReq = {
        body: {
          userId: '123',
          verificationToken: '123456'
        }
      };

      const mockRes = {
        cookie: jest.fn().mockReturnThis(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed_token')
      });

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock_token');

      // Act
      await AuthController.verifyEmail(mockReq, mockRes);

      // Assert
      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(User.findOne).toHaveBeenCalledWith({
        _id: '123',
        emailVerificationToken: 'hashed_token',
        emailVerificationExpires: { $gt: expect.any(Number) }
      });
      
      expect(mockUser.isVerified).toBe(true);
      expect(mockUser.emailVerificationToken).toBeUndefined();
      expect(mockUser.emailVerificationExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '123', email: 'test@example.com' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        'mock_token',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Adresse email vérifiée avec succès.',
        user: {
          _id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        }
      });
    });

    it('should return 400 if token is invalid or expired', async () => {
      // Arrange
      const mockReq = {
        body: {
          userId: '123',
          verificationToken: 'invalid_token'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed_token')
      });

      User.findOne.mockResolvedValue(null);

      // Act
      await AuthController.verifyEmail(mockReq, mockRes);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        _id: '123',
        emailVerificationToken: 'hashed_token',
        emailVerificationExpires: { $gt: expect.any(Number) }
      });
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token invalide ou expiré.' });
    });

    it('should return 500 on server error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      
      const mockReq = {
        body: {
          userId: '123',
          verificationToken: '123456'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed_token')
      });

      User.findOne.mockRejectedValue(mockError);

      // Act
      await AuthController.verifyEmail(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });
});