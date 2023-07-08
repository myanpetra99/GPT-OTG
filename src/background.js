// This is the background script for the extension.

chrome.action.onClicked.addListener(function(activeTab) {
  chrome.runtime.openOptionsPage();
});
function openOptionsPage(){
  chrome.runtime.openOptionsPage();
}

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

  chrome.contextMenus.create({
    id: "summarize",
    title: "Summarize AI",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "chat",
    title: "Chat AI"
  });

  chrome.contextMenus.create({
    id: "explain",
    title: "What is this?",
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
 
  if (info.menuItemId === "chat") {
    // Request the mouse position from the content script
    chrome.tabs.sendMessage(tab.id, {text: 'getMousePosition'}, function(response) {
      const {x, y} = response;

      // Then send the position to the tab
      console.log("This is the mouse position: " + x + " " + y)
      chrome.tabs.sendMessage(tab.id, {text: 'chat', mousePosition: {x: x, y: y}});
    });
  }

  if (info.menuItemId === "explain") {
    chrome.tabs.sendMessage(tab.id, {text: 'explain', selectionText: info.selectionText});
  }
});

let lastSearchQuery = null;

chrome.webNavigation.onCompleted.addListener(function(details) {
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

  const isYouTubeVideo = url.hostname.includes('youtube') && url.pathname.includes('watch');
  if(isYouTubeVideo) {
    chrome.tabs.sendMessage(details.tabId, {
      action: "createYoutubeSummaryButton"
      
  });
  }
});



chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.tabs.sendMessage(tabId, {action: 'getURL', tabId: tabId});
});

chrome.runtime.onMessage.addListener(async function (request) {

  if (request.action === 'OpenOptionsPage') {
    openOptionsPage();
  }

  if (request.action === 'sendURL') {
    console.log('get response from content script: ' + request.url); // <-- Debugging line
  
    const url = new URL(request.url);
    const isYouTubeVideo = url.hostname.includes('youtube') && url.pathname.includes('watch');
    
    console.log('checking if the url is youtube video')
    if (isYouTubeVideo) {
      console.log('Yes it is!')
      const videoId = url.searchParams.get('v');
      let currentvideoid = await chrome.storage.session.get('currentYTid')
      console.log('session storage : '+ currentvideoid.currentYTid + "| video id : "+videoId)
      if (currentvideoid.currentYTid !== videoId) {
      
        await chrome.storage.session.set({ currentYTid: videoId });
        
        console.log("video id is not the same");
  
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          var activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, { action: "youtubeWatch", videoId: videoId });
        });
  
      } else {
        console.log("video id is same, checking for popup shown...")
        let popupShown = await chrome.storage.session.get(["popupShown"]);
  
        console.log('popup shown : '+ popupShown.popupShown)
        if (!popupShown.popupShown) {
          console.log('popup not shown, calling the AI..')
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: "youtubeWatch", videoId: videoId });
          });
        }
      }
    } else {
      console.log('Not sending message to content script, url is not a YT video'); // <-- Debugging line
    }
  }
  
});

chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

