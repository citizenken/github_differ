addCheckbox = function () {
  var existingCheckBoxes = document.querySelectorAll('[name="differ_commit"]');
  if (existingCheckBoxes.length > 0) {
    return;
  }

  var commits = document.querySelectorAll('li.commit');
    for (var i = 0; i < commits.length; i++) {
        var commitDiv = commits[i];
        var commit = commitDiv.getAttribute('data-channel').replace(/.*:commit:/, '');
        var linksDiv = commitDiv.getElementsByClassName('commit-links-cell')[0];
        var checkbox = document.createElement('input');
        var checkboxLabel = document.createElement('label');
        var breakNode = document.createElement('br');
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
};

clickCheckbox = function(event) {
  var checkedCommits = document.querySelectorAll('[name="differ_commit"]:checked');
  if (checkedCommits.length === 2) {
    var currentWindow = window.location.href;
    var base = checkedCommits[0].value;
    var compare = checkedCommits[1].value;
    var compareString = 'compare/' + base + '...' + compare + '?diff=split';
    var compareUrl = currentWindow.replace(/pull.*|commits.*/, compareString);
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

window.onLoad = confirmGithubUrl();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse('recieved');
    addCheckbox();
  }
);




