if(!process.argv[2]) {
    console.log('usage: node csv-to-db.js <filename>');
    process.exit(1);
}


require.paths.push(__dirname + '/../lib');
var EmailReader = require('email-reader').EmailReader;
var dataCollector = require('data-collector');

var emailReader = new EmailReader(process.argv[2]);

var emmiter = new require('events').EventEmitter();

dataCollector.start(function() {
    emailReader.readEmails(function(signups) {
        waitAndCall(signups, function(signup) {
            console.log(signup);
            dataCollector.addAccount('email', signup.email, {engaged:signup.dateStamp});
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
