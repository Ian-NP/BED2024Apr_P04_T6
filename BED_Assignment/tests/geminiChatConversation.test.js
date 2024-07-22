import sql from 'mssql';
import ChatConversation from '../models/geminiChatConversation';

// Mock setup for mssql
jest.mock('mssql', () => {
    const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
    };

    const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn()
    };

    return {
        connect: jest.fn().mockResolvedValue(mockConnection),
        ConnectionPool: jest.fn().mockImplementation(() => ({
            connect: jest.fn().mockResolvedValue(mockConnection),
            close: jest.fn().mockResolvedValue(undefined)
        })),
        NVarChar: jest.fn().mockImplementation((size) => `NVarChar(${size})`), // Mock for NVarChar
        Int: 'Int' // Mock for Int
    };
});

describe('fetchChatConversationsByUserId', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and format chat conversations by userId successfully', async () => {
        // Arrange
        const mockUserId = 1;
        const mockChatConversations = [
            {
                conversationId: 1,
                conversationTitle: 'Chat with John',
                timeStamp: new Date(),
                userId: mockUserId
            }
        ];

        // Set up mock data and behaviors
        sql.connect.mockResolvedValue({
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ recordset: mockChatConversations })
            }),
            close: jest.fn()
        });

        // Act
        const result = await ChatConversation.fetchChatConversationsByUserId(mockUserId);

        // Assert
        expect(result).toHaveLength(mockChatConversations.length);
        expect(result[0]).toBeInstanceOf(ChatConversation);
        expect(result[0].conversationId).toBe(mockChatConversations[0].conversationId);
        expect(result[0].conversationTitle).toBe(mockChatConversations[0].conversationTitle);
        expect(result[0].timeStamp).toEqual(mockChatConversations[0].timeStamp);
        expect(result[0].userId).toBe(mockChatConversations[0].userId);
    });

    it('should handle errors when fetching chat conversations', async () => {
        // Arrange
        const mockUserId = 1;
        const mockError = new Error('Database error');

        // Set up mock behaviors
        sql.connect.mockRejectedValue(mockError);

        // Act & Assert
        await expect(ChatConversation.fetchChatConversationsByUserId(mockUserId))
            .rejects
            .toThrow('Error fetching and formatting chat conversations by userId');
    });
});

describe('deleteChatConversation', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete chat conversation and return true if rows are affected', async () => {
        // Arrange
        const mockConversationId = 1;
        const mockRowsAffected = [1]; // Simulate that one row was affected

        const mockConnection = {
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ rowsAffected: mockRowsAffected })
            }),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection);

        // Act
        const result = await ChatConversation.deleteChatConversation(mockConversationId);

        // Assert
        expect(result).toBe(true);
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should return false if no rows are affected', async () => {
        // Arrange
        const mockConversationId = 1;
        const mockRowsAffected = [0]; // Simulate that no rows were affected

        const mockConnection = {
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ rowsAffected: mockRowsAffected })
            }),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection);

        // Act
        const result = await ChatConversation.deleteChatConversation(mockConversationId);

        // Assert
        expect(result).toBe(false);
        expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle errors and ensure the connection is closed', async () => {
        // Arrange
        const mockConversationId = 1;
        const mockError = new Error('Database error');

        const mockConnection = {
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn()
            }),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection);
        mockConnection.request().query.mockRejectedValue(mockError);

        // Act & Assert
        await expect(ChatConversation.deleteChatConversation(mockConversationId))
            .rejects
            .toThrow('Error deleting chat conversation by conversationId');

        // Ensure connection is closed even if there is an error
        expect(mockConnection.close).toHaveBeenCalled();
    });
});

describe('addNewConversation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should add a new conversation and return a ChatConversation instance', async () => {
        // Arrange
        const conversationTitle = "Chat with Alice";
        const userId = 1;
        const mockRecordset = [
            {
                conversationId: 1,
                conversationTitle: conversationTitle,
                timeStamp: new Date(),
                userId: userId,
            }
        ];

        sql.connect.mockResolvedValue({
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ recordset: mockRecordset })
            }),
            close: jest.fn()
        });

        // Act
        const result = await ChatConversation.addNewConversation(conversationTitle, userId);

        // Assert
        expect(result).toBeInstanceOf(ChatConversation);
        expect(result.conversationId).toBe(mockRecordset[0].conversationId);
        expect(result.conversationTitle).toBe(mockRecordset[0].conversationTitle);
        expect(result.timeStamp).toEqual(mockRecordset[0].timeStamp);
        expect(result.userId).toBe(mockRecordset[0].userId);
    });

    it('should handle foreign key constraint errors and throw a specific error', async () => {
        // Arrange
        const conversationTitle = "Chat with Bob";
        const userId = 999; // Assuming this userId does not exist
        const mockError = new Error('The INSERT statement conflicted with the FOREIGN KEY constraint');
    
        sql.connect.mockResolvedValue({
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(mockError)
            }),
            close: jest.fn()
        });
    
        // Act & Assert
        await expect(ChatConversation.addNewConversation(conversationTitle, userId))
            .rejects
            .toThrow('User ID does not exist. Cannot create conversation.');
    });

    it('should handle general errors and throw a specific error', async () => {
        // Arrange
        const conversationTitle = "Chat with Carol";
        const userId = 1;
        const mockError = new Error('General database error');
    
        sql.connect.mockResolvedValue({
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(mockError)
            }),
            close: jest.fn()
        });
    
        // Act & Assert
        await expect(ChatConversation.addNewConversation(conversationTitle, userId))
            .rejects
            .toThrow('Error creating chat conversation');
    });

    it('should ensure the connection is closed even if an error occurs', async () => {
        // Arrange
        const conversationTitle = "Chat with Dave";
        const userId = 1;
        const mockError = new Error('General database error');
    
        const mockConnection = {
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(mockError)
            }),
            close: jest.fn()
        };
    
        sql.connect.mockResolvedValue(mockConnection);
    
        // Act & Assert
        await expect(ChatConversation.addNewConversation(conversationTitle, userId))
            .rejects
            .toThrow('Error creating chat conversation');
    
        // Ensure connection is closed even if there is an error
        expect(mockConnection.close).toHaveBeenCalled();
    });
});

describe('editConversationTitle', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully update the conversation title and return true if affected rows are greater than 0', async () => {
        // Arrange
        const mockConversationTitle = 'Updated Chat Title';
        const mockConversationId = 1;
        const mockResult = { rowsAffected: [1] };

        sql.connect.mockResolvedValue({
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue(mockResult)
            }),
            close: jest.fn()
        });

        // Act
        const result = await ChatConversation.editConversationTitle(mockConversationTitle, mockConversationId);

        // Assert
        expect(result).toBe(true);
    });

    it('should return false if no rows are affected', async () => {
        // Arrange
        const mockConversationTitle = 'Updated Chat Title';
        const mockConversationId = 1;
        const mockResult = { rowsAffected: [0] };

        sql.connect.mockResolvedValue({
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue(mockResult)
            }),
            close: jest.fn()
        });

        // Act
        const result = await ChatConversation.editConversationTitle(mockConversationTitle, mockConversationId);

        // Assert
        expect(result).toBe(false);
    });

    it('should throw an error if a database error occurs', async () => {
        // Arrange
        const mockConversationTitle = 'Updated Chat Title';
        const mockConversationId = 1;
        const mockError = new Error('Database error');

        sql.connect.mockResolvedValue({
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(mockError)
            }),
            close: jest.fn()
        });

        // Act & Assert
        await expect(ChatConversation.editConversationTitle(mockConversationTitle, mockConversationId))
            .rejects
            .toThrow('Error updating conversation title by conversationId');
    });

    it('should ensure the connection is closed even if an error occurs', async () => {
        // Arrange
        const mockConversationTitle = 'Updated Chat Title';
        const mockConversationId = 1;
        const mockError = new Error('Database error');

        const mockConnection = {
            request: () => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(mockError)
            }),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection);

        // Act & Assert
        await expect(ChatConversation.editConversationTitle(mockConversationTitle, mockConversationId))
            .rejects
            .toThrow('Error updating conversation title by conversationId');

        // Ensure connection is closed even if there is an error
        expect(mockConnection.close).toHaveBeenCalled();
    });
});