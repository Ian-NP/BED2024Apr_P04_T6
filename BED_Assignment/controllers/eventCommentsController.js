import EventComments from "../models/eventComments"

const getAllCommentsFromEventIdByLatest = async(req, res) =>{
    const eventId = parseInt(req.params.eventId);
    
    try{
        const eventComments = await EventComments.getAllCommentsFromEventIdByLatest(eventId);
        return res.status(200).json(eventComments);
    } catch(err){
        console.error('Error getting comments for EventId: ', err);
        res.status(500).send("Error retrieving comments for EventId");
    }
}

const getAllCommentsFromEventIdByRelevance = async(req, res) =>{
    const eventId = parseInt(req.params.eventId);
    
    try{
        const eventComments = await EventComments.getAllCommentsFromEventIdByRelevance(eventId);
        return res.status(200).json(eventComments);
    } catch(err){
        console.error('Error getting comments for EventId: ', err);
        res.status(500).send("Error retrieving comments for EventId");
    }
}

const getEventCommentById = async(req, res) =>{
    const commentId = parseInt(req.params.commentId);

    try{
        const eventComment = await EventComments.getEventCommentById(commentId);
        return res.status(200).json(eventComment);
    } catch(err){
        console.error(`Error getting comments for commentId: ${commentId}`, err);
        res.status(500).send("Error retrieving comment for commentId");
    }
}

const createEventComment = async (req, res) => {
    const newCommentData = req.body;
    console.log(newCommentData);

    try {
        const createdEventComment = await EventComments.createEventComment(newCommentData);
        res.status(201).json(createdEventComment);
    } catch (err) {
        console.error('Error creating comment', err);

        // Check if the error message indicates an eventId mismatch
        if (err.message === "The eventId of the parent comment does not match the eventId of the new comment.") {
            res.status(400).send("EventId mismatch with parent comment");
        } else {
            res.status(500).send("Error creating comment");
        }
    }
}

const updateEventCommentContent = async(req, res) =>{
    const commentId =  req.body.commentId;
    const newContent = req.body.content;
    const newScore = req.body.score;

    try{
        const updatedEventComment = await EventComments.updateEventCommentContent(commentId, newContent, newScore);
        if (!updatedEventComment){
            return res.status(404).send("Comment not found");
        }
        res.status(200).json(updatedEventComment);
    } catch(err){
        console.error(err);
        if (err.message === "At least one of newContent or newScore must be provided."){
            res.status(400).send("At least one of newContent or newScore must be provided.");
        } else{
            res.status(500).send("Error updating comment");
        }
    }
};

const deleteEventComment = async(req, res) =>{
    const commentId = req.body.commentId;

    try{
        const deletedEventComment = await EventComments.deleteEventComment(commentId);
        if (!deletedEventComment){
            return res.status(404).send("Comment not found");
        }
        return res.status(204).send("Comment deleted successfully");
    } catch(err){
        console.error(err);
        res.status(500).send("Error deleting comment");
    }
}

module.exports = {
    getAllCommentsFromEventIdByLatest,
    getAllCommentsFromEventIdByRelevance,
    getEventCommentById,
    createEventComment,
    updateEventCommentContent,
    deleteEventComment
}