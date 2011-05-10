/*
*
* Copyright (C) 2011, The Locker Project
* All rights reserved.
*
* Please see the LICENSE file for more information.
*
*/

var express = require('express'),
    connect = require('connect'),
    request = require('request'),
    fs = require('fs');

var locker;

var app = express.createServer(connect.bodyParser());

app.get('/', function(req, res) {
    res.writeHead(200);
    res.end('yeah!!');
});

var baseUrl = 'http://localhost:8081'

app.post('/contact/twitter', function(req, res) {
    var contact = req.body.obj;
    if(!contact || !req.body._via || !contact.screen_name) {
        res.writeHead(400);
        console.log('bad contact!', req.body);
        res.end('bad contact:' + JSON.stringify(contact));
        return;
    }
    getHandleForID(req.body._via[0], 'twitter', function(err, handle) {
        console.log('posting new contact ' + contact.screen_name + ' to ' + baseUrl + '/new/twitter/' + handle);
        request.post({uri: baseUrl + '/new/twitter/' + handle, json:contact}, function(err, resp, body) {
            
            res.writeHead(200);
            res.end();
        });
    })
});


app.post('/contact/github', function(req, res) {
    //{repo:{username:self.username, reponame:repo}, user:watcher});
    var obj = req.body.obj;
    if(!req.body._via || !obj || !obj.user || !obj.user.login) {
        res.writeHead(400);
        console.log('bad event!', req.body);
        res.end('bad contact:' + JSON.stringify(req.body));
        return;
    }
    getHandleForID(req.body._via[0], 'github', function(err, handle) {
        console.log('posting new contact ' + obj.user.login + ' to ' + baseUrl + '/new/github/' + handle);
        request.post({uri: baseUrl + '/new/github/' + handle, json:obj}, function(err, resp, body) {
            res.writeHead(200);
            res.end();
        });
    })
});

//var handleMap = {};
var handle_id_map = {};
function getHandleForID(id, serviceType, callback) {
    if(handle_id_map[id]) {
        callback(null, handle_id_map[id]);
        return;
    } else {
        getProfileFor(id, serviceType, callback);
    } 
}

function getProfileFor(id, serviceType, callback) {
    locker.providers('contact/' + serviceType, function(providers) {
        for(var i in providers) {
            if(providers[i].id == id) {
                request.get({uri:providers[i].uri + 'get_profile'}, function(err, resp, body) {
                    if(err) {
                        callback(err, body);
                    } else if(!body) {
                        callback(new Error(), "no body!");
                    } else {
                        console.error('uri:', providers[i].uri + 'get_profile');
                        // console.log(body);
                        var profile = JSON.parse(body);
                        console.log(profile.screen_name);
                        var sn = profile.screen_name;
                        if(serviceType == 'github')
                            sn = profile.login;
                        console.log('serviceType:', serviceType);
                        console.log('sn:', sn);
                        handle_id_map[id] = sn.toLowerCase();
                        callback(null, handle_id_map[id]);
                    }
                });
                return;
            }
        }
    });
}

function populateHandleMap(serviceType) {
    locker.providers('contact/' + serviceType, function(providers) {
        for(var i in providers) {
            getHandleForID(providers[i].id, serviceType, function(err, handle) {
                console.error('mapped handle', handle);
                console.error(handle_id_map);
            });
        }
    });
}

var stdin = process.openStdin();
stdin.setEncoding('utf8');
stdin.on('data', function (chunk) {
    var processInfo = JSON.parse(chunk);
    process.chdir(processInfo.workingDirectory);
    console.error(process.cwd());
    locker = require(process.cwd() + '/../../Common/node/locker.js');
    locker.initClient(processInfo);
    
    populateHandleMap('twitter');
    populateHandleMap('github');
    
    app.listen(processInfo.port);
    var returnedInfo = {port: processInfo.port};
    console.log(JSON.stringify(returnedInfo));
    locker.listen('contact/twitter', '/contact/twitter');
    locker.listen('contact/github', '/contact/github');
});