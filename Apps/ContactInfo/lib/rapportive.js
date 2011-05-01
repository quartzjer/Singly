var request = require('request');

exports.getDataFromEmail = function(emailAddr, callback) {
    get('email', encodeURIComponent(emailAddr), callback);
}

exports.getDataFromTwitter = function(twitterHandle, callback) {
    get('twitter', twitterHandle, callback);
}

function get(type, account, callback) {
    request.get({uri:'http://rapportive.com/contacts/' + type + '/' + account}, function(err, resp, body) {
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