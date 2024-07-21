const eventCommentsController = require("../controllers/eventCommentsController");
const EventComments = require("../models/eventComments");

// Mock data
const mockComments = [
    { commentId: 1, content: "I really like this event, it is very insightful and it just shows how the plan isn't working that well due to production costs", score: 2, timeStamp: "2024-07-18 06:24:06.4900000", userId: 1, eventId: 1, parentCommentId: null },
    { commentId: 2, content: "I agree with your statement", score: 2, timeStamp: "2024-07-18 06:24:06.4900000", userId: 2, eventId: 1, parentCommentId: 1 },
    { commentId: 3, content: "I agree with you too", score: 0, timeStamp: "2024-07-18 06:24:06.4900000", userId: 3, eventId: 2, parentCommentId: 2 },
];

// Mocking the EventComments model methods
jest.mock('../models/eventComments', () => ({
    getAllCommentsFromEventIdByLatest: jest.fn(),
    getAllCommentsFromEventIdByRelevance: jest.fn(),
    getEventCommentById: jest.fn(),
    createEventComment: jest.fn(),
    updateEventCommentContent: jest.fn(),
    deleteEventComment: jest.fn(),
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

// Tests for getAllCommentsFromEventIdByLatest
describe("getAllCommentsFromEventIdByLatest", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should return comments ordered by the latest timestamp for the given event ID", async () => {
        const req = mockRequest({ eventId: 1 }, {});
        const res = mockResponse();

        EventComments.getAllCommentsFromEventIdByLatest.mockResolvedValue(mockComments);

        await eventCommentsController.getAllCommentsFromEventIdByLatest(req, res);

        expect(EventComments.getAllCommentsFromEventIdByLatest).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockComments);
    });

    test("should handle errors and return a 500 status code if there's an issue retrieving comments", async () => {
        const req = mockRequest({ eventId: 1 }, {});
        const res = mockResponse();

        EventComments.getAllCommentsFromEventIdByLatest.mockRejectedValue(new Error('Error'));

        await eventCommentsController.getAllCommentsFromEventIdByLatest(req, res);

        expect(EventComments.getAllCommentsFromEventIdByLatest).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error retrieving comments for EventId");
    });
});

// Tests for getAllCommentsFromEventIdByRelevance
describe("getAllCommentsFromEventIdByRelevance", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should return comments ordered by relevance for the given event ID", async () => {
        const req = mockRequest({ eventId: 1 }, {});
        const res = mockResponse();

        EventComments.getAllCommentsFromEventIdByRelevance.mockResolvedValue(mockComments);

        await eventCommentsController.getAllCommentsFromEventIdByRelevance(req, res);

        expect(EventComments.getAllCommentsFromEventIdByRelevance).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockComments);
    });

    test("should handle errors and return a 500 status code if there's an issue retrieving comments", async () => {
        const req = mockRequest({ eventId: 1 }, {});
        const res = mockResponse();

        EventComments.getAllCommentsFromEventIdByRelevance.mockRejectedValue(new Error('Error'));

        await eventCommentsController.getAllCommentsFromEventIdByRelevance(req, res);

        expect(EventComments.getAllCommentsFromEventIdByRelevance).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error retrieving comments for EventId");
    });
});

// Tests for getEventCommentById
describe("getEventCommentById", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should return a specific comment based on the provided comment ID", async () => {
        const req = mockRequest({ commentId: 1 }, {});
        const res = mockResponse();

        EventComments.getEventCommentById.mockResolvedValue(mockComments[0]);

        await eventCommentsController.getEventCommentById(req, res);

        expect(EventComments.getEventCommentById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockComments[0]);
    });

    test("should handle errors and return a 500 status code if there's an issue retrieving the comment", async () => {
        const req = mockRequest({ commentId: 1 }, {});
        const res = mockResponse();

        EventComments.getEventCommentById.mockRejectedValue(new Error('Error'));

        await eventCommentsController.getEventCommentById(req, res);

        expect(EventComments.getEventCommentById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error retrieving comment for commentId");
    });
});

// Tests for createEventComment
describe("createEventComment", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should create a new comment and return it with a 201 status code", async () => {
        const req = mockRequest({}, mockComments[0]);
        const res = mockResponse();

        EventComments.createEventComment.mockResolvedValue(mockComments[0]);

        await eventCommentsController.createEventComment(req, res);

        expect(EventComments.createEventComment).toHaveBeenCalledWith(mockComments[0]);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockComments[0]);
    });

    test("should not create a new comment and return a 400 status code if the eventId of the new comment doesn't match the eventId of the parent comment", async () => {
        const invalidComment = { ...mockComments[1], eventId: 2 }; // eventId mismatch
        const req = mockRequest({}, invalidComment);
        const res = mockResponse();
        
        // Mock createEventComment to throw an error when there's an eventId mismatch
        EventComments.createEventComment.mockImplementation(() => {
            throw new Error("The eventId of the parent comment does not match the eventId of the new comment.");
        });
    
        await eventCommentsController.createEventComment(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("EventId mismatch with parent comment");
    });     

    test("should handle errors and return a 500 status code if there's an issue creating the comment", async () => {
        const req = mockRequest({}, mockComments[0]);
        const res = mockResponse();

        EventComments.createEventComment.mockRejectedValue(new Error('Error'));

        await eventCommentsController.createEventComment(req, res);

        expect(EventComments.createEventComment).toHaveBeenCalledWith(mockComments[0]);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error creating comment");
    });
});

// Tests for updateEventCommentContent
describe("updateEventCommentContent", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should update the content and score of an existing comment and return the updated comment", async () => {
        const req = mockRequest({}, { commentId: 1, content: "Updated content", score: 5 });
        const res = mockResponse();

        EventComments.updateEventCommentContent.mockResolvedValue({ ...mockComments[0], content: "Updated content", score: 5 });

        await eventCommentsController.updateEventCommentContent(req, res);

        expect(EventComments.updateEventCommentContent).toHaveBeenCalledWith(1, "Updated content", 5);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ ...mockComments[0], content: "Updated content", score: 5 });
    });

    test("should not update comment and return a 400 status code if both newContent and newScore are null", async () => {
        // Mock the updateEventCommentContent method to throw an error for null content and score
        EventComments.updateEventCommentContent.mockImplementation(async (id, content, score) => {
            if (content === null && score === null) {
                throw new Error('At least one of newContent or newScore must be provided.');
            }
            return { commentId: id, content, score }; // This is just for simulation
        });

        const req = mockRequest({}, { commentId: 1, content: null, score: null });
        const res = mockResponse();

        await eventCommentsController.updateEventCommentContent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("At least one of newContent or newScore must be provided.");
    });

    test("should return a 404 status code if the comment to update is not found", async () => {
        // Create a mock request with a commentId that doesn't exist
        const req = mockRequest({}, { commentId: 4, content: "Updated content", score: 5 });
        const res = mockResponse();
    
        // Mock the updateEventCommentContent method to return null (comment not found)
        EventComments.updateEventCommentContent.mockResolvedValue(null);
    
        // Call the controller method
        await eventCommentsController.updateEventCommentContent(req, res);
    
        // Assertions
        expect(EventComments.updateEventCommentContent).toHaveBeenCalledWith(4, "Updated content", 5);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Comment not found");
    }); 

    test("should handle errors and return a 500 status code if there's an issue updating the comment", async () => {
        const req = mockRequest({}, { commentId: 1, content: "Updated content", score: 5 });
        const res = mockResponse();

        EventComments.updateEventCommentContent.mockRejectedValue(new Error('Error'));

        await eventCommentsController.updateEventCommentContent(req, res);

        expect(EventComments.updateEventCommentContent).toHaveBeenCalledWith(1, "Updated content", 5);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error updating comment");
    });
});

// Tests for deleteEventComment
describe("deleteEventComment", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should delete an existing comment and return a 204 status code", async () => {
        const req = mockRequest({}, { commentId: 1 });
        const res = mockResponse();

        EventComments.deleteEventComment.mockResolvedValue(true);

        await eventCommentsController.deleteEventComment(req, res);

        expect(EventComments.deleteEventComment).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalledWith("Comment deleted successfully");
    });

    test("should handle errors and return a 500 status code if there's an issue deleting the comment", async () => {
        const req = mockRequest({}, { commentId: 1 });
        const res = mockResponse();

        EventComments.deleteEventComment.mockRejectedValue(new Error('Error'));

        await eventCommentsController.deleteEventComment(req, res);

        expect(EventComments.deleteEventComment).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error deleting comment");
    });

    test("should return a 404 status code if the comment to delete is not found", async () => {
        const req = mockRequest({}, { commentId: 4 });
        const res = mockResponse();

        // Mock deleteArticleComment to simulate that the comment was not found
        EventComments.deleteEventComment.mockResolvedValue(false);

        await eventCommentsController.deleteEventComment(req, res);

        expect(EventComments.deleteEventComment).toHaveBeenCalledWith(4);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Comment not found");
    });
});
