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
    klout.klout(twitter_username, function(err, json) {
//        console.log(json);
        if(err || json.status != 200) {
            console.error('oh noez!', err, json);
            if(callback) callback(new Error());
        }
        else {
            var contact = {username:twitter_username};
            var user = json.users[0];
            contact.klout_score = user.kscore;
            klout.topics(twitter_username, function(err, json) {
//                console.log(JSON.stringify(json));
                if(err || json.status != 200) {
                    console.error('oh noez!', err, json);
                    if(callback) callback(new Error(), contact);
                }
                else {
                    if(json.users && json.users[0])
                        contact.klout_topics = json.users[0].topics;  
                    if(callback) callback(null, contact);
                }
            })
        }
    });
}
