const ArticleComments = require("../models/articleComments");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("getAllCommentsFromArticleIdByLatest", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch comments and return an array of ArticleComments objects", async () => {
        const mockResult = {
            recordset: [
                {
                    commentId: 1,
                    content: "Comment 1",
                    score: 5,
                    timeStamp: new Date(),
                    userId: 1,
                    articleId: 1,
                    parentCommentId: null,
                    level: 0
                },
                {
                    commentId: 2,
                    content: "Comment 2",
                    score: 3,
                    timeStamp: new Date(),
                    userId: 2,
                    articleId: 1,
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

        const comments = await ArticleComments.getAllCommentsFromArticleIdByLatest(1);

        expect(comments).toHaveLength(2);
        expect(comments[0]).toBeInstanceOf(ArticleComments);
        expect(comments[0].commentId).toBe(1);
        expect(comments[1].commentId).toBe(2);
    });

    it("should handle errors and throw a new error", async () => {
        sql.connect.mockRejectedValue(new Error("Connection error"));

        await expect(ArticleComments.getAllCommentsFromArticleIdByLatest(1)).rejects.toThrow("Error getting comments");
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

        await expect(ArticleComments.getAllCommentsFromArticleIdByLatest(1)).rejects.toThrow("Error getting comments");

        expect(mockClose).toHaveBeenCalled();
    });
});

describe("getAllCommentsFromArticleIdByRelevance", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch comments and return an array of ArticleComments objects ordered by score", async () => {
        const mockResult = {
            recordset: [
                {
                    commentId: 1,
                    content: "Comment 1",
                    score: 5,
                    timeStamp: new Date(),
                    userId: 1,
                    articleId: 1,
                    parentCommentId: null,
                    level: 0
                },
                {
                    commentId: 2,
                    content: "Comment 2",
                    score: 7,
                    timeStamp: new Date(),
                    userId: 2,
                    articleId: 1,
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

        const comments = await ArticleComments.getAllCommentsFromArticleIdByRelevance(1);

        expect(comments).toHaveLength(2);
        expect(comments[0]).toBeInstanceOf(ArticleComments);
        expect(comments[0].commentId).toBe(1);
        expect(comments[1].commentId).toBe(2);
        expect(comments[1].score).toBeGreaterThan(comments[0].score);
    });

    it("should handle errors and throw a new error", async () => {
        sql.connect.mockRejectedValue(new Error("Connection error"));

        await expect(ArticleComments.getAllCommentsFromArticleIdByRelevance(1)).rejects.toThrow("Error getting comments");
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

        await expect(ArticleComments.getAllCommentsFromArticleIdByRelevance(1)).rejects.toThrow("Error getting comments");

        expect(mockClose).toHaveBeenCalled();
    });
});

describe("getArticleCommentById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch a comment and return an ArticleComments object", async () => {
        const mockResult = {
            recordset: [
                {
                    commentId: 1,
                    content: "Comment 1",
                    score: 5,
                    timeStamp: new Date(),
                    userId: 1,
                    articleId: 1,
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

        const comment = await ArticleComments.getArticleCommentById(1);

        expect(comment).toBeInstanceOf(ArticleComments);
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

        const comment = await ArticleComments.getArticleCommentById(1);

        expect(comment).toBeNull();
    });

    it("should handle errors and throw the error", async () => {
        sql.connect.mockRejectedValue(new Error("Connection error"));

        await expect(ArticleComments.getArticleCommentById(1)).rejects.toThrow("Connection error");
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

        await expect(ArticleComments.getArticleCommentById(1)).rejects.toThrow("Query error");

        expect(mockClose).toHaveBeenCalled();
    });
});

describe("createArticleComment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a comment and return the created ArticleComments object", async () => {
        const newCommentData = {
            content: "New comment",
            score: 10,
            timeStamp: new Date(),
            userId: 1,
            articleId: 1,
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
                    articleId: 1,
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

        const createdComment = await ArticleComments.createArticleComment(newCommentData);

        expect(createdComment).toBeInstanceOf(ArticleComments);
        expect(createdComment.commentId).toBe(1);
        expect(createdComment.content).toBe("New comment");
    });

    it("should throw an error if parentCommentId's articleId does not match the new comment's articleId", async () => {
        const newCommentData = {
            content: "New comment",
            score: 10,
            timeStamp: new Date(),
            userId: 1,
            articleId: 1,
            parentCommentId: 2
        };

        const mockParentComment = {
            commentId: 2,
            content: "Parent comment",
            score: 5,
            timeStamp: new Date(),
            userId: 2,
            articleId: 2,
            parentCommentId: null
        };

        ArticleComments.getArticleCommentById = jest.fn().mockResolvedValue(mockParentComment);

        await expect(ArticleComments.createArticleComment(newCommentData)).rejects.toThrow("The articleId of the parent comment does not match the articleId of the new comment.");
    });

    it("should handle errors and throw the error", async () => {
        const newCommentData = {
            content: "New comment",
            score: 10,
            timeStamp: new Date(),
            userId: 1,
            articleId: 1,
            parentCommentId: null
        };

        sql.connect.mockRejectedValue(new Error("Connection error"));

        await expect(ArticleComments.createArticleComment(newCommentData)).rejects.toThrow("Connection error");
    });

    it("should ensure the connection is closed even if an error occurs", async () => {
        const newCommentData = {
            content: "New comment",
            score: 10,
            timeStamp: new Date(),
            userId: 1,
            articleId: 1,
            parentCommentId: null
        };

        const mockClose = jest.fn().mockResolvedValue(undefined);
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(new Error("Query error"))
            }),
            close: mockClose
        });

        await expect(ArticleComments.createArticleComment(newCommentData)).rejects.toThrow("Query error");

        expect(mockClose).toHaveBeenCalled();
    });
});

describe("updateArticleCommentContent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update comment content and return the updated ArticleComments object", async () => {
        const mockUpdatedComment = new ArticleComments(
            1,
            "Updated content",
            10,
            new Date(),
            1,
            1,
            null
        );

        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce(),
                query: jest.fn().mockResolvedValue({ recordset: [{ commentId: 1 }] })
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        jest.spyOn(ArticleComments, "getArticleCommentById").mockResolvedValue(mockUpdatedComment);

        const updatedComment = await ArticleComments.updateArticleCommentContent(1, "Updated content", null);

        expect(updatedComment).toBeInstanceOf(ArticleComments);
        expect(updatedComment.commentId).toBe(1);
        expect(updatedComment.content).toBe("Updated content");
    });

    it("should update comment score and return the updated ArticleComments object", async () => {
        const mockUpdatedComment = new ArticleComments(
            1,
            "Original content",
            20,
            new Date(),
            1,
            1,
            null
        );

        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce(),
                query: jest.fn().mockResolvedValue({ recordset: [{ commentId: 1 }] })
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        jest.spyOn(ArticleComments, "getArticleCommentById").mockResolvedValue(mockUpdatedComment);

        const updatedComment = await ArticleComments.updateArticleCommentContent(1, null, 20);

        expect(updatedComment).toBeInstanceOf(ArticleComments);
        expect(updatedComment.commentId).toBe(1);
        expect(updatedComment.score).toBe(20);
    });

    it("should update both comment content and score and return the updated ArticleComments object", async () => {
        const mockUpdatedComment = new ArticleComments(
            1,
            "Updated content",
            20,
            new Date(),
            1,
            1,
            null
        );

        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce(),
                query: jest.fn().mockResolvedValue({ recordset: [{ commentId: 1 }] })
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        jest.spyOn(ArticleComments, "getArticleCommentById").mockResolvedValue(mockUpdatedComment);

        const updatedComment = await ArticleComments.updateArticleCommentContent(1, "Updated content", 20);

        expect(updatedComment).toBeInstanceOf(ArticleComments);
        expect(updatedComment.commentId).toBe(1);
        expect(updatedComment.content).toBe("Updated content");
        expect(updatedComment.score).toBe(20);
    });

    it("should throw an error if neither newContent nor newScore is provided", async () => {
        await expect(ArticleComments.updateArticleCommentContent(1, null, null)).rejects.toThrow("At least one of newContent or newScore must be provided.");
    });

    it("should handle errors and throw the error", async () => {
        sql.connect.mockRejectedValue(new Error("Connection error"));

        await expect(ArticleComments.updateArticleCommentContent(1, "Updated content", null)).rejects.toThrow("Connection error");
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

        await expect(ArticleComments.updateArticleCommentContent(1, "Updated content", null)).rejects.toThrow("Query error");

        expect(mockClose).toHaveBeenCalled();
    });
});

describe("deleteArticleComment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete the comment and return true if the comment exists", async () => {
        // Mocking the connection and query response
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ rowsAffected: [0, 1] }) // Simulate successful deletion
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        const result = await ArticleComments.deleteArticleComment(1);

        expect(result).toBe(true);
    });

    it("should return false if the comment does not exist", async () => {
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ rowsAffected: [0, 0] }) // Simulate no rows affected
            }),
            close: jest.fn().mockResolvedValue(undefined)
        });

        const result = await ArticleComments.deleteArticleComment(999); // Non-existent comment ID

        expect(result).toBe(false);
    });

    it("should handle errors and throw the error", async () => {
        sql.connect.mockRejectedValue(new Error("Connection error"));

        await expect(ArticleComments.deleteArticleComment(1)).rejects.toThrow("Connection error");
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

        await expect(ArticleComments.deleteArticleComment(1)).rejects.toThrow("Query error");

        expect(mockClose).toHaveBeenCalled();
    });
});