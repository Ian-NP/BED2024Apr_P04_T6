// Sample User object in the session storage
class User {
    constructor(userId, username, profilePic) {
        this.userId = userId;
        this.username = username;
        this.profilePic = profilePic;
    }
}

class Page{
    constructor(page, pageId){
        this.page = page;
        this.pageId = pageId;
    }
}

const user = new User(1, "Optimus Prime", "https://avatarfiles.alphacoders.com/341/341848.png");
sessionStorage.setItem("User", JSON.stringify(user));

// Function for converting the timeStamp ISO date to date text for comment
const commentPostedTime = (timeInMileSec) => {
    const sec = (timeInMileSec / 1000).toFixed(0);
    const min = (timeInMileSec / (1000 * 60)).toFixed(0);
    const hrs = (timeInMileSec / (1000 * 60 * 60)).toFixed(0);
    const days = (timeInMileSec / (1000 * 60 * 60 * 24)).toFixed(0);
    const weeks = (timeInMileSec / (1000 * 60 * 60 * 24 * 7)).toFixed(0);
    const months = (timeInMileSec / (1000 * 60 * 60 * 24 * 31)).toFixed(0);
    const years = (timeInMileSec / (1000 * 60 * 60 * 24 * 12)).toFixed(0);
  
    if (sec < 60) {
      return "seconds ago";
    } else if (min < 60) {
      return min + " mins ago";
    } else if (hrs < 24) {
      return hrs + " hrs ago";
    } else if (days < 7) {
      return days + " days ago";
    } else if (weeks < 4) {
      return weeks + " weeks ago";
    } else if (months < 12) {
      return months + " months ago";
    } else {
      return years + " year";
    }
};

function getCommentPage(){
    const pathname = window.location.pathname; // e.g., /article/1
    const pathSegments = pathname.split('/'); // Splits the pathname into an array: ["", "article", "1"]
    let page;
    if (pathSegments[1] == "article"){
        const articleId = pathSegments[2];
        page = new Page(pathSegments[1], articleId);
    } else{
        const eventId = pathSegments[2];
        page = new Page(pathSegments[1], eventId);
    }
    return page
}

const page = getCommentPage();

async function fetchComments() {
    if (page.page === "article"){
        const response = await fetch(`/api/article/${page.pageId}/comments`);
        const comments = await response.json();
        displayComments(comments);
    } else{
        const response = await fetch(`/api/event/${page.pageId}/comments`);
        const comments = await response.json();
        displayComments(comments);
    }
}

fetchComments();

async function createCommentContainer(comment){
    // Get the value of the comment input
    const commentText = comment.content;

    // const user = await fetch(`api/user/${comment.userId}`);
    // Uncomment the top line and delete bottom line once the user api is done
    const user = JSON.parse(sessionStorage.getItem('User'));

    // Get user data from sessionStorage
    if (user) {
        // Get user data from sessionStorage
        const userId = parseInt(user.userId);
        const username = user.username;
        const profilePic = user.profilePic;

        // Get the current date and time
        const dateOfComment = comment.timeStamp // output Eg.: "2024-06-14T19:14:23.200Z"
        const commentDate = new Date(dateOfComment);
        const commentDateLocal = new Date(commentDate.getTime());
        // console.log(commentDateLocal.getTime());

        const currentDate = new Date();
        // console.log(currentDate.getTime());

        // console.log(currentDate.getTime() - commentDateLocal.getTime());
        const formattedDate = commentPostedTime(currentDate.getTime() - commentDateLocal.getTime());

        // Create a new comment container
        const newCommentContainer = document.createElement('div');
        newCommentContainer.classList.add('comment-container');
        const getCommentId = comment.commentId;
        const getCommentLevel = comment.level;
        newCommentContainer.setAttribute('data-commentid', `${getCommentId}`);
        newCommentContainer.setAttribute('data-commentlevel', `${getCommentLevel}`)

        // Create the comment structure
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');

        // Create the comment-votes section
        const commentVotes = document.createElement('div');
        commentVotes.classList.add('comment-votes');

        const plusBtn = document.createElement('button');
        plusBtn.classList.add('plus-btn');
        const plusIcon = document.createElement('i');
        plusIcon.classList.add('fa-solid', 'fa-plus');
        plusBtn.appendChild(plusIcon);
        commentVotes.appendChild(plusBtn);

        const getCommentScore = comment.score;
        const commentScore = document.createElement('p');
        commentScore.classList.add('comment-score');
        commentScore.setAttribute('data-initial-score', `${getCommentScore}`);
        commentScore.textContent = `${getCommentScore}`;
        commentVotes.appendChild(commentScore);

        const minusBtn = document.createElement('button');
        minusBtn.classList.add('minus-btn');
        const minusIcon = document.createElement('i');
        minusIcon.classList.add('fa-solid', 'fa-minus');
        minusBtn.appendChild(minusIcon);
        commentVotes.appendChild(minusBtn);

        commentDiv.appendChild(commentVotes);

        // Create the comment-body section
        const commentBody = document.createElement('div');
        commentBody.classList.add('comment-body');

        const commentHeader = document.createElement('div');
        commentHeader.classList.add('comment-header');

        const profilePicDiv = document.createElement('div');
        profilePicDiv.classList.add('profile-pic');
        profilePicDiv.style.backgroundImage = `url('${profilePic}')`;
        commentHeader.appendChild(profilePicDiv);

        const usernameDiv = document.createElement('div');
        usernameDiv.classList.add('username');
        usernameDiv.textContent = username;
        commentHeader.appendChild(usernameDiv);

        const timeDiv = document.createElement('div');
        timeDiv.classList.add('comment-posted-time');
        timeDiv.textContent = formattedDate;
        commentHeader.appendChild(timeDiv);

        const commentBtns = document.createElement('div');
        commentBtns.classList.add('comment-btns');

        const replyBtn = document.createElement('button');
        replyBtn.classList.add('reply-btn');
        const replyIcon = document.createElement('i');
        replyIcon.classList.add('fas', 'fa-reply');
        replyBtn.appendChild(replyIcon);
        const replyText = document.createTextNode(" Reply ");
        replyBtn.appendChild(replyText);
        commentBtns.appendChild(replyBtn);

        if (userId === comment.userId){
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            const editIcon = document.createElement('i');
            editIcon.classList.add('fas', 'fa-edit');
            editBtn.appendChild(editIcon);
            const editText = document.createTextNode(" Edit ");
            editBtn.appendChild(editText)
            commentBtns.appendChild(editBtn);
    
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fa-solid', 'fa-trash');
            deleteBtn.appendChild(deleteIcon);
            const deleteText = document.createTextNode(" Delete ");
            deleteBtn.appendChild(deleteText);
            commentBtns.appendChild(deleteBtn);
        }

        commentHeader.appendChild(commentBtns);
        commentBody.appendChild(commentHeader);

        const commentContent = document.createElement('div');
        commentContent.classList.add('comment-content');

        const commentTextContent = document.createElement('p');
        commentTextContent.classList.add('comment-text-content');
        commentTextContent.textContent = commentText;
        commentContent.appendChild(commentTextContent);

        commentBody.appendChild(commentContent);
        commentDiv.appendChild(commentBody);

        newCommentContainer.appendChild(commentDiv);
        console.log(newCommentContainer);

        return newCommentContainer;
    } else {
        // If user data does not exist in sessionStorage, handle it accordingly
        alert('User data not found.');
    }
}

const displayComments = (comments) =>{
    const commentSectionContainerDiv = document.getElementById('comment-section-container');
    
    // Logic for displayingComments
    comments.forEach(async(comment) => {
        if (comment.level === 0) {
            console.log("Parent Comment:", comment);
            // Display parent comment logic here
            const newCommentContainer = await createCommentContainer(comment);

            // Appending the replyContainer that is only present in level 0 comments
            const replyContainer = document.createElement('div');
            replyContainer.classList.add("reply-container");
            newCommentContainer.appendChild(replyContainer);

            commentSectionContainerDiv.appendChild(newCommentContainer);
        } else if (comment.level === 1) {
            console.log("Child Comment Level 1:", comment);
            // Display child comment level 1 logic here
            const newCommentContainer = await createCommentContainer(comment);

            // Appending the replyContainer that is only present in level 0 comments
            const replyContainer = document.createElement('div');
            replyContainer.classList.add("reply-container");
            newCommentContainer.appendChild(replyContainer);

            const commentContainerDivs = commentSectionContainerDiv.querySelectorAll('.comment-container');
            commentContainerDivs.forEach(commentContainerDiv => {
                if (parseInt(commentContainerDiv.getAttribute('data-commentid')) === comment.parentCommentId){
                    const replyContainer = commentContainerDiv.querySelector('.reply-container');
                    replyContainer.appendChild(newCommentContainer);
                }
            });
        } else if(comment.level === 2) {
            console.log("Comment Level = 2:", comment);

            // Display deeper level comments if necessary
            const newCommentContainer = await createCommentContainer(comment);
            const commentContainerDivs = commentSectionContainerDiv.querySelectorAll('.comment-container');
            console.log(commentContainerDivs);
            commentContainerDivs.forEach(commentContainerDiv => {
                if (parseInt(commentContainerDiv.getAttribute('data-commentid')) === comment.parentCommentId){
                    const replyContainer = commentContainerDiv.querySelector('.reply-container');
                    replyContainer.appendChild(newCommentContainer);
                }
            });
        } else{
            console.log("Comment Level > 2:", comment);

            // Display deeper level comments if necessary
            const newCommentContainer = await createCommentContainer(comment);
            const commentContainerDivs = commentSectionContainerDiv.querySelectorAll('.comment-container');
            console.log(commentContainerDivs);
            commentContainerDivs.forEach(commentContainerDiv => {
                if (parseInt(commentContainerDiv.getAttribute('data-commentid')) === comment.parentCommentId){
                    const parentReplyContainer = commentContainerDiv.parentElement;
                    parentReplyContainer.appendChild(newCommentContainer);
                }
            });
        }
    });
}

async function getCommentById(commentId){
    const response = await fetch(`/api/article/comment/${commentId}`);
    const comment = await response.json();
    return comment;
}

async function postComment(content, score, timeStamp, userId, parentCommentId) {
    let newCommentData;

    if (page.page === "article"){
        const articleId = page.pageId;
        newCommentData = {
            content: content,
            score: score, // Assuming a new comment starts with a score of 0
            timeStamp: timeStamp,
            userId: userId,
            articleId: articleId,
            parentCommentId: parentCommentId
        };
    } else{
        const eventId = page.pageId;
        newCommentData = {
            content: content,
            score: score, // Assuming a new comment starts with a score of 0
            timeStamp: timeStamp,
            userId: userId,
            eventId: eventId,
            parentCommentId: parentCommentId
        };
    }
    try {
        // Send the POST request to the backend
        const response = await fetch(`/api/${page.page}/${page.pageId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newCommentData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const createdComment = await response.json();
        return createdComment;
    } catch (error) {
        console.error('Error creating comment:', error);
    }
}

async function updateComment(commentId, newContent=null, newScore=null){
    console.log(commentId);
    console.log(newContent);
    console.log(newScore);
    
    const updateCommentData = {
        commentId: commentId,
        content: newContent,
        score: newScore
    };

    try {
        // Send the POST request to the backend
        const response = await fetch(`/api/${page.page}/${page.pageId}/comments`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateCommentData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const updatedComment = await response.json();
        return updatedComment;
    } catch (error) {
        console.error('Error updating comment:', error);
    }
}

async function deleteComment(commentId) {
    const deleteCommentData = {
        commentId: commentId
    };

    try {
        // Send the DELETE request to the backend
        const response = await fetch(`/api/${page.page}/${page.pageId}/comments`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deleteCommentData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // If you don't need a response, just return a success indicator
        return true;
    } catch (error) {
        console.error('Error deleting comment:', error);
        return false; // or throw the error if you want to handle it further up the chain
    }
}


const commentSectionContainer = document.querySelector('.comment-section-container');

// Attach click event listener to the comment section container
commentSectionContainer.addEventListener('click', async(event) => {
    console.log(event.target.classList);

    // Increase score logic
    if (event.target.classList.contains('fa-plus')){
        const plusBtn = event.target.parentElement;
        console.log(plusBtn);

        let scoreElement = plusBtn.parentElement.querySelector('.comment-score');
        let currentScore = parseInt(scoreElement.textContent);
        let initialScore = parseInt(scoreElement.dataset.initialScore);
        if (initialScore === currentScore){
            currentScore = initialScore + 1;
            plusBtn.disabled = true;
        } else if(currentScore === initialScore - 1){
            currentScore = initialScore;
            plusBtn.closest('.comment-votes').querySelector('.minus-btn').disabled = false;
        }

        // Update score here
        const commentContainer = plusBtn.closest('.comment-container');
        const commentId = commentContainer.getAttribute('data-commentid');
        await updateComment(commentId, null, currentScore);
        scoreElement.textContent = currentScore;
    }

    // Decrease Score Logic
    if (event.target.classList.contains('fa-minus')){
        const minusBtn = event.target.parentElement;
        console.log(minusBtn);

        let scoreElement = minusBtn.parentElement.querySelector('.comment-score');
        let currentScore = parseInt(scoreElement.textContent);
        let initialScore = parseInt(scoreElement.dataset.initialScore);

        if(currentScore === initialScore + 1){
            console.log("activated");
            currentScore = initialScore;
            minusBtn.closest('.comment-votes').querySelector('.plus-btn').disabled = false;
        } else if (initialScore === currentScore){
            currentScore = initialScore - 1;
            minusBtn.disabled = true;
        } 
        
        // Update score here
        const commentContainer = minusBtn.closest('.comment-container');
        const commentId = commentContainer.getAttribute('data-commentid');
        console.log(currentScore);
        await updateComment(commentId, null, currentScore);
        scoreElement.textContent = currentScore;
    }

    // Open textarea input for them to reply to comment
    if (event.target.classList.contains('reply-btn')){
        const replyButton = event.target;
        
        // Check if add-comment div already exists
        // Get the parent comment container
        const commentContainer = replyButton.closest('.comment-container');

        // Check if add-comment div already exists within the comment container
        const addCommentDiv = commentContainer.querySelector('.add-comment');
        
        if (addCommentDiv) {
            // If add-comment div exists, remove it
            addCommentDiv.remove();
        } else {
            // If add-comment div doesn't exist, create and append it
            const newAddCommentDiv = document.createElement('div');
            newAddCommentDiv.classList.add('add-comment');

            // Create profile pic div
            const profilePicDiv = document.createElement('div');
            profilePicDiv.classList.add('profile-pic');
            newAddCommentDiv.appendChild(profilePicDiv);

            // Create textarea for comment input
            const textarea = document.createElement('textarea');
            textarea.classList.add('comment-input');
            textarea.placeholder = 'Add a comment';
            newAddCommentDiv.appendChild(textarea);

            const replyBtnsDiv = document.createElement('div');
            replyBtnsDiv.classList.add('reply-btns-div');

            // Create reply button container
            const replyBtnContainer = document.createElement('a');
            replyBtnContainer.classList.add('send-reply-btn');
            replyBtnContainer.textContent = 'Reply';
            replyBtnsDiv.appendChild(replyBtnContainer);

            // Create cancel button
            const cancelBtn = document.createElement('a');
            cancelBtn.classList.add('cancel-btn');
            cancelBtn.classList.add('cancel-reply-btn');
            cancelBtn.textContent = 'Cancel';
            replyBtnsDiv.appendChild(cancelBtn);

            newAddCommentDiv.appendChild(replyBtnsDiv);

            // Insert the new add-comment div after the current comment
            const currentComment = replyButton.closest('.comment');
            currentComment.parentNode.insertBefore(newAddCommentDiv, currentComment.nextSibling);
        }
    }

    if (event.target.classList.contains('cancel-reply-btn')){
        const cancelReplyBtn = event.target;
        const replyBtnsDiv = cancelReplyBtn.parentElement;
        const addCommentDiv = replyBtnsDiv.parentElement;
        addCommentDiv.remove();
    }

    // Open Textarea to edit comment
    if (event.target.classList.contains('edit-btn')){
        const editBtn = event.target;
        const commentBtns = editBtn.parentElement;
        const commentHeader = commentBtns.parentElement;
        const commentBody = commentHeader.parentElement;
    
        // Remove the existing comment content
        const commentContent = commentBody.querySelector('.comment-content');
        if (commentContent){
            const textAreaContent = commentContent.textContent.trim();
            console.log(textAreaContent);
            commentContent.remove();
        
            // Create a new textarea element
            const textarea = document.createElement('textarea');
            textarea.value = textAreaContent;
            textarea.classList.add('comment-input');
        
            // Append the textarea to the comment-body
            commentBody.appendChild(textarea);
    
            const editBtnsDiv = document.createElement('div');
            editBtnsDiv.classList.add('edit-btns-div');
    
            // Create and append the updateEditBtn button
            const sendEditBtn = document.createElement('a');
            sendEditBtn.classList.add('edit-comment-btn');
            sendEditBtn.textContent = 'Edit';
            editBtnsDiv.appendChild(sendEditBtn);
    
            // Create cancel button
            const cancelEditBtn = document.createElement('a');
            cancelEditBtn.classList.add('cancel-btn');
            cancelEditBtn.classList.add('cancel-edit-btn');
            cancelEditBtn.textContent = 'Cancel';
            editBtnsDiv.appendChild(cancelEditBtn);
    
            commentBody.appendChild(editBtnsDiv);
        } else{
            const textarea = commentBody.querySelector('.comment-input');
            const textAreaContent = textarea.value;
            const editBtnsDiv = commentBody.querySelector('.edit-btns-div');

            // Remove the textarea
            textarea.remove();
            editBtnsDiv.remove();

            // Create a new comment-content div
            const commentContent = document.createElement('div');
            commentContent.classList.add('comment-content');

            const commentTextContent = document.createElement('p');
            commentTextContent.classList.add('comment-text-content');

            const commentContainer = commentBody.parentElement.parentElement;
            const commentId = commentContainer.getAttribute('data-commentid');
            const prevComment = await getCommentById(commentId);

            commentTextContent.textContent = prevComment.content;

            // Append the text content to the comment content div
            commentContent.appendChild(commentTextContent);

            // Append the comment content to the comment body
            commentBody.appendChild(commentContent);
        }
    }

    // Cancel Update / Edit Comment
    if (event.target.classList.contains('cancel-edit-btn')){
        // IT SHOULD fetch current commentID and put it back in the textContent but I'm just returning the edited value for now
        const cancelEditBtn = event.target;
        const editBtnsDiv = cancelEditBtn.parentElement;
        const commentBody = editBtnsDiv.parentElement;
        
        const textarea = commentBody.querySelector('.comment-input');
        const textAreaContent = textarea.value;

        // Remove the textarea
        textarea.remove();
        editBtnsDiv.remove();

        // Create a new comment-content div
        const commentContent = document.createElement('div');
        commentContent.classList.add('comment-content');

        const commentTextContent = document.createElement('p');
        commentTextContent.classList.add('comment-text-content');
        commentTextContent.textContent = textAreaContent;

        // Append the text content to the comment content div
        commentContent.appendChild(commentTextContent);

        // Append the comment content to the comment body
        commentBody.appendChild(commentContent);
    }

    // Update / Edit Commment
    if (event.target.classList.contains('edit-comment-btn')){
        const editCommentBtn = event.target;
        const commentBody = editCommentBtn.parentElement.parentElement;

        const textarea = commentBody.querySelector('.comment-input');
        const textAreaContent = textarea.value;
        
        if (textAreaContent.trim() !== '') {
            // Remove the textarea
            textarea.remove();
            const editBtnsDiv = commentBody.querySelector('.edit-btns-div');
            editBtnsDiv.remove();

            // Create a new comment-content div
            const commentContent = document.createElement('div');
            commentContent.classList.add('comment-content');

            const commentTextContent = document.createElement('p');
            commentTextContent.classList.add('comment-text-content');
            commentTextContent.textContent = textAreaContent;

            // Append the text content to the comment content div
            commentContent.appendChild(commentTextContent);

            // Append the comment content to the comment body
            commentBody.appendChild(commentContent);

            const commentContainer = commentBody.parentElement.parentElement;
            const commentId = commentContainer.getAttribute("data-commentid");
            await updateComment(commentId, textAreaContent);
        } else{
            alert('Please enter a comment before you finish editing.')
        }
    }

    // Delete Comment
    if (event.target.classList.contains('delete-btn')){
        const commentContainerDiv = event.target.parentElement.parentElement.parentElement.parentElement.parentElement;
        const commentId = commentContainerDiv.getAttribute('data-commentid');
        await deleteComment(commentId);
        commentContainerDiv.remove();
    }

    // Check if the clicked element is a send-reply-btn
    if (event.target.classList.contains('send-reply-btn')) {
        const sendReplyButton = event.target;

        // Get the value of the comment input
        const commentInput = event.target.parentElement.parentElement.querySelector('.comment-input');
        const commentText = commentInput.value;

        // Check if comment text is not empty
        if (commentText.trim() !== '') {
            // Get user data from sessionStorage
            if (sessionStorage.getItem('User')) {
                // Get user data from sessionStorage
                const user = JSON.parse(sessionStorage.getItem('User'));
                const userId = parseInt(user.userId);
                const username = user.username;
                const profilePic = user.profilePic;

                // Get the current date and time
                const currentDate = new Date();
                const formattedDate = commentPostedTime(Date.now() - currentDate.getTime());
            

                // Creation of comment in the DB is at line 

                // Create a new comment container
                const newCommentContainer = document.createElement('div');
                newCommentContainer.classList.add('comment-container');

                // Create the comment structure
                const comment = document.createElement('div');
                comment.classList.add('comment');

                // Create the comment-votes section
                const commentVotes = document.createElement('div');
                commentVotes.classList.add('comment-votes');

                const plusBtn = document.createElement('button');
                plusBtn.classList.add('plus-btn');
                const plusIcon = document.createElement('i');
                plusIcon.classList.add('fa-solid', 'fa-plus');
                plusBtn.appendChild(plusIcon);
                commentVotes.appendChild(plusBtn);

                const commentScore = document.createElement('p');
                commentScore.classList.add('comment-score');
                commentScore.setAttribute('data-initial-score', '0');
                commentScore.textContent = '0';
                commentVotes.appendChild(commentScore);

                const minusBtn = document.createElement('button');
                minusBtn.classList.add('minus-btn');
                const minusIcon = document.createElement('i');
                minusIcon.classList.add('fa-solid', 'fa-minus');
                minusBtn.appendChild(minusIcon);
                commentVotes.appendChild(minusBtn);

                comment.appendChild(commentVotes);

                // Create the comment-body section
                const commentBody = document.createElement('div');
                commentBody.classList.add('comment-body');

                const commentHeader = document.createElement('div');
                commentHeader.classList.add('comment-header');

                const profilePicDiv = document.createElement('div');
                profilePicDiv.classList.add('profile-pic');
                profilePicDiv.style.backgroundImage = `url('${profilePic}')`;
                commentHeader.appendChild(profilePicDiv);

                const usernameDiv = document.createElement('div');
                usernameDiv.classList.add('username');
                usernameDiv.textContent = username;
                commentHeader.appendChild(usernameDiv);

                const timeDiv = document.createElement('div');
                timeDiv.classList.add('comment-posted-time');
                timeDiv.textContent = formattedDate;
                commentHeader.appendChild(timeDiv);

                const commentBtns = document.createElement('div');
                commentBtns.classList.add('comment-btns');

                const replyBtn = document.createElement('button');
                replyBtn.classList.add('reply-btn');
                const replyIcon = document.createElement('i');
                replyIcon.classList.add('fas', 'fa-reply');
                replyBtn.appendChild(replyIcon);
                const replyText = document.createTextNode(" Reply ");
                replyBtn.appendChild(replyText);
                commentBtns.appendChild(replyBtn);

                const editBtn = document.createElement('button');
                editBtn.classList.add('edit-btn');
                const editIcon = document.createElement('i');
                editIcon.classList.add('fas', 'fa-edit');
                editBtn.appendChild(editIcon);
                const editText = document.createTextNode(" Edit ");
                editBtn.appendChild(editText)
                commentBtns.appendChild(editBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn');
                const deleteIcon = document.createElement('i');
                deleteIcon.classList.add('fa-solid', 'fa-trash');
                deleteBtn.appendChild(deleteIcon);
                const deleteText = document.createTextNode(" Delete ");
                deleteBtn.appendChild(deleteText);
                commentBtns.appendChild(deleteBtn);

                commentHeader.appendChild(commentBtns);
                commentBody.appendChild(commentHeader);

                const commentContent = document.createElement('div');
                commentContent.classList.add('comment-content');

                const commentTextContent = document.createElement('p');
                commentTextContent.classList.add('comment-text-content');
                commentTextContent.textContent = commentText;
                commentContent.appendChild(commentTextContent);

                commentBody.appendChild(commentContent);
                comment.appendChild(commentBody);

                newCommentContainer.appendChild(comment);

                // Append the new comment container to the reply container
                const parentContainer = sendReplyButton.closest('.comment-container');
                const parentCommentId = parentContainer.getAttribute('data-commentid');

                // COMPLETE SYCNING CREATION OF COMMENT WITH DATABASE
                const createdCommentData = await postComment(commentText, 0, currentDate.toISOString(), userId, parentCommentId);
                newCommentContainer.setAttribute('data-commentid', createdCommentData.commentId);

                if (parentContainer) {
                    console.log(parentContainer.getAttribute('data-commentlevel'));
                    if (parseInt(parentContainer.getAttribute('data-commentlevel')) === 0){
                        const replyContainer = document.createElement('div');
                        replyContainer.classList.add("reply-container");
                        newCommentContainer.appendChild(replyContainer);
                    }

                    // Find the reply container within the parent container
                    let replyContainer = parentContainer.querySelector('.reply-container');

                    if (replyContainer) {
                        // Append the new comment container to the reply container
                        replyContainer.appendChild(newCommentContainer);
                    } else {
                        replyContainer = parentContainer.parentElement;
                    }
                    // Append the new comment container to the reply container
                    replyContainer.appendChild(newCommentContainer);

                    // Remove the entire add-comment div
                    const addCommentDiv = parentContainer.querySelector('.add-comment');
                    if (addCommentDiv) {
                        addCommentDiv.remove();
                    }
                }
            } else {
                // If user data does not exist in sessionStorage, handle it accordingly
                alert('User data not found. Please log in.');
            }
        } else {
            // If comment text is empty, display an error message or handle it accordingly
            alert('Please enter a comment before replying.');
        }
    }

    // Add a comment to the comment-section-container
    if (event.target.classList.contains("send-comment-btn")){
        const sendCommentBtn = event.target;
        const commentSectionContainerDiv = sendCommentBtn.parentElement.parentElement;

        // Get the value of the comment input
        const commentInput = commentSectionContainerDiv.querySelector('.comment-input');
        const commentText = commentInput.value;
        commentInput.value = '';

        // Check if comment text is not empty
        if (commentText.trim() !== '') {
            // Get user data from sessionStorage
            if (sessionStorage.getItem('User')) {
                // Get user data from sessionStorage
                const user = JSON.parse(sessionStorage.getItem('User'));
                const userId = parseInt(user.userId);
                const username = user.username;
                const profilePic = user.profilePic;

                // Get the current date and time
                const currentDate = new Date();
                const formattedDate = commentPostedTime(Date.now() - currentDate.getTime());

                // COMPLETE SYCNING CREATION OF COMMENT WITH DATABASE
                const createdCommentData = await postComment(commentText, 0, currentDate.toISOString(), userId, null);

                // Create a new comment container
                const newCommentContainer = document.createElement('div');
                newCommentContainer.classList.add('comment-container');
                newCommentContainer.setAttribute('data-commentid', createdCommentData.commentId);
                newCommentContainer.setAttribute('data-commentlevel', 0);

                // Create the comment structure
                const comment = document.createElement('div');
                comment.classList.add('comment');

                // Create the comment-votes section
                const commentVotes = document.createElement('div');
                commentVotes.classList.add('comment-votes');

                const plusBtn = document.createElement('button');
                plusBtn.classList.add('plus-btn');
                const plusIcon = document.createElement('i');
                plusIcon.classList.add('fa-solid', 'fa-plus');
                plusBtn.appendChild(plusIcon);
                commentVotes.appendChild(plusBtn);

                const commentScore = document.createElement('p');
                commentScore.classList.add('comment-score');
                commentScore.setAttribute('data-initial-score', '0');
                commentScore.textContent = '0';
                commentVotes.appendChild(commentScore);

                const minusBtn = document.createElement('button');
                minusBtn.classList.add('minus-btn');
                const minusIcon = document.createElement('i');
                minusIcon.classList.add('fa-solid', 'fa-minus');
                minusBtn.appendChild(minusIcon);
                commentVotes.appendChild(minusBtn);

                comment.appendChild(commentVotes);

                // Create the comment-body section
                const commentBody = document.createElement('div');
                commentBody.classList.add('comment-body');

                const commentHeader = document.createElement('div');
                commentHeader.classList.add('comment-header');

                const profilePicDiv = document.createElement('div');
                profilePicDiv.classList.add('profile-pic');
                profilePicDiv.style.backgroundImage = `url('${profilePic}')`;
                commentHeader.appendChild(profilePicDiv);

                const usernameDiv = document.createElement('div');
                usernameDiv.classList.add('username');
                usernameDiv.textContent = username;
                commentHeader.appendChild(usernameDiv);

                const timeDiv = document.createElement('div');
                timeDiv.classList.add('comment-posted-time');
                timeDiv.textContent = formattedDate;
                commentHeader.appendChild(timeDiv);

                const commentBtns = document.createElement('div');
                commentBtns.classList.add('comment-btns');

                const replyBtn = document.createElement('button');
                replyBtn.classList.add('reply-btn');
                const replyIcon = document.createElement('i');
                replyIcon.classList.add('fas', 'fa-reply');
                replyBtn.appendChild(replyIcon);
                const replyText = document.createTextNode(" Reply ");
                replyBtn.appendChild(replyText);
                commentBtns.appendChild(replyBtn);

                const editBtn = document.createElement('button');
                editBtn.classList.add('edit-btn');
                const editIcon = document.createElement('i');
                editIcon.classList.add('fas', 'fa-edit');
                editBtn.appendChild(editIcon);
                const editText = document.createTextNode(" Edit ");
                editBtn.appendChild(editText)
                commentBtns.appendChild(editBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn');
                const deleteIcon = document.createElement('i');
                deleteIcon.classList.add('fa-solid', 'fa-trash');
                deleteBtn.appendChild(deleteIcon);
                const deleteText = document.createTextNode(" Delete ");
                deleteBtn.appendChild(deleteText);
                commentBtns.appendChild(deleteBtn);

                commentHeader.appendChild(commentBtns);
                commentBody.appendChild(commentHeader);

                const commentContent = document.createElement('div');
                commentContent.classList.add('comment-content');

                const commentTextContent = document.createElement('p');
                commentTextContent.classList.add('comment-text-content');
                commentTextContent.textContent = commentText;
                commentContent.appendChild(commentTextContent);

                commentBody.appendChild(commentContent);
                comment.appendChild(commentBody);

                newCommentContainer.appendChild(comment);
                
                const replyContainer = document.createElement('div');
                replyContainer.classList.add("reply-container");
                newCommentContainer.appendChild(replyContainer);
                
                var childNodes = commentSectionContainerDiv.childNodes;
                commentSectionContainerDiv.insertBefore(newCommentContainer, childNodes[2]);
            } else {
                // If user data does not exist in sessionStorage, handle it accordingly
                alert('User data not found. Please log in.');
            }
        } else {
            // If comment text is empty, display an error message or handle it accordingly
            alert('Please enter a comment before sending a comment.');
        }
    }
});
