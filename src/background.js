// This is the background script for the extension.

chrome.action.onClicked.addListener(function(activeTab) {
  // Get the URL of the active tab.
  const url = 'https://myanpetra99.github.io/GPT-OTG-WEB/#/thankyou'

  // Open the new URL in a new tab.
  chrome.tabs.create({
    url: url
  });
});

const DEFAULT_SETTINGS = {
  youtubeSummary: true,
  aiCommand: true,
  googleSearch: true,
  initialPrompt: "You are ChatGPT, a large language model trained by OpenAI.\nCarefully heed the user's instructions. \nDon't give Respond too Long or too short,make it summary. \nRespond using Markdown. \nYou are a part of chrome extension now that was made by myanpetra99, that You could be used anywhere around the web just type like '/ai' or '/typeai' to spawn you. \nWhen user tell you to type something or tell to someone or create a post or caption or status or write an email or write a letter about something, just give the straight answer without any extra sentences before the answer like `Sure, here's the...` or like `Sure, I'd be happy to help you write a..` and it can be the other, and don't add anything after the answer, just give straight pure answer about what the user just asked."
};


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

// listen for google
let lastSearchQuery = null;

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {

  const url = new URL(details.url);
  const isGoogleSearch = url.hostname.includes('google') && url.pathname.includes('search');
  if (isGoogleSearch) {

  chrome.storage.sync.get(DEFAULT_SETTINGS, function(data) {
    if (data.googleSearch) {

      // Check if the current URL is a Google search

        console.log("This is the Google URL that triggered the listener: " + details.url)
          // Get the search query from the URL
          const query = url.searchParams.get('q');

          // Ignore if it's the same as the last query
          if(query !== lastSearchQuery) {
            console.log("This is the Google Search Query that triggered the listener: " + query)
            lastSearchQuery = query;
            chrome.tabs.sendMessage(details.tabId, {
                action: "googleSearch",
                query: query
            });
          } else{
            console.log("This is the Google Search Query is same as last query: " + query + " and last query is: " + lastSearchQuery)
            lastSearchQuery = null; 
          }
  } else {
    // Reset lastSearchQuery if we navigate away from Google
    chrome.storage.sync.set(DEFAULT_SETTINGS);
};
  });
}});


// let lastVideoId = null;

// chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
//   chrome.storage.sync.get(DEFAULT_SETTINGS, function(data) {
//     const url = new URL(details.url);
//     const isYouTubeVideo = url.hostname.includes('youtube') && url.pathname.includes('watch');

//     // Check if the current URL is a YouTube video
//     if(isYouTubeVideo) {
//         // Get the video ID from the URL
//         const videoId = url.searchParams.get('v');

//         // Ignore if it's the same as the last video
//         if(videoId !== lastVideoId) {
//             lastVideoId = videoId;
//             console.log("This is the Youtube Video ID that triggered the listener: " + videoId)
            
//             chrome.tabs.sendMessage(details.tabId, {
//                 action: "youtubeWatch",
//                 videoId: videoId
//             });
//             console.log('fire event where action = youtubeWatch and videoid = ' + videoId + '')
//         }else{
//           console.log("This is the Youtube Video ID is same as last video: " + videoId + " and last video id is: " + lastVideoId)
//         }
//     } else {
//         lastVideoId = null; // Reset lastVideoId if we navigate away from YouTube
//         chrome.storage.sync.set(DEFAULT_SETTINGS);
//     }
//   });
// });

// listen for youtube
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  console.log("This is the URL that triggered the listener: " + details.url)
  chrome.storage.sync.get(DEFAULT_SETTINGS, function(data) {
    const url = new URL(details.url);
    const isYouTubeVideo = url.hostname.includes('youtube') && url.pathname.includes('watch');

    // Check if the current URL is a YouTube video
    if(isYouTubeVideo) {
        // Get the video ID from the URL
        const videoId = url.searchParams.get('v');

        chrome.tabs.sendMessage(details.tabId, {
            action: "youtubeWatch",
            videoId: videoId
        });
    }else{
      chrome.storage.sync.set(DEFAULT_SETTINGS);
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "open_options_page") {
      chrome.runtime.openOptionsPage();
  }
});


function openOptionsPage(){
  chrome.runtime.openOptionsPage();
}
