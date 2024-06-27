const Admin = require("../models/admin");
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');

const getAllAdminUsers = async (req, res) => {
  try {
    const admins = await Admin.getAllAdminUsers();
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving admin users");
  }
};

const getAdminById = async (req, res) => {
  const adminId = parseInt(req.params.adminId);
  try {
    const admin = await Admin.getAdminById(adminId);
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving admin user");
  }
};

const createAdminUser = async (req, res) => {
    const newAdmin = req.body;
    try {
      const createdAdminUser = await Admin.createAdminUser(newAdmin);
      res.status(201).json(createdAdminUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating admin");
    }
  };

  const updateAdminUser = async (req, res) => {
    const adminId = parseInt(req.params.adminId);
    const newAdminData = req.body;
  
    try {
      const updatedAdmin = await Admin.updateAdminUser(adminId, newAdminData);
      if (!updatedAdmin) {
        return res.status(404).send("Admin not found");
      }
      res.json(updatedAdmin);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating admin");
    }
  };
  
  const deleteAdminUser = async (req, res) => {
    const adminId = parseInt(req.params.adminId);
  
    try {
      const success = await Admin.deleteAdminUser(adminId);
      if (!success) {
        return res.status(404).send("Admin not found");
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting admin");
    }
  };

  const generateToken = (userId, userType) => {
    const payload = { userId, userType };
    return jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('Received login request:', { email, password }); // Debug log

    try {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `
            SELECT * FROM AdminUser
            WHERE adminEmail = @Email
        `;
        const request = connection.request();
        request.input('Email', sql.VarChar, email);
        const result = await request.query(sqlQuery);

        console.log('Query result:', result); // Debug log

        if (result.recordset.length === 0) {
            console.log('Email not found'); // Debug log
            return res.status(401).json({ success: false, message: 'Email not found' });
        }

        const user = result.recordset[0];
        console.log('User found:', user); // Debug log

        // Directly compare passwords
        if (password !== user.password) {
            console.log('Incorrect password'); // Debug log
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }

        // Generate token upon successful login
        const token = generateToken(user.userId, user.userType);

        // Authenticated successfully
        console.log('Login successful'); // Debug log
        return res.status(200).json({ success: true, message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        sql.close(); // Ensure to close the SQL connection
    }
};

module.exports = {
  getAllAdminUsers,
  getAdminById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  loginUser,
};