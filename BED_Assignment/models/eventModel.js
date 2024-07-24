import sql from "mssql";
import dbConfig from "../dbConfig";
const EventAttendanceModel = require('./eventAttendanceModel'); 

class EventModel {
    constructor(eventId, eventName, eventDesc, eventOverview, eventCategory, eventReports, eventTime, creatorId, creatorName, cost, eventImage) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.eventDesc = eventDesc;
        this.eventOverview = eventOverview;
        this.eventCategory = eventCategory;
        this.eventReports = eventReports;
        this.eventTime = eventTime;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.cost = cost;
        this.eventImage = eventImage;
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
                    u.name AS creatorName,
                    e.cost,
                    e.eventImage
                FROM Events e
                JOIN Users u ON e.creatorId = u.userId
            `;
            const request = connection.request(); 
            const result = await request.query(sqlQuery);

            const events = result.recordset.map(record => {
                const eventImageBase64 = record.eventImage ? record.eventImage.toString('base64') : null;
                return new EventModel(
                    record.eventId,
                    record.eventName,
                    record.eventDesc,
                    record.eventOverview,
                    record.eventCategory,
                    record.eventReports,
                    record.eventTime,
                    record.creatorId,
                    record.creatorName,
                    record.cost,
                    eventImageBase64
                );
            });
            
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
                    u.name AS creatorName,
                    e.cost,
                    e.eventImage
                FROM Events e
                JOIN Users u ON e.creatorId = u.userId
                WHERE e.eventId = @eventId
            `;
            const request = connection.request();
            request.input("eventId", sql.Int, eventId);
            const result = await request.query(sqlQuery);

            const record = result.recordset[0];
          
            const event = record ? new EventModel(
                record.eventId,
                record.eventName,
                record.eventDesc,
                record.eventOverview,
                record.eventCategory,
                record.eventReports,
                record.eventTime,
                record.creatorId,
                record.creatorName,
                record.cost,
                record.eventImage ? record.eventImage.toString('base64') : null
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
                    u.name AS creatorName,
                    e.cost,
                    e.eventImage
                FROM Events e
                JOIN Users u ON e.creatorId = u.userId
                WHERE e.creatorId = @creatorId
            `;
            const request = connection.request();
            request.input("creatorId", sql.Int, creatorId);
            const result = await request.query(sqlQuery);
    
            const events = result.recordset.map(record => {
                const eventImageBase64 = record.eventImage ? record.eventImage.toString('base64') : null;
                return {
                    eventId: record.eventId,
                    eventName: record.eventName,
                    eventDesc: record.eventDesc,
                    eventOverview: record.eventOverview,
                    eventCategory: record.eventCategory,
                    eventReports: record.eventReports,
                    eventTime: record.eventTime,
                    creatorId: record.creatorId,
                    creatorName: record.creatorName,
                    cost: record.cost,
                    eventImage: eventImageBase64
                };
            });
    
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
                INSERT INTO Events (eventName, eventDesc, eventCategory, eventReports, eventTime, creatorId, eventOverview, cost, eventImage)
                VALUES (@eventName, @eventDesc, @eventCategory, @eventReports, @eventTime, @creatorId, @eventOverview, @cost, @eventImage);
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
            request.input("cost", sql.Decimal(10, 2), newEventData.cost);
            request.input("eventImage", sql.VarBinary(sql.MAX), newEventData.eventImage);

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
                newEventData.creatorName,
                newEventData.cost,
                newEventData.eventImage
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
                    eventOverview = @eventOverview,
                    cost = @cost,
                    eventImage = @eventImage
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
                    u.name AS creatorName,
                    e.cost,
                    e.eventImage
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
            request.input("cost", sql.Decimal(10, 2), updatedEventData.cost);
            request.input("eventImage", sql.VarBinary(sql.MAX), Buffer.from(updatedEventData.eventImage.split(',')[1], 'base64'));

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
                record.creatorName,
                record.cost,
                record.eventImage
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
            
            const sqlQuery = `DELETE FROM Events WHERE eventId = @eventId`;
            const request = connection.request();
            
            request.input("eventId", sql.Int, eventId);
            const result = await request.query(sqlQuery);

            return { deleted: result.rowsAffected[0] > 0 };
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

    static async getEventsByUserId(userId) {
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
                    c.name AS creatorName,
                    e.cost,
                    e.eventImage
                FROM Events e
                JOIN EventAttendance ea ON e.eventId = ea.eventId
                JOIN Users c ON e.creatorId = c.userId
                WHERE ea.userId = @userId
            `;
            const request = connection.request();
            request.input("userId", sql.Int, userId);
            const result = await request.query(sqlQuery);

            const events = result.recordset.map(record => {
                const eventImageBase64 = record.eventImage ? record.eventImage.toString('base64') : null;
                const event = new EventModel(
                    record.eventId,
                    record.eventName,
                    record.eventDesc,
                    record.eventOverview,
                    record.eventCategory,
                    record.eventReports,
                    record.eventTime,
                    record.creatorId,
                    record.creatorName,
                    record.cost,
                    eventImageBase64
                );

                return event;
            });

            return events;
        } catch (error) {
            console.error('Error fetching events by user ID:', error);
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
