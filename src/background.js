chrome.browserAction.onClicked.addListener(function (activeTab) {
    var newURL = chrome.extension.getURL('https://myanpetra99.github.io/GPT-OTG-WEB/#/thankyou');
    chrome.tabs.create({ url: newURL });
  });
  