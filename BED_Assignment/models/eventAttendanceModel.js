import sql from "mssql";
import dbConfig from "../dbConfig.js";
const User = require('./user.js');  

class EventAttendanceModel {
    static async getAttendeesByEventId(eventId) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT u.userId, u.email, u.name, u.password, u.userType 
                FROM EventAttendance ea 
                INNER JOIN Users u ON ea.userId = u.userId 
                WHERE ea.eventId = @eventId
            `;
            const request = connection.request();
            request.input("eventId", sql.Int, eventId);
            const result = await request.query(sqlQuery);

            const attendees = result.recordset.map(record => 
                new User(
                    record.userId,
                    record.email,
                    record.name,
                    record.password,
                    record.userType
                )
            );
            return attendees;
        } catch (error) {
            console.error('Error fetching attendees:', error);
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

    static async addUserToEvent(eventId, userId) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `INSERT INTO EventAttendance (eventId, userId) VALUES (@eventId, @userId)`;

            const request = connection.request();
            request.input("eventId", sql.Int, eventId);
            request.input("userId", sql.Int, userId);

            const result = await request.query(sqlQuery);

            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error adding user to event:', error);
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

    static async removeUserFromEvent(eventId, userId) {
        let connection;
        
        try {
            connection = await sql.connect(dbConfig);

            const sqlQuery = `DELETE FROM EventAttendance WHERE eventId = @eventId AND userId = @userId`;

            const request = connection.request();
            request.input("eventId", sql.Int, eventId);
            request.input("userId", sql.Int, userId);

            const result = await request.query(sqlQuery);

            return result.rowsAffected[0] > 0; 
        } catch (error) {
            console.error('Error removing user from event:', error);
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

};

module.exports = EventAttendanceModel;
