import EventComments from "../models/eventComments"

const getAllCommentsFromEventId = async(req, res) =>{
    const eventId = parseInt(req.params.eventId);
    
    try{
        const eventComments = await EventComments.getAllCommentsFromEventId(eventId);
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

const createEventComment = async(req, res) =>{
    const newCommentData = req.body;

    try{
        const createdEventComment = await EventComments.createEventComment(newCommentData);
        res.status(201).json(createdEventComment);
    } catch(err){
        console.error('Error creating comment', err);
        res.status(500).send("Error creating comment");
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
        res.status(500).send("Error updating comment");
    }
};

const deleteEventComment = async(req, res) =>{
    const commentId = req.body.commentId;

    try{
        const deletedEventComment = await EventComments.deleteEventComment(commentId);
        if (!deletedEventComment){
            return res.status(404).send("Comment not found");
        }
        return res.status(204).send();
    } catch(err){
        console.error(err);
        res.status(500).send("Error deleting comment");
    }
}

module.exports = {
    getAllCommentsFromEventId,
    getEventCommentById,
    createEventComment,
    updateEventCommentContent,
    deleteEventComment
}