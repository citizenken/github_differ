sendMsgToBkgrd = function (message) {
  chrome.runtime.sendMessage(message, function(response) {
    console.log(response);
  });
};

addCheckbox = function () {
  var existingCheckBoxes = document.querySelectorAll('[name="differ_commit"]');
  if (existingCheckBoxes.length > 0) {
    return;
  }

  var commits = [];
  var commitDivs = document.querySelectorAll('li.commit');
  for (var i = 0; i < commitDivs.length; i++) {
      var commitDiv = commitDivs[i];
      var commit = commitDiv.getAttribute('data-channel').replace(/.*:commit:/, '');
      var linksDiv = commitDiv.getElementsByClassName('commit-links-cell')[0];
      var checkbox = document.createElement('input');
      var checkboxLabel = document.createElement('label');
      var breakNode = document.createElement('br');
      commits.push(commit);

      checkbox.type = 'checkbox';
      checkbox.name = 'differ_commit';
      checkbox.value = commit;
      checkbox.id = 'differ_' + commit;
      checkbox.addEventListener('click', clickCheckbox, false);


      checkboxLabel.htmlFor = checkbox.id;
      checkboxLabel.id = 'label_' + checkbox.value;
      checkboxLabel.className = 'differ_label';
      checkboxLabel.innerHTML = 'Click to compare this commit ';
      checkboxLabel.appendChild(checkbox);

      linksDiv.appendChild(breakNode);
      linksDiv.appendChild(checkboxLabel);
  }

  var prUrl = window.location.href.replace('github.com/', 'api.github.com/repos/');
  prUrl = prUrl.replace('commits', '');
  prUrl = prUrl.replace('pull', 'pulls');
  sendMsgToBkgrd({msg: 'all_commits', commits: commits, prUrl: prUrl});

};

clickCheckbox = function(event) {
  var checkedCommits = document.querySelectorAll('[name="differ_commit"]:checked');
  if (checkedCommits.length === 2) {
    var currentWindow = window.location.href;
    var base = checkedCommits[0].value;
    var compare = checkedCommits[1].value;
    var compareString = 'compare/' + base + '...' + compare + '?diff=split';
    var compareUrl = currentWindow.replace(/pull.*|commits.*/, compareString);
    var prCommits = [];
    for (var i = checkedCommits.length - 1; i >= 0; i--) {
      if (checkedCommits[i].getAttribute('has-pr-commits')) {
        prCommits.push(checkedCommits[i].value);
      }
    }

    var prUrl = window.location.href.replace('github.com/', 'api.github.com/repos/');
    prUrl = prUrl.replace('commits', '');
    prUrl = prUrl.replace('pull', 'pulls');
    var data = {
      msg: 'checked_commit',
      commits: prCommits,
      prUrl: prUrl
    };
    sendMsgToBkgrd(data);

    window.location = compareUrl;
  } else {
    changeLabelText(event);
  }
};

changeLabelText = function (event) {
  var target = event.target;
  var parentNode = target.parentNode;
  var labels = document.getElementsByClassName('differ_label');
  if (target.checked) {
    target.parentNode.innerHTML = 'Pick another commit ';
  } else {
    target.parentNode.innerHTML = 'Click to compare this commit ';
  }
  parentNode.appendChild(target);
};

confirmGithubUrl = function () {
  var gitHubRE = /.*github.com\/.*\/pull\/[0-9]*\/commits.*/;
  if (gitHubRE.test(window.location.href)) {
    addCheckbox();
  }
};

addPRCommentLabel = function (comments) {
  for (var i = comments.length - 1; i >= 0; i--) {
    var commit = comments[i].commit_id;
    if (!document.getElementById('pr_comment_' + commit)) {
      var differLabel = document.getElementById('label_' + commit);
      var commentLabel = document.createElement('label');
      var breakNode = document.createElement('br');
      var parent = differLabel.parentNode;
      var differCheckbox = document.getElementById('differ_' + commit);
      differCheckbox.setAttribute('has-pr-commits', 'true');

      commentLabel.id = 'pr_comment_' + commit;
      commentLabel.innerHTML = 'Has PR comments';
      commentLabel.style.color = 'rgb(64, 120, 192)';
      parent.appendChild(breakNode);
      parent.appendChild(commentLabel);
    }
  }
};

window.onLoad = confirmGithubUrl();


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request === 'on_github_commit') {
      sendResponse('on_github_commit recieved');
      addCheckbox();
    } else if (request.commitComments) {
      sendResponse('commitComments recieved');
      addPRCommentLabel(request.commitComments);
    }
  }
);




