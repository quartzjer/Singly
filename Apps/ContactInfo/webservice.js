var express = require('express'),
    connect = require('connect'),
    app = express.createServer(
        express.static(__dirname + '/web')
        );//connect.bodyParser());

var dataStore = require('./lib/data-store.js');

app.get('/data/contacts', function(req, res) {
    var options = {};
    var query = req.query;
    if(query.skip)
        options.skip = query.skip;
    if(query.limit)
        options.limit = query.limit;
    if(query.sort)
        options.sort = query.sort;
    dataStore.getContacts(options, function(err, docs) {
        if(!err) {
            res.writeHead(200, {'Content-Type':'text/json'});
            res.end(JSON.stringify(docs));
        }
        else {
            res.writeHead(500, {'Content-Type':'text/json'});
            res.end({'error':err});
        }
    });
});

dataStore.openCollection(function() {
    app.listen(8080);
});