const { authorizePayment, capturePayment } = require('../controllers/eventPaymentController');
const EventPaymentsModel = require('../models/eventPaymentModel');
const fetch = require('node-fetch');

jest.mock('../models/eventPaymentModel');
jest.mock('node-fetch');

describe('Payment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authorizePayment', () => {
    it('should store authorization ID successfully', async () => {
      const req = {
        body: { authorizationID: 'auth123' },
        params: { eventId: 'event123' },
        user: { userId: 'user123' }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      EventPaymentsModel.create.mockResolvedValue();

      await authorizePayment(req, res);

      expect(EventPaymentsModel.create).toHaveBeenCalledWith('event123', 'user123', 'auth123');
      expect(res.json).toHaveBeenCalledWith({ message: 'Authorization ID stored successfully' });
    });

    it('should handle errors when storing authorization ID', async () => {
      const req = {
        body: { authorizationID: 'auth123' },
        params: { eventId: 'event123' },
        user: { userId: 'user123' }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      EventPaymentsModel.create.mockRejectedValue(new Error('Database error'));

      await authorizePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('capturePayment', () => {
    it('should capture payment successfully', async () => {
      const req = {
        params: { eventId: 'event123' },
        user: { userId: 'user123' }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockAccessToken = 'mock_access_token';
      const mockAuthorizationID = 'auth123';
      const mockCaptureResponse = { id: 'capture123', status: 'COMPLETED' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ access_token: mockAccessToken })
      });

      EventPaymentsModel.getAuthorizationID.mockResolvedValue(mockAuthorizationID);

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCaptureResponse)
      });

      EventPaymentsModel.capture.mockResolvedValue();

      await capturePayment(req, res);

      expect(EventPaymentsModel.getAuthorizationID).toHaveBeenCalledWith('event123', 'user123');
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(EventPaymentsModel.capture).toHaveBeenCalledWith('event123', 'user123');
      expect(res.json).toHaveBeenCalledWith(mockCaptureResponse);
    });

    it('should handle payment not found', async () => {
      const req = {
        params: { eventId: 'event123' },
        user: { userId: 'user123' }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ access_token: 'mock_access_token' })
      });

      EventPaymentsModel.getAuthorizationID.mockResolvedValue(null);

      await capturePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Payment not found' });
    });

    it('should handle capture failure', async () => {
      const req = {
        params: { eventId: 'event123' },
        user: { userId: 'user123' }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockAccessToken = 'mock_access_token';
      const mockAuthorizationID = 'auth123';
      const mockErrorResponse = { error: 'Capture failed' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ access_token: mockAccessToken })
      });

      EventPaymentsModel.getAuthorizationID.mockResolvedValue(mockAuthorizationID);

      fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue(mockErrorResponse)
      });

      await capturePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockErrorResponse);
    });

    it('should handle internal server error', async () => {
      const req = {
        params: { eventId: 'event123' },
        user: { userId: 'user123' }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      fetch.mockRejectedValue(new Error('Network error'));

      await capturePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});