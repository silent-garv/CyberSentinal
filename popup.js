// popup.js
// Handles popup UI logic

document.getElementById('open-settings').onclick = () => {
  chrome.runtime.openOptionsPage();
};

// ...existing code for status, history, and report...
