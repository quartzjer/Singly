var EventEmitter = require('events').EventEmitter,
    github = require('../github-sync.js')

var emitter = new EventEmitter();
exports.getEventEmitter = function() {
    return emitter;
}

exports.getNewData = function(newGitHubAccountEvent) {
    console.log(newGitHubAccountEvent);
    getGithubData(newGitHubAccountEvent.username, function(err, user) {
        if(!err)
            emitter.emit('new-data', {type:'github', data:user, source_event:newGitHubAccountEvent});
        else
            console.error('got github error for username', newGitHubAccountEvent.username, ':', user);
    });
}

function getGithubData(username, callback) {
    github.getUserInfo(username, function(err, data) {
        if(err) {
            callback(err, data);
        } else if(!data.user || !data.user.login) {
            callback(new Error(), data);
        } else {
            var user = data.user;
            user._username_lowercase = user.login.toLowerCase();
            callback(null, user);
        }
    });
}