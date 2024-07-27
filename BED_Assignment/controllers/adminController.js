const Admin = require("../models/admin");
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');

//Function to get all admin users
const getAllAdminUsers = async (req, res) => {
  try {
    const admins = await Admin.getAllAdminUsers();
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving admin users");
  }
};

//Function to get admin accounts using their adminId
const getAdminById = async (req, res) => {
  const adminId = parseInt(req.params.adminId);
  console.log(`Fetching admin with adminId: ${adminId}`);
  try {
      const admin = await Admin.getAdminById(adminId);
      if (!admin) {
          console.log(`Admin with adminId ${adminId} not found`);
          return res.status(404).send("Admin not found");
      }
      console.log(`Fetched admin data:`, admin);
      res.json(admin);
  } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving admin");
  }
};

//Function to get admin profile by using their adminId
const getAdminProfileByAdminId = async (req, res) => {
  const adminId = parseInt(req.params.adminId);
  try {
      const userData = await Admin.getAdminProfile(adminId);

      if (!userData) {
          return res.status(404).json({ message: 'Admin not found' });
      }

      // Prepare the response data
      const response = {
          name: userData.name,
          email: userData.adminEmail,
          profilePictureUrl: userData.profilePicture ? `/api/profilePicture/${adminId}` : '../images/default-profile-user.jpg',
      };


      res.json(response);
  } catch (error) {
      console.error('Error fetching admin data:', error);
      res.status(500).json({ message: 'Error fetching admin data' });
  }
};

//Function to fetch admin profile picture
const fetchAdminProfilePicture = async (req, res) => {
  const adminId = req.params.adminId;

  try {
      const user = await Admin.getAdminProfile(adminId);
      if (!user || !user.profilePicture) {
          return res.status(404).json({ message: 'Profile picture not found' });
      }

      res.set('Content-Type', 'image/jpeg'); // Adjust content type based on your image format
      res.send(user.profilePicture);
  } catch (error) {
      console.error('Error fetching profile picture:', error);
      res.status(500).json({ message: 'Error fetching profile picture' });
  }
}

//Function to upload profile picture for admins
const uploadProfilePicture = async (req, res) => {
  const adminId = req.user.adminId;
  const profilePicture = req.file.buffer;

  try {
    const updateSuccessful = await Admin.updateAdminProfilePicture(adminId, profilePicture);

    if (updateSuccessful) {
      res.json({ profilePictureUrl: `/api/adminProfilePicture/${adminId}` });
    } else {
      res.status(404).json({ message: 'No user found or profile picture unchanged' });
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

//Function to create admin account
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

  //Function to update an admin account
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
  
  //Function to delete admin user
  const deleteAdminUser = async (req, res) => {
    const adminId = parseInt(req.params.adminId);
  
    try {
      const success = await Admin.deleteAdmin(adminId);
      if (!success) {
        return res.status(404).send("Admin not found");
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting admin");
    }
  };

  //Function to delete admin account by adminId
  const deleteAdminById = async (req, res) => {
    const adminId = parseInt(req.params.adminId);
    try {
      const result = await Admin.deleteAdminById(adminId); // Ensure this method exists
      if (result.affectedRows === 0) {
        return res.status(404).send("Admin not found");
      }
      res.status(200).send("Admin deleted successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting admin");
    }
  };

  //Function to generate admin token once they are logged in
const generateAdminToken = (adminId, adminName, adminEmail) => {
  const payload = { adminId, adminName, adminEmail };
  const secret = process.env.JWT_SECRET || 'JWT_SECRET'; 
  const options = { expiresIn: '1h' };
  //console.log('Payload for JWT:', { adminId: user.adminId, adminName: user.adminName, adminEmail: user.adminEmail });
  console.log('JWT Secret:', 'JWT_SECRET');

  return jwt.sign(payload, secret, options);
};

//Function to login admin user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await Admin.getAdminByEmail(email);

      if (!user) {
          return res.status(401).json({ success: false, message: 'Email not found' });
      }

      console.log('User retrieved from DB:', user); // Check the user object retrieved

      let isMatch = false;

      if (user.password.startsWith('$2b$')) {
          // Password is hashed, compare with bcrypt
          isMatch = await bcrypt.compare(password, user.password);
      } else {
          // Legacy plain text password handling
          isMatch = (password === user.password);
      }

      console.log('Password comparison result:', isMatch); // Checking the result of password comparison

      if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Incorrect password' });
      }

      // Generate token upon successful login
      console.log('Generating token...');
      const token = generateAdminToken(user.adminId, user.adminName, user.adminEmail);

      // Authenticated successfully
      return res.status(200).json({ success: true, message: 'Login successful', token });
  } catch (error) {
      console.error('Error logging in user:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




module.exports = {
  getAllAdminUsers,
  getAdminById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  deleteAdminById,
  loginUser,
  getAdminProfileByAdminId,
  fetchAdminProfilePicture,
  uploadProfilePicture,
  generateAdminToken,
};