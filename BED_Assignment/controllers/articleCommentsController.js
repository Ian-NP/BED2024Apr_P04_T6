import ArticleComments from "../models/articleComments"

const getAllCommentsFromArticleIdByLatest = async(req, res) =>{
    const articleId = parseInt(req.params.articleId);
    
    try{
        const articleComments = await ArticleComments.getAllCommentsFromArticleIdByLatest(articleId);
        return res.status(200).json(articleComments);
    } catch(err){
        console.error('Error getting comments for ArticleId: ', err);
        res.status(500).send("Error retrieving comments for ArticleId");
    }
}

const getAllCommentsFromArticleIdByRelevance = async(req, res) =>{
    const articleId = parseInt(req.params.articleId);
    
    try{
        const articleComments = await ArticleComments.getAllCommentsFromArticleIdByRelevance(articleId);
        return res.status(200).json(articleComments);
    } catch(err){
        console.error('Error getting comments for ArticleId: ', err);
        res.status(500).send("Error retrieving comments for ArticleId");
    }
}

const getArticleCommentById = async(req, res) =>{
    const commentId = parseInt(req.params.commentId);

    try{
        const articleComment = await ArticleComments.getArticleCommentById(commentId);
        return res.status(200).json(articleComment);
    } catch(err){
        console.error(`Error getting comments for commentId: ${commentId}`, err);
        res.status(500).send("Error retrieving comment for commentId");
    }
}

const createArticleComment = async (req, res) => {
    const newCommentData = req.body;

    try {
        const createdArticleComment = await ArticleComments.createArticleComment(newCommentData);
        res.status(201).json(createdArticleComment);
    } catch (err) {
        console.error('Error creating comment', err);

        // Check if the error message indicates an articleId mismatch
        if (err.message === "The articleId of the parent comment does not match the articleId of the new comment.") {
            res.status(400).send("ArticleId mismatch with parent comment");
        } else {
            res.status(500).send("Error creating comment");
        }
    }
}

const updateArticleCommentContent = async(req, res) =>{
    const commentId =  req.body.commentId;
    const newContent = req.body.content;
    const newScore = req.body.score;

    try{
        const updatedArticleComment = await ArticleComments.updateArticleCommentContent(commentId, newContent, newScore);
        if (!updatedArticleComment){
            return res.status(404).send("Comment not found");
        }
        res.status(200).json(updatedArticleComment);
    } catch(err){
        console.error(err);
        if (err.message === "At least one of newContent or newScore must be provided."){
            res.status(400).send("At least one of newContent or newScore must be provided.");
        } else{
            res.status(500).send("Error updating comment");
        }
    }
};

const deleteArticleComment = async(req, res) =>{
    const commentId = req.body.commentId;

    try{
        const deletedArticleComment = await ArticleComments.deleteArticleComment(commentId);
        if (!deletedArticleComment){
            return res.status(404).send("Comment not found");
        }
        return res.status(204).send();
    } catch(err){
        console.error(err);
        res.status(500).send("Error deleting comment");
    }
}

module.exports = {
    getAllCommentsFromArticleIdByLatest,
    getAllCommentsFromArticleIdByRelevance,
    getArticleCommentById,
    createArticleComment,
    updateArticleCommentContent,
    deleteArticleComment
}