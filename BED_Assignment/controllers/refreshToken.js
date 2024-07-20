const { ref } = require('joi');
const RefreshTokenModel = require('../models/refreshToken.js');

const refreshToken = async (req, res) => {
    try {
      const { token } = req.body;
  
      if (!token) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }
  
      const user = await RefreshTokenModel.getUserByRefreshToken(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }
  
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

const removeToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const result = await RefreshTokenModel.deleteRefreshToken(token);

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

const addToken = async (req, res) => {
    try {
      const { userId, token } = req.body;
  
      if (!userId || !token) {
        return res.status(400).json({ error: 'User ID and token are required' });
      }
  
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