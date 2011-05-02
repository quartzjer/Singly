var express = require('express'),
    connect = require('connect'),
    app = express.createServer();//connect.bodyParser());
    request = require('request'),
    redis = require('redis'),
    cache = redis.createClient();

var rapportiveUrl = 'http://rapportive.com/contacts/'

app.get('/contacts/:type/:account', function(req, res) {
    res.writeHead(200, 'text/json');
    var account = req.params.account;
    var type = req.params.type;
    cache.get(type + '_' + account, function(err, resp) {
        if(resp) {
            res.end(resp);
            return;
        } else {
            console.log('making rapportive request for', account);
            request.get({uri:rapportiveUrl + type + '/' + account}, function(err, resp, body) {
                res.end(body);
                cache.set(type + '_' + account, body);
            });
            
        }
    });
});

app.listen(3456);