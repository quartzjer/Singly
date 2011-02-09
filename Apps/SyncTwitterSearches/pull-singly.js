var consumerKey = process.argv[2];
var consumerSecret = process.argv[3];
var port = process.argv[4];

var Sys = require('sys');

if (!consumerKey || !consumerSecret) {
    console.log("node client.js consumerKey consumerSecret");
    console.log("create one at http://dev.twitter.com/apps/new");
    process.exit(1);
}
var express = require('express'),
    connect = require('connect'),
    fs = require('fs');
    lfs = require('../../Common/node/lfs.js'),
    httpClient = require('wwwdude').createClient(),
    crypto = require('crypto');

var twitterClient = require('twitter-js')(consumerKey, consumerSecret, 'http://127.0.0.1:' + port + '/'),
    app = express.createServer(
        connect.bodyDecoder(),
        connect.cookieDecoder(),
        connect.session({secret : "locker"})
    );
    
var meta = lfs.loadMeData();
var context = JSON.parse(fs.readFileSync("context.json"));


app.get('/', function(req, res) {
    console.log('serving /');
    twitterClient.getAccessToken(req, res,
    function(error, newToken) {
        if (error)
            console.log(JSON.stringify(error));
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        if (newToken != null) {
            console.log(JSON.stringify(newToken));
            context.token = newToken;
            fs.writeFile("context.json", JSON.stringify(context));
        }
        res.end();
    });
});

app.get('/pull_search', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text'});
    
    var q = req.param('q');
    console.log('q = ' + q);
    search(q, function(data) {
        console.log(JSON.stringify(meta) + '\n\n');
        if(data && data.length > 0) {
            console.log('found ' + data.length + ' new items' + '\n\n');
            res.write(JSON.stringify(data));
        }
        res.end();
    });
});

function search(q, callback) {
    if(!meta.search)
        meta.search = {};
    if(!meta.search[q])
        meta.search[q] = {};
    
    var hash = crypto.createHash('sha1');
    hash.update(q);
    var digest = hash.digest('hex');
    pullSearch(q, meta.search[q].since_id, function(data) {
        if(data && data.length > 0) {
            meta.search[q].since_id = data[0].id_str;
            data.reverse();
            lfs.syncMeData(meta);
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
//        console.log(JSON.stringify(resp));
        Sys.puts('Headers: ' + Sys.inspect(resp.headers));
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
    }).send();
}

app.get('/get_home_timeline', function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/javascript'
    });
    lfs.readObjectsFromFile('feed.json', function(data) {
        data.reverse();
        res.write(JSON.stringify(data));
        res.end();
    });
});

app.get('/home_timeline', function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    pullTimeline(function() {
        res.end();
    });
    /*twitterClient.apiCall('GET','/statuses/home_timeline.json', 
        { token: { oauth_token: token.oauth_token, oauth_token_secret: token.oauth_token_secret} }, 
        function(error, result) {
            console.log('\n\n\n\nERROR:\n\n' + JSON.stringify(error));
            console.log('\n\n\n\nRESULT:\n\n' + JSON.stringify(result));
            res.end();
        });*/
});


function pullTimeline(callback) {
    if(!meta.home_timeline)
        meta.home_timeline = {};
    var items = [];
    pullTimelinePage(null, meta.home_timeline.latest, null, items, function() {
        items.reverse();
        lfs.appendObjectsToFile('feed.json', items);
        callback();
    });
}

function pullTimelinePage(max_id, since_id, page, items, callback) {
    console.log(page);
    if(!page)
        page = 1;
    var params = {token: context.token, count: 200, page: page};
    if(max_id)
        params.max_id = max_id;
    if(since_id)
        params.since_id = since_id;
    console.log('calling api with params: ' + JSON.stringify(params));
    twitterClient.apiCall('GET', '/statuses/home_timeline.json', params, 
        function(error, result) {
            if(error) {
                console.log(JSON.stringify(error));
                return;
            }
            if(result.length > 0) {
                var id = result[0].id;
                if(!meta.home_timeline.latest || id > meta.home_timeline.latest)
                    meta.home_timeline.latest = id;
                console.log(JSON.stringify(meta));
                for(var i = 0; i < result.length; i++)
                    items.push(result[i]);

                if(!max_id)
                    max_id = result[0].id;
                page++;
                pullTimelinePage(max_id, since_id, page, items, callback);
            } else if(callback) {
                lfs.syncMeData(meta);
                callback();
            }
        });
}


/*
app.post('/message',
function(req, res) {
    twitterClient.apiCall('POST', '/statuses/update.json',
    {
        token: {
            oauth_token_secret: req.param('oauth_token_secret'),
            oauth_token: req.param('oauth_token'),
            status: req.param('message')
        }
    },
    function(error, result) {
        console.log(JSON.stringify(error));
        console.log(JSON.stringify(result));
    }
    );
});*/

console.log('http://localhost:' + port + '/');
app.listen(port);