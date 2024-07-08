import geminiChatModel from "../geminiChatConfig"
import ChatBotHistory from "../models/geminiChatBotConversationHistory"

async function startChatForUser(userId) {
  try {
    const { formattedHistory } = await ChatBotHistory.fetchAndFormatChatHistoryForGemini(userId);
    const geminiChat = await geminiChatModel.startChat({
      history: formattedHistory || [], // Start with fetched formatted history or empty array
    });
    return geminiChat;
  } catch (error) {
    console.error('Error starting chat for user:', error);
    throw new Error("Error starting chat for user");
  }
}

const fetchChatHistory = async (req, res) => {
  const userId = req.params.userId;

  try {
    const { chatHistory } = await ChatBotHistory.fetchAndFormatChatHistoryForGemini(userId);
    res.json({ chatHistory }); // Respond with the full chat history
  } catch (error) {
    console.error("Error fetching AI chat history:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const postUserInput = async (req, res) => {
    const query = req.body.query;
    const userId = req.params.userId;

    try {
        const geminiChat = await startChatForUser(userId);
        const result = await geminiChat.sendMessage(query);
        const response = await result.response;
        const text = await response.text();
        console.log("AI Response:", text);

        // Logic for adding it to the chatBotHistory
        const addUserPromptToChatHistory = await ChatBotHistory.addChatHistory("user", query, userId);
        const addBotResponseToChatHistory = await ChatBotHistory.addChatHistory("model", text, userId);

        return res.status(200).json({ message: text }); // Sending JSON response with AI text
    } catch (error) {
        console.error("Error querying AI:", error);
        return res.status(500).json({ error: "Internal Server Error" }); // Example error response
    }
};

const clearChatHistoryFromUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const success = await ChatBotHistory.clearChatHistoryFromUserId(userId);
    if (success) {
      res.json({ message: "Chat history cleared successfully." });
    } else {
      res.status(404).json({ error: "No chat history found for the given user ID." });
    }
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  fetchChatHistory,
  postUserInput,
  clearChatHistoryFromUserId
};