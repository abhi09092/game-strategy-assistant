let currentPage = 1; // Track current page
const itemsPerPage = 10; // Number of items per page
let allHistory = []; // Array to hold the chat history

document.addEventListener('DOMContentLoaded', () => {
    loadHistory(); // Load the chat history when the page loads
});

// Function to load history (simulated with localStorage for this example)
function loadHistory() {
    // Replace with actual data retrieval
    allHistory = JSON.parse(localStorage.getItem('chatHistory')) || []; // Get history from localStorage
    displayHistory(allHistory); // Display the chat history on the page
}

// Function to display the filtered chat history
function displayHistory(history) {
    // Get the start and end indices for the current page
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    const paginatedHistory = history.slice(start, end); // Get the messages for the current page

    // Display the paginated history on the page
    const historyContainer = document.getElementById('historyContent');
    historyContainer.innerHTML = paginatedHistory.map(msg => `
        <div class="${msg.sender === 'user' ? 'user-message' : 'ai-message'} p-4 rounded-lg">
            <p class="text-white">${msg.content}</p>
        </div>
    `).join('');

    // Update the current page number
    document.getElementById('currentPage').textContent = `Page ${currentPage}`;

    // Enable/Disable pagination buttons based on the current page
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage * itemsPerPage >= history.length;

    // Shift to the next page after 5 messages
    if (currentPage === 1 && history.length > 5) {
        currentPage = 2;
        displayHistory(history); // Re-display with updated page
    }
}

// Function to handle page change (previous or next)
function changePage(direction) {
    // Calculate new page number
    const newPage = currentPage + direction;

    // Check if the new page is valid
    if (newPage >= 1 && newPage <= Math.ceil(allHistory.length / itemsPerPage)) {
        currentPage = newPage; // Update current page
        displayHistory(allHistory); // Re-display the history with the new page
    }
}

// Sample function to clear history (for testing)
function clearHistory() {
    localStorage.removeItem('chatHistory'); // Clear history from localStorage
    allHistory = []; // Clear the array
    displayHistory(allHistory); // Refresh the page content
}
