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
    res.writeHead(200);
    var contact = req.body;
//    console.log('contact:', contact.screen_name);
    request.post({uri:'http://localhost:8080/new/twitter/lockerproject',
                  json:contact}, function(err, resp, body) {
//                      console.log('response body:', body);
                  });
    res.end();
});

var stdin = process.openStdin();
stdin.setEncoding('utf8');
stdin.on('data', function (chunk) {
    var processInfo = JSON.parse(chunk);
    process.chdir(processInfo.workingDirectory);
    console.error(process.cwd());
    locker = require(process.cwd() + '/../../Common/node/locker.js');
    locker.initClient(processInfo);
    app.listen(processInfo.port);
    var returnedInfo = {port: processInfo.port};
    console.log(JSON.stringify(returnedInfo));
    locker.listen('contact/twitter', '/contact/twitter');
});