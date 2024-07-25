const fetch = require('node-fetch');
const EventPaymentsModel = require('../models/eventPaymentModel');
require('dotenv').config();
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const auth = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');

// Function to get PayPal access token
async function getAccessToken() {
    const response = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        throw new Error('Failed to get access token');
    }

    const data = await response.json();
    return data.access_token;
}

// Function to authorize a payment and store authorization ID
const authorizePayment = async (req, res) => {
    const { authorizationID } = req.body;
    const { eventId } = req.params;
    const userId = req.user.userId;

    try {
        await EventPaymentsModel.create(eventId, userId, authorizationID);
        res.json({ message: 'Authorization ID stored successfully' });
    } catch (error) {
        console.error('Error storing authorization ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Function to capture an authorized payment
const capturePayment = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.userId;

    try {
        const accessToken = await getAccessToken();
        const authorizationID = await EventPaymentsModel.getAuthorizationID(eventId, userId);

        if (!authorizationID) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const captureUrl = `https://api.sandbox.paypal.com/v2/payments/authorizations/${authorizationID}/capture`;
        const response = await fetch(captureUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(400).json(error);
        }

        const data = await response.json();
        await EventPaymentsModel.capture(eventId, userId);

        res.json(data);
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    authorizePayment,
    capturePayment
};
