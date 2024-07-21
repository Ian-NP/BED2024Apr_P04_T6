const articleCommentsController = require("../controllers/articleCommentsController");
const ArticleComments = require("../models/articleComments");

// Mock data
const mockComments = [
    { commentId: 1, content: "I really like this article, it is very insightful and it just shows how the plan isn't working that well due to production costs", score: 2, timeStamp: "2024-07-18 06:24:06.4900000", userId: 1, articleId: 1, parentCommentId: null },
    { commentId: 2, content: "I agree with your statement", score: 2, timeStamp: "2024-07-18 06:24:06.4900000", userId: 2, articleId: 1, parentCommentId: 1 },
    { commentId: 3, content: "I agree with your statement", score: 2, timeStamp: "2024-07-18 06:24:06.4900000", userId: 3, articleId: 2, parentCommentId: 2 },
];

// Mocking the ArticleComments model methods
jest.mock('../models/articleComments', () => ({
    getAllCommentsFromArticleIdByLatest: jest.fn(),
    getAllCommentsFromArticleIdByRelevance: jest.fn(),
    getArticleCommentById: jest.fn(),
    createArticleComment: jest.fn(),
    updateArticleCommentContent: jest.fn(),
    deleteArticleComment: jest.fn(),
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

// Tests for getAllCommentsFromArticleIdByLatest
describe("getAllCommentsFromArticleIdByLatest", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should return comments ordered by the latest timestamp for the given article ID", async () => {
        const req = mockRequest({ articleId: 1 }, {});
        const res = mockResponse();

        ArticleComments.getAllCommentsFromArticleIdByLatest.mockResolvedValue(mockComments);

        await articleCommentsController.getAllCommentsFromArticleIdByLatest(req, res);

        expect(ArticleComments.getAllCommentsFromArticleIdByLatest).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockComments);
    });

    test("should handle errors and return a 500 status code if there's an issue retrieving comments", async () => {
        const req = mockRequest({ articleId: 1 }, {});
        const res = mockResponse();

        ArticleComments.getAllCommentsFromArticleIdByLatest.mockRejectedValue(new Error('Error'));

        await articleCommentsController.getAllCommentsFromArticleIdByLatest(req, res);

        expect(ArticleComments.getAllCommentsFromArticleIdByLatest).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error retrieving comments for ArticleId");
    });
});

// Tests for getAllCommentsFromArticleIdByRelevance
describe("getAllCommentsFromArticleIdByRelevance", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should return comments ordered by relevance for the given article ID", async () => {
        const req = mockRequest({ articleId: 1 }, {});
        const res = mockResponse();

        ArticleComments.getAllCommentsFromArticleIdByRelevance.mockResolvedValue(mockComments);

        await articleCommentsController.getAllCommentsFromArticleIdByRelevance(req, res);

        expect(ArticleComments.getAllCommentsFromArticleIdByRelevance).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockComments);
    });

    test("should handle errors and return a 500 status code if there's an issue retrieving comments", async () => {
        const req = mockRequest({ articleId: 1 }, {});
        const res = mockResponse();

        ArticleComments.getAllCommentsFromArticleIdByRelevance.mockRejectedValue(new Error('Error'));

        await articleCommentsController.getAllCommentsFromArticleIdByRelevance(req, res);

        expect(ArticleComments.getAllCommentsFromArticleIdByRelevance).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error retrieving comments for ArticleId");
    });
});

// Tests for getArticleCommentById
describe("getArticleCommentById", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should return a specific comment based on the provided comment ID", async () => {
        const req = mockRequest({ commentId: 1 }, {});
        const res = mockResponse();

        ArticleComments.getArticleCommentById.mockResolvedValue(mockComments[0]);

        await articleCommentsController.getArticleCommentById(req, res);

        expect(ArticleComments.getArticleCommentById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockComments[0]);
    });

    test("should handle errors and return a 500 status code if there's an issue retrieving the comment", async () => {
        const req = mockRequest({ commentId: 1 }, {});
        const res = mockResponse();

        ArticleComments.getArticleCommentById.mockRejectedValue(new Error('Error'));

        await articleCommentsController.getArticleCommentById(req, res);

        expect(ArticleComments.getArticleCommentById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error retrieving comment for commentId");
    });
});

// Tests for createArticleComment
describe("createArticleComment", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should create a new comment and return it with a 201 status code", async () => {
        const req = mockRequest({}, mockComments[0]);
        const res = mockResponse();

        ArticleComments.createArticleComment.mockResolvedValue(mockComments[0]);

        await articleCommentsController.createArticleComment(req, res);

        expect(ArticleComments.createArticleComment).toHaveBeenCalledWith(mockComments[0]);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockComments[0]);
    });

    test("should not create a new comment and return a 400 status code if the articleId of the new comment doesn't match the articleId of the parent comment", async () => {
        const invalidComment = { ...mockComments[1], articleId: 2 }; // articleId mismatch
        const req = mockRequest({}, invalidComment);
        const res = mockResponse();
        
        // Mock createArticleComment to throw an error when there's an articleId mismatch
        ArticleComments.createArticleComment.mockImplementation(() => {
            throw new Error("The articleId of the parent comment does not match the articleId of the new comment.");
        });
    
        await articleCommentsController.createArticleComment(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("ArticleId mismatch with parent comment");
    });     

    test("should handle errors and return a 500 status code if there's an issue creating the comment", async () => {
        const req = mockRequest({}, mockComments[0]);
        const res = mockResponse();

        ArticleComments.createArticleComment.mockRejectedValue(new Error('Error'));

        await articleCommentsController.createArticleComment(req, res);

        expect(ArticleComments.createArticleComment).toHaveBeenCalledWith(mockComments[0]);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error creating comment");
    });
});

// Tests for updateArticleCommentContent
describe("updateArticleCommentContent", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should update the content and score of an existing comment and return the updated comment", async () => {
        const req = mockRequest({}, { commentId: 1, content: "Updated content", score: 5 });
        const res = mockResponse();

        ArticleComments.updateArticleCommentContent.mockResolvedValue({ ...mockComments[0], content: "Updated content", score: 5 });

        await articleCommentsController.updateArticleCommentContent(req, res);

        expect(ArticleComments.updateArticleCommentContent).toHaveBeenCalledWith(1, "Updated content", 5);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ ...mockComments[0], content: "Updated content", score: 5 });
    });

    test("should not update comment and return a 400 status code if both newContent and newScore are null", async () => {
        // Mock the updateArticleCommentContent method to throw an error for null content and score
        ArticleComments.updateArticleCommentContent.mockImplementation(async (id, content, score) => {
            if (content === null && score === null) {
                throw new Error('At least one of newContent or newScore must be provided.');
            }
            // If you need to simulate a successful update, you can add that here
            return { id, content, score };
        });
    
        const req = mockRequest({}, { commentId: 1, content: null, score: null });
        const res = mockResponse();
    
        // Call the controller method
        await articleCommentsController.updateArticleCommentContent(req, res);
    
        // Assertions
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("At least one of newContent or newScore must be provided.");
    });

    test("should return a 404 status code if the comment to update is not found", async () => {
        // Create a mock request with a commentId that doesn't exist
        const req = mockRequest({}, { commentId: 4, content: "Updated content", score: 5 });
        const res = mockResponse();
    
        // Mock the updateArticleCommentContent method to return null (comment not found)
        ArticleComments.updateArticleCommentContent.mockResolvedValue(null);
    
        // Call the controller method
        await articleCommentsController.updateArticleCommentContent(req, res);
    
        // Assertions
        expect(ArticleComments.updateArticleCommentContent).toHaveBeenCalledWith(4, "Updated content", 5);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Comment not found");
    });  

    test("should handle errors and return a 500 status code if there's an issue updating the comment", async () => {
        const req = mockRequest({}, { commentId: 1, content: "Updated content", score: 5 });
        const res = mockResponse();

        ArticleComments.updateArticleCommentContent.mockRejectedValue(new Error('Error'));

        await articleCommentsController.updateArticleCommentContent(req, res);

        expect(ArticleComments.updateArticleCommentContent).toHaveBeenCalledWith(1, "Updated content", 5);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error updating comment");
    });
});

// Tests for deleteArticleComment
describe("deleteArticleComment", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should delete a comment by its ID and return a 204 status code", async () => {
        const req = mockRequest({}, { commentId: 1 });
        const res = mockResponse();

        // Mock deleteArticleComment to simulate successful deletion
        ArticleComments.deleteArticleComment.mockResolvedValue(true);

        await articleCommentsController.deleteArticleComment(req, res);

        expect(ArticleComments.deleteArticleComment).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalledWith();
    });

    test("should handle errors and return a 500 status code if there's an issue deleting the comment", async () => {
        const req = mockRequest({}, { commentId: 1 });
        const res = mockResponse();

        // Mock deleteArticleComment to simulate an error
        ArticleComments.deleteArticleComment.mockRejectedValue(new Error('Error'));

        await articleCommentsController.deleteArticleComment(req, res);

        expect(ArticleComments.deleteArticleComment).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Error deleting comment");
    });

    test("should return a 404 status code if the comment to delete is not found", async () => {
        const req = mockRequest({}, { commentId: 4 });
        const res = mockResponse();

        // Mock deleteArticleComment to simulate that the comment was not found
        ArticleComments.deleteArticleComment.mockResolvedValue(false);

        await articleCommentsController.deleteArticleComment(req, res);

        expect(ArticleComments.deleteArticleComment).toHaveBeenCalledWith(4);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Comment not found");
    });
});