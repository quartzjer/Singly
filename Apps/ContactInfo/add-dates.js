var EmailReader = require('./lib/email-reader.js').EmailReader;
var dataStore = require('./lib/data-store.js');
var dataCollector = require('./lib/data-collector.js');
var assert = require('assert');
var dataCollector = require('./lib/data-collector.js');

//console.log(assert);
var emailReader = new EmailReader('data/emails.txt');

dataStore.openCollection(function() {
    emailReader.readEmails(function(signups) {
        addDate(signups, function() {
            dataStore.close();
        })
    });
});

function addDate(signups, callback) {
    if(!signups || signups.length < 1) {
        callback();
        return;
    }
    var signup = signups.pop();
    assert.notEqual(signup, null);
    assert.notEqual(signup, undefined);
    assert.notEqual(signup.email, null);
    assert.notEqual(signup.email, undefined);
    dataStore.getByEmailAddress(signup.email, function(err, cursor) {
        cursor.nextObject(function(err, contact) {
            if(contact == null || contact.email == null) {
                console.log('contact was not in DB for signup:', signup, 'attempting to get more data...');
                dataCollector.getDataFromEmail(signup.email, function(cleanName, contact) {
                    if(!contact || contact.email != signup.email) {
                        console.log('could not get data for signup:', signup, 'putting signup in without data...');
                        contact = {};
                        contact.email = signup.email;
                        contact.signupDate = signupDate.dateStamp;
                    } else {
                        console.log('got new data for signup:', signup, 'putting in contact data...');
                    }
                    dataStore.putContact(cleanName, contact, function() {
                        addDate(signups, callback);
                    });
                });
            } else {
                contact.signupDate = signup.dateStamp;
                var cleanName = dataCollector.getCleanName(contact);
                assert.notEqual(cleanName, null);
                assert.notEqual(cleanName, undefined);
                dataStore.putContact(cleanName, contact, function() {
                    addDate(signups, callback);
                });
            }
        });
    });
}