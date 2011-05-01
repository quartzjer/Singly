var EventEmitter = require('events').EventEmitter;
var rapportive = require('../rapportive.js');

var emitter = new EventEmitter();
exports.getEventEmitter = function() {
    return emitter;
}

exports.getNewData = function(newEmailAddressEvent) {
    rapportive.getDataFromEmail(newEmailAddressEvent.email, function(err, data) {
        if(!err && data)
            emitter.emit('new-data', {type:'rapportive', data:data});
        else
            console.error(err);
    });
}