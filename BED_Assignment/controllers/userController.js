const User = require("../models/user");
const bcrypt = require('bcrypt');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');
const RefreshTokenModel = require('../models/refreshToken');

//Function to get all user accounts
const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving users");
  }
};

//Function to get user account by userId
const getUserByUserId = async (req, res) => {
  const userId = parseInt(req.params.userId);
  console.log(`Fetching user with userId: ${userId}`);
  try {
      const user = await User.getUserByUserId(userId);
      if (!user) {
          console.log(`User with userId ${userId} not found`);
          return res.status(404).send("User not found");
      }
      console.log(`Fetched user data:`, user);
      res.json(user);
  } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving user");
  }
};

//Function to get user profile by userId
const getUserProfileByUserId = async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
      const userData = await User.getUserProfile(userId);

      if (!userData) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Prepare the response data
      const response = {
          name: userData.name,
          email: userData.email,
          profilePictureUrl: userData.profilePicture ? `/api/profilePicture/${userId}` : '../images/default-profile-user.jpg',
      };

      if (userData.userType === 'C') {
          response.paypalEmail = userData.paypalEmail;
      }

      res.json(response);
  } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Error fetching user data' });
  }
};

//Function to fetch user profile picture
const fetchProfilePicture = async (req, res) => {
  const userId = req.params.userId;

  try {
      const user = await User.getUserProfile(userId);
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

//Function to upload user profile picture
const uploadProfilePicture = async (req, res) => {
  const userId = req.user.userId;
  const profilePicture = req.file.buffer;

  try {
    const updateSuccessful = await User.updateUserProfilePicture(userId, profilePicture);

    if (updateSuccessful) {
      res.json({ profilePictureUrl: `/api/profilePicture/${userId}` });
    } else {
      res.status(404).json({ message: 'No user found or profile picture unchanged' });
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};


//Function to create a new user account
const createUser = async (req, res) => {
  const newUser = req.body;
    try {
      const createdUser = await User.createUser(newUser);
      res.status(201).json(createdUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating user");
    }
};

//Function to update a user account
  const updateUser = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const newUserData = req.body;
  
    try {
      const updatedUser = await User.updateUser(userId, newUserData);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating user");
    }
  };
  
  //Function to delete a user account
  const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.userId);
  
    try {
      const success = await User.deleteUser(userId);
      if (!success) {
        return res.status(404).send("User not found");
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting user");
    }
  };

//Function to delete user account by userId
const deleteUserById = async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const result = await User.deleteUserById(userId); 
    if (result.affectedRows === 0) {
      return res.status(404).send("User not found");
    }
    res.status(200).send("User deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting user");
  }
};

// Function to login a user account
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email not found' });
    }
    
    let isMatch = false;
    if (user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password); 
    }
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
    
    // Generate tokens upon successful login
    const accessToken = generateAccessToken(user.userId, user.userType, user.name, user.email);
    const refreshToken = generateRefreshToken(user.userId);
    
    // Save refresh token to database
    await RefreshTokenModel.addToken(user.userId, refreshToken);
    
    // Authenticated successfully
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const generateAccessToken = (userId, userType, userName, userEmail) => {
  const payload = { userId, userType, userName, userEmail };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.refresh_token_secret_JWT_SECRET, { expiresIn: '7d' });
};

//Function to get user about info
const getAboutInfo = async (req, res) => {
  const userId = req.params.userId;
  //console.log(userId);
  try {
    const userData = await User.getUserAboutProfile(userId);
    //console.log(userData);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ about: userData.about });
  } catch (error) {
    console.error('Error fetching about info:', error);
    res.status(500).json({ message: 'Error fetching about info' });
  }
};

//Function to save about info
const saveAboutInfo = async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  const { about } = req.body;

  try {
    const updateSuccessful = await User.updateUserAboutProfile(userId, { about });
    console.log(updateSuccessful);
    if (updateSuccessful) {
      res.json({ message: 'About info saved successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error saving about info:', error);
    res.status(500).json({ message: 'Error saving about info' });
  }
};


module.exports = {
  getAllUsers,
  getUserByUserId,
  createUser,
  updateUser,
  deleteUser,
  deleteUserById,
  loginUser,
  getUserProfileByUserId,
  fetchProfilePicture,
  uploadProfilePicture,
  getAboutInfo,
  saveAboutInfo,
};