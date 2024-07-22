import sql from 'mssql';
import ChatBotHistory from '../models/geminiChatBotConversationHistory';

// Mock setup for mssql
jest.mock('mssql', () => {
    const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
    };

    const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined)
    };

    return {
        connect: jest.fn().mockResolvedValue(mockConnection),
        ConnectionPool: jest.fn().mockImplementation(() => ({
            connect: jest.fn().mockResolvedValue(mockConnection),
            close: jest.fn().mockResolvedValue(undefined)
        })),
        NVarChar: jest.fn().mockImplementation((size) => `NVarChar(${size})`),
        Int: 'Int',
        MAX: -1 // For NVarChar(MAX)
    };
});

describe('fetchAndFormatChatHistoryForGemini', () => {
    let mockConnection;
    let mockRequest;

    beforeEach(() => {
        mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn()
        };
        mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };
        sql.connect.mockResolvedValue(mockConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and format chat history correctly', async () => {
        // Arrange
        const conversationId = 1;
        const mockResult = {
            recordset: [
                { role: 'user', text: 'Hello', chatHistoryId: 1, timeStamp: new Date(), conversationId },
                { role: 'model', text: 'Hi there!', chatHistoryId: 2, timeStamp: new Date(), conversationId }
            ]
        };
        mockRequest.query.mockResolvedValue(mockResult);

        // Act
        const { formattedHistory, chatHistory } = await ChatBotHistory.fetchAndFormatChatHistoryForGemini(conversationId);

        // Assert
        expect(formattedHistory).toEqual([
            { role: 'user', parts: [{ text: 'Hello' }] },
            { role: 'model', parts: [{ text: 'Hi there!' }] }
        ]);
        expect(chatHistory).toEqual([
            new ChatBotHistory(1, 'user', 'Hello', mockResult.recordset[0].timeStamp, conversationId),
            new ChatBotHistory(2, 'model', 'Hi there!', mockResult.recordset[1].timeStamp, conversationId)
        ]);
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle errors and close the connection', async () => {
        // Arrange
        const conversationId = 1;
        const error = new Error('Database error');
        mockRequest.query.mockRejectedValue(error);

        // Act & Assert
        await expect(ChatBotHistory.fetchAndFormatChatHistoryForGemini(conversationId))
            .rejects
            .toThrow('Error fetching and formatting chat history');
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle empty results gracefully', async () => {
        // Arrange
        const conversationId = 1;
        const mockResult = { recordset: [] };
        mockRequest.query.mockResolvedValue(mockResult);

        // Act
        const { formattedHistory, chatHistory } = await ChatBotHistory.fetchAndFormatChatHistoryForGemini(conversationId);

        // Assert
        expect(formattedHistory).toEqual([]);
        expect(chatHistory).toEqual([]);
        expect(mockConnection.close).toHaveBeenCalled();
    });
});

describe('addChatHistory', () => {
    let mockConnection;
    let mockRequest;

    beforeEach(() => {
        mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn()
        };
        mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };
        sql.connect.mockResolvedValue(mockConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should insert chat history correctly', async () => {
        // Arrange
        const role = 'user';
        const text = 'Hello';
        const conversationId = 1;
        mockRequest.query.mockResolvedValue({}); // Mock successful query execution
    
        // Act
        const result = await ChatBotHistory.addChatHistory(role, text, conversationId);
    
        // Assert
        expect(result).toBe(true);
        expect(mockRequest.input).toHaveBeenCalledWith("role", "NVarChar(5)", role);
        expect(mockRequest.input).toHaveBeenCalledWith("text", "NVarChar(-1)", text); // Ensure the text length is MAX
        expect(mockRequest.input).toHaveBeenCalledWith("conversationId", "Int", conversationId);
        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO ChatBotHistory'));
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle errors and close the connection', async () => {
        // Arrange
        const role = 'user';
        const text = 'Hello';
        const conversationId = 1;
        const error = new Error('Database error');
        mockRequest.query.mockRejectedValue(error); // Mock query error
    
        // Act & Assert
        await expect(ChatBotHistory.addChatHistory(role, text, conversationId))
            .rejects
            .toThrow('Error adding chat history');
        
        // Ensure the connection.close() method is called even when there's an error
        expect(mockConnection.close).toHaveBeenCalled();
    });
});
