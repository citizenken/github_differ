var commentsToCopy = [];
var commentIds = [];

queryForComments = function (commits, prUrl) {
    var url = prUrl + 'comments';
    url += '?access_token=' + localStorage.getItem('gh_token');
    $.ajax(url)
    .done(function (response) {
      var comments = checkCommitComments(response, commits);
      sendMsgToActiveTab({commitComments: commentsToCopy});
    })
    .fail(function() {
      console.log();
    });
};

checkCommitComments = function (comments, commits) {
  for (var i = comments.length - 1; i >= 0; i--) {
    for (var z = commits.length - 1; z >= 0; z--) {
      if (comments[i].commit_id === commits[z] && commentIds.indexOf(comments[i].id === -1)) {
        commentsToCopy.push(comments[i]);
        commentIds.push(comments[i].id);
      }
    }
  }
  return commentsToCopy;
};

copyCommentsToCommit = function (commits, prUrl) {
    var comments = commentsToCopy;
    for (var i = comments.length - 1; i >= 0; i--) {
      for (var z = commits.length - 1; z >= 0; z--) {
        var comment = comments[i];
        if (comment.commit_id === commits[z]) {
          var url = prUrl.replace(/pulls.*/, 'commits/' + comment.commit_id + '/comments');
          var data = {
            body: comment.body,
            path: comment.path,
            postition: comment.position
          };
          $.ajax({
            method: "POST",
            url: url,
            data: JSON.stringify(data)
          })
          .done(function (response) {
            console.log(response);
          })
          .fail(function(response) {
            console.log(response);
          });
        }
      }
    }
};


sendMsgToActiveTab = function (msg) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, msg, function(response) {
      console.log(response);
    });
  });
};


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var gitHubRE = /.*github.com\/.*\/pull\/[0-9]*\/commits.*/;

    if (gitHubRE.test(changeInfo.url)) {
        sendMsgToActiveTab("on_github_commit");
    }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.msg) {
      case 'all_commits':
        sendResponse('commits recieved');
        queryForComments(request.commits, request.prUrl);
        break;
      case 'checked_commit':
        sendResponse('checked_commit recieved');
        copyCommentsToCommit(request.commits, request.prUrl);
        break;

    }
  }
);