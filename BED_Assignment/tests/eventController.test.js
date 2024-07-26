// Mock the dependencies
jest.mock('mssql', () => ({}));
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));
jest.mock('../dbConfig', () => ({}));
jest.mock('../models/user', () => ({}));
jest.mock('../models/eventAttendanceModel', () => ({
  addUserToEvent: jest.fn(),
  removeUserFromEvent: jest.fn()
}));
jest.mock('../models/eventModel', () => ({
  getAllEvents: jest.fn(),
  getEventById: jest.fn(),
  createEvent: jest.fn(),
  getEventsByUserId: jest.fn(),
  getEventsByCreatorId: jest.fn(),
  deleteEvent: jest.fn()
}));

const path = require('path');
const EventModel = require('../models/eventModel');
const eventAttendanceModel = require('../models/eventAttendanceModel');
const { 
  serveEventsContent, 
  getAllEvents, 
  getEventById, 
  createEvent, 
  signUserUp, 
  getEventsByUserId, 
  updateEventAttendance, 
  deleteEvent 
} = require('../controllers/eventController');

// The rest of your test file remains the same...

describe('Event Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('serveEventsContent', () => {
    it('should serve events.html for unauthenticated users', () => {
      const req = { user: null };
      const res = { sendFile: jest.fn() };
      
      serveEventsContent(req, res);
      
      expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining('events.html'));
    });

    it('should serve createEvent.html for authenticated company users', () => {
      const req = { user: { userType: 'C' } };
      const res = { sendFile: jest.fn() };
      
      serveEventsContent(req, res);
      
      expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining('createEvent.html'));
    });

    it('should serve events.html for authenticated non-company users', () => {
      const req = { user: { userType: 'U' } };
      const res = { sendFile: jest.fn() };
      
      serveEventsContent(req, res);
      
      expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining('events.html'));
    });
  });

  describe('getAllEvents', () => {
    it('should return all events successfully', async () => {
      const mockEvents = [{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }];
      EventModel.getAllEvents.mockResolvedValue(mockEvents);
      
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await getAllEvents(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should handle errors when fetching events', async () => {
      EventModel.getAllEvents.mockRejectedValue(new Error('Database error'));
      
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      
      await getAllEvents(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving events");
    });
  });

  describe('getEventById', () => {
    it('should return an event by ID successfully', async () => {
      const mockEvent = { id: 1, name: 'Event 1' };
      EventModel.getEventById.mockResolvedValue(mockEvent);
      
      const req = { params: { eventId: '1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await getEventById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEvent);
    });

    it('should return 404 when event is not found', async () => {
      EventModel.getEventById.mockResolvedValue(null);
      
      const req = { params: { eventId: '999' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      
      await getEventById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Event not found");
    });

    it('should handle errors when fetching an event', async () => {
      EventModel.getEventById.mockRejectedValue(new Error('Database error'));
      
      const req = { params: { eventId: '1' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      
      await getEventById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving event");
    });
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      const mockEventData = {
        eventName: 'New Event',
        eventDesc: 'Description',
        eventOverview: 'Overview',
        eventCategory: 'Category',
        eventTime: '2024-07-22T12:00:00Z',
        cost: '10.99',
        eventImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
      };
      
      const mockUser = { userId: 1 };
      const mockCreatedEvent = { id: 1, ...mockEventData, creatorId: mockUser.userId };
      
      EventModel.createEvent.mockResolvedValue(mockCreatedEvent);
      
      const req = { 
        body: mockEventData,
        user: mockUser
      };
      const res = { 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn() 
      };
      
      await createEvent(req, res);
      
      expect(EventModel.createEvent).toHaveBeenCalledWith(expect.objectContaining({
        ...mockEventData,
        eventTime: expect.any(Date),
        creatorId: mockUser.userId,
        cost: 10.99,
        eventImage: expect.any(Buffer),
        eventReports: 0
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedEvent);
    });
  
    it('should handle invalid date format', async () => {
      const req = { 
        body: { 
          eventTime: 'invalid-date',
          cost: '10.99',
          eventImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
        },
        user: { userId: 1 }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await createEvent(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid date format' });
    });
  
    it('should handle invalid cost format', async () => {
      const req = { 
        body: { 
          eventTime: '2024-07-22T12:00:00Z',
          cost: 'invalid-cost',
          eventImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
        },
        user: { userId: 1 }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await createEvent(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid cost format' });
    });
  
    it('should handle errors when creating an event', async () => {
      const mockEventData = {
        eventName: 'New Event',
        eventDesc: 'Description',
        eventOverview: 'Overview',
        eventCategory: 'Category',
        eventTime: '2024-07-22T12:00:00Z',
        cost: '10.99',
        eventImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
      };
      
      EventModel.createEvent.mockRejectedValue(new Error('Database error'));
      
      const req = { 
        body: mockEventData,
        user: { userId: 1 }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await createEvent(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('signUserUp', () => {
    it('should sign up a user for an event successfully', async () => {
      const req = { 
        user: { userId: 1 },
        params: { eventId: '1' }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      eventAttendanceModel.addUserToEvent.mockResolvedValue(true);
      
      await signUserUp(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User signed up successfully' });
    });

    it('should return 401 for unauthenticated users', async () => {
      const req = { user: null };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await signUserUp(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 404 when event is not found', async () => {
      const req = { 
        user: { userId: 1 },
        params: { eventId: '999' }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      eventAttendanceModel.addUserToEvent.mockResolvedValue(null);
      
      await signUserUp(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Event not found' });
    });

    it('should handle errors when signing up a user', async () => {
      const req = { 
        user: { userId: 1 },
        params: { eventId: '1' }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      eventAttendanceModel.addUserToEvent.mockRejectedValue(new Error('Database error'));
      
      await signUserUp(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('getEventsByUserId', () => {
    it('should return events for authenticated user', async () => {
      const mockEvents = [{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }];
      EventModel.getEventsByUserId.mockResolvedValue(mockEvents);
      
      const req = { user: { userId: 1, userType: 'U' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await getEventsByUserId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should return events for authenticated company user', async () => {
      const mockEvents = [{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }];
      EventModel.getEventsByCreatorId.mockResolvedValue(mockEvents);
      
      const req = { user: { userId: 1, userType: 'C' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await getEventsByUserId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEvents.map(event => ({ ...event, isCompanyEvent: true })));
    });

    it('should return 200 for unauthenticated users', async () => {
      const req = { user: null };
      const res = { status: jest.fn().mockReturnThis() };
      
      await getEventsByUserId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors when fetching events', async () => {
      EventModel.getEventsByUserId.mockRejectedValue(new Error('Database error'));
      
      const req = { user: { userId: 1, userType: 'U' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await getEventsByUserId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('updateEventAttendance', () => {
    it('should update event attendance for authenticated user', async () => {
      const req = { 
        user: { userId: 1, userType: 'U' },
        params: { eventId: '1' }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      eventAttendanceModel.removeUserFromEvent.mockResolvedValue(true);
      
      await updateEventAttendance(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event attendance updated successfully' });
    });

    it('should update event attendance for authenticated company user', async () => {
      const req = { 
        user: { userId: 1, userType: 'C' },
        params: { eventId: '1', userId: '2' }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      eventAttendanceModel.removeUserFromEvent.mockResolvedValue(true);
      
      await updateEventAttendance(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event attendance updated successfully' });
    });

   
    it('should return 200 for unauthenticated users', async () => {
        const req = { user: null, params: { eventId: '1' } };
        const res = { status: jest.fn().mockReturnThis() };
        
        await updateEventAttendance(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
      });
    it('should return 404 when event is not found', async () => {
    const req = { 
        user: { userId: 1, userType: 'U' },
        params: { eventId: '999' }
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    eventAttendanceModel.removeUserFromEvent.mockResolvedValue(null);
    
    await updateEventAttendance(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Event not found' });
    });

    it('should handle errors when updating event attendance', async () => {
    const req = { 
        user: { userId: 1, userType: 'U' },
        params: { eventId: '1' }
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    eventAttendanceModel.removeUserFromEvent.mockRejectedValue(new Error('Database error'));
    
    await updateEventAttendance(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
});

describe('deleteEvent', () => {
    it('should delete an event successfully', async () => {
    const req = { params: { eventId: '1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    EventModel.deleteEvent.mockResolvedValue(true);
    
    await deleteEvent(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Event deleted successfully' });
    });

    it('should return 404 when event is not found', async () => {
    const req = { params: { eventId: '999' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    EventModel.deleteEvent.mockResolvedValue(null);
    
    await deleteEvent(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Event not found' });
    });

    it('should handle errors when deleting an event', async () => {
    const req = { params: { eventId: '1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    EventModel.deleteEvent.mockRejectedValue(new Error('Database error'));
    
    await deleteEvent(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
});
});