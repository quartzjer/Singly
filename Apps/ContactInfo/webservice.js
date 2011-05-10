var express = require('express'),
    connect = require('connect'),
    app = express.createServer(
        connect.basicAuth(function(user, pass){
          return 'singly' == user && 's1ngly' == pass;
        }),
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

