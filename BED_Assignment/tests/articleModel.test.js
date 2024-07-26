const sql = require('mssql');
const dbConfig = require('../dbConfig');
const Article = require('../models/articleModel');

jest.mock('mssql');

describe('Article Model', () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Clear any previous mock data
    });

    describe('getAllArticles', () => {
        test('should return all articles', async () => {
            const mockArticles = [
                { articleId: 1, photo: Buffer.from('test'), title: 'Test Article', userId: 1, content: 'Content', publicationDate: new Date() }
            ];

            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnValue({
                    query: jest.fn().mockResolvedValueOnce({ recordset: mockArticles })
                })
            });

            const articles = await Article.getAllArticles();
            expect(articles).toEqual(expect.arrayContaining([expect.any(Article)]));
        });

        test('should handle errors', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Connection error'));

            await expect(Article.getAllArticles()).rejects.toThrow('Error getting articles');
        });
    });

    describe('getArticleByTitle', () => {
        test('should return articles by title', async () => {
            const mockArticle = { articleId: 1, photo: Buffer.from('test'), title: 'Test Article', userId: 1, content: 'Content', publicationDate: new Date() };
    
            const mockConnection = {
                request: jest.fn().mockReturnValue({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValueOnce({ recordset: [mockArticle] }),
                    close: jest.fn() // Mock the close method
                }),
                close: jest.fn() // Ensure close method is mocked
            };
    
            sql.connect.mockResolvedValueOnce(mockConnection);
    
            const articles = await Article.getArticleByTitle('Test');
            expect(articles).toEqual(expect.arrayContaining([expect.any(Article)]));
        });
    
        test('should handle errors', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Connection error'));
    
            await expect(Article.getArticleByTitle('Test')).rejects.toThrow('Error getting articles by title');
        });
    });
    

    describe('createArticle', () => {
        test('should create and return a new article', async () => {
            const newArticle = { photo: Buffer.from('test'), title: 'New Article', userId: 1, content: 'Content', publicationDate: new Date() };
            const insertedArticleId = 1;
    
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnValue({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValueOnce({ recordset: [{ articleId: insertedArticleId }] })
                }),
                close: jest.fn() // Mock the close method
            });
    
            // Mock `getArticleById` method to return a fake article
            jest.spyOn(Article, 'getArticleById').mockResolvedValueOnce(new Article(insertedArticleId, newArticle.photo.toString('base64'), newArticle.title, newArticle.userId, newArticle.content, newArticle.publicationDate));
    
            const article = await Article.createArticle(newArticle);
            expect(article).toBeInstanceOf(Article);
        });
    
        test('should handle errors', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Connection error'));
    
            await expect(Article.createArticle({})).rejects.toThrow('Error creating article');
        });
    });
    

    describe('getArticleById', () => {
        test('should return an article by its ID', async () => {
            const mockArticle = { articleId: 1, photo: Buffer.from('test'), title: 'Test Article', userId: 1, content: 'Content', publicationDate: new Date() };
    
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnValue({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValueOnce({ recordset: [mockArticle] })
                }),
                close: jest.fn() // Mock the close method
            });
    
            const article = await Article.getArticleById(1);
            expect(article).toBeInstanceOf(Article);
        });
    
        test('should handle errors', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Connection error'));
    
            await expect(Article.getArticleById(1)).rejects.toThrow('Error fetching article by ID');
        });
    });
    
    describe('updateArticle', () => {
        test('should update and return the article', async () => {
            const updatedArticle = { photo: Buffer.from('test'), title: 'Updated Article', content: 'Updated Content', publicationDate: new Date() };
    
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnValue({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValueOnce({ recordset: [{ articleId: 1 }] })
                }),
                close: jest.fn() // Mock the close method
            });
    
            // Mock `getArticleById` method to return a fake article
            jest.spyOn(Article, 'getArticleById').mockResolvedValueOnce(new Article(1, updatedArticle.photo.toString('base64'), updatedArticle.title, 1, updatedArticle.content, updatedArticle.publicationDate));
    
            const article = await Article.updateArticle(1, updatedArticle);
            expect(article).toBeInstanceOf(Article);
        });
    
        test('should handle errors', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Connection error'));
    
            await expect(Article.updateArticle(1, {})).rejects.toThrow('Error updating article');
        });
    });
    

    describe('deleteArticle', () => {
        test('should delete an article and return true', async () => {
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnValue({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValueOnce({ rowsAffected: [1] })
                })
            });

            const result = await Article.deleteArticle(1);
            expect(result).toBe(false);
        });

        test('should handle errors', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Connection error'));

            await expect(Article.deleteArticle(1)).rejects.toThrow('Error deleting article');
        });
    });

    describe('addFavouriteArticle', () => {
        test('should add a favourite article and return true', async () => {
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnValue({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValueOnce({ rowsAffected: [1] })
                })
            });
    
            const result = await Article.addFavouriteArticle(1, 1);
            expect(result).toBe(true);
        });
    
        test('should handle errors', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Connection error'));
    
            await expect(Article.addFavouriteArticle(1, 1)).rejects.toThrow('Error adding favourite article');
        });
    });    

    describe('removeFavouriteArticle', () => {
        test('should remove a favourite article and return true', async () => {
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnValue({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValueOnce({ rowsAffected: [1] })
                })
            });
    
            const result = await Article.removeFavouriteArticle(1, 1);
            expect(result).toBe(true);
        });
    
        test('should handle errors', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Connection error'));
    
            await expect(Article.removeFavouriteArticle(1, 1)).rejects.toThrow('Error removing favourite article');
        });
    });    

    describe('getFavouriteArticles', () => {
        test('should return favourite articles for a user', async () => {
            const mockArticle = { articleId: 1, photo: Buffer.from('test'), title: 'Favourited Article', userId: 1, content: 'Content', publicationDate: new Date() };
    
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnValue({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValueOnce({ recordset: [mockArticle] })
                })
            });
    
            const articles = await Article.getFavouriteArticles(1);
            expect(articles).toEqual(expect.arrayContaining([expect.any(Article)]));
        });
    
        test('should handle errors', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Connection error'));
    
            await expect(Article.getFavouriteArticles(1)).rejects.toThrow('Error fetching favourite articles');
        });
    });    

    describe('isFavouriteArticle', () => {
        test('should check if an article is a favourite', async () => {
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnValue({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValueOnce({ recordset: [{ count: 1 }] })
                })
            });
    
            const result = await Article.isFavouriteArticle(1, 1);
            expect(result).toBe(true);
        });
    
        test('should handle errors', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Connection error'));
    
            await expect(Article.isFavouriteArticle(1, 1)).rejects.toThrow('Error checking if article is favourite');
        });
    });    

    describe('getArticleById', () => {
        test('should return an article by its ID', async () => {
            const mockArticle = { articleId: 1, photo: Buffer.from('test'), title: 'Article By ID', userId: 1, content: 'Content', publicationDate: new Date() };

            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnValue({
                    input: jest.fn(),
                    query: jest.fn().mockResolvedValueOnce({ recordset: [mockArticle] })
                })
            });

            const article = await Article.getArticleById(1);
            expect(article).toBeInstanceOf(Article);
        });

        test('should handle errors', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Connection error'));

            await expect(Article.getArticleById(1)).rejects.toThrow('Error fetching article by ID');
        });
    });
});
