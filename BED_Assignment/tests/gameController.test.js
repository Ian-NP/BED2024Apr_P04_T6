// tests/gameController.test.js
const GameController = require('../controllers/gameController');
const GameModel = require('../models/gameModel');

// Mock the GameModel methods
jest.mock('../models/gameModel', () => ({
    saveGame: jest.fn(),
    getGames: jest.fn()
}));

describe('GameController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            user: {
                userId: 1
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('saveGame', () => {
        it('should save a game and return the game ID', async () => {
            // Arrange
            const gameId = 123;
            const gridSize = 10;
            const buildingsGrid = [[1, 2]];
            const points = 100;
            const coins = 50;
            const turnNumber = 5;
            const gameMode = 'survival';
            const saveDate = new Date();

            req.body = { gridSize, buildingsGrid, points, coins, turnNumber, gameMode, saveDate };
            GameModel.saveGame.mockResolvedValue(gameId);

            // Act
            await GameController.saveGame(req, res);

            // Assert
            expect(GameModel.saveGame).toHaveBeenCalledWith(
                req.user.userId,
                gridSize,
                buildingsGrid,
                points,
                coins,
                turnNumber,
                gameMode,
                saveDate
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Game saved successfully',
                gameId
            });
        });

        it('should handle errors during game save', async () => {
            // Arrange
            const errorMessage = 'Error saving game';
            GameModel.saveGame.mockRejectedValue(new Error(errorMessage));

            // Act
            await GameController.saveGame(req, res);

            // Assert
            expect(GameModel.saveGame).toHaveBeenCalledWith(
                req.user.userId,
                req.body.gridSize,
                req.body.buildingsGrid,
                req.body.points,
                req.body.coins,
                req.body.turnNumber,
                req.body.gameMode,
                req.body.saveDate
            );
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Error saving game'
            });
        });
    });

    describe('getGames', () => {
        it('should return a list of games for a given user', async () => {
            // Arrange
            const mockGames = [
                {
                    id: 1,
                    gridSize: 10,
                    buildingsGrid: [[1, 2]],
                    points: 100,
                    coins: 50,
                    turnNumber: 5,
                    gameMode: 'survival',
                    saveDate: new Date()
                }
            ];

            GameModel.getGames.mockResolvedValue(mockGames);

            // Act
            await GameController.getGames(req, res);

            // Assert
            expect(GameModel.getGames).toHaveBeenCalledWith(req.user.userId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                games: mockGames
            });
        });

        it('should handle errors during game retrieval', async () => {
            // Arrange
            const errorMessage = 'Error retrieving games';
            GameModel.getGames.mockRejectedValue(new Error(errorMessage));

            // Act
            await GameController.getGames(req, res);

            // Assert
            expect(GameModel.getGames).toHaveBeenCalledWith(req.user.userId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Error retrieving games'
            });
        });
    });
});
