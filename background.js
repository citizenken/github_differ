chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var gitHubRE = /.*github.com\/.*\/pull\/[0-9]*\/commits.*/;

    if (gitHubRE.test(changeInfo.url)) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, "on_github_commit", function(response) {
            console.log(response);
          });
        });
    }
});