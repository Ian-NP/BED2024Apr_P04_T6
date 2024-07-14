const User = require("../models/user");
const bcrypt = require('bcrypt');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving users");
  }
};

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


const createUser = async (req, res) => {
  // try {
  //     const { email, name, password, userType } = req.body;
      
  //     // Create a new user object
  //     const newUser = new User(email, name, password, userType);

  //     // Call the createUser method of the User model
  //     const createdUser = await User.createUser(newUser);

  //     res.status(201).json({ message: 'User created successfully', user: createdUser });
  // } catch (error) {
  //     console.error('Error creating user:', error);
  //     res.status(500).json({ message: 'Error creating user' });
  // }
  const newUser = req.body;
    try {
      const createdUser = await User.createUser(newUser);
      res.status(201).json(createdUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating user");
    }
};

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

  const generateToken = (userId, userType, userName, userEmail) => {
    const payload = { userId, userType, userName, userEmail };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const deleteUserById = async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const result = await User.deleteUserById(userId); // Ensure this method exists
    if (result.affectedRows === 0) {
      return res.status(404).send("User not found");
    }
    res.status(200).send("User deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting user");
  }
};

// const loginUser = async (req, res) => {
//     const { email, password } = req.body;
//     console.log('Received login request:', { email, password }); // Debug log

//     try {
//         const connection = await sql.connect(dbConfig);
//         const sqlQuery = `
//             SELECT * FROM Users
//             WHERE email = @Email
//         `;
//         const request = connection.request();
//         request.input('Email', sql.VarChar, email);
//         const result = await request.query(sqlQuery);

//         console.log('Query result:', result); // Debug log

//         if (result.recordset.length === 0) {
//             console.log('Email not found'); // Debug log
//             return res.status(401).json({ success: false, message: 'Email not found' });
//         }

//         const user = result.recordset[0];
//         console.log('User found:', user); // Debug log

//         // Directly compare passwords
//         // Compare passwords using bcrypt
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             console.log('Incorrect password'); // Debug log
//             return res.status(401).json({ success: false, message: 'Incorrect password' });
//         }

//         // Generate token upon successful login
       
//         const token = generateToken(user.userId, user.userType, user.name);

//         // Authenticated successfully
//         console.log('Login successful'); // Debug log
//         return res.status(200).json({ success: true, message: 'Login successful', token });
//     } catch (error) {
//         console.error('Error logging in user:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     } finally {
//         sql.close(); // Ensure to close the SQL connection
//     }
// };
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
      const user = await User.getUserByEmail(email);

      if (!user) {
          return res.status(401).json({ success: false, message: 'Email not found' });
      }

      let isMatch = false;

      if (user.password.startsWith('$2b$')) {
          // Password is hashed, compare with bcrypt
          isMatch = await bcrypt.compare(password, user.password);
      } else {
          // Password is plain text, compare directly (after hashing for security)
          isMatch = (password === user.password); // Example: Direct comparison for illustration, not recommended in production
      }

      if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Incorrect password' });
      }

      // Generate token upon successful login
      const token = generateToken(user.userId, user.userType);

      // Authenticated successfully
      return res.status(200).json({ success: true, message: 'Login successful', token });
  } catch (error) {
      console.error('Error logging in user:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



//   const login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.getUserByEmail(email);
//         if (!user) return res.status(400).json({ message: "Invalid email or password" });

//         const isMatch = await user.validatePassword(password);
//         if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

//         const token = jwt.sign({ id: user.userId, userType: user.userType }, 'your_jwt_secret', { expiresIn: '1h' });
//         res.json({ token, userType: user.userType });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Server error");
//     }
// };

module.exports = {
  getAllUsers,
  getUserByUserId,
  createUser,
  updateUser,
  deleteUser,
  deleteUserById,
  loginUser,
};