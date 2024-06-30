import User from "../models/users";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
require('dotenv').config();

const createUser = async (req, res) => {
    const newUser = req.body;
    try {
        const createdUser = await User.createUser(newUser);    
        res.status(201).json(createdUser);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating user");
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate user credentials
        const user = await User.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password with hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const payload = {
            id: user.user_id,
            role: user.role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "3600s" }); // Expires in 1 hour

        return res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const registerUser = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Validate user data (you can add your validation logic here)

        // Check for existing username
        const existingUser = await User.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists. Please try again with a different username." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user in database
        const result = await User.createUser(username, hashedPassword, role);

        // Generate JWT token
        const payload = {
            id: result.user_id,
            role: result.role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "3600s" }); // Expires in 1 hour

        return res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving users");
    }
};

const getUserById = async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const user = await User.getUserById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        return res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving user");
    }
};

const updateUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    const newUserData = req.body;

    try {
        const updatedUser = await User.updateUser(userId, newUserData);
        if (!updatedUser) {
            return res.status(404).send("User not found");
        }
        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating user");
    }
};

const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        const deleteUser = await User.deleteUser(userId);
        if (!deleteUser) {
            return res.status(404).send("User not found");
        } 
        return res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting user");
    }
};

const searchUsers = async (req, res) => {
    const searchTerm = req.query.searchTerm; // Extract search term from query params

    try {    
        const users = await User.searchUsers(searchTerm);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error searching users" });
    }
};

const getUsersWithBooks = async (req, res) => {
    try {
        const users = await User.getUsersWithBooks();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching users with books" });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    registerUser,
    loginUser,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    getUsersWithBooks,
};
