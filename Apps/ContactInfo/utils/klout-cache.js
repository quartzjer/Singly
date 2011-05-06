var express = require('express'),
    connect = require('connect'),
    app = express.createServer();//connect.bodyParser());
    request = require('request'),
    redis = require('redis'),
    crypto = require('crypto'),
    cache = redis.createClient();

var baseUrl = 'http://api.klout.com/1/'

app.get("/clean", function(req, res) {
    clean(function() {
        res.writeHead(200);
        res.end();
    })
})

function clean(callback) {
    cache.keys('klout_*', function(err, resp) {
        console.log(resp.length);
        for(var i in resp)
            checkValid(resp[i]);
        callback();
    })
}

function checkValid(hash) {
    cache.get(hash, function(err, resp) {
        if(resp.status != 200 || resp.users.length < 1  ) {
            console.log('deleting', resp);
            cache.del(hash, function(err, resp) {
                if(err)
                    console.error('err', err);
                else
                    console.log('resp', resp);
            });
        }
    });
}

app.get('/*', function(req, res) {
    res.writeHead(200, 'text/json');
    var hashUrl = 'klout_' + hash(req.url);
    cache.get(hashUrl, function(err, resp) {
        if(resp) {
            console.log('for url', req.url, 'with hash', hashUrl, ', got from cache');
            res.end(resp);
            return;
        } else {
            console.log('queueing klout request for', req.url);
            queueUrl(req.url, hashUrl, res);
            
        }
    });
});

var queue = [];

function queueUrl(url, hashUrl, res) {
    console.log('queueing klout request for', url);
    queue.push({url:url, hashUrl:hashUrl, res:res});
    if(!dequeuing) dequeue();
}


var dequeuing = false;
var minInterval = 110;
function dequeue() {
    dequeuing = true;
    if(queue.length > 0) {
        var req = queue.shift();
        process(req.url, req.hashUrl, req.res);
        setTimeout(dequeue, minInterval);
    } else {
        dequeuing = false;
    }
}

function process(url, hashUrl, res) {
    console.log('making klout request for', url);
    request.get({uri:baseUrl + url}, function(err, resp, body) {
        res.end(body);
        var json = JSON.parse(body);
        if(!err && (!resp || resp.statusCode == 200) && json && json.users && json.users.length > 0) {
            console.log('setting', hashUrl);
            cache.set(hashUrl, body);
        }
    });
}


function hash(url) {
    var h = crypto.createHash('md5');
    h.update(url);
    return h.digest('hex').substring(0, 16);
}
clean(function() {});
app.listen(4567);