// DOM Elements
const elements = {
    loadingScreen: document.getElementById('loading-screen'),
    questionsToggle: document.getElementById('questions-toggle'),
    quickQuestions: document.getElementById('quick-questions'),
    userInput: document.getElementById('user-input'),
    sendButton: document.getElementById('send-button'),
    micButton: document.getElementById('mic-button'),
    chatBox: document.getElementById('chat-box'),
    typingIndicator: document.getElementById('typing-indicator'),
    exportChatBtn: document.getElementById('export-chat-btn'),
    clearChatBtn: document.getElementById('clear-chat-btn'),
    notificationToast: document.getElementById('notification-toast'),
    listeningIndicator: document.getElementById('listening-indicator'),
    chessVisualization: document.getElementById('chess-visualization'),
    historyToggle: document.getElementById('historyToggle'),
    historyPanel: document.getElementById('historyPanel'),
    historyContent: document.getElementById('historyContent')
};

// Chess questions data
const chessQuestions = [
    { emoji: '♟', text: 'Best openings for beginners' },
    { emoji: '♛', text: 'How to play the Queen\'s Gambit?' },
    { emoji: '♞', text: 'Explain the Knight\'s tour' },
    { emoji: '♜', text: 'Rook endgame strategies' },
    { emoji: '♝', text: 'Bishop pair advantages' },
    { emoji: '♚', text: 'King safety in middlegame' },
    { emoji: '🏆', text: 'Tips to improve my rating' },
    { emoji: '⏱️', text: 'Time management in blitz' }
];

// Speech recognition variables
let recognitionInstance = null;
let isPermissionGranted = false;

// Initialize the application
function initApp() {
    // Hide loading screen
    setTimeout(() => {
        elements.loadingScreen.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);
    
    // Create visual elements
    createStarfield();
    createChessBoard();
    createQuickQuestions();
    
    // Set up event listeners
    setupEventListeners();
    setupModals();
    
    // Load any existing chat history
    loadInitialChatHistory();
}

// Load initial chat history from localStorage
function loadInitialChatHistory() {
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    if (history.length > 0) {
        // Clear the default welcome message
        elements.chatBox.innerHTML = '';
        
        // Add all historical messages
        history.forEach(msg => {
            if (msg.isUser) {
                addUserMessage(msg.message, true); // true means don't save again
            } else {
                addBotMessage(msg.message, true); // true means don't save again
            }
        });
    }
}

// Save chat message to history
function saveToHistory(message, isUser) {
    // Get existing history or create new array
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    
    // Add new message
    history.push({
        message: message,
        isUser: isUser,
        timestamp: new Date().toISOString()
    });
    
    // Save back to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(history));
}

// Create starfield background
function createStarfield() {
    const starfield = document.getElementById('starfield');
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'absolute bg-white rounded-full';
        star.style.width = `${Math.random() * 2 + 1}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = Math.random() * 0.7 + 0.3;
        star.style.animation = `twinkle ${Math.random() * 5 + 5}s infinite alternate`;
        starfield.appendChild(star);
    }
}

// Create chess board visualization
function createChessBoard() {
    const board = document.querySelector('#chess-visualization > div');
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const pieces = {
        'white': ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
        'black': ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜']
    };
    
    board.className = 'grid grid-cols-8 gap-0 w-[400px] h-[400px] mx-auto my-4';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `aspect-square flex items-center justify-center relative ${(row + col) % 2 === 0 ? 'bg-board-light' : 'bg-board-dark'}`;
            
            // Add pieces
            if (row === 0) {
                addPiece(square, pieces.black[col], `${files[col]}${8-row}`);
            } else if (row === 1) {
                addPiece(square, '♟', `${files[col]}${8-row}`);
            } else if (row === 6) {
                addPiece(square, '♙', `${files[col]}${8-row}`);
            } else if (row === 7) {
                addPiece(square, pieces.white[col], `${files[col]}${8-row}`);
            }
            
            // Add coordinate label
            const coord = document.createElement('div');
            coord.className = 'absolute bottom-0 right-0 text-xs opacity-30';
            coord.textContent = `${files[col]}${8-row}`;
            square.appendChild(coord);
            
            board.appendChild(square);
        }
    }
}

function addPiece(square, pieceSymbol, position) {
    const piece = document.createElement('div');
    piece.className = 'chess-piece text-3xl cursor-pointer hover:text-4xl transition-all duration-200';
    piece.textContent = pieceSymbol;
    piece.dataset.piece = pieceSymbol;
    piece.dataset.position = position;
    piece.addEventListener('click', handlePieceClick);
    square.appendChild(piece);
}

function handlePieceClick() {
    const position = this.dataset.position;
    const pieceSymbol = this.dataset.piece;
    
    this.classList.add('move-highlight');
    setTimeout(() => {
        this.classList.remove('move-highlight');
    }, 1000);
    
    addBotMessage(`You clicked on ${pieceSymbol} at ${position}. What would you like to know about this piece or position?`);
}

// Create quick questions sidebar
function createQuickQuestions() {
    const container = document.querySelector('.question-buttons');
    chessQuestions.forEach(question => {
        const button = document.createElement('button');
        button.className = 'question-button w-full text-left flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 group';
        button.innerHTML = `
            <span class="question-emoji text-2xl mr-3 group-hover:scale-110 transition-transform">${question.emoji}</span>
            <span class="question-text flex-1 text-sm">${question.text}</span>
        `;
        button.addEventListener('click', () => {
            elements.userInput.value = question.text;
            elements.sendButton.click();
        });
        container.appendChild(button);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Toggle quick questions sidebar
    elements.questionsToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        elements.quickQuestions.classList.toggle('translate-x-0');
        elements.quickQuestions.classList.toggle('translate-x-96');
    });
    
    // Auto-resize textarea
    elements.userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Show tooltip on input hover
    const inputContainer = document.querySelector('.input-container');
    const tooltip = document.querySelector('.input-tooltip');
    
    inputContainer.addEventListener('mouseenter', () => {
        tooltip.classList.remove('opacity-0');
        tooltip.classList.add('opacity-100');
        tooltip.classList.remove('-translate-y-2');
        tooltip.classList.add('translate-y-0');
    });
    
    inputContainer.addEventListener('mouseleave', () => {
        tooltip.classList.add('opacity-0');
        tooltip.classList.remove('opacity-100');
        tooltip.classList.add('-translate-y-2');
        tooltip.classList.remove('translate-y-0');
    });
    
    // Send message
    elements.sendButton.addEventListener('click', sendMessage);
    
    // Send with Enter key
    elements.userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            elements.sendButton.click();
        }
    });
    
    // Voice recognition
    elements.micButton.addEventListener('click', handleVoiceRecognition);
    
    // Export chat
    elements.exportChatBtn.addEventListener('click', exportChat);
    
    // Clear chat
    elements.clearChatBtn.addEventListener('click', clearChat);
}

// Set up modals
function setupModals() {
    setupModal('privacy-link', 'privacy-modal');
    setupModal('about-link', 'about-modal');
}

function setupModal(triggerId, modalId) {
    const trigger = document.getElementById(triggerId);
    const modal = document.getElementById(modalId);
    const close = modal.querySelector('.modal-close');
    
    trigger.addEventListener('click', () => {
        modal.classList.remove('pointer-events-none');
        modal.classList.add('pointer-events-auto');
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('translate-y-4');
    });
    
    close.addEventListener('click', () => {
        modal.classList.add('pointer-events-none');
        modal.classList.remove('pointer-events-auto');
        modal.classList.add('opacity-0');
        modal.querySelector('div').classList.add('translate-y-4');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('pointer-events-none');
            modal.classList.remove('pointer-events-auto');
            modal.classList.add('opacity-0');
            modal.querySelector('div').classList.add('translate-y-4');
        }
    });
}

// Chat functions
function sendMessage() {
    const message = elements.userInput.value.trim();
    
    if (message) {
        addUserMessage(message);
        elements.userInput.value = '';
        elements.userInput.style.height = 'auto';
        
        // Show typing indicator
        elements.typingIndicator.classList.remove('hidden');
        
        // Send to API for response
        getChessResponse(message);
    }
}

function addUserMessage(text, skipSave = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message flex flex-col items-end animate-message-appear';
    messageDiv.innerHTML = `
        <div class="sender text-sm text-gray-400 mb-1">You</div>
        <div class="message-content bg-blue-600 bg-opacity-30 backdrop-blur-sm rounded-xl px-4 py-3 max-w-[85%]">
            ${text}
        </div>
    `;
    elements.chatBox.appendChild(messageDiv);
    elements.chatBox.scrollTop = elements.chatBox.scrollHeight;
    
    // Save to history unless we're loading from history
    if (!skipSave) {
        saveToHistory(text, true);
    }
}

function addBotMessage(text, skipSave = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message flex flex-col items-start animate-message-appear';
    messageDiv.innerHTML = `
        <div class="sender text-sm text-gray-400 mb-1">Chess Assistant</div>
        <div class="message-content bg-gray-700 bg-opacity-70 backdrop-blur-sm rounded-xl px-4 py-3 max-w-[85%]">
            ${text}
            <div class="response-progress h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 mt-2 rounded-full w-full opacity-0"></div>
        </div>
    `;
    elements.chatBox.appendChild(messageDiv);
    
    // Show loading progress bar
    const progressBar = messageDiv.querySelector('.response-progress');
    progressBar.classList.remove('opacity-0');
    progressBar.classList.add('opacity-100');
    progressBar.style.animation = 'progress-animation 2s infinite ease-in-out';
    
    setTimeout(() => {
        progressBar.style.animation = 'none';
        progressBar.classList.add('opacity-0');
        messageDiv.querySelector('.message-content').classList.add('animate-pulse-complete');
    }, 2000);
    
    elements.chatBox.scrollTop = elements.chatBox.scrollHeight;
    
    // Save to history unless we're loading from history
    if (!skipSave) {
        saveToHistory(text, false);
    }
}

// Voice recognition
async function handleVoiceRecognition() {
    if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
        showNotification('Voice recognition not supported in your browser');
        return;
    }

    if (isPermissionGranted) {
        startVoiceRecognition();
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        isPermissionGranted = true;
        stream.getTracks().forEach(track => track.stop());
        startVoiceRecognition();
    } catch (error) {
        console.error('Permission error:', error);
        showNotification('Microphone access blocked. Please allow permissions and try again.');
        cleanupRecognition();
    }
}

function startVoiceRecognition() {
    cleanupRecognition();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.lang = 'en-US';
    recognitionInstance.interimResults = false;
    recognitionInstance.continuous = false;
    
    elements.listeningIndicator.classList.remove('hidden');
    elements.micButton.classList.add('active');

    recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        elements.userInput.value = transcript;
        elements.sendButton.click();
    };
    
    recognitionInstance.onerror = (event) => {
        if (event.error === 'not-allowed') {
            isPermissionGranted = false;
            showNotification('Microphone access revoked. Please click the mic button and allow permissions again.');
        } else {
            showNotification(`Error: ${event.error}`);
        }
        cleanupRecognition();
    };
    
    recognitionInstance.onend = cleanupRecognition;
    
    try {
        recognitionInstance.start();
    } catch (error) {
        console.error('Start error:', error);
        showNotification('Failed to start microphone. Try again.');
        cleanupRecognition();
    }
}

function cleanupRecognition() {
    elements.listeningIndicator.classList.add('hidden');
    elements.micButton.classList.remove('active');
    if (recognitionInstance) {
        try {
            recognitionInstance.stop();
        } catch (e) {}
        recognitionInstance = null;
    }
}

// Export chat
function exportChat() {
    const chatMessages = Array.from(document.querySelectorAll('#chat-box .message-content')).map(el => {
        const isUser = el.closest('.user-message') ? 'You: ' : 'Assistant: ';
        return isUser + el.textContent;
    }).join('\n\n');

    // Copy chat messages to the clipboard
    navigator.clipboard.writeText(chatMessages)
        .then(() => showNotification('Chat copied to clipboard!'))
        .catch(err => showNotification('Failed to copy chat'));

    // Create an Excel file from the chat messages
    const wb = XLSX.utils.book_new(); // Create a new workbook
    const ws = XLSX.utils.aoa_to_sheet([[chatMessages]]); // Create a sheet with chat messages

    // Add the sheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Chat");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "chat_messages.xlsx");
}

// Example notification function (you can customize it)
function showNotification(message) {
    alert(message); // Simple alert for demonstration, replace with custom notification
}


// Clear chat
function clearChat() {
    if (confirm('Are you sure you want to clear the current chat?')) {
        elements.chatBox.innerHTML = `
            <div class="message bot-message flex flex-col items-start">
                <div class="sender text-sm text-gray-400 mb-1">Chess Assistant</div>
                <div class="message-content bg-gray-700 bg-opacity-70 backdrop-blur-sm rounded-xl px-4 py-3 max-w-[85%]">
                    Welcome! I'm your Chess Strategy Assistant. Ask me about openings, tactics, endgames, or analyze your positions.
                    <div class="response-progress h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 mt-2 rounded-full w-0 opacity-0"></div>
                </div>
            </div>
        `;
        
        // Optionally clear the history from localStorage
        if (confirm('Would you also like to clear your chat history?')) {
            localStorage.removeItem('chatHistory');
        }
    }
}

// Show notification
function showNotification(message) {
    elements.notificationToast.querySelector('#toast-message').textContent = message;
    elements.notificationToast.classList.remove('opacity-0');
    setTimeout(() => elements.notificationToast.classList.add('opacity-0'), 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);