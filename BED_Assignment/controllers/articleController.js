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

// const getAllArticles = async (req, res) => {
//     try {
//         const articles = await ArticleModel.getAllArticles();

//         // Convert photo field to base64 if it exists
//         articles.forEach(article => {
//             article.photo = article.photo ? Buffer.from(article.photo).toString('base64') : null;
//         });

//         res.json(articles);
//     } catch (error) {
//         console.error('Error fetching articles:', error);
//         res.status(500).json({ error: "Failed to fetch articles" });
//     }
// };
const getAllArticles = async (req, res) => {
    try {
        const article = await ArticleModel.getAllArticles();
        console.log(article);
        return res.status(200).json(article);
    } catch (err) {
        console.error('Error retrieving Article: ', err);
        res.status(500).send("Error retrieving Article");
    }
};

const getArticleByTitle = async (req, res) => {
    try {
        const title = req.query.title;
        console.log('Title:', title); // Debugging output

        if (!title) {
            return res.status(400).json({ error: 'Title query parameter is required' });
        }

        const articles = await ArticleModel.getArticleByTitle(title); // Correct usage
        console.log('Articles:', articles); // Debugging output

        if (!articles.length) {
            return res.status(404).json({ message: 'No articles found' });
        }

        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles by title:', error); // Detailed error
        res.status(500).json({ error: 'Server Error' });
    }
};

const createArticle = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const publicationDate = new Date(req.body.publicationDate);
        const photo2 = Buffer.from(req.body.photo.split(',')[1], 'base64');
        const newArticleData = {
            title: req.body.title,
            userId: req.body.userId,
            content: req.body.content,
            publicationDate: publicationDate,
            photo: photo2 
        };

        const createdArticle = await ArticleModel.createArticle(newArticleData);
        res.status(201).json(createdArticle);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
    const articleId = req.params.articleId;
    try {
        const result = await ArticleModel.deleteArticle(articleId);
        if (result) {
            res.status(200).json({ message: 'Article deleted successfully' });
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        console.error('Error in deleteArticle controller:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getFavouriteArticles = async (req, res) => {
    const userId = req.params.userId; // Assuming you have user ID in the request
    try {
        const favourites = await ArticleModel.getFavouriteArticles(userId);
        return res.status(200).json(favourites);
    } catch (err) {
        console.error('Error getting favourite articles: ', err);
        res.status(500).send("Error retrieving favourite articles");
    }
};

const addFavouriteArticle = async (req, res) => {
    const { userId } = req.params;
    const { articleId } = req.body;
    try {
        await ArticleModel.addFavouriteArticle(userId, articleId);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add favourite' });
    }
};

const removeFavouriteArticle = async (req, res) => {
    const { userId } = req.params;
    const { articleId } = req.body;
    try {
        await ArticleModel.removeFavouriteArticle(userId, articleId);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove favourite' });
    }
};

const isFavouriteArticle = async (req, res) => {
    const { userId, articleId } = req.params;
    console.log('Controller isFavourite userId: ', userId);
    console.log('Controller isFavourite articleId: ', articleId);
    try {
        const isFavourite = await ArticleModel.isFavouriteArticle(userId, articleId);
        console.log('Controller isFavourite function: ', isFavourite);
        res.status(200).json(isFavourite);
    } catch (error) {
        res.status(500).json({ error: 'Failed to check if article is favourite' });
    }
};

const getArticleById = async (req, res) => {
    const articleId = req.params.articleId;
    try {
        const article = await ArticleModel.getArticleById(articleId);

        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }

        
        // if (article.photo) {
        //     article.photo = Buffer.from(article.photo).toString('base64'); //converting photo
        // }
        res.status(200).json(article);
    } catch (error) {
        console.error('Error fetching article by ID:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getArticlesByUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const article = await ArticleModel.getArticlesByUser(userId);

        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }

        res.status(200).json(article);
    } catch (error) {
        console.error('Error fetching article by user:', error);
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
    getArticleById,
    getArticlesByUser,
    isFavouriteArticle
};
