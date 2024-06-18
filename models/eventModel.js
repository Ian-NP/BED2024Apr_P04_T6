import sql from "mssql";
import dbConfig from "../dbConfig";
const EventAttendanceModel = require('./eventAttendanceModel'); 

class EventModel {
    constructor(eventId, eventName, eventDesc, eventOverview, eventCategory, eventReports, eventTime, creatorId, creatorName) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.eventDesc = eventDesc;
        this.eventOverview = eventOverview;
        this.eventCategory = eventCategory;
        this.eventReports = eventReports;
        this.eventTime = eventTime;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
    }

    static async getAllEvents() {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT 
                    e.eventId, 
                    e.eventName, 
                    e.eventDesc, 
                    e.eventOverview, 
                    e.eventCategory, 
                    e.eventReports, 
                    e.eventTime, 
                    e.creatorId, 
                    u.name AS creatorName 
                FROM Events e
                JOIN Users u ON e.creatorId = u.userId
            `;
            const request = connection.request(); 
            const result = await request.query(sqlQuery);

            const events = result.recordset.map(record => 
                new EventModel(
                    record.eventId,
                    record.eventName,
                    record.eventDesc,
                    record.eventOverview,
                    record.eventCategory,
                    record.eventReports,
                    record.eventTime,
                    record.creatorId,
                    record.creatorName
                )
            );
            
            return events;
        } catch (error) {
            console.error('Error getting events:', error);
            throw new Error("Error getting events");
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error closing the connection:', closeError);
                }
            }
        }
    }

    static async getEventById(eventId) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT 
                    e.eventId, 
                    e.eventName, 
                    e.eventDesc, 
                    e.eventOverview, 
                    e.eventCategory, 
                    e.eventReports, 
                    e.eventTime, 
                    e.creatorId, 
                    u.name AS creatorName 
                FROM Events e
                JOIN Users u ON e.creatorId = u.userId
                WHERE e.eventId = @eventId
            `;
            const request = connection.request();
            request.input("eventId", sql.Int, eventId);
            const result = await request.query(sqlQuery);

            const event = result.recordset[0] ? new EventModel(
                result.recordset[0].eventId,
                result.recordset[0].eventName,
                result.recordset[0].eventDesc,
                result.recordset[0].eventOverview,
                result.recordset[0].eventCategory,
                result.recordset[0].eventReports,
                result.recordset[0].eventTime,
                result.recordset[0].creatorId,
                result.recordset[0].creatorName
            ) : null;

            if (event) {
                event.attendees = await EventAttendanceModel.getAttendeesByEventId(event.eventId);
            }

            return event;
        } catch (error) {
            console.error('Error fetching event by ID:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error closing the connection:', closeError);
                }
            }
        }
    }

    static async getEventsByCreatorId(creatorId) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT 
                    e.eventId, 
                    e.eventName, 
                    e.eventDesc, 
                    e.eventOverview, 
                    e.eventCategory, 
                    e.eventReports, 
                    e.eventTime, 
                    e.creatorId, 
                    u.name AS creatorName 
                FROM Events e
                JOIN Users u ON e.creatorId = u.userId
                WHERE e.creatorId = @creatorId
            `;
            const request = connection.request();
            request.input("creatorId", sql.Int, creatorId);
            const result = await request.query(sqlQuery);

            const events = result.recordset.map(record => 
                new EventModel(
                    record.eventId,
                    record.eventName,
                    record.eventDesc,
                    record.eventOverview,
                    record.eventCategory,
                    record.eventReports,
                    record.eventTime,
                    record.creatorId,
                    record.creatorName
                )
            );

            for (const event of events) {
                event.attendees = await EventAttendanceModel.getAttendeesByEventId(event.eventId);
            }

            return events;
        } catch (error) {
            console.error('Error fetching events by creator ID:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error closing the connection:', closeError);
                }
            }
        }
    }

    static async createEvent(newEventData) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO Events (eventName, eventDesc, eventCategory, eventReports, eventTime, creatorId, eventOverview)
                VALUES (@eventName, @eventDesc, @eventCategory, @eventReports, @eventTime, @creatorId, @eventOverview);
                SELECT SCOPE_IDENTITY() AS newEventId;
            `;

            const request = connection.request();
            request.input("eventName", sql.NVarChar(255), newEventData.eventName);
            request.input("eventDesc", sql.NVarChar(sql.MAX), newEventData.eventDesc);
            request.input("eventCategory", sql.NVarChar(50), newEventData.eventCategory);
            request.input("eventReports", sql.Int, newEventData.eventReports);
            request.input("eventTime", sql.DateTime2, newEventData.eventTime);
            request.input("creatorId", sql.Int, newEventData.creatorId);
            request.input("eventOverview", sql.NVarChar(sql.MAX), newEventData.eventOverview);

            const result = await request.query(sqlQuery);
            const newEventId = result.recordset[0].newEventId;

            const createdEvent = new EventModel(
                newEventId,
                newEventData.eventName,
                newEventData.eventDesc,
                newEventData.eventOverview,
                newEventData.eventCategory,
                newEventData.eventReports,
                newEventData.eventTime,
                newEventData.creatorId,
                newEventData.creatorName
            );

            return createdEvent;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error closing the connection:', closeError);
                }
            }
        }
    }

    static async updateEvent(eventId, updatedEventData) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);

            const attendees = await EventAttendanceModel.getAttendeesByEventId(eventId);

            const sqlQuery = `
                UPDATE Events
                SET eventName = @eventName,
                    eventDesc = @eventDesc,
                    eventCategory = @eventCategory,
                    eventReports = @eventReports,
                    eventTime = @eventTime,
                    creatorId = @creatorId,
                    eventOverview = @eventOverview
                WHERE eventId = @eventId;
                SELECT 
                    e.eventId, 
                    e.eventName, 
                    e.eventDesc, 
                    e.eventOverview, 
                    e.eventCategory, 
                    e.eventReports, 
                    e.eventTime, 
                    e.creatorId, 
                    u.name AS creatorName 
                FROM Events e
                JOIN Users u ON e.creatorId = u.userId
                WHERE e.eventId = @eventId;
            `;

            const request = connection.request();
            request.input("eventId", sql.Int, eventId);
            request.input("eventName", sql.NVarChar(255), updatedEventData.eventName);
            request.input("eventDesc", sql.NVarChar(sql.MAX), updatedEventData.eventDesc);
            request.input("eventCategory", sql.NVarChar(50), updatedEventData.eventCategory);
            request.input("eventReports", sql.Int, updatedEventData.eventReports);
            request.input("eventTime", sql.DateTime2, updatedEventData.eventTime);
            request.input("creatorId", sql.Int, updatedEventData.creatorId);
            request.input("eventOverview", sql.NVarChar(sql.MAX), updatedEventData.eventOverview);

            const result = await request.query(sqlQuery);
            const record = result.recordset[0];

            const updatedEvent = new EventModel(
                record.eventId,
                record.eventName,
                record.eventDesc,
                record.eventOverview,
                record.eventCategory,
                record.eventReports,
                record.eventTime,
                record.creatorId,
                record.creatorName
            );

            return { event: updatedEvent, attendees: attendees };
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error closing the connection:', closeError);
                }
            }
        }
    }

    static async deleteEvent(eventId) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);

            const attendees = await EventAttendanceModel.getAttendeesByEventId(eventId);

            const sqlQuery = `DELETE FROM Events WHERE eventId = @eventId`;

            const request = connection.request();
            request.input("eventId", sql.Int, eventId);

            const result = await request.query(sqlQuery);

            return { deleted: result.rowsAffected[0] > 0, attendees: attendees };
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error closing the connection:', closeError);
                }
            }
        }
    }
}

module.exports = EventModel;
