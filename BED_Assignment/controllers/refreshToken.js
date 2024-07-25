const { ref } = require('joi');
const RefreshTokenModel = require('../models/refreshToken.js');
const jwt = require('jsonwebtoken');

// Function to refresh an access token using a refresh token
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;

        // Check if the token is provided
        if (!token) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        // Get the user associated with the refresh token
        const user = await RefreshTokenModel.getUserByRefreshToken(token);

        // If no user is found, the token is invalid or expired
        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        // Generate a new access token
        const newAccessToken = jwt.sign(
            { 
                userId: user.userId, 
                email: user.email, 
                name: user.name, 
                userType: user.userType 
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ 
            accessToken: newAccessToken,
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to remove a refresh token
const removeToken = async (req, res) => {
    try {
        const { token } = req.body;

        // Check if the token is provided
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // Delete the refresh token from the database
        const result = await RefreshTokenModel.deleteRefreshToken(token);

        // Check if the token was successfully removed
        if (result) {
            return res.status(200).json({ message: 'Token successfully removed' });
        } else {
            return res.status(404).json({ error: 'Token not found' });
        }
    } catch (error) {
        console.error('Error removing refresh token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to add a new refresh token
const addToken = async (req, res) => {
    try {
        const { userId, token } = req.body;

        // Check if userId and token are provided
        if (!userId || !token) {
            return res.status(400).json({ error: 'User ID and token are required' });
        }

        // Add the new refresh token to the database
        await RefreshTokenModel.addToken(userId, token);

        return res.status(201).json({ message: 'Refresh token added successfully' });
    } catch (error) {
        console.error('Error adding refresh token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    refreshToken,
    removeToken,
    addToken
};
