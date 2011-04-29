var express = require('express'),
    connect = require('connect'),
    app = express.createServer();//connect.bodyParser());

var manager = require('./manager.js');

app.get('/', function(req, res) {
    res.writeHead(200);
    var email = req.query.email;
    manager.processEmail(email, function(err, cleanName contact) {
        var obj = {};
        obj[cleanName] = contact;
        res.end(JSON.stringify(obj));
    });
});

app.listen(3000);