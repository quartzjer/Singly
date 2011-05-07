if(!process.argv[2]) {
    console.log('usage: node csv-to-db.js <filename>');
    process.exit(1);
}


require.paths.push(__dirname + '/../lib');
var EmailReader = require('email-reader').EmailReader;
//var dataCollector = require('data-collector');
var request = require('request');
var websvcURI = 'http://localhost:8080/new/email/singlydotcom';

var emailReader = new EmailReader(process.argv[2]);

var emmiter = new require('events').EventEmitter();

dataCollector.start(function() {
    emailReader.readEmails(function(signups) {
        waitAndCall(signups, function(signup) {
            console.log(signup);
//            dataCollector.addAccount('email', signup.email, {engaged:signup.dateStamp});
            request.post({uri:websvcURI, json:{email:signup.email, date:signup.dateStamp}}, function(err, resp, body) {
                
            });
        });
    });
});

var averageInterval = 200;
function waitAndCall(signups, callback) {
    if(signups.length < 1)
        return;
    callback(signups.shift());
    setTimeout(function() {
        waitAndCall(signups, callback);
    }, Math.random()*averageInterval*2);
}
