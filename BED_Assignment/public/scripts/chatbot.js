// Function to adjust the height of the textarea based on its content
function adjustTextareaHeight() {
    textarea.style.height = 'auto'; // Reset textarea height
    textarea.style.height = textarea.scrollHeight + 'px'; // Set textarea height to content height
}

function toggleSideBar() {
    const gridContainer = document.querySelector(".grid-container");
    gridContainer.classList.toggle("sidebar-hidden");
    
    const sidebar = document.querySelector(".sidebar-container");
    sidebar.classList.toggle("hidden");
}

// Select the textarea element
const textarea = document.querySelector('.queryBar textarea');
// Call the function initially and whenever the textarea content changes
textarea.addEventListener('input', adjustTextareaHeight);

// Select the textarea and button elements
const userInput = document.getElementById('queryText');
const sendButton = document.getElementById('submitQuery');


const sideBarController = document.querySelector(".sideBarController");
sideBarController.addEventListener("click", toggleSideBar);

// Function to handle sending the message
async function sendMessage(conversationId) {
    const message = userInput.value.trim();
    if (message !== '') {
        const messageWithBreaks = message.replace(/\n/g, '<br>');
        console.log('Sending message:', messageWithBreaks);
        userInput.value = '';
        textarea.style.height = 'auto';

        const userMessageDiv = document.createElement('div');
        userMessageDiv.classList.add('user-message');
        const userMessageParagraph = document.createElement('p');
        userMessageParagraph.innerHTML = messageWithBreaks;
        userMessageDiv.appendChild(userMessageParagraph);

        const conversationWrapper = document.querySelector('.conversation-wrapper');
        conversationWrapper.appendChild(userMessageDiv);

        scrollToBottomOfChat();

        let modelMessage;
        try {
            const response = await fetch(`/api/chatbot/${conversationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: message, conversationId: conversationId })
            });
            const data = await response.json();
            modelMessage = data.message; // Adjust this based on your backend response structure
        } catch (error) {
            console.error('Error fetching data from backend:', error);
            modelMessage = 'Sorry, something went wrong while fetching data from the backend.';
        }
        updateUI(modelMessage);
    }
}

// Function to update the UI with user message and model message
function updateUI(modelMessage) {
    const modelMessageDiv = document.createElement('div');
    modelMessageDiv.classList.add('chat-message');
    const modelMessageContent = parseModelMessage(modelMessage);
    modelMessageDiv.innerHTML = modelMessageContent;

    const conversationWrapper = document.querySelector('.conversation-wrapper');
    conversationWrapper.appendChild(modelMessageDiv);

    // Scroll the last message into view
    scrollToBottomOfChat();
}

// Function to parse model message into HTML content
function parseModelMessage(modelMessage) {
    console.log(modelMessage);
    let htmlContent = modelMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    htmlContent = htmlContent.replace(/\* (.*?)\n/g, '<li>$1</li>');
    htmlContent = htmlContent.replace(/\n\n/g, '<br><br>');
    htmlContent = `<p>${htmlContent}</p>`;
    htmlContent = htmlContent.replace(/<\/strong><li>/g, '</strong><ul><li>');
    htmlContent = htmlContent.replace(/<\/li><li>/g, '</li><li>');
    htmlContent = htmlContent.replace(/<\/li><br><strong>/g, '</li></ul><strong>');
    htmlContent = htmlContent.replace(/<\/p><strong>/g, '</p><h2>');
    htmlContent = htmlContent.replace(/<\/strong><ul>/g, '</h2><ul>');

    return htmlContent;
}

function scrollToBottomOfChat(){
    // Scroll the last message into view
    const mainChatWrapper = document.querySelector('.mainchat-wrapper');
    mainChatWrapper.scrollTo({
        top: mainChatWrapper.scrollHeight,
        behavior: 'smooth'
    });
}

async function populateChatConversation(userId) {
    if (userId === null) {
        alert("Please login / register for an account before accessing this.");
        return;
    } else {
        try {
            console.log(userId);
            let response = await fetch(`/api/chatConversation/${userId}`);
            let data = await response.json();

            if (data.length === 0) {
                // Add a new conversation with the title "New Chat"
                response = await fetch(`/api/chatConversation/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ conversationTitle: "New Chat" })
                });

                // Fetch the conversations again after adding the new one
                response = await fetch(`/api/chatConversation/${userId}`);
                data = await response.json();
            }

            console.log(data);

            // Get the chat-conversation-group div
            const chatConversationGroup = document.getElementById('chat-conversation-group');

            // Clear any existing content in the chat-conversation-group div
            chatConversationGroup.innerHTML = '';

            // Flag to set aria-current="true" for the first element
            let isFirst = true;
            let firstConversationId;

            // Iterate over the conversations and append each one to the div
            data.forEach(conversation => {
                const conversationElement = document.createElement('a');
                conversationElement.href = '#';
                conversationElement.dataset.conversationId = conversation.conversationId;

                if (isFirst) {
                    conversationElement.setAttribute('aria-current', 'true');
                    conversationElement.className = 'list-group-item list-group-item-action active py-3 lh-sm';
                    isFirst = false;
                    firstConversationId =  conversation.conversationId;
                } else{
                    conversationElement.className = 'list-group-item list-group-item-action py-3 lh-sm';
                }

                const innerDiv = document.createElement('div');
                innerDiv.className = 'd-flex w-100 align-items-center justify-content-between';

                const strong = document.createElement('strong');
                strong.className = 'mb-1 conversation-title';
                strong.textContent = conversation.conversationTitle;

                innerDiv.appendChild(strong);
                conversationElement.appendChild(innerDiv);

                chatConversationGroup.appendChild(conversationElement);

                conversationElement.addEventListener("click", async() =>{
                    const conversationId = conversationElement.dataset.conversationId;
                    populateChatHistory(conversationId);
                    
                    // Remove active class from currently active conversation
                    const activeChatConversation = document.querySelector(".list-group-item.list-group-item-action.active.py-3.lh-sm");
                    if (activeChatConversation) {
                        activeChatConversation.classList.remove("active");
                    }
                
                    // Add active class to the clicked conversation
                    const newActiveConversation = document.querySelector(`.list-group-item.list-group-item-action.py-3.lh-sm[data-conversation-id="${conversationId}"]`);
                    if (newActiveConversation) {
                        newActiveConversation.classList.add("active");
                    }
                })
            });

            return firstConversationId;
        } catch (error) {
            console.error('Error fetching chat conversations:', error);
        }
    }
}

// Function to populate chat history when window is loaded
async function populateChatHistory(conversationId) {
    try {
        const response = await fetch(`/api/chatbot/${conversationId}`);
        const data = await response.json();
        const chatHistory = data.chatHistory; // Adjust this based on your backend response structure

        const conversationWrapper = document.querySelector('.conversation-wrapper');
        conversationWrapper.innerHTML='';

        chatHistory.forEach(history => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add(history.role === 'user' ? 'user-message' : 'chat-message');
            const messageParagraph = document.createElement('p');
            messageParagraph.innerHTML = parseModelMessage(history.text);
            messageDiv.appendChild(messageParagraph);

            conversationWrapper.appendChild(messageDiv);
        });

        if (!chatHistory || chatHistory.length <= 2){
            return
        } else{
            scrollToBottomOfChat();
        }
    } catch (error) {
        console.error('Error fetching chat history from backend:', error);
    }
}

function getUser(){
    const token = localStorage.getItem('token');
    let currentUserId;
    if (token){
        const userDetails = jwt_decode(token);
        currentUserId = userDetails.userId;
    } else{
        alert("Please login / register for an account before accessing this.");
        window.location.href="/login";
        currentUserId = null
    }

    console.log(currentUserId);
    return currentUserId;
}

function getCurrentConversation(){
    const activeChatConversation = document.querySelector(".list-group-item.list-group-item-action.active.py-3.lh-sm");
    const currentConversationId = activeChatConversation.dataset.conversationId;
    return currentConversationId;
}

function getNoOfConversations(){
    const chatConversationGroup = document.getElementById("chat-conversation-group");
    const chatList = chatConversationGroup.querySelectorAll('.list-group-item');

    const numberOfChat = chatList.length;
    return numberOfChat;
}

const userId = getUser();

// Populate chat history when the window is loaded
window.addEventListener('load', async() => {
    const firstConversationId = await populateChatConversation(userId);
    populateChatHistory(firstConversationId);
});

// Event listener for Enter key press in textarea
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        console.log(getCurrentConversation());
        sendMessage(getCurrentConversation());
    }
});

// Event listener for Send button click
sendButton.addEventListener('click', function() {
    sendMessage(getCurrentConversation());
});

