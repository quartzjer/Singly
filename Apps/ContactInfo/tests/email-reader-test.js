var EmailReader = require('../lib/email-reader.js').EmailReader;

var er = new EmailReader('../data/emails.csv');

er.readEmails(function(emails) {
    console.log(emails.length);
    console.log(emails[0]);
    console.log(emails[1]);
})