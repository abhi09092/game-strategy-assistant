
// Configuration
const API_KEY = "AIzaSyCmpP41ZS_kLjnZyy-0JDlwHT2vAZyHJU4"; 
const MODEL_NAME = "gemini-2.0-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// MAIN: Get Chess Response
async function getChessResponse(userMessage) {
    elements.typingIndicator.classList.remove('hidden'); // Show typing immediately

    try {
        const isChessQuestion = isChessSpecificQuestion(userMessage);

        if (isChessQuestion) {
            const chessResponse = await handleChessSpecificQuery(userMessage);

            if (chessResponse) {
                elements.typingIndicator.classList.add('hidden');
                addBotMessage(chessResponse);
                return;
            }
        } else {
            // Not a chess question at all
            elements.typingIndicator.classList.add('hidden');
            addBotMessage("Oops! I can only assist with chess-related questions. ♟️");
            return;
        }

        // Chess-related but general => use Gemini fallback
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 sec timeout

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            }),
            signal: controller.signal
        };

        const response = await fetch(API_URL, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text 
            || "I'm sorry, I couldn't generate a response. Please try again later.";

        elements.typingIndicator.classList.add('hidden');
        addBotMessage(aiResponse);

    } catch (error) {
        console.error('API Error:', error);
        elements.typingIndicator.classList.add('hidden');
        addBotMessage(
            "I'm having trouble reaching the servers. Here's a quick chess tip:\n\n" +
            generateFallbackResponse(userMessage)
        );
    }
}

// Check if the message is chess-related
function isChessSpecificQuestion(message) {
    const chessKeywords = [
        'chess', 'opening', 'endgame', 'tactic', 'strategy', 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king',
        'gambit', 'checkmate', 'stalemate', 'en passant', 'castling', 'FEN', 'PGN', 'rating', 'Elo', 'tournament', 
        'move', 'square', 'queen\'s gambit', 'rook endgame', 'bishop pair', 'king safety', 'middlegame', 
        'blitz', 'bullet', 'rapid', 'fork', 'pin', 'skewer', 'grandmaster', 'blunder', 'zugzwang', 'promotion'
    ];

    const blockedKeywords = [
        'winner', 'champion', 'trophy', 'prize', 'money', 'bet', 'gamble', 'wager', 'cash', 'reward',
        'jackpot', 'lottery', 'sweepstakes', 'raffle', 'contest', 'competition', 'sponsor', 'advertisement',
        'promotion', 'sale', 'discount', 'offer', 'deal', 'bargain', 'coupon', 'voucher', 'rebate', 'cashback',
        'player', 'fun', 'entertainment', 'amusement', 'leisure', 'hobby', 'pastime',
        'recreation', 'activity', 'event', 'gathering', 'meeting', 'socialize', 'networking', 'community',
        'players', 'team', 'group', 'club', 'association', 'organization', 'society', 'federation',
        'league', 'alliance', 'union', 'coalition', 'partnership', 'collaboration', 'cooperation', 'joint',
    ];

    // Check if the message contains any blocked keyword
    if (blockedKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        return false; // Block the message
    }

    // Ensure the message is related to chess and not just isolated keywords
    const messageLowerCase = message.toLowerCase();
    
    // Check for keywords that should be used in a chess context
    const chessContextFound = chessKeywords.some(keyword => messageLowerCase.includes(keyword));

    // If a chess-related context is found, but no specific chess context is established (e.g., ambiguous terms like "square"), return false
    if (chessContextFound && (messageLowerCase.includes('square','opening', 'endgame', 'tactic', 'strategy', 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king',
        'gambit', 'checkmate', 'stalemate', 'en passant', 'castling', 'FEN', 'PGN', 'rating', 'Elo', 'tournament', 
        'move', 'square', 'queen\'s gambit', 'rook endgame', 'bishop pair', 'king safety', 'middlegame', 
        'blitz', 'bullet', 'rapid', 'fork', 'pin', 'skewer', 'grandmaster', 'blunder', 'zugzwang', 'promotion') && !messageLowerCase.includes('chess'))) {
        return false;
    }

    return chessContextFound;
}

// Handle chess-specific queries
async function handleChessSpecificQuery(message) {
    const lowerMessage = message.toLowerCase();

    // Quick button type questions
    const quickQuestions = [
        "best openings for beginners",
        "how to play the queen's gambit",
        "explain the knight's tour",
        "rook endgame strategies",
        "bishop pair advantages",
        "king safety in middlegame",
        "tips to improve my rating",
        "time management in blitz"
    ];

    if (quickQuestions.some(q => lowerMessage.includes(q))) {
        return await searchChessAnswerOnGoogle(message);
    }

    // General chess improvement question
    if (lowerMessage.includes('how to improve') || lowerMessage.includes('tips') || lowerMessage.includes('rating')) {
        return getGeneralChessAdvice();
    }

    return null; // Otherwise handle normally
}

// Search Chess Answer (use fake search for now)
async function searchChessAnswerOnGoogle(query) {
    // Simulate network delay
    await delay(1000);

    // Fake smart response depending on query
    if (query.toLowerCase().includes("queen's gambit")) {
        const queenGambitResponses = [
            "The Queen’s Gambit is a chess opening where White offers a pawn with 1. d4 d5 2. c4. If Black accepts, White aims for quick center control!",
            "The Queen's Gambit is a chess opening where White sacrifices a pawn with d4, d5, and c4, hoping for quick central control if Black accepts.",
            "In the Queen’s Gambit, White offers a pawn early on, aiming to dominate the center if Black captures it.",
            "The Queen's Gambit is a popular chess opening where White offers a pawn to gain control of the center. It's a great choice for beginners!"
        ];
        // Return a random response
        return queenGambitResponses[Math.floor(Math.random() * queenGambitResponses.length)];
    }
    
    if (query.toLowerCase().includes("best openings")) {
        const bestOpeningsResponses = [
            "Best openings for beginners are the Italian Game, Queen's Gambit, and the Ruy Lopez. Focus on piece development and center control!",
            "For beginners, some of the best openings are the Queen’s Gambit, King's Pawn Opening, and the Italian Game. They focus on quick development and center control.",
            "The Ruy Lopez, Queen's Gambit, and King's Gambit are excellent choices for players starting out in chess."
        ];
        // Return a random response
        return bestOpeningsResponses[Math.floor(Math.random() * bestOpeningsResponses.length)];
    }

    if (query.toLowerCase().includes("knight's tour")) {
        const knightTourResponses = [
            "The Knight's Tour is a puzzle where the knight visits every square of the board exactly once, using only legal knight moves.",
            "In the Knight's Tour puzzle, the knight must travel to each square on the board exactly once without repeating any square.",
            "The Knight's Tour is a famous chess puzzle where the knight moves around the board, touching every square exactly once without revisiting any."
        ];
        // Return a random response
        return knightTourResponses[Math.floor(Math.random() * knightTourResponses.length)];
    }

    // Default fallback
    return "Here's a tip: Develop pieces early, control the center, and protect your king!";
}
// General chess tips
async function getGeneralChessAdvice() {
    await delay(1200);
    return "Chess improvement tips:\n\n- Solve puzzles daily\n- Study master games\n- Review your mistakes\n- Play longer games to improve calculation.";
}

// Random fallback chess tips
function generateFallbackResponse(message) {
    const tips = [
        "Always think two moves ahead.",
        "Control the center early!",
        "Develop knights before bishops.",
        "Don't move the same piece twice in opening unless needed."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
}

// Delay helper
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// DOM Helper
function addBotMessage(text) {
    const botMsg = document.createElement('div');
    botMsg.className = 'bot-message';
    botMsg.innerText = text;
    elements.chatBox.appendChild(botMsg);
    elements.chatBox.scrollTop = elements.chatBox.scrollHeight;
}
