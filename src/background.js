// This is the background script for the extension.

chrome.action.onClicked.addListener(function(activeTab) {
  // Get the URL of the active tab.
  const url = 'https://myanpetra99.github.io/GPT-OTG-WEB/#/thankyou'

  // Open the new URL in a new tab.
  chrome.tabs.create({
    url: url
  });
});


chrome.runtime.onInstalled.addListener(function() {
  // Create a context menu item for summarizing text.
  chrome.contextMenus.create({
    id: "summarize",
    title: "Summarize AI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "summarize") {
      chrome.tabs.sendMessage(tab.id, {text: 'summarize', selectionText: info.selectionText});
  }
});

// In your extension code, listen for URL changes
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  const url = new URL(details.url);
  const isGoogleSearch = url.hostname.includes('google') && url.pathname.includes('search');

  // Check if the current URL is a Google search
  if(isGoogleSearch) {
      // Get the search query from the URL
      const query = url.searchParams.get('q');

          chrome.tabs.sendMessage(details.tabId, {
              action: "injectInfo",
              query: query
          });
  }
});

chrome.runtime.onMessage.addListener(function(message) {
  switch (message.action) {
      case "openOptionsPage":
          openOptionsPage();
          break;
      default:
          break;
  }
});

function openOptionsPage(){
  chrome.runtime.openOptionsPage();
}