const HighscoreModel = require('../models/highScoreModel');


    async function getHighScores(req, res) {
        try {
            const highScores = await HighscoreModel.getHighScores();
            res.status(200).json({ status: 'success', highScores });
        } catch (err) {
            console.error('Error retrieving high scores:', err);
            res.status(500).json({ status: 'error', message: 'Error retrieving high scores' });
        }
    }

    async function createHighScore(req, res) {
        const { gameId, playerName } = req.body;
        const userId = req.user.userId;

        if (!gameId) {
            return res.status(400).json({ status: 'error', message: 'Game ID is required' });
        }

        try {
            await HighscoreModel.createHighScore(userId, gameId, playerName);
            res.status(200).json({ status: 'success', message: 'High score created successfully' });
        } catch (err) {
            console.error('Error creating high score:', err);
            res.status(500).json({ status: 'error', message: 'Error creating high score' });
        }
    }


module.exports = {
    getHighScores,
    createHighScore
};