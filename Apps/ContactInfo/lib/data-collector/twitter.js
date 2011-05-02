var EventEmitter = require('events').EventEmitter;

console.log(__dirname);
var auth = JSON.parse(require('fs').readFileSync(__dirname + '/twitter-auth.json')),
    twitterClient = require('twitter-js')(auth.consumerKey, auth.consumerSecret);

var emitter = new EventEmitter();

exports.getNewData = function(newTwitterAccountEvent) {
    enqueueEvent(newTwitterAccountEvent);
}
exports.getEventEmitter = function() {
    return emitter;
}

var eventQueue = [];

var nextUpdateTimeout;

function enqueueEvent(newTwitterAccountEvent) {
//    console.log('enqueueEvent:', username);
    eventQueue.push(newTwitterAccountEvent);
    if(eventQueue.length >= 100)
        dequeueEvents();
}

var dequeing = false;
function dequeueEvents() {
    if(dequeing) return;
    dequeing = true;
    try {
        var length = eventQueue.length;
        if(length == 0) {
            dequeing = false;
            return;
        }
        var eventHash = {};
//        console.log('dequeueEvents:', eventQueue.length);
        if(length > 100) length == 100;
        var screenNames = '';
        for(var i = 0; i < length && eventQueue.length > 0; i++) {
            var anEvent = eventQueue.shift();
            screenNames += anEvent.username + ',';
            eventHash[anEvent.username.toLowerCase()] = anEvent;
        }
    } catch(err) {
        console.error(err);
    }
    dequeing = false;
    if(screenNames.length > 0) {
        getUserData(screenNames, eventHash);
        if(eventQueue.length >= 100)
            dequeueEvents();
    }
}

function getUserData(id_str, eventHash) {
//    console.log('calling twitter with:', id_str);
    twitterClient.apiCall('GET', '/users/lookup.json', { token: { oauth_token_secret: auth.token.oauth_token_secret,
                                                                  oauth_token: auth.token.oauth_token}, 
                                                         screen_name: id_str,
                                                         include_entities : true },
        function(error, result) {
            if(error) {
                console.error('error! ' + JSON.stringify(error));
                return;
            }
            for(var i in result) {
                var screen_name = result[i].screen_name;
                if(screen_name && eventHash[screen_name.toLowerCase()]) {
                    result[i]._username_lowercase = screen_name.toLowerCase();
                    emitter.emit('new-data', {source_event: eventHash[result[i].screen_name.toLowerCase()], 
                                              type:'twitter', 
                                              data:result[i]});
                } else {
                    console.error('twitter error:', result[i]);
                }
            }
        });
}

setInterval(dequeueEvents, 5000);