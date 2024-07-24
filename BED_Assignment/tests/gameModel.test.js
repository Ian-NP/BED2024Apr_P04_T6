// gameModel.test.js
jest.mock('mssql', () => {
    const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({
            recordset: []  // Default empty array
        })
    };
    const mockPool = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn()
    };

    return {
        connect: jest.fn().mockResolvedValue(mockPool),
        close: jest.fn(),
        Int: jest.fn(),
        NVarChar: jest.fn(),
        MAX: 'max',
        DateTime: jest.fn(),
        Request: jest.fn().mockImplementation(() => mockRequest)  // Mock Request constructor
    };
});

// Import GameModel after mocking
const GameModel = require('../models/gameModel');
const sql = require('mssql');
const dbConfig = require('../dbConfig');

// Define your tests
describe('GameModel', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and methods
        sql.Request.mockClear();
        sql.connect.mockClear();
        sql.close.mockClear();
    });

    test('should save a game and return the game ID', async () => {
        // Arrange
        const userId = 1;
        const gridSize = 10;
        const buildingsGrid = [[1, 2]];
        const points = 100;
        const coins = 50;
        const turnNumber = 5;
        const gameMode = 'survival';
        const saveDate = new Date();

        const mockGameId = 123;

        sql.Request.mockImplementation(() => ({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [{ id: mockGameId }]
            })
        }));

        // Act
        const gameId = await GameModel.saveGame(userId, gridSize, buildingsGrid, points, coins, turnNumber, gameMode, saveDate);

        // Assert
        expect(gameId).toBe(mockGameId);
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);
        expect(sql.Request).toHaveBeenCalledTimes(2);  // One for the save and one for the user event
    });

    test('should return a list of games for a given user', async () => {
        // Arrange
        const userId = 1;
        const mockGames = [
            {
                id: 1,
                grid_size: 10,
                buildings_grid: JSON.stringify([[1, 2]]),
                points: 100,
                coins: 50,
                turn_number: 5,
                gameMode: 'survival',
                saveDate: new Date()
            }
        ];

        sql.Request.mockImplementation(() => ({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: mockGames
            })
        }));

        // Act
        const games = await GameModel.getGames(userId);

        // Assert
        expect(games.length).toBe(1);
        expect(games[0].id).toBe(mockGames[0].id);
        expect(games[0].gridSize).toBe(mockGames[0].grid_size);
        expect(games[0].buildingsGrid).toEqual(JSON.parse(mockGames[0].buildings_grid));
        expect(games[0].points).toBe(mockGames[0].points);
        expect(games[0].coins).toBe(mockGames[0].coins);
        expect(games[0].turnNumber).toBe(mockGames[0].turn_number);
        expect(games[0].gameMode).toBe(mockGames[0].gameMode);
        expect(games[0].saveDate).toEqual(mockGames[0].saveDate);
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);
        expect(sql.Request).toHaveBeenCalledTimes(1);
    });
});
