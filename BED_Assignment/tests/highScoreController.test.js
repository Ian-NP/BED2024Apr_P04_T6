const HighscoreController = require('../controllers/highscoreController');
const HighscoreModel = require('../models/highScoreModel');

jest.mock('../models/highScoreModel');

describe('HighscoreController', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getHighScores', () => {
    it('should return high scores successfully', async () => {
      const mockHighScores = [
        { id: 1, userId: 'user1', gameId: 'game1', playerName: 'Player 1', score: 100 },
        { id: 2, userId: 'user2', gameId: 'game1', playerName: 'Player 2', score: 90 }
      ];

      HighscoreModel.getHighScores.mockResolvedValue(mockHighScores);

      await HighscoreController.getHighScores(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        highScores: mockHighScores
      });
    });

    it('should handle errors when retrieving high scores', async () => {
      HighscoreModel.getHighScores.mockRejectedValue(new Error('Database error'));

      await HighscoreController.getHighScores(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error retrieving high scores'
      });
    });
  });

  describe('createHighScore', () => {
    it('should create a high score successfully', async () => {
      mockRequest.body = {
        gameId: 'game1',
        playerName: 'Player 1'
      };
      mockRequest.user = {
        userId: 'user1'
      };

      HighscoreModel.createHighScore.mockResolvedValue();

      await HighscoreController.createHighScore(mockRequest, mockResponse);

      expect(HighscoreModel.createHighScore).toHaveBeenCalledWith('user1', 'game1', 'Player 1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'High score created successfully'
      });
    });

    it('should return an error if gameId is missing', async () => {
      mockRequest.body = {
        playerName: 'Player 1'
      };
      mockRequest.user = {
        userId: 'user1'
      };

      await HighscoreController.createHighScore(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Game ID is required'
      });
    });

    it('should handle errors when creating a high score', async () => {
      mockRequest.body = {
        gameId: 'game1',
        playerName: 'Player 1'
      };
      mockRequest.user = {
        userId: 'user1'
      };

      HighscoreModel.createHighScore.mockRejectedValue(new Error('Database error'));

      await HighscoreController.createHighScore(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error creating high score'
      });
    });
  });
});