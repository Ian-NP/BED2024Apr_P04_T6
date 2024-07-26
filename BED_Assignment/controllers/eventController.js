const path = require('path');
const EventModel = require('../models/eventModel');
const eventAttendanceModel = require('../models/eventAttendanceModel');

// Function to serve the appropriate HTML content based on user type
const serveEventsContent = (req, res) => {
    // If the user is not logged in, serve the general events page
    if (!req.user) {
        return res.sendFile(path.join(__dirname + '/../public/html/events.html')); 
    }

    const userType = req.user.userType; 

    // If the user is a creator, serve the create event page
    if (userType === 'C') {
        res.sendFile(path.join(__dirname + '/../public/html/createEvent.html'));
    } else {
        // Otherwise, serve the general events page
        res.sendFile(path.join(__dirname + '/../public/html/events.html'));
    }
};

// Function to retrieve all events from the database
const getAllEvents = async (req, res) => {
    try {
        const events = await EventModel.getAllEvents();
        return res.status(200).json(events);
    } catch (err) {
        console.error('Error getting events: ', err);
        res.status(500).send("Error retrieving events");
    }
};

// Function to retrieve a specific event by its ID
const getEventById = async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    try {
        const event = await EventModel.getEventById(eventId);
        if (!event) {
            return res.status(404).send("Event not found");
        }
        return res.status(200).json(event);
    } catch (err) {
        console.error(`Error getting event by ID: ${eventId}`, err);
        res.status(500).send("Error retrieving event");
    }
};

// Function to create a new event
const createEvent = async (req, res) => {
    try {
        const eventTime = new Date(req.body.eventTime);
        const creatorId = req.user.userId

        // Check if eventTime is a valid date
        if (isNaN(eventTime)) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const cost = parseFloat(req.body.cost);
        // Check if cost is a valid number
        if (isNaN(cost)) {
            return res.status(400).json({ error: 'Invalid cost format' });
        }

        
        
        // Decode the base64 string to get the binary data
        const eventImageBuffer = Buffer.from(req.body.eventImage.split(',')[1], 'base64');

        const newEventData = {
            eventName: req.body.eventName,
            eventDesc: req.body.eventDesc,
            eventOverview: req.body.eventOverview,
            eventCategory: req.body.eventCategory,
            eventReports: req.body.eventReports || 0,
            eventTime: eventTime,
            creatorId: creatorId,
            cost: cost,
            eventImage: eventImageBuffer // Use the buffer for the image data
        };

        const createdEvent = await EventModel.createEvent(newEventData);
        res.status(201).json(createdEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to sign a user up for an event
const signUserUp = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const eventId = parseInt(req.params.eventId);
    const userId = req.user.userId;

    try {
        const result = await eventAttendanceModel.addUserToEvent(eventId, userId);
        if (!result) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json({ message: 'User signed up successfully' });
    } catch (error) {
        console.error('Error signing user up:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Function to get events associated with a specific user ID
const getEventsByUserId = async (req, res) => {
    if (!req.user) {
        return res.status(200);
    }

    const userId = req.user.userId;

    // If the user is a regular user, get events they are attending
    if (req.user.userType == 'U') {
        try {
            const events = await EventModel.getEventsByUserId(userId);
            res.status(200).json(events);
        } catch (error) {
            console.error('Error getting events by user ID:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        // If the user is a creator, get events they created
        try {
            const events = await EventModel.getEventsByCreatorId(userId);
            const companyEvents = events.map(event => ({ ...event, isCompanyEvent: true }));
            res.status(200).json(companyEvents);
        } catch (error) {
            console.error('Error getting events by user ID:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

// Function to update event attendance, either removing a user or handling company events
const updateEventAttendance = async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    if (!req.user) {
        return res.status(200);
    }

    if (req.user.userType == 'U') {
        const userId = req.user.userId;

        try {
            const result = await eventAttendanceModel.removeUserFromEvent(eventId, userId);
            if (!result) {
                return res.status(404).json({ error: 'Event not found' });
            }
            res.status(200).json({ message: 'Event attendance updated successfully' });
        } catch (error) {
            console.error('Error updating event attendance:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        const userId = parseInt(req.params.userId);
        try {
            const result = await eventAttendanceModel.removeUserFromEvent(eventId, userId);
            if (!result) {
                return res.status(404).json({ error: 'Event not found' });
            }
            res.status(200).json({ message: 'Event attendance updated successfully' });
        } catch (error) {
            console.error('Error updating event attendance:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Function to delete an event by its ID
const deleteEvent = async (req, res) => {
    const eventId = parseInt(req.params.eventId, 10);
    try {
        const result = await EventModel.deleteEvent(eventId);
        if (!result) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    serveEventsContent,
    createEvent,
    signUserUp,
    getEventsByUserId,
    updateEventAttendance,
    deleteEvent
};
