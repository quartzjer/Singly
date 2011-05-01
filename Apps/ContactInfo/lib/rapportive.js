var request = require('request');

function getDataFromEmail(emailAddr, callback) {
    request.get({uri:'http://rapportive.com/contacts/email/' + escape(emailAddr)}, function(err, resp, body) {
        if(err || !body)
            callback(err, body);
        else
            callback(err, JSON.parse(body));
    });
}

function getDataFromTwitter(twitterHandle, callback) {
    request.get({uri:'http://rapportive.com/contacts/twitter/' + twitterHandle}, function(err, resp, body) {
        if(err || !body)
            callback(err, body);
        else
            callback(err, JSON.parse(body));
    });
}

exports.getDataFromEmail = getDataFromEmail;
exports.getDataFromTwitter = getDataFromTwitter;