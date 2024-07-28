-- Drop existing tables if they exist
DROP TABLE IF EXISTS EventPayments;
DROP TABLE IF EXISTS CompanyUser;
DROP TABLE IF EXISTS NormalUser;
DROP TABLE IF EXISTS UserFavouriteArticles;
DROP TABLE IF EXISTS ArticleComments;
DROP TABLE IF EXISTS EventComments;
DROP TABLE IF EXISTS EventAttendance;
DROP TABLE IF EXISTS Articles;
DROP TABLE IF EXISTS Events;
DROP TABLE IF EXISTS ChatBotHistory;
DROP TABLE IF EXISTS ChatConversations;
DROP TABLE IF EXISTS highscores;
DROP TABLE IF EXISTS UserSaves;
DROP TABLE IF EXISTS game_saves;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS AdminUser;
GO

-- Create Tables
CREATE TABLE AdminUser (
    adminId INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    adminEmail NVARCHAR(255) NOT NULL UNIQUE,
	profilePicture VARBINARY(MAX) NULL,
	about text NULL
);

CREATE TABLE Users (
    userId INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    userType CHAR(1) NOT NULL CHECK (userType IN ('C', 'U')),
    paypalEmail NVARCHAR(255) NULL,
	profilePicture VARBINARY(MAX) NULL,
	about text NULL
);

CREATE TABLE refresh_tokens (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    token VARCHAR(255),
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(userId)
);

CREATE TABLE Articles (
    articleId INT PRIMARY KEY IDENTITY(1,1),
    photo VARBINARY(MAX),
    title NVARCHAR(255) NOT NULL,
    userId INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    publicationDate DATETIME2 NOT NULL,
    CONSTRAINT FK_Articles_Users FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE UserFavouriteArticles (
    normalUserId INT NOT NULL,
    articleId INT NOT NULL,
    PRIMARY KEY (normalUserId, articleId),
    FOREIGN KEY (normalUserId) REFERENCES Users(userId),
    FOREIGN KEY (articleId) REFERENCES Articles(articleId)
);

CREATE TABLE Events (
    eventId INT PRIMARY KEY IDENTITY(1,1),
    eventName NVARCHAR(255) NOT NULL,
    eventDesc NVARCHAR(MAX),
    eventOverview NVARCHAR(255),
    eventCategory NVARCHAR(50),
    eventReports INT DEFAULT 0 CHECK (eventReports >= 0),
    eventTime DATETIME2,
    eventImage VARBINARY(MAX),
    creatorId INT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT FK_Events_Users FOREIGN KEY (creatorId) REFERENCES Users(userId)
);

CREATE TABLE EventAttendance (
    eventId INT,
    userId INT,
    PRIMARY KEY (eventId, userId),
    FOREIGN KEY (eventId) REFERENCES Events(eventId),
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE EventPayments (
    paymentId INT PRIMARY KEY IDENTITY(1,1),
    eventId INT NOT NULL,
    userId INT NOT NULL,
    authorizationID NVARCHAR(255) NOT NULL,
    captured BIT DEFAULT 0,
    FOREIGN KEY (eventId) REFERENCES Events(eventId),
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE ArticleComments (
    commentId INT PRIMARY KEY IDENTITY(1,1),
    content NVARCHAR(MAX) NOT NULL,
    score INT DEFAULT 0,
    timeStamp DATETIME2 NOT NULL,
    userId INT NOT NULL,
    articleId INT NOT NULL,
    parentCommentId INT NULL,
    CONSTRAINT FK_ArticleComments_Users FOREIGN KEY (userId) REFERENCES Users(userId),
    CONSTRAINT FK_ArticleComments_Articles FOREIGN KEY (articleId) REFERENCES Articles(articleId),
    CONSTRAINT FK_ArticleComments_ParentComment FOREIGN KEY (parentCommentId) REFERENCES ArticleComments(commentId)
);

CREATE TABLE EventComments (
    commentId INT PRIMARY KEY IDENTITY(1,1),
    content NVARCHAR(MAX) NOT NULL,
    score INT DEFAULT 0,
    timeStamp DATETIME2 NOT NULL,
    userId INT NOT NULL,
    eventId INT NOT NULL,
    parentCommentId INT NULL,
    CONSTRAINT FK_EventComments_Users FOREIGN KEY (userId) REFERENCES Users(userId),
    CONSTRAINT FK_EventComments_Events FOREIGN KEY (eventId) REFERENCES Events(eventId),
    CONSTRAINT FK_EventComments_ParentComment FOREIGN KEY (parentCommentId) REFERENCES EventComments(commentId)
);

CREATE TABLE game_saves (    id INT IDENTITY(1,1) PRIMARY KEY,
    grid_size INT NOT NULL,    buildings_grid NVARCHAR(MAX) NOT NULL,
    points INT NOT NULL,    coins INT NOT NULL,
    turn_number INT NOT NULL,    created_at DATETIME NULL,
    gameMode NVARCHAR(MAX) NULL,    saveDate DATETIME
);

CREATE TABLE UserSaves (    UserSavesId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,    EventId INT NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(userId),    FOREIGN KEY (EventId) REFERENCES game_saves(id)
);
CREATE TABLE highscores (    userId INT NOT NULL,
    id INT NOT NULL,    playerName NVARCHAR(MAX) NULL,
    PRIMARY KEY (userId, id),    FOREIGN KEY (userId) REFERENCES Users(UserId),
    FOREIGN KEY (id) REFERENCES game_saves(id));

---------------------------------------------------------------------------------------------------------------------
-- Create ChatConversations table
CREATE TABLE ChatConversations (
    conversationId INT PRIMARY KEY IDENTITY(1,1),
    conversationTitle NVARCHAR(MAX) NOT NULL,
	timeStamp DATETIME2 NOT NULL,
	userId INT NOT NULL,
	CONSTRAINT FK_ChatConversations_UserId FOREIGN KEY (userId) REFERENCES Users(userId)
);

-- Create ChatBotHistory table
CREATE TABLE ChatBotHistory (
    chatHistoryId INT PRIMARY KEY IDENTITY(1,1),
    role NVARCHAR(5) NOT NULL CHECK (role IN ('user', 'model')),
    text NVARCHAR(MAX) NOT NULL,
    timeStamp DATETIME2 NOT NULL,
	conversationId INT NOT NULL,
	CONSTRAINT FK_ChatBotHistory_ConversationId FOREIGN KEY (conversationId) REFERENCES ChatConversations(conversationId)
);

GO

-- Create trigger to delete ChatBotHistory records before ChatConversation is deleted
CREATE TRIGGER trg_DeleteChatBotHistory
ON ChatConversations
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Delete from ChatBotHistory where conversationId matches deleted records
    DELETE FROM ChatBotHistory
    WHERE conversationId IN (SELECT conversationId FROM deleted);

    -- Delete from ChatConversations
    DELETE FROM ChatConversations
    WHERE conversationId IN (SELECT conversationId FROM deleted);
END;
GO

---------------------------------------------------------------------------------------------------------------------

-- Adding indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_userId_Articles' AND object_id = OBJECT_ID('dbo.Articles'))
BEGIN
    CREATE INDEX idx_userId_Articles ON Articles(userId);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_userId_UserFavouriteArticles' AND object_id = OBJECT_ID('dbo.UserFavouriteArticles'))
BEGIN
    CREATE INDEX idx_userId_UserFavouriteArticles ON UserFavouriteArticles(normalUserId);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_articleId_UserFavouriteArticles' AND object_id = OBJECT_ID('dbo.UserFavouriteArticles'))
BEGIN
    CREATE INDEX idx_articleId_UserFavouriteArticles ON UserFavouriteArticles(articleId);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_eventId_EventAttendance' AND object_id = OBJECT_ID('dbo.EventAttendance'))
BEGIN
    CREATE INDEX idx_eventId_EventAttendance ON EventAttendance(eventId);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_userId_EventAttendance' AND object_id = OBJECT_ID('dbo.EventAttendance'))
BEGIN
    CREATE INDEX idx_userId_EventAttendance ON EventAttendance(userId);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_userId_ChatConversations' AND object_id = OBJECT_ID('dbo.ChatConversations'))
BEGIN
    CREATE INDEX idx_userId_ChatConversations ON ChatConversations(userId);
END
GO

-- Create Triggers

-- Trigger to handle deletes in Users table
CREATE TRIGGER trg_DeleteUser
ON Users
INSTEAD OF DELETE
AS
BEGIN
    -- Recursive deletion of child comments for ArticleComments
    WITH RecursiveArticleComments AS (
        SELECT commentId
        FROM ArticleComments
        WHERE userId IN (SELECT userId FROM deleted)
        UNION ALL
        SELECT ac.commentId
        FROM ArticleComments ac
        INNER JOIN RecursiveArticleComments rac ON rac.commentId = ac.parentCommentId
    )
    DELETE FROM ArticleComments WHERE commentId IN (SELECT commentId FROM RecursiveArticleComments);

    -- Recursive deletion of child comments for EventComments
    WITH RecursiveEventComments AS (
        SELECT commentId
        FROM EventComments
        WHERE userId IN (SELECT userId FROM deleted)
        UNION ALL
        SELECT ec.commentId
        FROM EventComments ec
        INNER JOIN RecursiveEventComments rec ON rec.commentId = ec.parentCommentId
    )
    DELETE FROM EventComments WHERE commentId IN (SELECT commentId FROM RecursiveEventComments);

    -- Delete related records in EventAttendance
    DELETE FROM EventAttendance WHERE userId IN (SELECT userId FROM deleted);

    -- Delete related records in UserFavouriteArticles
    DELETE FROM UserFavouriteArticles WHERE normalUserId IN (SELECT userId FROM deleted);

    -- Delete related records in ArticleComments where articleId is referenced
    DELETE FROM ArticleComments WHERE articleId IN (SELECT articleId FROM Articles WHERE userId IN (SELECT userId FROM deleted));
    
    -- Delete related records in Articles
    DELETE FROM Articles WHERE userId IN (SELECT userId FROM deleted);

    -- Delete related records in EventComments where eventId is referenced
    DELETE FROM EventComments WHERE eventId IN (SELECT eventId FROM Events WHERE creatorId IN (SELECT userId FROM deleted));

    -- Delete related records in Events
    DELETE FROM Events WHERE creatorId IN (SELECT userId FROM deleted);

    -- Delete related records in EventPayments
    DELETE FROM EventPayments WHERE userId IN (SELECT userId FROM deleted);

    -- Delete related records in ChatConversations
    DELETE FROM ChatConversations WHERE userId IN (SELECT userId FROM deleted);

    -- Finally, delete the user
    DELETE FROM Users WHERE userId IN (SELECT userId FROM deleted);
END
GO

-- Trigger to handle deletes in Articles table
CREATE TRIGGER trg_DeleteArticle
ON Articles
INSTEAD OF DELETE
AS
BEGIN
    -- Delete related records in UserFavouriteArticles and ArticleComments
    DELETE FROM UserFavouriteArticles WHERE articleId IN (SELECT articleId FROM deleted);
    DELETE FROM ArticleComments WHERE articleId IN (SELECT articleId FROM deleted);

    -- Finally, delete the article
    DELETE FROM Articles WHERE articleId IN (SELECT articleId FROM deleted);
END
GO

-- Trigger to handle deletes in Events table
CREATE TRIGGER trg_DeleteEvent
ON Events
INSTEAD OF DELETE
AS
BEGIN
    -- Delete related records in EventComments and EventAttendance
    DELETE FROM EventComments WHERE eventId IN (SELECT eventId FROM deleted);
    DELETE FROM EventAttendance WHERE eventId IN (SELECT eventId FROM deleted);

    -- Delete related records in EventPayments
    DELETE FROM EventPayments WHERE eventId IN (SELECT eventId FROM deleted);

    -- Finally, delete the event
    DELETE FROM Events WHERE eventId IN (SELECT eventId FROM deleted);
END
GO

-- Create trigger to handle deletes in ArticleComments table
CREATE TRIGGER trg_DeleteArticleComment
ON ArticleComments
INSTEAD OF DELETE
AS
BEGIN
    -- Recursive deletion of child comments
    WITH RecursiveArticleComments AS (
        SELECT commentId
        FROM deleted
        UNION ALL
        SELECT ac.commentId
        FROM ArticleComments ac
        INNER JOIN RecursiveArticleComments rac ON rac.commentId = ac.parentCommentId
    )
    DELETE FROM ArticleComments WHERE commentId IN (SELECT commentId FROM RecursiveArticleComments);
END
GO

-- Create trigger to handle deletes in EventComments table
CREATE TRIGGER trg_DeleteEventComment
ON EventComments
INSTEAD OF DELETE
AS
BEGIN
    -- Recursive deletion of child comments
    WITH RecursiveEventComments AS (
        SELECT commentId
        FROM deleted
        UNION ALL
        SELECT ec.commentId
        FROM EventComments ec
        INNER JOIN RecursiveEventComments rec ON rec.commentId = ec.parentCommentId
    )
    DELETE FROM EventComments WHERE commentId IN (SELECT commentId FROM RecursiveEventComments);
END
GO

-- Insert data into AdminUser
INSERT INTO AdminUser (name, password, adminEmail) VALUES
('Roberts', 'password1', 'a1@bed.com'),
('Emma', 'password2', 'a2@bed.com'),
('Dan', 'password3', 'a3@bed.com'),
('Lily', 'password4', 'a4@bed.com'),
('Angelo', 'password5', 'a5@bed.com'),
('Beckett', 'password6', 'a6@bed.com'),
('Tan', 'password7', 'a7@bed.com'),
('Susan', 'password8', 'a8@bed.com'),
('Drake', 'password9', 'a9@bed.com'),
('Casey', 'password10', 'a10@bed.com');

INSERT INTO Users (email, name, password, userType, paypalEmail) VALUES
('abc_pte_ltd@gmail.com', 'ABC PTE LTD', 'abcd1234', 'C', 'sb-janes31221073@business.example.com'),
('trevormakes@hotmail.com', 'Trevor', 'trevormakes2', 'U', NULL),
('yourtrainingcenter@yahoo.com', 'Training Center', 'trainingseason123', 'C', 'sb-janes31221073@business.example.com'),
('polly_moe@gmail.com', 'Polly', 'moeyoudown12', 'U', NULL),
('Loopinc@yahoo.com', 'Loop Inc', 'itsaloop101', 'C', 'sb-janes31221073@business.example.com'),
('johndoe@yahoo.com', 'John', 'johndoe101', 'U', NULL),
('lexorders@yahoo.com', 'Lex Orders', 'lexisthebest10', 'C', 'sb-janes31221073@business.example.com'),
('katherine@gmail.com', 'Katherine', 'katherinebanks82', 'U', NULL),
('superawesomefacts@gmail.com', 'Super Awesome Facts', 'awesomepassword', 'C', 'sb-janes31221073@business.example.com'),
('maria@hotmail.com', 'Maria', 'mariamaria0', 'U', NULL);

-- Insert data into Articles
INSERT INTO Articles (photo, title, userId, content, publicationDate) VALUES
(NULL, 'Article1', 1, 'Content of Article1', '2023-01-01 10:00:00'),
(NULL, 'Article2', 3, 'Content of Article2', '2023-01-02 10:00:00'),
(NULL, 'Article3', 5, 'Content of Article3', '2023-01-03 10:00:00'),
(NULL, 'Article4', 7, 'Content of Article4', '2023-01-04 10:00:00'),
(NULL, 'Article5', 9, 'Content of Article5', '2023-01-05 10:00:00'),
(NULL, 'Article6', 2, 'Content of Article6', '2023-01-06 10:00:00'),
(NULL, 'Article7', 4, 'Content of Article7', '2023-01-07 10:00:00'),
(NULL, 'Article8', 6, 'Content of Article8', '2023-01-08 10:00:00'),
(NULL, 'Article9', 8, 'Content of Article9', '2023-01-09 10:00:00'),
(NULL, 'Article10', 10, 'Content of Article10', '2023-01-10 10:00:00');

-- Insert data into UserFavouriteArticles
INSERT INTO UserFavouriteArticles (normalUserId, articleId) VALUES
(2, 1),
(2, 2),
(4, 3),
(4, 4),
(6, 5),
(6, 6),
(8, 7),
(8, 8),
(10, 9),
(10, 10);

-- Insert data into Events
INSERT INTO Events (eventName, eventDesc, eventOverview, eventCategory, eventReports, eventTime, eventImage, creatorId, cost) VALUES
('Event1', 'Description of Event1', 'overview', 'Hackathons', 0, '2023-02-01 10:00:00', NULL, 1, 100.00),
('Event2', 'Description of Event2', 'overview', 'Conferences', 1, '2023-02-02 10:00:00', NULL, 3, 150.00),
('Event3', 'Description of Event3', 'overview', 'Talks', 2, '2023-02-03 10:00:00', NULL, 5, 200.00),
('Event4', 'Description of Event4', 'overview', 'Workshops', 3, '2023-02-04 10:00:00', NULL, 7, 250.00),
('Event5', 'Description of Event5', 'overview', 'Seminars', 4, '2023-02-05 10:00:00', NULL, 9, 300.00),
('Event6', 'Description of Event6', 'overview', 'Bootcamps', 5, '2023-02-06 10:00:00', NULL, 1, 350.00),
('Event7', 'Description of Event7', 'overview', 'Networking Events', 6, '2023-02-07 10:00:00', NULL, 3, 400.00),
('Event8', 'Description of Event8', 'overview', 'Webinars', 7, '2023-02-08 10:00:00', NULL, 5, 450.00),
('Event9', 'Description of Event9', 'overview', 'Hackathons', 8, '2023-02-09 10:00:00', NULL, 7, 500.00),
('Event10', 'Description of Event10', 'overview', 'Conferences', 9, '2023-02-10 10:00:00', NULL, 9, 550.00);


-- Insert data into EventAttendance
INSERT INTO EventAttendance (eventId, userId) VALUES
(1, 2),
(1, 4),
(2, 6),
(2, 8),
(3, 10),
(3, 2),
(4, 4),
(4, 6),
(5, 8),
(5, 10);

-- Insert data into ArticleComments with parent and child comments
INSERT INTO ArticleComments (content, score, timeStamp, userId, articleId, parentCommentId) VALUES
('Parent comment on Article 1 by User 2', 5, GETDATE(), 2, 1, NULL),
('Child comment 1 on Article 1 by User 4', 3, GETDATE(), 4, 1, 1),
('Child comment 2 on Article 1 by User 2', 2, GETDATE(), 2, 1, 1),
('Parent comment on Article 2 by User 4', 4, GETDATE(), 4, 2, NULL),
('Child comment 1 on Article 2 by User 2', 1, GETDATE(), 2, 2, 4),
('Child comment 2 on Article 2 by User 4', 3, GETDATE(), 4, 2, 4),
('Parent comment 2 on Article 1 by User 2', 4, GETDATE(), 2, 1, NULL),
('Child comment 3 on Article 1 by User 4', 2, GETDATE(), 4, 1, 7),
('Child comment 4 on Article 1 by User 2', 5, GETDATE(), 2, 1, 7),
('Child comment 5 on Article 1 by User 4', 1, GETDATE(), 4, 1, 7);

-- Insert data into EventComments with parent and child comments
INSERT INTO EventComments (content, score, timeStamp, userId, eventId, parentCommentId) VALUES
('Parent comment on Event 1 by User 2', 5, GETDATE(), 2, 1, NULL),
('Child comment 1 on Event 1 by User 4', 3, GETDATE(), 4, 1, 1),
('Child comment 2 on Event 1 by User 2', 2, GETDATE(), 2, 1, 1),
('Parent comment on Event 2 by User 4', 4, GETDATE(), 4, 2, NULL),
('Child comment 1 on Event 2 by User 2', 1, GETDATE(), 2, 2, 4),
('Child comment 2 on Event 2 by User 4', 3, GETDATE(), 4, 2, 4),
('Parent comment 2 on Event 1 by User 2', 4, GETDATE(), 2, 1, NULL),
('Child comment 3 on Event 1 by User 4', 2, GETDATE(), 4, 1, 7),
('Child comment 4 on Event 1 by User 2', 5, GETDATE(), 2, 1, 7),
('Child comment 5 on Event 1 by User 4', 1, GETDATE(), 4, 1, 7);

-- Insert sample data into ChatConversations table
INSERT INTO ChatConversations (conversationTitle, timeStamp, userId)
VALUES 
    ('Project Discussion', GETDATE(), 1),
    ('Support Chat', GETDATE(), 2),
    ('Sales Meeting', GETDATE(), 1);

-- Insert sample data into ChatBotHistory table
INSERT INTO ChatBotHistory (role, text, timeStamp, conversationId)
VALUES 
    ('user', 'Hello, how are you?', '2024-07-11 10:00:00', 1),
    ('model', 'I''m good, thank you!', '2024-07-11 10:01:00', 1),
    ('user', 'Can you provide me with the latest report?', '2024-07-11 10:05:00', 1),
    ('model', 'Sure! Here is the report link: [link]', '2024-07-11 10:06:00', 1),
    ('user', 'How can I solve this issue?', '2024-07-12 09:00:00', 2),
    ('model', 'Please try restarting your device.', '2024-07-12 09:02:00', 2),
    ('user', 'Thank you, it worked!', '2024-07-12 09:05:00', 2),
    ('user', 'I need more information about the product.', '2024-07-13 14:00:00', 3),
    ('model', 'Here are the product details...', '2024-07-13 14:02:00', 3);