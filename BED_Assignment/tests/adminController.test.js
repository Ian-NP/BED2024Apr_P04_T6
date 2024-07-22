const { getAllAdminUsers, getAdminById, createAdminUser, updateAdminUser, deleteAdminUser, deleteAdminById, loginUser } = require('../controllers/adminController');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

jest.mock('../models/admin');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('adminController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      json: jest.fn(),
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      
    };
  });

  describe('getAllAdminUsers', () => {
    it('should fetch all admin users', async () => {
      const admins = [{ adminId: 1, name: 'Admin1' }];
      Admin.getAllAdminUsers.mockResolvedValue(admins);

      await getAllAdminUsers(req, res);

      expect(Admin.getAllAdminUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(admins);
    });

    it('should handle errors', async () => {
      Admin.getAllAdminUsers.mockRejectedValue(new Error('Database error'));

      await getAllAdminUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error retrieving admin users');
    });
  });

  describe('getAdminById', () => {
    it('should fetch admin by ID', async () => {
      req.params.adminId = '1';
      const admin = { adminId: 1, name: 'Admin1' };
      Admin.getAdminById.mockResolvedValue(admin);

      await getAdminById(req, res);

      expect(Admin.getAdminById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(admin);
    });

    it('should return 404 if admin not found', async () => {
      req.params.adminId = '1';
      Admin.getAdminById.mockResolvedValue(null);

      await getAdminById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Admin not found');
    });

    it('should handle errors', async () => {
      req.params.adminId = '1';
      Admin.getAdminById.mockRejectedValue(new Error('Database error'));

      await getAdminById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error retrieving admin');
    });
  });

  describe('createAdminUser', () => {
    it('should create a new admin user', async () => {
      req.body = { name: 'Admin2' };
      const newAdmin = { adminId: 2, name: 'Admin2' };
      Admin.createAdminUser.mockResolvedValue(newAdmin);

      await createAdminUser(req, res);

      expect(Admin.createAdminUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newAdmin);
    });

    it('should handle errors', async () => {
      req.body = { name: 'Admin2' };
      Admin.createAdminUser.mockRejectedValue(new Error('Database error'));

      await createAdminUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error creating admin');
    });
  });

  describe('updateAdminUser', () => {
    it('should update an admin user', async () => {
      req.params.adminId = '1';
      req.body = { name: 'Updated Admin' };
      const updatedAdmin = { adminId: 1, name: 'Updated Admin' };
      Admin.updateAdminUser.mockResolvedValue(updatedAdmin);

      await updateAdminUser(req, res);

      expect(Admin.updateAdminUser).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith(updatedAdmin);
    });

    it('should return 404 if admin not found', async () => {
      req.params.adminId = '1';
      req.body = { name: 'Updated Admin' };
      Admin.updateAdminUser.mockResolvedValue(null);

      await updateAdminUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Admin not found');
    });

    it('should handle errors', async () => {
      req.params.adminId = '1';
      req.body = { name: 'Updated Admin' };
      Admin.updateAdminUser.mockRejectedValue(new Error('Database error'));

      await updateAdminUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error updating admin');
    });
  });

  describe('deleteAdminUser', () => {
    it('should delete an admin user', async () => {
        req.params.adminId = '1';
        Admin.deleteAdmin.mockResolvedValue(true); // Ensure this is `deleteAdmin`

        await deleteAdminUser(req, res);

        expect(Admin.deleteAdmin).toHaveBeenCalledWith(1); // Check if this method is correctly mocked
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).not.toHaveBeenCalled(); // No content
    });

    it('should return 404 if admin not found', async () => {
        req.params.adminId = '1';
        Admin.deleteAdmin.mockResolvedValue(false); // Ensure this simulates admin not found

        await deleteAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Admin not found');
    });

    it('should handle errors', async () => {
        req.params.adminId = '1';
        Admin.deleteAdmin.mockRejectedValue(new Error('Database error')); // Ensure this simulates an error

        await deleteAdminUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error deleting admin');
    });
});

  describe('deleteAdminById', () => {
    it('should delete an admin by ID', async () => {
      req.params.adminId = '1';
      const result = { affectedRows: 1 };
      Admin.deleteAdminById.mockResolvedValue(result);

      await deleteAdminById(req, res);

      expect(Admin.deleteAdminById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('Admin deleted successfully');
    });

    it('should return 404 if admin not found', async () => {
      req.params.adminId = '1';
      const result = { affectedRows: 0 };
      Admin.deleteAdminById.mockResolvedValue(result);

      await deleteAdminById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Admin not found');
    });

    it('should handle errors', async () => {
      req.params.adminId = '1';
      Admin.deleteAdminById.mockRejectedValue(new Error('Database error'));

      await deleteAdminById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error deleting admin');
    });
  });

  describe('loginUser', () => {
    it('should login a user and generate a token', async () => {
      req.body = { email: 'aexample@bed.com', password: 'password' };
      const user = { userId: 1, password: '$2b$10$...' };
      Admin.getAdminByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      await loginUser(req, res);

      expect(Admin.getAdminByEmail).toHaveBeenCalledWith('aexample@bed.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', user.password);
      expect(jwt.sign).toHaveBeenCalledWith({ userId: 1}, 'your_jwt_secret', { expiresIn: '1h' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Login successful', token: 'token' });
    });

    it('should return 401 if email not found', async () => {
      req.body = { email: 'aexample@bed.com', password: 'password' };
      Admin.getAdminByEmail.mockResolvedValue(null);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email not found' });
    });

    it('should return 401 if password is incorrect', async () => {
      req.body = { email: 'aexample@bed.com', password: 'password' };
      const user = { userId: 1, password: '$2b$10$...' };
      Admin.getAdminByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Incorrect password' });
    });

    it('should handle errors', async () => {
      req.body = { email: 'aexample@bed.com', password: 'password' };
      Admin.getAdminByEmail.mockRejectedValue(new Error('Database error'));

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error' });
    });
  });
});

//npm test adminController.test.js