// chatbot-with-history.js

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const closeBtn = document.querySelector(".close-btn");
  const chatbox = document.querySelector(".chatbox");
  const chatInput = document.querySelector(".chat-input textarea");
  const sendChatBtn = document.querySelector("#send-btn");
  const historyToggle = document.getElementById('historyToggle');
  const historyPanel = document.getElementById('historyPanel');
  const historyContent = document.getElementById('historyContent');

  // Initial input box height
  const inputInitHeight = chatInput.scrollHeight;

  // Gemini API Configuration
  const API_KEY = "AIzaSyCmpP41ZS_kLjnZyy-0JDlwHT2vAZyHJU4";
  const MODEL_NAME = "gemini-2.0-flash";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  // Initialize chat history
  let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

  // Create chat message bubble
  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    chatLi.innerHTML = className === "outgoing"
      ? `<p>${message}</p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    return chatLi;
  };

  // Check if message is chess-related
  const isChessRelated = (text) => {
    const chessKeywords = [
      "chess", "pawn", "bishop", "knight", "rook", "queen", "king",
      "checkmate", "stalemate", "opening", "defense", "Sicilian",
      "endgame", "gambit", "ELO", "chessboard", "FEN", "PGN"
    ];
    text = text.toLowerCase();
    return chessKeywords.some(keyword => text.includes(keyword));
  };

  // Save message to history
  const saveToHistory = (message, isUser) => {
    chatHistory.push({
      message: message,
      isUser: isUser,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    updateHistoryUI();
  };

  // Update history panel UI
  const updateHistoryUI = () => {
    if (!historyContent) return;
    
    historyContent.innerHTML = '';
    if (chatHistory.length === 0) {
      historyContent.innerHTML = '<p class="text-gray-500">No chat history yet</p>';
      return;
    }

    // Display history in reverse order (newest first)
    [...chatHistory].reverse().forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = `p-3 mb-2 rounded-lg ${item.isUser ? 'bg-blue-100' : 'bg-purple-100'}`;
      historyItem.innerHTML = `
        <div class="flex justify-between items-center mb-1">
          <span class="font-semibold ${item.isUser ? 'text-blue-600' : 'text-purple-600'}">
            ${item.isUser ? 'You' : 'Assistant'}
          </span>
          <span class="text-xs text-gray-500">
            ${new Date(item.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p>${item.message}</p>
      `;
      historyContent.appendChild(historyItem);
    });
  };

  // Clear chat history
  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      chatHistory = [];
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      updateHistoryUI();
    }
  };

  // Generate Gemini AI response
  const generateResponse = async (chatElement, userMessage) => {
    const messageElement = chatElement.querySelector("p");

    // Restrict non-chess questions
    if (!isChessRelated(userMessage)) {
      messageElement.textContent = "❌ OOPS! Please ask a question related to chess.";
      return;
    }

    const prompt = `
You are a chess strategy assistant. Provide helpful and clear answers to chess-related questions only. Do not answer anything not related to chess.

User's question:
"${userMessage}"
`;

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }),
    };

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
      messageElement.textContent = aiText;
      saveToHistory(aiText, false);
    } catch (error) {
      messageElement.classList.add("error");
      messageElement.textContent = `Error: ${error.message}`;
    } finally {
      chatbox.scrollTo(0, chatbox.scrollHeight);
    }
  };

  // Handle message send
  const handleChat = () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Clear and reset height
    chatInput.value = "";
    chatInput.style.height = "auto";

    // Display user's message
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    // Save user message to history
    saveToHistory(userMessage, true);

    // Show bot "thinking..." and fetch response
    setTimeout(() => {
      const incomingChatLi = createChatLi("Thinking...", "incoming");
      chatbox.appendChild(incomingChatLi);
      generateResponse(incomingChatLi, userMessage);
    }, 600);
  };

  // Event Listeners
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  });

  chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = chatInput.scrollHeight + "px";
  });

  sendChatBtn.addEventListener("click", handleChat);

  document.querySelectorAll(".suggest-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      chatInput.value = btn.textContent;
      handleChat();
    });
  });

  closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
  chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

  if (historyToggle && historyPanel) {
    historyToggle.addEventListener('click', () => {
      historyPanel.classList.toggle('show');
      updateHistoryUI();
    });
  }

  // Initialize history UI
  updateHistoryUI();
});