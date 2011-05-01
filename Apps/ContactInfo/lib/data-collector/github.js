var EventEmitter = require('events').EventEmitter,
    github = require('../github-sync.js')

var emmiter = new EventEmitter();
exports.getEventEmitter = function() {
    return emmiter;
}

exports.getNewData = function(newGitHubAccountEvent) {
    console.log(newGitHubAccountEvent);
    getGithubData(newGitHubAccountEvent.username, function(err, data) {
        emmiter.emit('new-data', {type:'github', data:data.user});
    });
}

function getGithubData(username, callback) {
    github.getUserInfo(username, callback);
}