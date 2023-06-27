// This is the background script for the extension.

chrome.action.onClicked.addListener(function(activeTab) {
  chrome.runtime.openOptionsPage();
});

const DEFAULT_SETTINGS = {
  tune: 'balance',
  youtubeSummary: true,
  aiCommand: true,
  googleSearch: true,
  initialPrompt:  "You are ChatGPT, a large language model trained by OpenAI.\nCarefully heed the user's instructions. \nDon't give Respond too Long or too short,make it summary. \nRespond using Markdown. \nYou are a part of chrome extension now that was made by myanpetra99, that You could be used anywhere around the web just type like '/ai' or '/typeai' to spawn you. \nWhen user tell you to type something or tell to someone or create a post or caption or status or write an email or write a letter about something, just give the straight answer without any extra sentences before the answer like `Sure, here's the...` or like `Sure, I'd be happy to help you write a..` and it can be the other, and don't add anything after the answer, just give straight pure answer about what the user just asked.",
};

chrome.runtime.onInstalled.addListener(function() {
  // Initialize the settings.
  chrome.storage.sync.set(DEFAULT_SETTINGS);
  

  chrome.contextMenus.create({
    id: "summarize",
    title: "Summarize AI",
    contexts: ["selection"]
  });

  const url = 'https://myanpetra99.github.io/GPT-OTG-WEB/#/thankyou'
  chrome.tabs.create({
    url: url
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "summarize") {
      chrome.tabs.sendMessage(tab.id, {text: 'summarize', selectionText: info.selectionText});
  }
});

let lastSearchQuery = null;

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  const url = new URL(details.url);
  const isGoogleSearch = url.hostname.includes('google') && url.pathname.includes('search');
  if (isGoogleSearch) {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function(data) {
      if (data.googleSearch) {
        console.log("This is the Google URL that triggered the listener: " + details.url)
        const query = url.searchParams.get('q');
        if(query !== lastSearchQuery) {
          console.log("This is the Google Search Query that triggered the listener: " + query)
          lastSearchQuery = query;
          chrome.tabs.sendMessage(details.tabId, {
            action: "googleSearch",
            query: query
          });
        } else {
          console.log("This is the Google Search Query is same as last query: " + query + " and last query is: " + lastSearchQuery)
          lastSearchQuery = null; 
        }
      }
    });
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  console.log("This is the URL that triggered the listener: " + details.url)
  chrome.storage.sync.get(DEFAULT_SETTINGS, function(data) {
    const url = new URL(details.url);
    const isYouTubeVideo = url.hostname.includes('youtube') && url.pathname.includes('watch');
    if(isYouTubeVideo) {
      const videoId = url.searchParams.get('v');
      chrome.tabs.sendMessage(details.tabId, {
          action: "youtubeWatch",
          videoId: videoId
      });
    }
  });
});

