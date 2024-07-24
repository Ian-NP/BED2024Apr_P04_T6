const HighscoreModel = require('../models/highScoreModel');
const sql = require('mssql');

// Mock the sql module
jest.mock('mssql', () => {
    const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
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
        Request: jest.fn().mockImplementation(() => mockRequest)
    };
});

// Helper function to normalize whitespace
const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();

describe('HighscoreModel', () => {
    describe('createHighScore', () => {
        it('should create a high score entry successfully', async () => {
            // Arrange
            const userId = 1;
            const gameId = 123;
            const playerName = 'Alice';

            const mockRequest = {
                input: jest.fn().mockReturnThis(),
                query: jest.fn()
            };

            // Mock the Request to handle both queries
            mockRequest.query.mockResolvedValueOnce({ recordset: [{ id: gameId }] }); // Game exists
            mockRequest.query.mockResolvedValueOnce({}); // High score inserted

            sql.Request.mockImplementation(() => mockRequest);

            // Act
            await HighscoreModel.createHighScore(userId, gameId, playerName);

            // Assert
            expect(mockRequest.query).toHaveBeenCalledTimes(2); // Check if both queries were called

            // Checking if the query contains expected parts
            expect(normalizeWhitespace(mockRequest.query.mock.calls[0][0])).toContain(
                normalizeWhitespace('SELECT id FROM game_saves WHERE id = @gameId')
            );
            expect(normalizeWhitespace(mockRequest.query.mock.calls[1][0])).toContain(
                normalizeWhitespace('INSERT INTO highscores (userId, id, playerName) VALUES (@userId, @gameId, @playerName)')
            );
        });

        it('should throw an error if the game save does not exist', async () => {
            // Arrange
            const userId = 1;
            const gameId = 123;
            const playerName = 'Alice';

            sql.Request.mockImplementation(() => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({ recordset: [] }) // Game does not exist
            }));

            // Act & Assert
            await expect(HighscoreModel.createHighScore(userId, gameId, playerName))
                .rejects
                .toThrow('Game save not found');
        });

        it('should handle errors during high score creation', async () => {
            // Arrange
            const userId = 1;
            const gameId = 123;
            const playerName = 'Alice';
            const errorMessage = 'Error creating high score';

            sql.Request.mockImplementation(() => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(new Error(errorMessage))
            }));

            // Act & Assert
            await expect(HighscoreModel.createHighScore(userId, gameId, playerName))
                .rejects
                .toThrow(errorMessage);
        });
    });
});
