var EventEmitter = require('events').EventEmitter,
    klout = require('klout-js')('xz5sqcss2dx43ctsxxxngpa8');

var emmiter = new EventEmitter();
exports.getEventEmitter = function() {
    return emmiter;
}

exports.getNewData = function(newTwitterAccountEvent) {
    getKloutData(newTwitterAccountEvent.username, function(err, data) {
        if(!err)
            emmiter.emit('new-data', {type:'klout', data:data});
    });
}

function getKloutData(twitter_username, callback) {
    var contact = {username:twitter_username};
    klout.show(twitter_username, function(err, json) {
        if(err || json.status != 200)
            callback(err, json);
        else {
            contact.score = json.users[0].score;
            klout.topics(twitter_username, function(err, json) {
                if(err || json.status != 200)
                    callback(err, json);
                else {
                    if(json.users && json.users[0])
                        contact.topics = json.users[0].topics;  
                    callback(null, contact);
                }
            });
        }
    });
}
