
const multer = require('multer');
const path = require('path');
const EventModel = require('../models/eventModel');

 
// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const serveEventsContent = (req, res) => {

    console.log("hello")
    if (!req.user) {
        console.log("hello")
        return res.sendFile(path.join(__dirname + '/../public/html/events.html')); // Serve normal events if no token
    }

    const userType = req.user.userType; // Extract user type from the request

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

const createEvent = [
    upload.single('eventImage'), // Handle file upload
    async (req, res) => {
        try {
            const { eventName, eventDesc, eventCategory, eventReports, eventTime, eventOverview, cost } = req.body;
            const eventImage = req.file ? req.file.buffer : null;

            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const creatorName = req.user.name;
            const creatorId = req.user.id; // Assuming the token includes an 'id' field

            const newEvent = {
                eventName,
                eventDesc,
                eventCategory,
                eventReports: parseInt(eventReports, 10),
                eventTime: new Date(eventTime),
                creatorId,
                eventOverview,
                cost: parseFloat(cost),
                eventImage
            };

            const createdEvent = await EventModel.createEvent(newEvent);
            return res.status(201).json(createdEvent);
        } catch (error) {
            console.error('Error creating event:', error);
            return res.status(500).json({ message: 'Error creating event' });
        }
    }
];


module.exports = {
    getAllEvents,
    getEventById,
    serveEventsContent,
    createEvent
}
