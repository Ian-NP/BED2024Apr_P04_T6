const sql = require('mssql');
const EventAttendanceModel = require('../models/eventAttendanceModel');
const User = require('../models/user'); 

jest.mock('mssql');

const dbConfig = require('../dbConfig'); 
jest.mock('../dbConfig', () => ({
    user: 'testUser',
    password: 'testPassword',
    server: 'localhost',
    database: 'testDatabase',
}));

describe('EventAttendanceModel', () => {
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

    describe('getAttendeesByEventId', () => {
        it('should return a list of attendees for the given event ID', async () => {
            const mockAttendees = [
                { userId: 1, email: 'test1@example.com', name: 'Test User 1', password: 'password1', userType: 'attendee' },
                { userId: 2, email: 'test2@example.com', name: 'Test User 2', password: 'password2', userType: 'attendee' }
            ];
            mockRequest.query.mockResolvedValue({ recordset: mockAttendees });

            const attendees = await EventAttendanceModel.getAttendeesByEventId(1);

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockRequest.input).toHaveBeenCalledWith('eventId', sql.Int, 1);
            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('FROM EventAttendance'));
            expect(attendees).toEqual([
                new User(1, 'test1@example.com', 'Test User 1', 'password1', 'attendee'),
                new User(2, 'test2@example.com', 'Test User 2', 'password2', 'attendee')
            ]);
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should handle errors when fetching attendees', async () => {
            mockRequest.query.mockRejectedValue(new Error('DB error'));

            await expect(EventAttendanceModel.getAttendeesByEventId(1)).rejects.toThrow('DB error');
            expect(mockConnection.close).toHaveBeenCalled();
        });
    });

    describe('addUserToEvent', () => {
        it('should add a user to an event', async () => {
            mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

            const result = await EventAttendanceModel.addUserToEvent(1, 2);

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockRequest.input).toHaveBeenCalledWith('eventId', sql.Int, 1);
            expect(mockRequest.input).toHaveBeenCalledWith('userId', sql.Int, 2);
            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO EventAttendance'));
            expect(result).toBe(true);
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should handle errors when adding a user to an event', async () => {
            mockRequest.query.mockRejectedValue(new Error('DB error'));

            await expect(EventAttendanceModel.addUserToEvent(1, 2)).rejects.toThrow('DB error');
            expect(mockConnection.close).toHaveBeenCalled();
        });
    });

    describe('removeUserFromEvent', () => {
        it('should remove a user from an event', async () => {
            mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

            const result = await EventAttendanceModel.removeUserFromEvent(1, 2);

            expect(sql.connect).toHaveBeenCalledWith(dbConfig);
            expect(mockRequest.input).toHaveBeenCalledWith('eventId', sql.Int, 1);
            expect(mockRequest.input).toHaveBeenCalledWith('userId', sql.Int, 2);
            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM EventAttendance'));
            expect(result).toBe(true);
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should handle errors when removing a user from an event', async () => {
            mockRequest.query.mockRejectedValue(new Error('DB error'));

            await expect(EventAttendanceModel.removeUserFromEvent(1, 2)).rejects.toThrow('DB error');
            expect(mockConnection.close).toHaveBeenCalled();
        });
    });
});
