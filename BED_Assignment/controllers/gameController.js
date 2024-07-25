const GameModel = require('../models/gameModel');

 // Function to save a game state   
    async function saveGame(req, res) {
        const { gridSize, buildingsGrid, points, coins, turnNumber, gameMode, saveDate } = req.body;
        const userId = req.user.userId;

        try {
            // Save the game and get the gameId
            const gameId = await GameModel.saveGame(userId, gridSize, buildingsGrid, points, coins, turnNumber, gameMode, saveDate);
            res.status(200).json({ status: 'success', message: 'Game saved successfully', gameId });
        } catch (err) {
            console.error('Error saving game:', err);
            res.status(500).json({ status: 'error', message: 'Error saving game' });
        }
    }
// Function to retrieve saved games for a user
    async function getGames(req, res) {
        const userId = req.user.userId;

        try {
            const games = await GameModel.getGames(userId);
            res.status(200).json({ status: 'success', games });
        } catch (err) {
            console.error('Error retrieving games:', err);
            res.status(500).json({ status: 'error', message: 'Error retrieving games' });
        }
    }

    module.exports = {
        saveGame,
        getGames
    };
    