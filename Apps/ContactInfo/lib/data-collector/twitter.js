var EventEmitter = require('events').EventEmitter;

console.log(__dirname);
var auth = JSON.parse(require('fs').readFileSync(__dirname + '/twitter-auth.json')),
    twitterClient = require('twitter-js')(auth.consumerKey, auth.consumerSecret);

var emmiter = new EventEmitter();

exports.getNewData = function(newTwitterAccountEvent) {
    enqueueUser(newTwitterAccountEvent.username);
}
exports.getEventEmitter = function() {
    return emmiter;
}

var userQueue = [];

var nextUpdateTimeout;

function enqueueUser(username) {
//    console.log('enqueueUser:', username);
    userQueue.push(username);
    if(userQueue.length >= 100)
        dequeueUsers();
}

var dequeing = false;
function dequeueUsers() {
    if(dequeing) return;
    dequeing = true;
    try {
        var length = userQueue.length;
        if(length == 0) {
            dequeing = false;
            return;
        }
//        console.log('dequeueUsers:', userQueue.length);
        if(length > 100) length == 100;
        var screenNames = '';
        for(var i = 0; i < length - 1 && userQueue.length > 0; i++)
            screenNames += userQueue.shift() + ',';
        if(userQueue.length > 0)
            screenNames += userQueue.shift();
    } catch(err) {
        console.error(err);
    }
    dequeing = false;
    if(screenNames.length > 0) {
        getUserData(screenNames);
        if(userQueue.length >= 100)
            dequeueUsers();
    }
}

function getUserData(id_str) {
    console.log('calling twitter with:', id_str);
    twitterClient.apiCall('GET', '/users/lookup.json', { token: { oauth_token_secret: auth.token.oauth_token_secret,
                                                                  oauth_token: auth.token.oauth_token}, 
                                                         screen_name: id_str,
                                                         include_entities : true },
        function(error, result) {
            if(error) {
                console.error('error! ' + JSON.stringify(error));
                return;
            }
            for(var i in result)
                emmiter.emit('new-data', {type:'twitter', data:result[i]});
        });
}

setInterval(dequeueUsers, 5000);