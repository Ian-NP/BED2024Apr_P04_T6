// RefreshTokenModel.test.js
const sql = require('mssql');
const RefreshTokenModel = require('../models/refreshToken');
const dbConfig = require('../dbConfig');

// Mock the SQL module
jest.mock('mssql');

describe('RefreshTokenModel', () => {
  let mockRequest;
  let mockConnection;

  beforeEach(() => {
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn()
    };

    mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn()
    };

    sql.connect.mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('getUserByRefreshToken should return user data when token is valid', async () => {
    const refreshToken = 'validToken';
    const mockResult = {
      recordset: [{
        userId: 1,
        email: 'test@example.com',
        name: 'Test User',
        userType: 'admin'
      }]
    };

    mockRequest.query.mockResolvedValue(mockResult);

    const user = await RefreshTokenModel.getUserByRefreshToken(refreshToken);

    expect(user).toEqual(mockResult.recordset[0]);
    expect(mockRequest.input).toHaveBeenCalledWith('refreshToken', sql.VarChar, refreshToken);
    expect(mockRequest.query).toHaveBeenCalled();
  });

  test('getUserByRefreshToken should return undefined when token is invalid', async () => {
    const refreshToken = 'invalidToken';
    const mockResult = { recordset: [] };

    mockRequest.query.mockResolvedValue(mockResult);

    const user = await RefreshTokenModel.getUserByRefreshToken(refreshToken);

    expect(user).toBeUndefined();
  });

  test('deleteRefreshToken should successfully delete token', async () => {
    const token = 'tokenToDelete';

    mockRequest.query.mockResolvedValue({});

    const result = await RefreshTokenModel.deleteRefreshToken(token);

    expect(result).toBe(true);
    expect(mockRequest.input).toHaveBeenCalledWith('token', sql.VarChar, token);
    expect(mockRequest.query).toHaveBeenCalled();
  });

  test('addToken should add a token successfully', async () => {
    const userId = 1;
    const token = 'newToken';
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    mockRequest.query.mockResolvedValue({});

    await RefreshTokenModel.addToken(userId, token);

    expect(mockRequest.input).toHaveBeenCalledWith('userId', sql.Int, userId);
    expect(mockRequest.input).toHaveBeenCalledWith('token', sql.VarChar, token);
    expect(mockRequest.input).toHaveBeenCalledWith('expiresAt', sql.DateTime, expect.any(Date));
    expect(mockRequest.query).toHaveBeenCalled();
  });
});
