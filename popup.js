cbFunc = function (responseUrl) {
    var code = responseUrl.replace(/.*=/, '');
    var url = 'https://github.com/login/oauth/access_token';
    var data = {
      client_id: 'bbb145d82d62e9c7d41c',
      client_secret: '56f36fb80ee9903afda3b944b7d9152701e79fb1',
      code: code
    };

    $.ajax({
        method: "POST",
        url: url,
        data: data
      })
      .done(function (response) {
        var accessToken = response.split('&')[0].replace(/.*=/, '');
        localStorage.setItem('gh_token', accessToken);
      })
      .fail(function(response) {
        console.log(response);
      });

};

testFunc = function () {
    var clientId = 'bbb145d82d62e9c7d41c';
    var url = 'https://github.com/login/oauth/authorize';
    url += '?client_id=' + clientId;
    url += '&scope=user,repo';

    var info = {
        url: url,
        interactive: true
    };

    chrome.identity.launchWebAuthFlow(info, cbFunc);
};



if (!localStorage.getItem('gh_token')) {
  document.getElementById('test_btn').addEventListener('click', testFunc, false);
} else {
  document.getElementById('test_btn').style.display = 'none';
}