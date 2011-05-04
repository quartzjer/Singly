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

app.post('/contact/twitter', function(req, res) {
    var contact = req.body.obj;
    if(!contact || !req.body._via || !contact.screen_name) {
        res.writeHead(400);
        console.log('bad contact!', req.body);
        res.end('bad contact:' + JSON.stringify(contact));
        return;
    }
    getHandleForID(req.body._via[0], function(err, handle) {
        console.log('posting new contact ' + contact.screen_name + ' to http://localhost:8080/new/twitter/' + handle);
        request.post({uri:'http://localhost:8080/new/twitter/' + handle, json:contact}, function(err, resp, body) {
            
            res.writeHead(200);
            res.end();
        });
    })
});

var handle_id_map = {};
function getHandleForID(id, callback) {
    if(handle_id_map[id]) {
        callback(null, handle_id_map[id]);
        return;
    } else {
        locker.providers('contact/twitter', function(providers) {
            console.log(providers);
            for(var i in providers) {
                if(providers[i].id == id) {
                    request.get({uri:providers[i].uri + 'get_profile'}, function(err, resp, body) {
                        if(err) {
                            callback(err, body);
                        } else if(!body) {
                            callback(new Error(), "no body!");
                        } else {
                            var profile = JSON.parse(body);
                            handle_id_map[id] = profile.screen_name.toLowerCase();
                            callback(null, handle_id_map[id]);
                        }
                    });
                    return;
                }
            }
        });
    } 
}


var stdin = process.openStdin();
stdin.setEncoding('utf8');
stdin.on('data', function (chunk) {
    var processInfo = JSON.parse(chunk);
    process.chdir(processInfo.workingDirectory);
    console.error(process.cwd());
    locker = require(process.cwd() + '/../../Common/node/locker.js');
    locker.initClient(processInfo);
    locker.providers('contact/twitter', function(providers) {
        console.error('providers',providers);
        for(var i in providers) {
            getHandleForID(providers[i].id, function(err, handle) {
                console.error('mapped handle', handle);
                console.error(handle_id_map);
            });
        }
    });
    app.listen(processInfo.port);
    var returnedInfo = {port: processInfo.port};
    console.log(JSON.stringify(returnedInfo));
    locker.listen('contact/twitter', '/contact/twitter');
});