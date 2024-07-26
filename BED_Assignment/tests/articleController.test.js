const {
    serveArticlesContent,
    getAllArticles,
    getArticleByTitle,
    createArticle,
    updateArticle,
    deleteArticle,
    getFavouriteArticles,
    addFavouriteArticle,
    removeFavouriteArticle,
    isFavouriteArticle,
    getArticleById,
    getArticlesByUser
} = require('../controllers/articleController');
const ArticleModel = require('../models/articleModel');

jest.mock('../models/articleModel');

describe('articleController', () => {
    let req, res;

    beforeEach(() => {
        req = { params: {}, query: {}, body: {}, user: {} };
        res = {
            json: jest.fn(),
            set: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            sendFile: jest.fn()
        };
    });

    describe('serveArticlesContent', () => {
        it('should serve createArticle.html if user type is C', () => {
            req.user = { userType: 'C' };
            serveArticlesContent(req, res);
            expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining('createArticle.html'));
        });

        it('should serve articles.html if user type is not C', () => {
            req.user = { userType: 'A' };
            serveArticlesContent(req, res);
            expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining('articles.html'));
        });

        it('should serve articles.html if no user is logged in', () => {
            serveArticlesContent(req, res);
            expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining('articles.html'));
        });
    });

    describe('getAllArticles', () => {
        it('should fetch all articles', async () => {
            const articles = [{ id: 1, title: 'Article1' }];
            ArticleModel.getAllArticles.mockResolvedValue(articles);

            await getAllArticles(req, res);

            expect(ArticleModel.getAllArticles).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(articles);
        });

        it('should handle errors', async () => {
            ArticleModel.getAllArticles.mockRejectedValue(new Error('Database error'));

            await getAllArticles(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error retrieving Article');
        });
    });

    describe('getArticleByTitle', () => {
        it('should fetch articles by title', async () => {
            req.query.title = 'Title1';
            const articles = [{ id: 1, title: 'Title1' }];
            ArticleModel.getArticleByTitle.mockResolvedValue(articles);

            await getArticleByTitle(req, res);

            expect(ArticleModel.getArticleByTitle).toHaveBeenCalledWith('Title1');
            expect(res.json).toHaveBeenCalledWith(articles);
        });

        it('should return 400 if title is not provided', async () => {
            await getArticleByTitle(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Title query parameter is required' });
        });

        it('should return 404 if no articles are found', async () => {
            req.query.title = 'Title1';
            ArticleModel.getArticleByTitle.mockResolvedValue([]);

            await getArticleByTitle(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No articles found' });
        });

        it('should handle errors', async () => {
            req.query.title = 'Title1';
            ArticleModel.getArticleByTitle.mockRejectedValue(new Error('Database error'));

            await getArticleByTitle(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Server Error' });
        });
    });

    describe('createArticle', () => {
        it('should create a new article', async () => {
            // Mock request and response objects
            req.body = { 
                title: 'New Article', 
                userId: 1, 
                content: 'Content', 
                publicationDate: '2024-07-26', 
                photo: 'data:image/png;base64,dGVzdA=='
            };
            const newArticle = { 
                id: 1, 
                title: 'New Article', 
                userId: 1, 
                content: 'Content', 
                publicationDate: new Date('2024-07-26'), 
                photo: Buffer.from('dGVzdA==', 'base64')
            };
            
            // Mock ArticleModel.createArticle to return the new article
            ArticleModel.createArticle.mockResolvedValue(newArticle);
    
            // Call createArticle function
            await createArticle(req, res);
    
            // Assertions
            expect(ArticleModel.createArticle).toHaveBeenCalledWith({
                title: 'New Article',
                userId: 1,
                content: 'Content',
                publicationDate: new Date('2024-07-26'),
                photo: Buffer.from('dGVzdA==', 'base64')
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newArticle);
        });
    
        it('should handle errors', async () => {
            req.body = { 
                title: 'New Article', 
                userId: 1, 
                content: 'Content', 
                publicationDate: '2024-07-26', 
                photo: 'data:image/png;base64,dGVzdA=='
            };
            ArticleModel.createArticle.mockRejectedValue(new Error('Database error'));
    
            await createArticle(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });
    

    describe('updateArticle', () => {
        it('should update an article', async () => {
            req.params.articleId = '1';
            req.body = { title: 'Updated Article' };
            const updatedArticle = { id: 1, title: 'Updated Article' };
            ArticleModel.updateArticle.mockResolvedValue(updatedArticle);

            await updateArticle(req, res);

            expect(ArticleModel.updateArticle).toHaveBeenCalledWith(1, req.body);
            expect(res.json).toHaveBeenCalledWith(updatedArticle);
        });

        it('should return 404 if article not found', async () => {
            req.params.articleId = '1';
            req.body = { title: 'Updated Article' };
            ArticleModel.updateArticle.mockResolvedValue(null);

            await updateArticle(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('Article not found');
        });

        it('should handle errors', async () => {
            req.params.articleId = '1';
            req.body = { title: 'Updated Article' };
            ArticleModel.updateArticle.mockRejectedValue(new Error('Database error'));

            await updateArticle(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error updating article');
        });
    });

    describe('deleteArticle', () => {
        it('should delete an article', async () => {
            req.params.articleId = '1';
            ArticleModel.deleteArticle.mockResolvedValue(true);

            await deleteArticle(req, res);

            expect(ArticleModel.deleteArticle).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Article deleted successfully' });
        });

        it('should return 404 if article not found', async () => {
            req.params.articleId = '1';
            ArticleModel.deleteArticle.mockResolvedValue(false);

            await deleteArticle(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Article not found' });
        });

        it('should handle errors', async () => {
            req.params.articleId = '1';
            ArticleModel.deleteArticle.mockRejectedValue(new Error('Database error'));

            await deleteArticle(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });

    describe('getFavouriteArticles', () => {
        it('should fetch favourite articles for a user', async () => {
            req.params.userId = '1';
            const favourites = [{ id: 1, title: 'Favourite Article' }];
            ArticleModel.getFavouriteArticles.mockResolvedValue(favourites);

            await getFavouriteArticles(req, res);

            expect(ArticleModel.getFavouriteArticles).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalledWith(favourites);
        });

        it('should handle errors', async () => {
            req.params.userId = '1';
            ArticleModel.getFavouriteArticles.mockRejectedValue(new Error('Database error'));

            await getFavouriteArticles(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Error retrieving favourite articles');
        });
    });

    describe('addFavouriteArticle', () => {
        it('should add an article to favourites', async () => {
            req.params.userId = '1';
            req.body = { articleId: '1' };
    
            await addFavouriteArticle(req, res);
    
            expect(ArticleModel.addFavouriteArticle).toHaveBeenCalledWith('1', '1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });
    
        it('should handle errors', async () => {
            req.params.userId = '1';
            req.body = { articleId: '1' };
            ArticleModel.addFavouriteArticle.mockRejectedValue(new Error('Database error'));
    
            await addFavouriteArticle(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to add favourite' });
        });
    });
    

    describe('removeFavouriteArticle', () => {
        it('should remove an article from favourites', async () => {
            req.params.userId = '1';
            req.body = { articleId: '1' };
    
            await removeFavouriteArticle(req, res);
    
            expect(ArticleModel.removeFavouriteArticle).toHaveBeenCalledWith('1', '1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });
    
        it('should handle errors', async () => {
            req.params.userId = '1';
            req.body = { articleId: '1' };
            ArticleModel.removeFavouriteArticle.mockRejectedValue(new Error('Database error'));
    
            await removeFavouriteArticle(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to remove favourite' });
        });
    });
    

    describe('isFavouriteArticle', () => {
        it('should check if an article is a favourite', async () => {
            req.params.userId = '1';
            req.params.articleId = '1'; // Ensure articleId is set in params
            ArticleModel.isFavouriteArticle.mockResolvedValue(true);
    
            await isFavouriteArticle(req, res);
    
            expect(ArticleModel.isFavouriteArticle).toHaveBeenCalledWith('1', '1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith( true );
        });
    
        it('should handle errors', async () => {
            req.params.userId = '1';
            req.params.articleId = '1'; // Ensure articleId is set in params
            ArticleModel.isFavouriteArticle.mockRejectedValue(new Error('Database error'));
    
            await isFavouriteArticle(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to check if article is favourite' });
        });
    });
    

    describe('getArticleById', () => {
        it('should handle errors', async () => {
            req.params.articleId = '1';
            ArticleModel.getArticleById.mockRejectedValue(new Error('Database error'));
    
            await getArticleById(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });
    

    describe('getArticlesByUser', () => {
        it('should handle errors', async () => {
            req.params.userId = '1'; // Mock a user ID
            ArticleModel.getArticlesByUser.mockRejectedValue(new Error('Database error'));
    
            await getArticlesByUser(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });
    
});
