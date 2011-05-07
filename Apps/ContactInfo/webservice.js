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
    console.log(query.text);
    dataStore.getContacts(query.text, options, function(err, docs) {
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
    if(!(via == 'lockerproject' || via == 'singlyinc' || via == 'quartzjer' || via == 'singlydotcom')) {
        res.writeHead(400);
        res.end('via must be equal to lockerproject, singlyinc, or quartzjer for now!');
    } else if(!(type == 'twitter' || type == 'github' || type == 'email')) {
        res.writeHead(400);
        res.end('type must be equal to twitter for now!');
    } else if(!((type == 'twitter' && req.body.screen_name) || 
                (type == 'github' && req.body.user && req.body.user.login) || 
                (type == 'email' && req.body && req.body.email && req.body.date))) {
        console.error(req.body);
        res.writeHead(400);
        res.end('twitter data has no screen_name, login, or email object, data:', req.body);
    } else {
        if(type == 'twitter') {
            dataCollector.addAccount(type, req.body.screen_name, 
                                     {following:via, engaged:new Date().getTime()}, req.body);
        } else if(type == 'github') {
            dataCollector.addAccount(type, req.body.user.login, 
                                     {following : req.body.repo.username + '/' + req.body.repo.reponame, 
                                      engaged : new Date().getTime()},
                                      req.body.user);
        } else if(type == 'email') {
            console.log(req.body);
//            dataCollector.addAccount(type, req.body.email, {engaged: req.body.date});
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

app.post('/data/update/notes', function(req, res) {
    var id = req.body.id;
    var notes = req.body.notes;
    console.log('id =', id);
    console.log('notes =', notes);
    dataStore.setNotes(id, notes, function(err) {
        if(err) {
            res.writeHead(500);
            res.end(JSON.stringify(err));
        } else {
            res.writeHead(200);
            res.end();
        }
    })
});

app.get('/update/searchtext', function(req, res) {
    dataStore.updateAllSearchText(function(length) {
        console.log(length);
        res.writeHead(200);
        res.end();
    });
});


app.get('/data/search', function(req, res) {
    var text = req.query.text;
    dataStore.textSearch(text, function(err, cursor) {
        console.log('phew');
        if(err) {
            res.writeHead(500);
            res.end(JSON.stringify(err));
            return;
        } else {
            res.writeHead(200, {'Content-Type': 'application/json'});
            // res.write('[');
            // try { console.log(cursor.count()); } catch(err) {
                // console.error(err);
            // }
            cursor.toArray(function(err, docs) {
                console.log(docs.length);
                res.write(JSON.stringify(docs));
                res.end();
                return;
            });
        }
    });
});
dataCollector.start(function() {
    app.listen(8080);
});