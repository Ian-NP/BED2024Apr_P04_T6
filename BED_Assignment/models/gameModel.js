const sql = require('mssql');
const dbConfig = require('../dbConfig');

class GameModel {
    constructor(id, gridSize, buildingsGrid, points, coins, turnNumber, gameMode, saveDate) {
        this.id = id;
        this.gridSize = gridSize;
        this.buildingsGrid = buildingsGrid;
        this.points = points;
        this.coins = coins;
        this.turnNumber = turnNumber;
        this.gameMode = gameMode;
        this.saveDate = saveDate;
    }

    static async saveGame(userId, gridSize, buildingsGrid, points, coins, turnNumber, gameMode, saveDate) {
        try {
            await sql.connect(dbConfig);
            const buildingsGridString = JSON.stringify(buildingsGrid);

            const insertGameSaveQuery = `
                INSERT INTO game_saves (grid_size, buildings_grid, points, coins, turn_number, gameMode, saveDate) 
                OUTPUT INSERTED.id
                VALUES (@gridSize, @buildingsGrid, @points, @coins, @turnNumber, @gameMode, @saveDate)
            `;

            const request = new sql.Request();
            const result = await request
                .input('gridSize', sql.Int, gridSize)
                .input('buildingsGrid', sql.NVarChar(sql.MAX), buildingsGridString)
                .input('points', sql.Int, points)
                .input('coins', sql.Int, coins)
                .input('turnNumber', sql.Int, turnNumber)
                .input('gameMode', sql.NVarChar(50), gameMode)
                .input('saveDate', sql.DateTime, saveDate)
                .query(insertGameSaveQuery);

            const gameId = result.recordset[0].id;

            const insertUserEventQuery = `
                INSERT INTO UserSaves (UserId, EventId)
                VALUES (@userId, @eventId)
            `;

            await new sql.Request()
                .input('userId', sql.Int, userId)
                .input('eventId', sql.Int, gameId)
                .query(insertUserEventQuery);

            return gameId;
        } catch (err) {
            console.error('Error in saveGame:', err);
            throw err;
        } finally {
            await sql.close();
        }
    }

    static async saveGame2(userId, gridSize, buildingsGrid, points, coins, turnNumber, gameMode, saveDate) {
        try {
            await sql.connect(dbConfig);
            const buildingsGridString = JSON.stringify(buildingsGrid);

            const insertGameSaveQuery = `
                INSERT INTO game_saves (grid_size, buildings_grid, points, coins, turn_number, gameMode, saveDate) 
                OUTPUT INSERTED.id
                VALUES (@gridSize, @buildingsGrid, @points, @coins, @turnNumber, @gameMode, @saveDate)
            `;

            const request = new sql.Request();
            const result = await request
                .input('gridSize', sql.Int, gridSize)
                .input('buildingsGrid', sql.NVarChar(sql.MAX), buildingsGridString)
                .input('points', sql.Int, points)
                .input('coins', sql.Int, coins)
                .input('turnNumber', sql.Int, turnNumber)
                .input('gameMode', sql.NVarChar(50), gameMode)
                .input('saveDate', sql.DateTime, saveDate)
                .query(insertGameSaveQuery);

            const gameId = result.recordset[0].id;


            return gameId;
        } catch (err) {
            console.error('Error in saveGame:', err);
            throw err;
        } finally {
            await sql.close();
        }
    }

    static async getGames(userId) {
        try {
            await sql.connect(dbConfig);
            const query = `
                SELECT gs.id, gs.grid_size, gs.buildings_grid, gs.points, gs.coins, gs.turn_number, gs.gameMode, gs.created_at, gs.saveDate
                FROM game_saves gs
                INNER JOIN UserSaves ue ON gs.id = ue.EventId
                WHERE ue.UserId = @userId
            `;

            const request = new sql.Request();
            const result = await request
                .input('userId', sql.Int, userId)
                .query(query);

            return result.recordset.map(game => new GameModel(
                game.id,
                game.grid_size,
                JSON.parse(game.buildings_grid),
                game.points,
                game.coins,
                game.turn_number,
                game.gameMode,
                game.saveDate
            ));
        } catch (err) {
            console.error('Error in getGames:', err);
            throw err;
        } finally {
            await sql.close();
        }
    }
}

module.exports = GameModel;