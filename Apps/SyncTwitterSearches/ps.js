//var consumerKey = process.argv[2];
//var consumerSecret = process.argv[3];
var port = process.argv[2];

var Sys = require('sys');
if(!port) {
    console.log("node ps.js port");
    process.exit(1);
}
/*
if (!consumerKey || !consumerSecret) {
    console.log("node client.js consumerKey consumerSecret");
    console.log("create one at http://dev.twitter.com/apps/new");
    process.exit(1);
}*/
var express = require('express'),
    connect = require('connect'),
    fs = require('fs');
    lfs = require('../../../Locker/Common/node/lfs.js'),
    httpClient = require('wwwdude').createClient(),
    crypto = require('crypto');

//var twitterClient = require('twitter-js')(consumerKey, consumerSecret, 'http://127.0.0.1:' + port + '/'),
var twitterClient = require('twitter-js')(),
    app = express.createServer(
        connect.bodyDecoder(),
        connect.cookieDecoder(),
        connect.session({secret : "locker"})
    );
    
var me = lfs.loadMeData();

app.get('/pull_search', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text'});
    
    var q = req.param('q');
//    console.log('q = ' + q);
    search(q, function(data) {
//        console.log(JSON.stringify(me) + '\n\n');
        if(data && data.length > 0) {
            console.log('found ' + data.length + ' new items' + '\n\n');
            res.write(JSON.stringify(data));
        }
        res.end();
    });
});

function search(q, callback) {
    if(!me.searches)
        me.searches = {};
    if(!me.searches[q])
        me.searches[q] = {};
    
    var hash = crypto.createHash('sha1');
    hash.update(q);
    var digest = hash.digest('hex');
    pullSearch(q, me.searches[q].since_id, function(data) {
        if(data && data.length > 0) {
            me.searches[q].since_id = data[0].id_str;
            data.reverse();
            lfs.syncMeData(me);
            lfs.appendObjectsToFile('feed' + digest + '.json', data);
        }
        callback(data);
    });
}
function pullSearch(q, since_id, callback) {
    var page = 1;
    var items = [];
    pullSearchPage(q, 1, since_id, items, function() {
        callback(items);
    });
}
function pullSearchPage(q, page, since_id, items, callback) {
    if(!items)
        items = [];
    var qString = 'http://search.twitter.com/search.json?rpp=100&q=' + escape(q);
    if(!page)
        page = 1;
    qString += '&page=' + page;
    if(since_id)
        qString += '&since_id=' + since_id;
    httpClient.get(qString).addListener('complete', function(respData, resp) {
//        Sys.puts('Headers: ' + Sys.inspect(resp.headers));
        var data = JSON.parse(respData);
        if(!data || !data.results || data.results.length == 0)
            callback();
        else {
            for(var i = 0; i < data.results.length; i++)
                items.push(data.results[i]);
            page++;
            pullSearchPage(q, page, since_id, items, callback);
        }
    }).addListener('error', function(respData, resp) {
        callback();
    });
}

console.log('http://localhost:' + port + '/');
app.listen(port);