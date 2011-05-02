var EventEmitter = require('events').EventEmitter,
    klout = require('klout-js')('xz5sqcss2dx43ctsxxxngpa8');

var emitter = new EventEmitter();
exports.getEventEmitter = function() {
    return emitter;
}

exports.getNewData = function(newTwitterAccountEvent) {
    getKloutData(newTwitterAccountEvent.username, function(err, contact) {
        if(!err)
            emitter.emit('new-data', {type:'klout', data:contact, source_event:newTwitterAccountEvent});
        else {
//            console.error('got klout err, err:', err);
            console.error('got klout err for username', newTwitterAccountEvent.username, ', data:', contact);
        }
    });
}

function getKloutData(twitter_username, callback) {
    var contact = {username:twitter_username.toLowerCase()};
    klout.show(twitter_username, function(err, json) {
        if(err)
            callback(err, null);
        else if(json.status != 200 || !json.users || !json.users.length || !json.users[0].score)
            callback(new Error(), json);
        else {
            contact.score = json.users[0].score;
            klout.topics(twitter_username, function(err, json) {
                if(err)
                    callback(err, json);
                else if(json.status != 200 || !json.users || !json.users.length || !json.users[0].topics)
                    callback(new Error(), json);
                else {
                    if(json.users && json.users[0])
                        contact.topics = json.users[0].topics;  
                    callback(null, contact);
                }
            });
        }
    });
}
