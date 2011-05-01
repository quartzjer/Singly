//https://github.com/api/v2/json/repos/show/quartzjer/locker/watchers?full=1

var request = require('request');
var querystring = require('querystring');

var urlBase = 'https://github.com/api/v2/json';


exports.getWatchers = function(username, reponame, callback) {
    get('/repos/show/' + username + '/' + reponame + '/watchers', {full:1}, function(err, data) {
        if(!data)
            callback(err, data);
        else
            callback(err, data.watchers);
    });
}

exports.getUserInfo = function(username, callback) {
    get('/user/show/' + username, null, callback);
}


function get(endpoint, params, callback) {
    var url = urlBase + endpoint;
    if(params)
        url += '?' + querystring.stringify(params);
    request.get({uri:url}, function(err, resp, body) {
        if(err)
            callback(err);
        else if(body)// && (!resp || resp.statusCode == 200))
            callback(err, JSON.parse(body));
    });
    
}