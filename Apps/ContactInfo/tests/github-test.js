var gh = require('../lib/github-sync.js');

gh.getWatchers('quartzjer', 'locker', function(err, watchers) {
    console.log(watchers.length);
});

gh.getUserInfo('smurthasmith', function(err, userInfo) {
    console.log(userInfo);
});