var dataCollector = require('./lib/data-collector.js');
var dataStore = require('./lib/data-store.js');

exports.init = function(callback) {
    dataStore.openCollection(function(err, collection) {
        callback(err);
    });
}

exports.processEmail = function(emailAddress, callback) {
    dataCollector.getDataFromEmail(emailAddress, function(cleanName, contact){
        contact.signup_date = new Date().getTime();
        dataStore.putContact(cleanName, contact, function(err, doc) {
            callback(err, cleanName, contact);
        });
    });
}