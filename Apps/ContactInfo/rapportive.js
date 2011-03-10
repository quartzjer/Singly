var wwwdude = require('wwwdude');

function getDataFromEmail(emailAddr, callback) {
    wwwdude.createClient().get('http://rapportive.com/contacts/email/' + escape(emailAddr))
    .addListener('success', function(data, resp) {
        var item = JSON.parse(data);
        callback(item);
    });
}

function getDataFromTwitter(twitterHandle, callback) {
    wwwdude.createClient().get('http://rapportive.com/contacts/twitter/' + twitterHandle)
    .addListener('success', function(data, resp) {
        var item = JSON.parse(data);
        callback(item);
    });
}

exports.getDataFromEmail = getDataFromEmail;
exports.getDataFromTwitter = getDataFromTwitter;