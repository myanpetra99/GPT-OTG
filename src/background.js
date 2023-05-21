chrome.browserAction.onClicked.addListener(function (activeTab) {
    var newURL = 'https://myanpetra99.github.io/GPT-OTG-WEB/#/thankyou'
    chrome.tabs.create({ url: newURL });
  });
  