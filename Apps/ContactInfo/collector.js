var express = require('express'),
    connect = require('connect'),
    app = express.createServer(
        connect.bodyParser()
        );//
        
var assert = require('assert');

var dataStore = require('./lib/data-store.js'),
    dataCollector = require('./lib/data-collector.js');

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
//            console.log(req.body);
            dataCollector.addAccount(type, req.body.email, {engaged: req.body.date});
        }
        res.writeHead(200);
        res.end();
    }
});


app.get('/update/searchtext', function(req, res) {
    dataStore.updateAllSearchText(function(length) {
        console.log(length);
        res.writeHead(200);
        res.end();
    });
});

dataCollector.start(function() {
    app.listen(8081);
});