import sql from "mssql";
import dbConfig from "../dbConfig";

class EventPaymentsModel {
    constructor(paymentId, eventId, userId, authorizationID, captured) {
        this.paymentId = paymentId;
        this.eventId = eventId;
        this.userId = userId;
        this.authorizationID = authorizationID;
        this.captured = captured;
    }

    static async create(eventId, userId, authorizationID) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO EventPayments (eventId, userId, authorizationID, captured)
                VALUES (@eventId, @userId, @authorizationID, 0)
            `;
            const request = connection.request();
            request.input('eventId', sql.Int, eventId);
            request.input('userId', sql.Int, userId);
            request.input('authorizationID', sql.NVarChar, authorizationID);

            await request.query(sqlQuery);
        } catch (error) {
            console.error('Error creating event payment:', error);
            throw new Error("Error creating event payment");
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

    static async getAuthorizationID(eventId, userId) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT authorizationID
                FROM EventPayments
                WHERE eventId = @eventId AND userId = @userId AND captured = 0
            `;
            const request = connection.request();
            request.input('eventId', sql.Int, eventId);
            request.input('userId', sql.Int, userId);

            const result = await request.query(sqlQuery);
            return result.recordset[0] ? result.recordset[0].authorizationID : null;
        } catch (error) {
            console.error('Error getting authorization ID:', error);
            throw new Error("Error getting authorization ID");
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

    static async capture(eventId, userId) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                UPDATE EventPayments
                SET captured = 1
                WHERE eventId = @eventId AND userId = @userId
            `;
            const request = connection.request();
            request.input('eventId', sql.Int, eventId);
            request.input('userId', sql.Int, userId);

            await request.query(sqlQuery);
        } catch (error) {
            console.error('Error capturing event payment:', error);
            throw new Error("Error capturing event payment");
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

module.exports = EventPaymentsModel;
