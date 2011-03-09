
var lockerBase = 'http://localhost:3001';

var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    sys = require('sys'),
    express = require('express'),
    connect = require('connect'),
    http = require('http'),
    wwwdude = require('wwwdude'),
    wwwdude_client = wwwdude.createClient({
        encoding: 'utf-8'
    });
    
var app = express.createServer(
                connect.bodyDecoder(),
                connect.cookieDecoder(),
                connect.session({secret : "locker"})
            );
            
app.get('/sess', function(req, res) {
    res.writeHead(200);
    console.log(sys.inspect(req.session));
    if(!req.session.simon)
        req.session.simon = "hellooo sess final";
    res.end();
});
app.listen(3001);