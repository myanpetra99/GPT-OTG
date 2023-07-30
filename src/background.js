// This is the background script for the extension.

chrome.action.onClicked.addListener(function (activeTab) {
  chrome.runtime.openOptionsPage();
});
function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

const DEFAULT_SETTINGS = {
  tune: "balance",
  youtubeSummary: true,
  aiCommand: true,
  googleSearch: true,
  initialPrompt:`You are ChatGPT, a large language model trained by OpenAI. 
  Your role is to provide succinct, relevant responses to user queries. 
  At the end of each interaction, you must provide one or more suggestions for future questions the user might ask. 
  These suggestions should follow this specific format: [{suggestion: '1', text: 'Your question here'}, {suggestion: '2', text: 'Your second question here'}]. 
  For instance, if a user asks 'Who is Spiderman?', you should end your response EXACTLY LIKE THIS: "GPT-SUGGEST: [{suggestion: '1', text: 'How strong is Spiderman?'}, {suggestion: '2', text: 'Who are some of Spiderman's most formidable enemies?'}]". 
  No leading or trailing phrases should be used around these suggestions; they should follow immediately after the answer to the initial query.
  Users may summon you anywhere online by typing '/ai' or '/typeai'. If a user requests you to create content such as posts, captions, emails, or letters, 
  provide only the required text without any leading phrases (e.g., 'Sure, here is...') or concluding remarks. 
  Your response should be focused solely on fulfilling the user's request. Respond using Markdown.`
};

chrome.runtime.onInstalled.addListener(function () {
  // Initialize the settings.
  chrome.storage.sync.set(DEFAULT_SETTINGS);

  chrome.contextMenus.create({
    id: "summarize",
    title: "Summarize AI",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "summarize",
    title: "Summarize AI",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "chat",
    title: "Chat AI",
  });

  chrome.contextMenus.create({
    id: "explain",
    title: "What is this?",
    contexts: ["selection"],
  });

  const url = "https://myanpetra99.github.io/GPT-OTG-WEB/#/thankyou";
  chrome.tabs.create({
    url: url,
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "summarize") {
    chrome.tabs.sendMessage(
      tab.id,
      { text: "getMousePosition" },
      function (response) {
        const { x, y } = response;

        // Then send the position to the tab
        console.log("This is the mouse position: " + x + " " + y);

        chrome.tabs.sendMessage(tab.id, {
          text: "summarize",
          selectionText: info.selectionText,
          mousePosition: { x: x, y: y },
        });
      }
    );
  }

  if (info.menuItemId === "chat") {
    // Request the mouse position from the content script
    chrome.tabs.sendMessage(
      tab.id,
      { text: "getMousePosition" },
      function (response) {
        const { x, y } = response;

        // Then send the position to the tab
        console.log("This is the mouse position: " + x + " " + y);
        chrome.tabs.sendMessage(tab.id, {
          text: "chat",
          mousePosition: { x: x, y: y },
        });
      }
    );
  }

  if (info.menuItemId === "explain") {
    chrome.tabs.sendMessage(
      tab.id,
      { text: "getMousePosition" },
      function (response) {
        const { x, y } = response;

        // Then send the position to the tab
        console.log("This is the mouse position: " + x + " " + y);

        chrome.tabs.sendMessage(tab.id, {
          text: "explain",
          selectionText: info.selectionText,
          mousePosition: { x: x, y: y },
        });
      }
    );
  }
});

let lastSearchQuery = null;

chrome.webNavigation.onCompleted.addListener(function (details) {
  const url = new URL(details.url);
  const isGoogleSearch =
    url.hostname.includes("google") && url.pathname.includes("search");
  if (isGoogleSearch) {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function (data) {
      if (data.googleSearch) {
        console.log(
          "This is the Google URL that triggered the listener: " + details.url
        );
        const query = url.searchParams.get("q");
        if (query !== lastSearchQuery) {
          console.log(
            "This is the Google Search Query that triggered the listener: " +
              query
          );
          lastSearchQuery = query;
          chrome.tabs.sendMessage(details.tabId, {
            action: "googleSearch",
            query: query,
          });
        } else {
          console.log(
            "This is the Google Search Query is same as last query: " +
              query +
              " and last query is: " +
              lastSearchQuery
          );
          lastSearchQuery = null;
        }
      }
    });
  }

// Convert the URL to lower case before comparing, to ensure case-insensitivity

  

  const isYouTubeVideo =
    url.hostname.includes("youtube") && url.pathname.includes("watch");
  if (isYouTubeVideo) {
    chrome.tabs.sendMessage(details.tabId, {
      action: "createYoutubeSummaryButton",
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = new URL(tab.url);

  const isgithubUrl = url == "https://myanpetra99.github.io/GPT-OTG-WEB/#/thankyou";
  
console.log("This is the url: " + url);
//check if the url is the github url

if (isgithubUrl) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {
      action: "displayThankYouPage",
    });
  });
} 

  const isYouTubeVideo =
    url.hostname.includes("youtube") && url.pathname.includes("watch");
    

  if (isYouTubeVideo) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {
        action: "createYoutubeSummaryButton",
      });
    });
  } 
});

chrome.runtime.onMessage.addListener(async function (request) {
  if (request.action === "OpenOptionsPage") {
    openOptionsPage();
  }
});

chrome.storage.session.setAccessLevel({
  accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
});
