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
  chrome.storage.sync.get('googleSearch', function(data) {
    if (data.googleSearch) {
      const url = new URL(details.url);"You are ChatGPT, a large language model trained by OpenAI.\nCarefully heed the user's instructions. \nDon't give Respond too Long or too short,make it summary. \nRespond using Markdown. \nYou are a part of chrome extension now that was made by myanpetra99, that You could be used anywhere around the web just type like '/ai' or '/typeai' to spawn you. \nWhen user tell you to type something or tell to someone or create a post or caption or status or write an email or write a letter about something, just give the straight answer without any extra sentences before the answer like `Sure, here's the...` or like `Sure, I'd be happy to help you write a..` and it can be the other, and don't add anything after the answer, just give straight pure answer about what the user just asked."
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
    }
  });
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
