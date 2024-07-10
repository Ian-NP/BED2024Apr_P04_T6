import geminiChatModel from "../geminiChatConfig"
import ChatBotHistory from "../models/geminiChatBotConversationHistory"
import ChatConversation from "../models/geminiChatConversation"

async function startChatForUser(conversationId) {
  try {
    const { formattedHistory } = await ChatBotHistory.fetchAndFormatChatHistoryForGemini(conversationId);
    const geminiChat = await geminiChatModel.startChat({
      history: formattedHistory || [
        {
          role: "user",
          parts: [
            "Hey There!",
          ],
        },
        {
          role: "model",
          parts: [
            "Hello! 👋  I'm A+4BED, your AI guide for insights across agriculture, manufacturing, and services. What can I help you with today? 😊  Are you interested in specific industry trends, current events, or perhaps looking for personalized advice? Just let me know, and I'll do my best to assist you! \n",
          ],
        },
      ] // Start with fetched formatted history or empty array
    });
    return geminiChat;
  } catch (error) {
    console.error('Error starting chat for user:', error);
    throw new Error("Error starting chat for user");
  }
}

const fetchChatHistory = async (req, res) => {
  const conversationId = req.params.conversationId;

  try {
    const { chatHistory } = await ChatBotHistory.fetchAndFormatChatHistoryForGemini(conversationId);
    if (!chatHistory || chatHistory.length === 0) {
      await ChatBotHistory.addChatHistory("user", "Hey There! What can you do?", conversationId);
      await ChatBotHistory.addChatHistory("model", "Hello! I'm A+4BED, your friendly AI guide for the agricultural, manufacturing, and service industries. I'm here to help you navigate the ever-changing landscape of these sectors. \n\nHere's what I can do:\n\n**General Industry Insights:**\n\n* **Trends and Tech:** I can explain how technologies like AI, robotics, and precision agriculture are transforming each industry, and their impact on jobs, efficiency, and sustainability.\n* **Political Winds:**  I can analyze how recent policies, regulations, and trade deals affect different industries, and what opportunities and challenges they present.\n* **Climate Change Challenges:**  I can discuss the impact of climate change on various sectors, and suggest solutions like sustainable practices, resource management, and technological innovation.\n\n**Interactive Assistance:**\n\n* **Real-time Updates:**  I can keep you informed about the latest developments, news, and trends in these industries. \n* **Answer Your Questions:**  I can answer your questions about specific practices, technologies, or challenges within the agricultural, manufacturing, or service sectors.\n* **Predictive Analytics:** I can help you understand potential growth areas, emerging trends, and future opportunities in each industry. \n\n**Personalized Recommendations:**\n\n* **Tailored Content:**  Based on your interests and past interactions, I can recommend articles, resources, and industry reports that are relevant to you.\n* **Best Practice Guidance:**  I can suggest practical strategies and best practices for businesses to adapt to technological advancements, political changes, and climate challenges.\n\n**Data Analysis and Visualization:**\n\n* **Data Insights:** I can analyze industry data and create insightful visualizations to help you understand complex trends, patterns, and relationships.\n* **Scenario Planning:** I can help you model different scenarios, considering future policies, market changes, and their impact on various sectors.\n\nLet me know what you're interested in, and I'll be happy to help you explore the fascinating world of agriculture, manufacturing, and services! \n", conversationId);
      const { chatHistory } = await ChatBotHistory.fetchAndFormatChatHistoryForGemini(conversationId);
      return res.status(200).json({ chatHistory });
    }
    return res.status(200).json({ chatHistory }); // Respond with the full chat history
  } catch (error) {
    console.error("Error fetching AI chat history:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const postUserInput = async (req, res) => {
    const query = req.body.query;
    const conversationId = req.params.conversationId;

    try {
        const geminiChat = await startChatForUser(conversationId);
        const result = await geminiChat.sendMessage(query);
        const response = await result.response;
        const text = await response.text();
        console.log("AI Response:", text);

        // Logic for adding it to the chatBotHistory
        const addUserPromptToChatHistory = await ChatBotHistory.addChatHistory("user", query, conversationId);
        const addBotResponseToChatHistory = await ChatBotHistory.addChatHistory("model", text, conversationId);

        return res.status(200).json({ message: text }); // Sending JSON response with AI text
    } catch (error) {
        console.error("Error querying AI:", error);
        return res.status(500).json({ error: "Internal Server Error" }); // Example error response
    }
};

const fetchChatConversationsByUserId = async (req, res) =>{
  const userId = req.params.userId;
  
  try{
    const chatConversations = await ChatConversation.fetchChatConversationsByUserId(userId);
    return res.status(200).json(chatConversations);
  } catch(err){
      console.error(`Error getting chatConversations for userId: ${userId}`, err);
      res.status(500).send(`Error retrieving comments for userId: ${userId}`);
  }
}

const addNewConversation = async (req, res) =>{
  const userId = req.params.userId;
  const conversationTitle = req.body.conversationTitle;

  try{
    const newChatConversation = await ChatConversation.addNewConversation(conversationTitle, userId);
    res.status(201).json(newChatConversation);
  } catch(err){
      console.error('Error creating conversation', err);
      res.status(500).send("Error creating conversation");
  }
}

const editConversationTitle = async (req, res) => {
  const newTitle = req.body.conversationTitle
  const conversationId = req.params.conversationId;

  try{
    const updatedConversation = await ChatConversation.editConversationTitle(newTitle, conversationId);
    if (!updatedConversation){
      return res.status(404).send("Conversation not found");
    }
    return res.status(200).json(updatedConversation);
  } catch(err){
    console.error(err);
    res.status(500).send("Error updating conversationTitle");
  }
};

const deleteChatConversation = async (req, res) => {
  const conversationId = req.params.conversationId;

  try {
      const deleteConversation = await ChatConversation.deleteChatConversation(conversationId);
      if (deleteConversation) {
          res.status(204).json({ message: 'Conversation deleted successfully' });
      } else {
          res.status(404).json({ message: 'Conversation not found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Error deleting conversation', error: error.message });
  }
};
module.exports = {
  fetchChatHistory,
  postUserInput,
  fetchChatConversationsByUserId,
  addNewConversation,
  editConversationTitle,
  deleteChatConversation
};