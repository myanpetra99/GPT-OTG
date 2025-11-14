// This is the background script for the extension.

chrome.action.onClicked.addListener(() => {
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
  gptModel: "openai-gpt-4o-mini",
  openaiApiKey: "",
  geminiApiKey: "",
  anthropicApiKey: "",
  deepseekApiKey: "",
  initialPrompt: `You are ChatGPT, a large language model trained by OpenAI.
Carefully heed the user's instructions.
Respond using Markdown and keep answers concise but complete.
When creating content for the user, answer directly without filler phrases.
After answering, provide follow-up ideas prefixed with "GPT-SUGGEST:" in JSON format.`,
};

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.storage.sync.set(DEFAULT_SETTINGS);
  } else if (reason === "update") {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (existing) => {
      const missingEntries = {};
      Object.keys(DEFAULT_SETTINGS).forEach((key) => {
        if (typeof existing[key] === "undefined") {
          missingEntries[key] = DEFAULT_SETTINGS[key];
        }
      });
      if (Object.keys(missingEntries).length) {
        chrome.storage.sync.set(missingEntries);
      }
    });
  }

  createContextMenus();

  const url = "https://myanpetra99.github.io/GPT-OTG-WEB/#/thankyou";
  chrome.tabs.create({
    url,
  });
});

function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "summarize",
      title: "Summarize with AI",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "chat",
      title: "Chat with AI",
      contexts: ["page", "selection"],
    });

    chrome.contextMenus.create({
      id: "explain",
      title: "What is this?",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "analyzeImage",
      title: "Ask AI about this image",
      contexts: ["image"],
    });
  });
}

chrome.runtime.onStartup.addListener(createContextMenus);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) {
    return;
  }

  const forwardWithPosition = (payload) => {
    chrome.tabs.sendMessage(tab.id, { text: "getMousePosition" }, (response) => {
      const { x = 0, y = 0 } = response || {};
      chrome.tabs.sendMessage(tab.id, {
        ...payload,
        mousePosition: { x, y },
      });
    });
  };

  switch (info.menuItemId) {
    case "summarize":
      forwardWithPosition({ text: "summarize", selectionText: info.selectionText });
      break;
    case "chat":
      forwardWithPosition({ text: "chat" });
      break;
    case "explain":
      forwardWithPosition({ text: "explain", selectionText: info.selectionText });
      break;
    case "analyzeImage":
      forwardWithPosition({ text: "analyzeImage", imageUrl: info.srcUrl });
      break;
    default:
      break;
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
