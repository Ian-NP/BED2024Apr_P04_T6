const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const RefreshTokenModel = require('../models/refreshToken');
const userController = require('../controllers/userController');
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

jest.mock('../models/user');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../models/refreshToken');

describe('userController', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [{ userId: 1, name: 'John Doe' }];
      User.getAllUsers.mockResolvedValue(users);

      await userController.getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(users);
    });

    it('should handle errors', async () => {
      User.getAllUsers.mockRejectedValue(new Error('Database error'));

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error retrieving users');
    });
  });

  describe('getUserByUserId', () => {
    it('should return a user by userId', async () => {
      req.params = { userId: '1' };
      const user = { userId: 1, name: 'John Doe' };
      User.getUserByUserId.mockResolvedValue(user);

      await userController.getUserByUserId(req, res);

      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should return 404 if user not found', async () => {
      req.params = { userId: '1' };
      User.getUserByUserId.mockResolvedValue(null);

      await userController.getUserByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('User not found');
    });

    it('should handle errors', async () => {
      req.params = { userId: '1' };
      User.getUserByUserId.mockRejectedValue(new Error('Database error'));

      await userController.getUserByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error retrieving user');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      req.body = { email: 'test@example.com', name: 'John Doe', password: 'password', userType: 'N' };
      const createdUser = { userId: 1, ...req.body };
      User.createUser.mockResolvedValue(createdUser);

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdUser);
    });

    it('should handle errors', async () => {
      req.body = { email: 'test@example.com', name: 'John Doe', password: 'password', userType: 'C', paypalEmail: 'paypal@test.com' };
      User.createUser.mockRejectedValue(new Error('Database error'));

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error creating user');
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      req.params = { userId: '1' };
      req.body = { name: 'John Updated' };
      const updatedUser = { userId: 1, ...req.body };
      User.updateUser.mockResolvedValue(updatedUser);

      await userController.updateUser(req, res);

      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should return 404 if user not found', async () => {
      req.params = { userId: '1' };
      req.body = { name: 'John Updated' };
      User.updateUser.mockResolvedValue(null);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('User not found');
    });

    it('should handle errors', async () => {
      req.params = { userId: '1' };
      req.body = { name: 'John Updated' };
      User.updateUser.mockRejectedValue(new Error('Database error'));

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error updating user');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      req.params = { userId: '1' };
      User.deleteUser.mockResolvedValue(true);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      req.params = { userId: '1' };
      User.deleteUser.mockResolvedValue(false);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('User not found');
    });

    it('should handle errors', async () => {
      req.params = { userId: '1' };
      User.deleteUser.mockRejectedValue(new Error('Database error'));

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error deleting user');
    });
  });

  describe('loginUser', () => {
    it('should login a user and return tokens', async () => {
      req.body = { email: 'test@example.com', password: 'password' };
      const user = { userId: 1, email: 'test@example.com', password: '$2b$10$...', userType: 'C', name: 'John Doe' };
      User.getUserByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation((payload, secret) => `${secret}:${JSON.stringify(payload)}`);
      RefreshTokenModel.addToken.mockResolvedValue(true);

      await userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Login successful',
      }));
    });

    it('should return 401 if email not found', async () => {
      req.body = { email: 'test@example.com', password: 'password' };
      User.getUserByEmail.mockResolvedValue(null);

      await userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email not found' });
    });

    it('should return 401 if password is incorrect', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      const user = { userId: 1, email: 'test@example.com', password: '$2b$10$...', userType: 'C', name: 'John Doe' };
      User.getUserByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Incorrect password' });
    });

    it('should handle errors', async () => {
      req.body = { email: 'test@example.com', password: 'password' };
      User.getUserByEmail.mockRejectedValue(new Error('Database error'));

      await userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error' });
    });
  });

  describe('getUserProfileByUserId', () => {
    it('should return user profile by userId', async () => {
      req.params = { userId: '1' };
      const userData = { name: 'John Doe', email: 'john@example.com', profilePicture: null, userType: 'C', paypalEmail: 'paypal@example.com' };
      User.getUserProfile.mockResolvedValue(userData);

      await userController.getUserProfileByUserId(req, res);

      expect(res.json).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        profilePictureUrl: '../images/default-profile-user.jpg',
        paypalEmail: 'paypal@example.com'
      });
    });

    it('should return 404 if user profile not found', async () => {
      req.params = { userId: '1' };
      User.getUserProfile.mockResolvedValue(null);

      await userController.getUserProfileByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should handle errors', async () => {
      req.params = { userId: '1' };
      User.getUserProfile.mockRejectedValue(new Error('Database error'));

      await userController.getUserProfileByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching user data' });
    });
  });

  describe('fetchProfilePicture', () => {
    it('should fetch profile picture', async () => {
      req.params = { userId: '1' };
      const user = { profilePicture: Buffer.from('testimage') };
      User.getUserProfile = jest.fn().mockResolvedValue(user);

      await userController.fetchProfilePicture(req, res);

      expect(res.set).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(res.send).toHaveBeenCalledWith(user.profilePicture);
    });

    it('should return 404 if profile picture not found', async () => {
      req.params = { userId: '1' };
      User.getUserProfile.mockResolvedValue({ profilePicture: null });

      await userController.fetchProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Profile picture not found' });
    });

    it('should handle errors', async () => {
      req.params = { userId: '1' };
      User.getUserProfile.mockRejectedValue(new Error('Database error'));

      await userController.fetchProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching profile picture' });
    });
  });

  describe('uploadProfilePicture', () => {
    it('should upload profile picture', async () => {
      req.user = { userId: '1' };
      req.file = { buffer: Buffer.from('newimage') };
      User.updateUserProfilePicture.mockResolvedValue(true);

      await userController.uploadProfilePicture(req, res);

      expect(res.json).toHaveBeenCalledWith({ profilePictureUrl: '/api/profilePicture/1' });
    });

    it('should return 404 if no user found or profile picture unchanged', async () => {
      req.user = { userId: '1' };
      req.file = { buffer: Buffer.from('newimage') };
      User.updateUserProfilePicture.mockResolvedValue(false);

      await userController.uploadProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No user found or profile picture unchanged' });
    });

    it('should handle errors', async () => {
      req.user = { userId: '1' };
      req.file = { buffer: Buffer.from('newimage') };
      User.updateUserProfilePicture.mockRejectedValue(new Error('Database error'));

      await userController.uploadProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to upload profile picture' });
    });
  });

});
