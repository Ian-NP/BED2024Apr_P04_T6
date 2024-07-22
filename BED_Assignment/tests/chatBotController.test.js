const chatBotController = require("../controllers/chatBotController");
const ChatConversation = require("../models/geminiChatConversation");
const ChatBotHistory = require("../models/geminiChatBotConversationHistory");
const geminiChatModel = require("../geminiChatConfig");

const mockChatConversation = [
    {conversationId: 1, conversationTitle: "Project Discussion", timeStamp: "2024-07-18 13:45:50.6933333", userId: 1},
    {conversationId: 2, conversationTitle: "Support Chat", timeStamp: "2024-07-18 13:45:50.6933333", userId: 2}
];

const mockChatBotHistory = [
    {ChatHisotryId: 1, role: "user", text: "Hello, how are you?", timeStamp: "2024-07-11 10:00:00.0000000", conversationId: 1},
    {ChatHisotryId: 2, role: "model", text: "I'm good, thank you!", timeStamp: "2024-07-11 10:01:00.0000000", conversationId: 1},
    {ChatHisotryId: 3, role: "user", text: "Can you provide me with the latest report?", timeStamp: "2024-07-11 10:05:00.0000000", conversationId: 2},
    {ChatHisotryId: 4, role: "model", text: "Sure! Here is the report link: [link]", timeStamp: "2024-07-11 10:05:00.0000000", conversationId: 2},
]

jest.mock('../geminiChatConfig');

// Mocking the ArticleComments model methods
jest.mock('../models/geminiChatBotConversationHistory', () => ({
    fetchAndFormatChatHistoryForGemini: jest.fn(),
    addChatHistory: jest.fn(),
}));

jest.mock('../models/geminiChatConversation', () => ({
    fetchChatConversationsByUserId: jest.fn(),
    deleteChatConversation: jest.fn(),
    addNewConversation: jest.fn(),
    editConversationTitle: jest.fn(),
}));

// Helper function to mock req and res
const mockRequest = (params, body) => ({
    params,
    body,
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe("fetchChatHistory", () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest({ conversationId: 1 });
        res = mockResponse();
        jest.clearAllMocks();
    });

    it("should fetch and return chat history successfully", async () => {
        const mockChatHistory = [
            { chatHistoryId: 1, role: "user", text: "Hello, how are you?", timeStamp: "2024-07-11 10:00:00.0000000", conversationId: 1 },
            { chatHistoryId: 2, role: "model", text: "I'm good, thank you!", timeStamp: "2024-07-11 10:01:00.0000000", conversationId: 1 }
        ];

        const mockFormattedHistory = [
            { role: "user", content: "Hello, how are you?" },
            { role: "model", content: "I'm good, thank you!" }
        ];

        ChatBotHistory.fetchAndFormatChatHistoryForGemini.mockResolvedValue({ 
            chatHistory: mockChatHistory,
            formattedHistory: mockFormattedHistory 
        });

        await chatBotController.fetchChatHistory(req, res);

        expect(ChatBotHistory.fetchAndFormatChatHistoryForGemini).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ chatHistory: mockChatHistory });
    });

    it("should add default messages when chat history is empty", async () => {
        const conversationId = 1;
    
        // Mock initial empty chat history
        ChatBotHistory.fetchAndFormatChatHistoryForGemini.mockResolvedValueOnce({ chatHistory: [] });
    
        // Mock addChatHistory to simulate adding default messages
        ChatBotHistory.addChatHistory = jest.fn()
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true);
    
        // Mock updated chat history after default messages are added
        const mockUpdatedChatHistory = [
            { chatHistoryId: 1, role: "user", text: "Hey There! What can you do?", timeStamp: "2024-07-22 10:00:00.0000000", conversationId: 1 },
            { chatHistoryId: 2, role: "model", text: "Hello! I'm A+4BED, your friendly AI guide for the agricultural, manufacturing, and service industries. I'm here to help you navigate the ever-changing landscape of these sectors. \n\nHere's what I can do:\n\n**General Industry Insights:**\n\n* **Trends and Tech:** I can explain how technologies like AI, robotics, and precision agriculture are transforming each industry, and their impact on jobs, efficiency, and sustainability.\n* **Political Winds:**  I can analyze how recent policies, regulations, and trade deals affect different industries, and what opportunities and challenges they present.\n* **Climate Change Challenges:**  I can discuss the impact of climate change on various sectors, and suggest solutions like sustainable practices, resource management, and technological innovation.\n\n**Interactive Assistance:**\n\n* **Real-time Updates:**  I can keep you informed about the latest developments, news, and trends in these industries. \n* **Answer Your Questions:**  I can answer your questions about specific practices, technologies, or challenges within the agricultural, manufacturing, or service sectors.\n* **Predictive Analytics:** I can help you understand potential growth areas, emerging trends, and future opportunities in each industry. \n\n**Personalized Recommendations:**\n\n* **Tailored Content:**  Based on your interests and past interactions, I can recommend articles, resources, and industry reports that are relevant to you.\n* **Best Practice Guidance:**  I can suggest practical strategies and best practices for businesses to adapt to technological advancements, political changes, and climate challenges.\n\n**Data Analysis and Visualization:**\n\n* **Data Insights:** I can analyze industry data and create insightful visualizations to help you understand complex trends, patterns, and relationships.\n* **Scenario Planning:** I can help you model different scenarios, considering future policies, market changes, and their impact on various sectors.\n\nLet me know what you're interested in, and I'll be happy to help you explore the fascinating world of agriculture, manufacturing, and services! \n", timeStamp: "2024-07-22 10:01:00.0000000", conversationId: 1 }
        ];
    
        // Mock the second call to fetchAndFormatChatHistoryForGemini with updated chat history
        ChatBotHistory.fetchAndFormatChatHistoryForGemini.mockResolvedValueOnce({ chatHistory: mockUpdatedChatHistory });
    
        await chatBotController.fetchChatHistory(req, res);
    
        expect(ChatBotHistory.fetchAndFormatChatHistoryForGemini).toHaveBeenCalledWith(conversationId);
        expect(ChatBotHistory.addChatHistory).toHaveBeenCalledWith(mockUpdatedChatHistory[0].role, mockUpdatedChatHistory[0].text, mockUpdatedChatHistory[0].conversationId);
        expect(ChatBotHistory.addChatHistory).toHaveBeenCalledWith(mockUpdatedChatHistory[1].role, mockUpdatedChatHistory[1].text, mockUpdatedChatHistory[1].conversationId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ chatHistory: mockUpdatedChatHistory });
    });

    it("should handle error when fetching chat history fails", async () => {
        ChatBotHistory.fetchAndFormatChatHistoryForGemini.mockRejectedValue(new Error("Error fetching chat history"));

        await chatBotController.fetchChatHistory(req, res);

        expect(ChatBotHistory.fetchAndFormatChatHistoryForGemini).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("postUserInput", () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest({ conversationId: '1' }, { query: "What is the latest trend in AI?" });
        res = mockResponse();
        jest.clearAllMocks();
    });

    // it("should handle user input and respond with AI message", async () => {
    //     // Spy on the addChatHistory method
    //     const addChatHistorySpy = jest.spyOn(ChatBotHistory, 'addChatHistory').mockResolvedValue(true);

    //     // Call the postUserInput function
    //     await postUserInput(req, res);

    //     // Verify that addChatHistory was called with correct arguments
    //     expect(addChatHistorySpy).toHaveBeenCalledWith("user", "What is the latest trend in AI?", '1');
    //     expect(addChatHistorySpy).toHaveBeenCalledWith("model", "The latest trend in AI is generative models like Gemini.", '1');

    //     // Verify the response
    //     expect(res.status).toHaveBeenCalledWith(200);
    //     expect(res.json).toHaveBeenCalledWith({ message: "The latest trend in AI is generative models like Gemini." });
    // });

    it("should handle errors and respond with 500 status", async () => {
        // Mock startChatForUser to throw an error
        chatBotController.startChatForUser = jest.fn().mockRejectedValue(new Error("AI service error"));

        // Mock the ChatBotHistory methods
        ChatBotHistory.addChatHistory = jest.fn().mockResolvedValue(true);

        // Call the postUserInput function
        await chatBotController.postUserInput(req, res);

        // Verify the error response
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("fetchChatConversationsByUserId", () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest({ userId: 1 });
        res = mockResponse();
        jest.clearAllMocks();
    });

    it("should fetch and return chat conversations successfully", async () => {
        const mockChatConversations = [
            { conversationId: 1, conversationTitle: "Project Discussion", timeStamp: "2024-07-18 13:45:50.6933333", userId: 1 },
            { conversationId: 2, conversationTitle: "Support Chat", timeStamp: "2024-07-18 13:45:50.6933333", userId: 1 }
        ];

        // Mock the fetchChatConversationsByUserId method
        ChatConversation.fetchChatConversationsByUserId.mockResolvedValue(mockChatConversations);

        await chatBotController.fetchChatConversationsByUserId(req, res);

        expect(ChatConversation.fetchChatConversationsByUserId).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockChatConversations);
    });

    it("should handle error when fetching chat conversations fails", async () => {
        const userId = 1;

        // Mock the fetchChatConversationsByUserId method to throw an error
        ChatConversation.fetchChatConversationsByUserId.mockRejectedValue(new Error("Error fetching chat conversations"));

        await chatBotController.fetchChatConversationsByUserId(req, res);

        expect(ChatConversation.fetchChatConversationsByUserId).toHaveBeenCalledWith(userId);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(`Error retrieving comments for userId: ${userId}`);
    });
});

describe("addNewConversation", () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest({ userId: 1 }, { conversationTitle: "New Project Discussion" });
        res = mockResponse();
        jest.clearAllMocks();
    });

    it("should add a new conversation and return it successfully", async () => {
        const mockNewConversation = { conversationId: 3, conversationTitle: "New Project Discussion", timeStamp: "2024-07-22 10:00:00.0000000", userId: 1 };

        // Mock the addNewConversation method
        ChatConversation.addNewConversation.mockResolvedValue(mockNewConversation);

        await chatBotController.addNewConversation(req, res);

        expect(ChatConversation.addNewConversation).toHaveBeenCalledWith("New Project Discussion", 1);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockNewConversation);
    });

    it("should handle foreign key constraint error when user ID does not exist", async () => {
        // Mock the addNewConversation method to throw a foreign key constraint error
        ChatConversation.addNewConversation.mockRejectedValue(new Error("User ID does not exist. Cannot create conversation."));

        await chatBotController.addNewConversation(req, res);

        expect(ChatConversation.addNewConversation).toHaveBeenCalledWith("New Project Discussion", 1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("User ID does not exist. Cannot create conversation.");
    });

    it("should handle error when adding a new conversation fails", async () => {
        // Mock the addNewConversation method to throw an error
        ChatConversation.addNewConversation.mockRejectedValue(new Error("Error adding new conversation"));

        await chatBotController.addNewConversation(req, res);

        expect(ChatConversation.addNewConversation).toHaveBeenCalledWith("New Project Discussion", 1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error creating conversation");
    });
});

describe("editConversationTitle", () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest({ conversationId: 1 }, { conversationTitle: "New Title" });
        res = mockResponse();
        jest.clearAllMocks();
    });

    it("should update conversation title successfully", async () => {
        // Mock successful update
        ChatConversation.editConversationTitle = jest.fn().mockResolvedValue({
            conversationId: 1,
            conversationTitle: "New Title"
        });

        await chatBotController.editConversationTitle(req, res);

        expect(ChatConversation.editConversationTitle).toHaveBeenCalledWith("New Title", 1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Conversation updated successfully" });
    });

    it("should return 404 if conversation is not found", async () => {
        // Mock case where the conversation is not found
        ChatConversation.editConversationTitle = jest.fn().mockResolvedValue(null);

        await chatBotController.editConversationTitle(req, res);

        expect(ChatConversation.editConversationTitle).toHaveBeenCalledWith("New Title", 1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Conversation not found");
    });

    it("should handle error and respond with 500 status", async () => {
        // Mock error during update
        ChatConversation.editConversationTitle = jest.fn().mockRejectedValue(new Error("Update error"));

        await chatBotController.editConversationTitle(req, res);

        expect(ChatConversation.editConversationTitle).toHaveBeenCalledWith("New Title", 1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error updating conversationTitle");
    });
});

describe("deleteChatConversation", () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest({ conversationId: 1 });
        res = mockResponse();
        jest.clearAllMocks();
    });

    it("should delete the conversation successfully", async () => {
        // Mock successful deletion
        ChatConversation.deleteChatConversation = jest.fn().mockResolvedValue(true);

        await chatBotController.deleteChatConversation(req, res);

        expect(ChatConversation.deleteChatConversation).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Conversation deleted successfully' });
    });

    it("should return 404 if the conversation is not found", async () => {
        // Mock case where the conversation is not found
        ChatConversation.deleteChatConversation = jest.fn().mockResolvedValue(false);

        await chatBotController.deleteChatConversation(req, res);

        expect(ChatConversation.deleteChatConversation).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
    });

    it("should handle errors and respond with 500 status", async () => {
        // Mock error during deletion
        ChatConversation.deleteChatConversation = jest.fn().mockRejectedValue(new Error("Deletion error"));

        await chatBotController.deleteChatConversation(req, res);

        expect(ChatConversation.deleteChatConversation).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting conversation', error: 'Deletion error' });
    });
});