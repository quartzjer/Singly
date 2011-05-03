var express = require('express'),
    connect = require('connect'),
    app = express.createServer();//connect.bodyParser());
    request = require('request'),
    redis = require('redis'),
    crypto = require('crypto'),
    cache = redis.createClient();

var baseUrl = 'http://api.klout.com/1/'

app.get('/*', function(req, res) {
    res.writeHead(200, 'text/json');
    var hashUrl = 'klout_' + hash(res.url);
    cache.get(hashUrl, function(err, resp) {
        if(resp) {
            res.end(resp);
            return;
        } else {
            console.log('making klout request for', req.url);
            request.get({uri:baseUrl + req.url}, function(err, resp, body) {
                res.end(body);
                cache.set(hashUrl, body);
            });
            
        }
    });
});

function hash(url) {
    var h = crypto.createHash('md5');
    h.update(url);
    return h.digest('hex').substring(0, 16);
}

app.listen(4567);