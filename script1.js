document.addEventListener('DOMContentLoaded', () => {
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const closeBtn = document.querySelector(".close-btn");
  const chatbox = document.querySelector(".chatbox");
  const chatInput = document.querySelector(".chat-input textarea");
  const sendChatBtn = document.querySelector("#send-btn");

  const inputInitHeight = chatInput.scrollHeight;

  // ✅ Gemini API Configuration
  const API_KEY = "AIzaSyCmpP41ZS_kLjnZyy-0JDlwHT2vAZyHJU4";
  const MODEL_NAME = "gemini-2.0-flash";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    chatLi.innerHTML = className === "outgoing"
      ? `<p>${message}</p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    return chatLi;
  };

  const generateResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: userMessage }]
          }
        ]
      }),
    };

  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    chatLi.innerHTML = className === "outgoing"
      ? `<p>${message}</p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    return chatLi;
  };

 

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
      messageElement.textContent = aiText;
    } catch (error) {
      messageElement.classList.add("error");
      messageElement.textContent = `Error: ${error.message}`;
    } finally {
      chatbox.scrollTo(0, chatbox.scrollHeight);
    }
  };

  const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
      const incomingChatLi = createChatLi("Thinking...", "incoming");
      chatbox.appendChild(incomingChatLi);
      generateResponse(incomingChatLi);
    }, 600);
  };

  document.querySelectorAll(".suggest-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      chatInput.value = btn.textContent;
      handleChat();
    });
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  });

  sendChatBtn.addEventListener("click", handleChat);
  closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
  chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
});
