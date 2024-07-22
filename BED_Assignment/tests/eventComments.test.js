const EventComments = require("../models/eventComments");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("getAllCommentsFromEventIdByLatest", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch comments and return an array of EventComments objects", async () => {
        const mockResult = {
            recordset: [
                {
                    commentId: 1,
                    content: "Comment 1",
                    score: 5,
                    timeStamp: new Date(),
                    userId: 1,
                    eventId: 1,
                    parentCommentId: null,
                    level: 0
                },
                {
                    commentId: 2,
                    content: "Comment 2",
                    score: 3,
                    timeStamp: new Date(),
                    userId: 2,
                    eventId: 1,
                    parentCommentId: 1,
                    level: 1
                }
            ]
        };

        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue(mockResult)
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        const comments = await EventComments.getAllCommentsFromEventIdByLatest(1);

        expect(comments).toHaveLength(2);
        expect(comments[0]).toBeInstanceOf(EventComments);
        expect(comments[0].commentId).toBe(1);
        expect(comments[1].commentId).toBe(2);
    });

    it("should handle errors and throw a new error", async () => {
        sql.connect.mockRejectedValue(new Error("Connection error"));

        await expect(EventComments.getAllCommentsFromEventIdByLatest(1)).rejects.toThrow("Error getting comments");
    });

    it("should ensure the connection is closed even if an error occurs", async () => {
        const mockClose = jest.fn().mockResolvedValue(undefined);
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(new Error("Query error"))
            }),
            close: mockClose
        });

        await expect(EventComments.getAllCommentsFromEventIdByLatest(1)).rejects.toThrow("Error getting comments");

        expect(mockClose).toHaveBeenCalled();
    });
});

describe("getAllCommentsFromEventIdByRelevance", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch comments and return an array of EventComments objects ordered by score", async () => {
        const mockResult = {
            recordset: [
                {
                    commentId: 1,
                    content: "Comment 1",
                    score: 5,
                    timeStamp: new Date(),
                    userId: 1,
                    eventId: 1,
                    parentCommentId: null,
                    level: 0
                },
                {
                    commentId: 2,
                    content: "Comment 2",
                    score: 7,
                    timeStamp: new Date(),
                    userId: 2,
                    eventId: 1,
                    parentCommentId: 1,
                    level: 1
                }
            ]
        };

        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue(mockResult)
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        const comments = await EventComments.getAllCommentsFromEventIdByRelevance(1);

        expect(comments).toHaveLength(2);
        expect(comments[0]).toBeInstanceOf(EventComments);
        expect(comments[0].commentId).toBe(1);
        expect(comments[1].commentId).toBe(2);
        expect(comments[1].score).toBeGreaterThan(comments[0].score);
    });

    it("should handle errors and throw a new error", async () => {
        sql.connect.mockRejectedValue(new Error("Connection error"));

        await expect(EventComments.getAllCommentsFromEventIdByRelevance(1)).rejects.toThrow("Error getting comments");
    });

    it("should ensure the connection is closed even if an error occurs", async () => {
        const mockClose = jest.fn().mockResolvedValue(undefined);
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(new Error("Query error"))
            }),
            close: mockClose
        });

        await expect(EventComments.getAllCommentsFromEventIdByRelevance(1)).rejects.toThrow("Error getting comments");

        expect(mockClose).toHaveBeenCalled();
    });
});

describe("getEventCommentById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch a comment and return an EventComments object", async () => {
        const mockResult = {
            recordset: [
                {
                    commentId: 1,
                    content: "Comment 1",
                    score: 5,
                    timeStamp: new Date(),
                    userId: 1,
                    eventId: 1,
                    parentCommentId: null
                }
            ]
        };

        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue(mockResult)
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        const comment = await EventComments.getEventCommentById(1);

        expect(comment).toBeInstanceOf(EventComments);
        expect(comment.commentId).toBe(1);
        expect(comment.content).toBe("Comment 1");
    });

    it("should return null if no comment is found", async () => {
        const mockResult = {
            recordset: []
        };

        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue(mockResult)
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        const comment = await EventComments.getEventCommentById(1);

        expect(comment).toBeNull();
    });

    it("should handle errors and throw the error", async () => {
        sql.connect.mockRejectedValue(new Error("Connection error"));

        await expect(EventComments.getEventCommentById(1)).rejects.toThrow("Connection error");
    });

    it("should ensure the connection is closed even if an error occurs", async () => {
        const mockClose = jest.fn().mockResolvedValue(undefined);
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(new Error("Query error"))
            }),
            close: mockClose
        });

        await expect(EventComments.getEventCommentById(1)).rejects.toThrow("Query error");

        expect(mockClose).toHaveBeenCalled();
    });
});

describe("createEventComment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a comment and return the created EventComments object", async () => {
        const newCommentData = {
            content: "New comment",
            score: 10,
            timeStamp: new Date(),
            userId: 1,
            eventId: 1,
            parentCommentId: null
        };

        const mockNewCommentIdResult = {
            recordset: [{ newCommentId: 1 }]
        };

        const mockCreatedCommentResult = {
            recordset: [
                {
                    commentId: 1,
                    content: "New comment",
                    score: 10,
                    timeStamp: new Date(),
                    userId: 1,
                    eventId: 1,
                    parentCommentId: null
                }
            ]
        };

        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce(mockNewCommentIdResult).mockResolvedValueOnce(mockCreatedCommentResult)
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        const createdComment = await EventComments.createEventComment(newCommentData);

        expect(createdComment).toBeInstanceOf(EventComments);
        expect(createdComment.commentId).toBe(1);
        expect(createdComment.content).toBe("New comment");
    });

    it("should throw an error if parentCommentId's eventId does not match the new comment's eventId", async () => {
        const newCommentData = {
            content: "New comment",
            score: 10,
            timeStamp: new Date(),
            userId: 1,
            eventId: 1,
            parentCommentId: 2
        };

        const mockParentComment = {
            commentId: 2,
            content: "Parent comment",
            score: 5,
            timeStamp: new Date(),
            userId: 2,
            eventId: 2,
            parentCommentId: null
        };

        EventComments.getEventCommentById = jest.fn().mockResolvedValue(mockParentComment);

        await expect(EventComments.createEventComment(newCommentData)).rejects.toThrow("The eventId of the parent comment does not match the eventId of the new comment");
    });

    it("should handle errors and throw a new error", async () => {
        sql.connect.mockRejectedValue(new Error("Connection error"));
    
        await expect(EventComments.createEventComment({}))
            .rejects.toThrow("Error creating comment"); // This should match the error message thrown by the method
    });

    it("should ensure the connection is closed even if an error occurs", async () => {
        // Mock the connection to reject with an error
        const mockClose = jest.fn().mockResolvedValue(undefined);

        sql.connect.mockImplementation(() => {
            return {
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockRejectedValue(new Error("Connection error"))
                }),
                close: mockClose
            };
        });

        // Call the method and assert it throws the expected error
        await expect(EventComments.createEventComment({}))
            .rejects.toThrow("Error creating comment");

        // Check if mockClose was called
        expect(mockClose).toHaveBeenCalled();
    });
});

describe("updateEventCommentContent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update comment content and return the updated EventComments object", async () => {
        const mockUpdatedComment = new EventComments(
            1,
            "Updated comment",
            10,
            new Date(),
            1,
            1,
            null
        );

        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue(mockUpdatedComment)
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        EventComments.getEventCommentById = jest.fn().mockResolvedValue(mockUpdatedComment);

        const updatedComment = await EventComments.updateEventCommentContent(1, "Updated comment", 5);

        expect(updatedComment).toBeInstanceOf(EventComments);
        expect(updatedComment.commentId).toBe(1);
        expect(updatedComment.content).toBe("Updated comment");
    });

    it("should throw an error if neither newContent nor newScore is provided", async () => {
        await expect(EventComments.updateEventCommentContent(1, null, null)).rejects.toThrow('At least one of newContent or newScore must be provided.');
    });

    it("should handle errors and throw the error", async () => {
        sql.connect.mockRejectedValue(new Error("Connection error"));

        await expect(EventComments.updateEventCommentContent(1, "Updated comment", 5)).rejects.toThrow("Connection error");
    });

    it("should ensure the connection is closed even if an error occurs", async () => {
        const mockClose = jest.fn().mockResolvedValue(undefined);

        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(new Error("Query error"))
            }),
            close: mockClose
        });

        await expect(EventComments.updateEventCommentContent(1, "Updated comment", 5)).rejects.toThrow("Query error");

        expect(mockClose).toHaveBeenCalled();
    });
});

describe("deleteEventComment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete the comment and return true if the comment exists", async () => {
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ rowsAffected: [0, 1] }) // Simulate successful deletion
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        const result = await EventComments.deleteEventComment(1);

        expect(result).toBe(true);
    });

    it("should return false if the comment does not exist", async () => {
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ rowsAffected: [0] }) // Simulate no rows affected
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        const result = await EventComments.deleteEventComment(999); // Non-existent comment ID

        expect(result).toBe(false);
    });

    it("should handle errors and throw the error", async () => {
        sql.connect.mockRejectedValue(new Error("Connection error"));

        await expect(EventComments.deleteEventComment(1)).rejects.toThrow("Connection error");
    });

    it("should ensure the connection is closed even if an error occurs", async () => {
        const mockClose = jest.fn().mockResolvedValue(undefined);
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(new Error("Query error"))
            }),
            close: mockClose
        });

        await expect(EventComments.deleteEventComment(1)).rejects.toThrow("Query error");

        expect(mockClose).toHaveBeenCalled();
    });
});