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

module.exports = {
    getAllEvents
}
