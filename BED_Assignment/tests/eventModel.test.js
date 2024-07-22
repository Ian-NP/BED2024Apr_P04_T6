const sql = require('mssql');
const EventModel = require('../models/eventModel');
const EventAttendanceModel = require('../models/eventAttendanceModel');

jest.mock('mssql', () => ({
  connect: jest.fn(),
  close: jest.fn(),
  Int: jest.fn(),
  NVarChar: jest.fn(),
  MAX: 'max',
  DateTime2: jest.fn(),
  Decimal: jest.fn(),
  VarBinary: jest.fn(),
}));

jest.mock('../dbConfig', () => ({}));

jest.mock('../models/eventAttendanceModel', () => ({
  getAttendeesByEventId: jest.fn(),
}));

describe('EventModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEvents', () => {
    it('should return all events', async () => {
      const mockRecordset = [
        {
          eventId: 1,
          eventName: 'Test Event',
          eventDesc: 'Test Description',
          eventOverview: 'Test Overview',
          eventCategory: 'Test Category',
          eventReports: 0,
          eventTime: new Date(),
          creatorId: 1,
          creatorName: 'Test Creator',
          cost: 10.99,
          eventImage: Buffer.from('test image'),
        },
      ];

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          query: jest.fn().mockResolvedValue({ recordset: mockRecordset }),
        }),
      });

      const events = await EventModel.getAllEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(EventModel);
      expect(events[0].eventId).toBe(1);
      expect(events[0].eventName).toBe('Test Event');
      expect(events[0].eventImage).toBe('dGVzdCBpbWFnZQ=='); // Base64 encoded 'test image'
    });

    it('should handle database errors', async () => {
      sql.connect.mockRejectedValue(new Error('Database error'));

      await expect(EventModel.getAllEvents()).rejects.toThrow('Error getting events');
    });
  });

  describe('getEventById', () => {
    it('should return an event by ID', async () => {
      const mockRecord = {
        eventId: 1,
        eventName: 'Test Event',
        eventDesc: 'Test Description',
        eventOverview: 'Test Overview',
        eventCategory: 'Test Category',
        eventReports: 0,
        eventTime: new Date(),
        creatorId: 1,
        creatorName: 'Test Creator',
        cost: 10.99,
        eventImage: Buffer.from('test image'),
      };

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ recordset: [mockRecord] }),
        }),
      });

      EventAttendanceModel.getAttendeesByEventId.mockResolvedValue([]);

      const event = await EventModel.getEventById(1);

      expect(event).toBeInstanceOf(EventModel);
      expect(event.eventId).toBe(1);
      expect(event.eventName).toBe('Test Event');
      expect(event.eventImage).toBe('dGVzdCBpbWFnZQ=='); // Base64 encoded 'test image'
      expect(event.attendees).toEqual([]);
    });

    it('should return null for non-existent event', async () => {
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ recordset: [] }),
        }),
      });

      const event = await EventModel.getEventById(999);

      expect(event).toBeNull();
    });

    it('should handle database errors', async () => {
      sql.connect.mockRejectedValue(new Error('Database error'));

      await expect(EventModel.getEventById(1)).rejects.toThrow('Database error');
    });
  });

  describe('getEventsByCreatorId', () => {
    it('should return events by creator ID', async () => {
      const mockRecordset = [
        {
          eventId: 1,
          eventName: 'Test Event',
          eventDesc: 'Test Description',
          eventOverview: 'Test Overview',
          eventCategory: 'Test Category',
          eventReports: 0,
          eventTime: new Date(),
          creatorId: 1,
          creatorName: 'Test Creator',
          cost: 10.99,
          eventImage: Buffer.from('test image'),
        },
      ];

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ recordset: mockRecordset }),
        }),
      });

      EventAttendanceModel.getAttendeesByEventId.mockResolvedValue([]);

      const events = await EventModel.getEventsByCreatorId(1);

      expect(events).toHaveLength(1);
      expect(events[0].eventId).toBe(1);
      expect(events[0].eventName).toBe('Test Event');
      expect(events[0].eventImage).toBe('dGVzdCBpbWFnZQ=='); // Base64 encoded 'test image'
      expect(events[0].attendees).toEqual([]);
    });

    it('should handle database errors', async () => {
      sql.connect.mockRejectedValue(new Error('Database error'));

      await expect(EventModel.getEventsByCreatorId(1)).rejects.toThrow('Database error');
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const newEventData = {
        eventName: 'New Event',
        eventDesc: 'New Description',
        eventOverview: 'New Overview',
        eventCategory: 'New Category',
        eventReports: 0,
        eventTime: new Date(),
        creatorId: 1,
        creatorName: 'Test Creator',
        cost: 20.99,
        eventImage: Buffer.from('new image'),
      };

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ recordset: [{ newEventId: 2 }] }),
        }),
      });

      const createdEvent = await EventModel.createEvent(newEventData);

      expect(createdEvent).toBeInstanceOf(EventModel);
      expect(createdEvent.eventId).toBe(2);
      expect(createdEvent.eventName).toBe('New Event');
      expect(createdEvent.eventImage).toEqual(Buffer.from('new image'));
    });

    it('should handle database errors', async () => {
      sql.connect.mockRejectedValue(new Error('Database error'));

      await expect(EventModel.createEvent({})).rejects.toThrow('Database error');
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      const updatedEventData = {
        eventName: 'Updated Event',
        eventDesc: 'Updated Description',
        eventOverview: 'Updated Overview',
        eventCategory: 'Updated Category',
        eventReports: 1,
        eventTime: new Date(),
        creatorId: 1,
        cost: 30.99,
        eventImage: 'data:image/png;base64,dXBkYXRlZCBpbWFnZQ==', // Base64 encoded 'updated image'
      };

      const mockRecord = {
        eventId: 1,
        ...updatedEventData,
        creatorName: 'Test Creator',
      };

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ recordset: [mockRecord] }),
        }),
      });

      EventAttendanceModel.getAttendeesByEventId.mockResolvedValue([]);

      const result = await EventModel.updateEvent(1, updatedEventData);

      expect(result.event).toBeInstanceOf(EventModel);
      expect(result.event.eventId).toBe(1);
      expect(result.event.eventName).toBe('Updated Event');
      expect(result.event.eventImage).toBe('data:image/png;base64,dXBkYXRlZCBpbWFnZQ=='); // Base64 encoded 'updated image'
      expect(result.attendees).toEqual([]);
    });

    it('should handle database errors', async () => {
      sql.connect.mockRejectedValue(new Error('Database error'));

      await expect(EventModel.updateEvent(1, {})).rejects.toThrow('Database error');
    });
  });

  describe('deleteEvent', () => {
    it('should delete an existing event', async () => {
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
        }),
      });

      const result = await EventModel.deleteEvent(1);

      expect(result).toEqual({ deleted: true });
    });

    it('should return deleted: false for non-existent event', async () => {
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ rowsAffected: [0] }),
        }),
      });

      const result = await EventModel.deleteEvent(999);

      expect(result).toEqual({ deleted: false });
    });

    it('should handle database errors', async () => {
      sql.connect.mockRejectedValue(new Error('Database error'));

      await expect(EventModel.deleteEvent(1)).rejects.toThrow('Database error');
    });
  });

  describe('getEventsByUserId', () => {
    it('should return events by user ID', async () => {
      const mockRecordset = [
        {
          eventId: 1,
          eventName: 'Test Event',
          eventDesc: 'Test Description',
          eventOverview: 'Test Overview',
          eventCategory: 'Test Category',
          eventReports: 0,
          eventTime: new Date(),
          creatorId: 1,
          creatorName: 'Test Creator',
          cost: 10.99,
          eventImage: Buffer.from('test image'),
        },
      ];

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ recordset: mockRecordset }),
        }),
      });

      const events = await EventModel.getEventsByUserId(1);

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(EventModel);
      expect(events[0].eventId).toBe(1);
      expect(events[0].eventName).toBe('Test Event');
      expect(events[0].eventImage).toBe('dGVzdCBpbWFnZQ=='); // Base64 encoded 'test image'
    });

    it('should handle database errors', async () => {
      sql.connect.mockRejectedValue(new Error('Database error'));

      await expect(EventModel.getEventsByUserId(1)).rejects.toThrow('Database error');
    });
  });
});