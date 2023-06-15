document.addEventListener("DOMContentLoaded", function () {
    // Load any previously saved settings when the options page opens
    loadSettings();
    
    // Attach event listener to the Save button
    document.getElementById('save').addEventListener('click', function() {
        // Save settings when the Save button is clicked
        saveSettings();
    });
  
    // Attach event listener to the Reset button
    document.getElementById('reset').addEventListener('click', function() {
        // Reset settings when the Reset button is clicked
        resetSettings();
    });

    // Attach event listeners for changes to input fields
    document.getElementById('aiCommand').addEventListener('change', enableSaveReset);
    document.getElementById('googleSearch').addEventListener('change', enableSaveReset);
    document.getElementById('initialPrompt').addEventListener('input', enableSaveReset);
    document.getElementById('youtubeSummary').addEventListener('change', enableSaveReset);
});
  
// Default settings
const DEFAULT_SETTINGS = {
    youtubeSummary: true,
    aiCommand: true,
    googleSearch: true,
    initialPrompt: "You are ChatGPT, a large language model trained by OpenAI.\nCarefully heed the user's instructions. \nDon't give Respond too Long or too short,make it summary. \nRespond using Markdown. \nYou are a part of chrome extension now that was made by myanpetra99, that You could be used anywhere around the web just type like '/ai' or '/typeai' to spawn you. \nWhen user tell you to type something or tell to someone or create a post or caption or status or write an email or write a letter about something, just give the straight answer without any extra sentences before the answer like `Sure, here's the...` or like `Sure, I'd be happy to help you write a..` and it can be the other, and don't add anything after the answer, just give straight pure answer about what the user just asked."
};

// Function to load settings
function loadSettings() {
    
    chrome.storage.sync.get(DEFAULT_SETTINGS, function(items) {
        document.getElementById('aiCommand').checked = items.aiCommand;
        document.getElementById('googleSearch').checked = items.googleSearch;
        document.getElementById('youtubeSummary').checked = items.youtubeSummary;
        document.getElementById('initialPrompt').value = items.initialPrompt;

        // disable buttons at start
        document.getElementById('save').disabled = true;
        document.getElementById('reset').disabled = true;
    });
}

// Function to save settings
function saveSettings() {
    let aiCommand = document.getElementById('aiCommand').checked;
    let googleSearch = document.getElementById('googleSearch').checked;
    let initialPrompt = document.getElementById('initialPrompt').value;
    let youtubeSummary = document.getElementById('youtubeSummary').checked;

    chrome.storage.sync.set({
        aiCommand: aiCommand,
        googleSearch: googleSearch,
        initialPrompt: initialPrompt,
        youtubeSummary: youtubeSummary
    }, function() {
        // Notify that we saved.
        alert('Settings saved');

        // disable save and reset buttons after successful save
        document.getElementById('save').disabled = true;
    });
}

// Function to reset settings
function resetSettings() {
    // Reset to default settings
    document.getElementById('aiCommand').checked = DEFAULT_SETTINGS.aiCommand;
    document.getElementById('googleSearch').checked = DEFAULT_SETTINGS.googleSearch;
    document.getElementById('initialPrompt').value = DEFAULT_SETTINGS.initialPrompt;
    document.getElementById('youtubeSummary').value = DEFAULT_SETTINGS.youtubeSummary;
    // Save the default settings
    saveSettings();
    document.getElementById('reset').disabled = true;
}

// Function to enable Save and Reset buttons when changes are made
function enableSaveReset() {
    document.getElementById('save').disabled = false;
    document.getElementById('reset').disabled = false;
}
