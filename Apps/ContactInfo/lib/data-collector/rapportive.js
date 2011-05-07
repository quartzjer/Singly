var EventEmitter = require('events').EventEmitter;
var rapportive = require('../rapportive.js');

var emitter = new EventEmitter();
exports.getEventEmitter = function() {
    return emitter;
}

exports.getNewData = function(newEmailAddressEvent) {
//    console.log(newEmailAddressEvent);
    rapportive.getDataFromEmail(newEmailAddressEvent.email, function(err, contact) {
        if(!err && contact)
            emitter.emit('new-data', {type:'rapportive', data:contact, source_event:newEmailAddressEvent});
        else
            emitter.emit('new-data-error', {type:'rapportive', error:err, data:contact, source_event:newEmailAddressEvent});
    });
}