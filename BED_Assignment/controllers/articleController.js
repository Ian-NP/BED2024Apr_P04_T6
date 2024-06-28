const path = require('path');
const ArticleModel = require('../models/articleModel');

const serveArticlesContent = (req, res) => {
    if (!req.user) {
        return res.sendFile(path.join(__dirname, '../public/html/articles.html')); // Serve normal articles if no token
    }

    const userType = req.user.userType; // Extract user type from the request

    if (userType === 'C') {
        res.sendFile(path.join(__dirname, '../public/html/createArticle.html'));
    } else {
        res.sendFile(path.join(__dirname, '../public/html/articles.html'));
    }
};

const getAllArticles = async (req, res) => {
    try {
        const articles = await ArticleModel.getAllArticles();

        // Convert photo field to base64 if it exists
        articles.forEach(article => {
            article.photo = article.photo ? Buffer.from(article.photo).toString('base64') : null;
        });

        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: "Failed to fetch articles" });
    }
};

const getArticleByTitle = async (req, res) => {
    const title = req.params.title;
    try {
        const article = await ArticleModel.getArticleByTitle(title);
        if (!article) {
            return res.status(404).send("Article not found");
        }
        return res.status(200).json(article);
    } catch (err) {
        console.error(`Error getting article by title: ${title}`, err);
        res.status(500).send("Error retrieving article");
    }
};

const createArticle = async (req, res) => {
    const { title, userId, content, publicationDate } = req.body;
    const photo = req.body.photo;

    if (!title || !userId || !content || !photo || !publicationDate) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const newArticle = new ArticleModel(null, photo, title, userId, content, publicationDate);
        const createdArticle = await ArticleModel.createArticle(newArticle);
        res.status(201).json(createdArticle);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: "Failed to create article", details: error.message });
    }
};

const updateArticle = async (req, res) => {
    const articleId = parseInt(req.params.articleId);
    const updatedArticle = req.body;
    try {
        const article = await ArticleModel.updateArticle(articleId, updatedArticle);
        if (!article) {
            return res.status(404).send("Article not found");
        }
        return res.status(200).json(article);
    } catch (err) {
        console.error(`Error updating article with ID: ${articleId}`, err);
        res.status(500).send("Error updating article");
    }
};

const deleteArticle = async (req, res) => {
    const articleId = parseInt(req.params.articleId);
    try {
        const success = await ArticleModel.deleteArticle(articleId);
        if (!success) {
            return res.status(404).send("Article not found");
        }
        return res.status(200).send("Article deleted successfully");
    } catch (err) {
        console.error(`Error deleting article with ID: ${articleId}`, err);
        res.status(500).send("Error deleting article");
    }
};

const getFavouriteArticles = async (req, res) => {
    const userId = req.user.id; // Assuming you have user ID in the request
    try {
        const favourites = await ArticleModel.getFavouriteArticles(userId);
        return res.status(200).json(favourites);
    } catch (err) {
        console.error('Error getting favourite articles: ', err);
        res.status(500).send("Error retrieving favourite articles");
    }
};

const addFavouriteArticle = async (req, res) => {
    const userId = req.user.id; // Assuming you have user ID in the request
    const articleId = parseInt(req.params.articleId);
    try {
        await ArticleModel.addFavouriteArticle(userId, articleId);
        return res.status(200).send("Article added to favourites");
    } catch (err) {
        console.error(`Error adding favourite article: ${articleId}`, err);
        res.status(500).send("Error adding favourite article");
    }
};

const removeFavouriteArticle = async (req, res) => {
    const userId = req.user.id; // Assuming you have user ID in the request
    const articleId = parseInt(req.params.articleId);
    try {
        await ArticleModel.removeFavouriteArticle(userId, articleId);
        return res.status(200).send("Article removed from favourites");
    } catch (err) {
        console.error(`Error removing favourite article: ${articleId}`, err);
        res.status(500).send("Error removing favourite article");
    }
};

const getArticleById = async (req, res) => {
    const articleId = req.params.articleId;
    try {
        const article = await ArticleModel.getArticleById(articleId);

        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }

        // Example: Convert photo field to base64 if it exists
        if (article.photo) {
            article.photo = Buffer.from(article.photo).toString('base64');
        }

        res.status(200).json(article);
    } catch (error) {
        console.error('Error fetching article by ID:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    serveArticlesContent,
    getAllArticles,
    getArticleByTitle,
    createArticle,
    updateArticle,
    deleteArticle,
    getFavouriteArticles,
    addFavouriteArticle,
    removeFavouriteArticle,
    getArticleById
};
