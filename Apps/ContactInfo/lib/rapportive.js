var request = require('request');

function getDataFromEmail(emailAddr, callback) {
    request.get({uri:'http://rapportive.com/contacts/email/' + escape(emailAddr)}, function(err, resp, body) {
        var item = JSON.parse(body);
        callback(item);
    });
}

function getDataFromTwitter(twitterHandle, callback) {
    request.get({uri:'http://rapportive.com/contacts/twitter/' + twitterHandle}, function(err, resp, body) {
        var item = JSON.parse(body);
        callback(item);
    });
}

exports.getDataFromEmail = getDataFromEmail;
exports.getDataFromTwitter = getDataFromTwitter;