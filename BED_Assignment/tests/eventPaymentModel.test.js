const sql = require('mssql');
const EventPaymentsModel = require('../models/eventPaymentModel');

jest.mock('mssql');

const dbConfig = require('../dbConfig'); // Mock this module to prevent actual DB connections
jest.mock('../dbConfig', () => ({
    user: 'testUser',
    password: 'testPassword',
    server: 'localhost',
    database: 'testDatabase',
}));

describe('EventPaymentsModel', () => {
    let mockRequest, mockConnection;

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
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new event payment', async () => {
            mockRequest.query.mockResolvedValue({});

            await EventPaymentsModel.create(1, 2, 'authID');

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockRequest.input).toHaveBeenCalledWith('eventId', sql.Int, 1);
            expect(mockRequest.input).toHaveBeenCalledWith('userId', sql.Int, 2);
            expect(mockRequest.input).toHaveBeenCalledWith('authorizationID', sql.NVarChar, 'authID');
            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO EventPayments'));
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should handle errors when creating a new event payment', async () => {
            mockRequest.query.mockRejectedValue(new Error('DB error'));

            await expect(EventPaymentsModel.create(1, 2, 'authID')).rejects.toThrow('Error creating event payment');
            expect(mockConnection.close).toHaveBeenCalled();
        });
    });

    describe('getAuthorizationID', () => {
        it('should return the authorizationID', async () => {
            mockRequest.query.mockResolvedValue({ recordset: [{ authorizationID: 'authID' }] });

            const result = await EventPaymentsModel.getAuthorizationID(1, 2);

            expect(result).toBe('authID');
            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockRequest.input).toHaveBeenCalledWith('eventId', sql.Int, 1);
            expect(mockRequest.input).toHaveBeenCalledWith('userId', sql.Int, 2);
            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('SELECT authorizationID'));
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should return null if no authorizationID is found', async () => {
            mockRequest.query.mockResolvedValue({ recordset: [] });

            const result = await EventPaymentsModel.getAuthorizationID(1, 2);

            expect(result).toBeNull();
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should handle errors when getting authorizationID', async () => {
            mockRequest.query.mockRejectedValue(new Error('DB error'));

            await expect(EventPaymentsModel.getAuthorizationID(1, 2)).rejects.toThrow('Error getting authorization ID');
            expect(mockConnection.close).toHaveBeenCalled();
        });
    });

    describe('capture', () => {
        it('should update the event payment to captured', async () => {
            mockRequest.query.mockResolvedValue({});

            await EventPaymentsModel.capture(1, 2);

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockRequest.input).toHaveBeenCalledWith('eventId', sql.Int, 1);
            expect(mockRequest.input).toHaveBeenCalledWith('userId', sql.Int, 2);
            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE EventPayments'));
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should handle errors when capturing the event payment', async () => {
            mockRequest.query.mockRejectedValue(new Error('DB error'));

            await expect(EventPaymentsModel.capture(1, 2)).rejects.toThrow('Error capturing event payment');
            expect(mockConnection.close).toHaveBeenCalled();
        });
    });
});
