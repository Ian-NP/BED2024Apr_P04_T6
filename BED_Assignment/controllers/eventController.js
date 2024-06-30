

const path = require('path');
const EventModel = require('../models/eventModel');
const eventAttendanceModel = require('../models/eventAttendanceModel');
 


const serveEventsContent = (req, res) => {

    console.log("hello")
    if (!req.user) {
        console.log("hello")
        return res.sendFile(path.join(__dirname + '/../public/html/events.html')); // Serve normal events if no token
    }

    const userType = req.user.userType; 

    if (userType === 'C') {
        console.log("hello12")
        res.sendFile(path.join(__dirname + '/../public/html/createEvent.html'));
    } else {
        console.log("hello123")
        res.sendFile(path.join(__dirname + '/../public/html/events.html'));
    }
};

const getAllEvents = async (req, res) => {
    try {
        const events = await EventModel.getAllEvents();
        console.log(events);
        return res.status(200).json(events);
    } catch (err) {
        console.error('Error getting events: ', err);
        res.status(500).send("Error retrieving events");
    }
};

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
const createEvent = async (req, res) => {
    try {
        console.log('Request body:', req.body);

        const eventTime = new Date(req.body.eventTime);
        console.log('Received eventTime:', req.body.eventTime);
        console.log('Parsed eventTime:', eventTime);

        if (isNaN(eventTime)) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const cost = parseFloat(req.body.cost);
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
            creatorId: req.body.creatorId,
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
const signUserUp = async (req, res) => {
    if(!req.user) {
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

const getEventsByUserId = async (req, res) => {
    console.log(req.user);
    if (!req.user) {
        return res.status(200);
    }

    const userId = req.user.userId;

    console.log(userId);
    if (req.user.userType == 'U'){
    try {
        const events = await EventModel.getEventsByUserId(userId);
        console.log(events);
        res.status(200).json(events);
    } catch (error) {
        console.error('Error getting events by user ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
} else {
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

const updateEventAttendance = async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    if (!req.user) {
        return res.status(200);
    }

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

}

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
}
