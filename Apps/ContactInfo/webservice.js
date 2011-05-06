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
    var via = req.params.via;
    var type = req.params.type;
    if(!(via == 'lockerproject' || via == 'singlyinc' || via == 'quartzjer')) {
        res.writeHead(400);
        res.end('via must be equal to lockerproject, singlyinc, or quartzjer for now!');
    } else if(!(type == 'twitter' ||     type == 'github')) {
        res.writeHead(400);
        res.end('type must be equal to twitter for now!');
    } else if(!(req.body.screen_name || req.body.user.login)) {
        console.error(req.body);
        res.writeHead(400);
        res.end('twitter data has no screen_name or login object, data:', req.body);
    } else {
        if(type == 'twitter') {
            dataCollector.addAccount(type, req.body.screen_name, 
                                    {following:via, engaged:new Date().getTime()}, req.body);
        } else if(type == 'github') {
            dataCollector.addAccount(type, req.body.user.login, 
                                    {following:req.body.repo.username + '/' + req.body.repo.reponame, engaged:new Date().getTime()},
                                    req.body.user);
//            console.log('got github acct', req.body);
        }
        res.writeHead(200);
        res.end();
    }
});


app.get('/data/tags/add', function(req, res) {
    var _id = req.query.id;
    var tag = req.query.tag;
    console.log('_id:', _id)
    console.log('tag:', tag)
    dataStore.addTag(_id, tag, function(err, doc) {
        res.writeHead(200);
        res.end();
    })
});

app.get('/data/tags/drop', function(req, res) {
    var _id = req.query.id;
    var tag = req.query.tag;
    console.log('_id:', _id)
    console.log('tag:', tag)
    dataStore.dropTag(_id, tag, function(err, doc) {
        res.writeHead(200);
        res.end();
    })
});

dataCollector.start(function() {
    app.listen(8080);
});