const sql = require('mssql');
const dbConfig = require('../dbConfig');

class HighscoreModel {
    constructor(playerName, playerName2, score, turnNumber, date) {
        this.playerName = playerName;
        this.playerName2 = playerName2;
        this.score = score;
        this.turnNumber = turnNumber;
        this.date = date;
    }

    static async getHighScores() {
        try {
            await sql.connect(dbConfig);
            const query = `
                SELECT TOP 10
                    u.name AS playerName,
                    hs.playerName AS playerName2,
                    gs.points AS score,
                    gs.turn_number AS turnNumber,
                    gs.saveDate AS date
                FROM highscores hs
                INNER JOIN Users u ON hs.userId = u.userId
                INNER JOIN game_saves gs ON hs.id = gs.id
                WHERE gs.turn_number > 0 AND gs.gameMode = 'arcade'
                ORDER BY gs.points ASC, gs.saveDate DESC
            `;

            const request = new sql.Request();
            const result = await request.query(query);

            return result.recordset.map(score => new HighscoreModel(
                score.playerName,
                score.playerName2,
                score.score,
                score.turnNumber,
                score.date
            ));
        } catch (err) {
            console.error('Error in getHighScores:', err);
            throw err;
        } finally {
            await sql.close();
        }
    }

    static async createHighScore(userId, gameId, playerName) {
        try {
            await sql.connect(dbConfig);
            const gameSaveQuery = `
                SELECT id
                FROM game_saves
                WHERE id = @gameId
            `;

            const request = new sql.Request();
            const gameSaveResult = await request
                .input('gameId', sql.Int, gameId)
                .query(gameSaveQuery);

            if (gameSaveResult.recordset.length === 0) {
                throw new Error('Game save not found');
            }

            const insertHighScoreQuery = `
                INSERT INTO highscores (userId, id, playerName)
                VALUES (@userId, @gameId, @playerName)
            `;

            await new sql.Request()
                .input('userId', sql.Int, userId)
                .input('gameId', sql.Int, gameId)
                .input('playerName', sql.NVarChar, playerName)
                .query(insertHighScoreQuery);
        } catch (err) {
            console.error('Error in createHighScore:', err);
            throw err;
        } finally {
            await sql.close();
        }
    }
}

module.exports = HighscoreModel;