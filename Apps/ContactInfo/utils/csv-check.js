if(!process.argv[2]) {
    console.log('usage: node csv-check.js <filename>');
    process.exit(1);
}


require.paths.push(__dirname + '/../lib');
var EmailReader = require('email-reader').EmailReader;
var dataStore = require('data-store');

var emailReader = new EmailReader(process.argv[2]);

var emmiter = new require('events').EventEmitter();

emailReader.readEmails(function(signups) {
    dataStore.openCollection(function() {
        console.log(signups.length);
        checkEmail(signups, function() {
            dataStore.close();
        });
    });
});

function checkEmail(signups, callback) {
    if(signups.length == 0) {
        callback();
        return;
    }
    var signup = signups.shift();
    dataStore.getByEmailAddress(signup.email, function(err, cursor) {
        cursor.toArray(function(err, contacts) {
            if(err) {
                console.error('for email addr', signup.email, 'got error', err);
            } else if(!contacts || !contacts.length == 1 || !contacts[0] || 
                      !contacts[0].rapportive || !contacts[0].rapportive.email || 
                      contacts[0].rapportive.email != signup.email) {
                console.log('for email addr', signup.email ,'contact:', contacts);
            } else {
              //  console.log('found for', signup.email);
            }
            checkEmail(signups, callback);
        });
    });
}