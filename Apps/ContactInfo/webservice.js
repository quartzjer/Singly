var express = require('express'),
    connect = require('connect'),
    app = express.createServer(
        express.static(__dirname + '/web'),
        connect.bodyParser()
        );//
        
var assert = require('assert');

var dataStore = require('./lib/data-store.js'),
    dataCollector = require('./lib/data-collector.js');

app.get('/data/contacts', function(req, res) {
    var options = {};
    var query = req.query;
    if(query.skip)
        options.skip = query.skip;
    if(query.limit)
        options.limit = query.limit;
        
    console.log(query.sort);
    var sort = [];
    if(query.sort) {
        for(var i in query.sort)
            sort.push(query.sort[i]);
        options.sort = sort;
    }
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

app.post('/new/:type/:via', function(req, res) {
    req.params.via;
    req.params.type;
    if(!(req.params.via == 'lockerproject' || req.params.via == 'singlyinc')) {
        res.writeHead(400);
        res.end('via must be equal to lockerproject or singlyinc for now!');
    } else if(req.params.type != 'twitter') {
        res.writeHead(400);
        res.end('type must be equal to twitter for now!');
    } else if(!req.body.screen_name) {
        res.writeHead(400);
        res.end('twitter data has no screen_name object, data:', req.body);
    } else {
        dataCollector.addAccount(req.params.type, req.body.screen_name, {following:req.params.via, engaged:new Date().getTime()}, req.body);
        res.writeHead(200);
        res.end();
    }
});

dataCollector.start(function() {
    app.listen(8080);
});