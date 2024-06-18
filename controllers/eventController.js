const EventModel = require("../models/eventModel");

const getAllEvents = async (req, res) => {
    try {
        const events = await EventModel.getAllEvents();
        console.log(events);
        return res.status(200).json(events);
    } catch (err) {
        console.error('Error getting events: ', err);
        res.status(500).send("Error retrieving events");
    }
}

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
}

module.exports = {
    getAllEvents,
    getEventById
}
