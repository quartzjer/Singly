var request = require('request');

exports.getDataFromEmail = function(emailAddr, callback) {
    get('email', encodeURIComponent(emailAddr), callback);
}

exports.getDataFromTwitter = function(twitterHandle, callback) {
    get('twitter', twitterHandle, callback);
}

var cacheUrl = 'http://localhost:3456/contacts/';
var rapportiveUrl = 'http://rapportive.com/contacts/'

var baseURL = cacheUrl;

exports.bypassCache = function() {
    baseURL = rapportiveUrl;
}
exports.useCache = function() {
    baseURL = cacheUrl;
}

function get(type, account, callback) {
    request.get({uri:baseURL + type + '/' + account}, function(err, resp, body) {
        if(err) {
            try {
                body = JSON.parse(body);
            } catch (err) { }
            callback(err, body);
        }
        else {
            var contact = JSON.parse(body).contact;
            if(contact.memberships) { //convert memberships from array to dictionary
                var membershipsArr = contact.memberships;
                contact.memberships = {};
                for(var i in membershipsArr) {
                    var type = membershipsArr[i].icon_name || membershipsArr[i].widget_name;
                    contact.memberships[type] = membershipsArr[i];
                }
            }
            callback(err, contact);
        }
    });
}