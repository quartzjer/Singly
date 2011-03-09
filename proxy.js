
var lockerBase = 'http://localhost:3000';

var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    sys = require('sys'),
    express = require('express'),
    connect = require('connect'),
    http = require('http'),
    wwwdude = require('wwwdude'),
    wwwdude_client = wwwdude.createClient({
        encoding: 'utf-8'
    });
    
var app = express.createServer(
                connect.bodyDecoder(),
                connect.cookieDecoder(),
                connect.session({secret : "locker"})
            );
            
app.get('/sess', function(req, res) {
    res.writeHead(200);
    res.write(sys.inspect(req.session));
    if(!req.session.simon)
        req.session.simon = "hellooo";
    res.end();
});

app.get('/prox', function(req, res) {
    proxied('http://localhost:3001/sess', req, res);
});

app.listen(3000);

function proxied(uri, req, res) {
//function proxied(svc, ppath, req, res) {
    console.log("proxying " + req.url + " to "+uri);
    console.log('req.session = ' + req.session);
    sys.debug('req.session from browser:\n\n' + sys.inspect(req.session));
    sys.debug('req.cookies from browser:\n\n' + sys.inspect(req.cookies));
    var host = url.parse(uri).host;
    var cookies;
    if(!req.session.cookies) {
        req.session.cookies = {};
    } else {
        cookies = req.session.cookies[host];
    }
    sys.debug('cookies[' + host + '] = ' + sys.inspect(cookies));
    var headers = req.headers;
    if(cookies && cookies['connect.sid'])
        headers.cookie = 'connect.sid=' + cookies['connect.sid'];
    var client = wwwdude.createClient({headers:headers});
    client.get(uri, req.headers)
    .addListener('success', function(data, resp) {
        sys.debug('success: resp.headers[\'set-cookie\'] = ' + sys.inspect(resp.headers['set-cookie']));
        
        var newCookies = getCookies(resp.headers);
        sys.debug('newCookies for ' + host + ' = ' + sys.inspect(newCookies));
        req.session.cookies[host] = newCookies;
        
        var cookies = getCookies(resp.headers);
        req.session.cookies[host] = cookies;
        res.writeHead(200);
        res.end(data);
    })
    .send();
}

function getCookies(headers) {
    var cookies = {};
    if(headers && headers['set-cookie']) {
        var splitCookies = headers['set-cookie'].split(';');
        for(var i = 0; i < splitCookies.length; i++) {
            var cookie = splitCookies[i];
            var parts = cookie.split('=');
            var key = parts[ 0 ].trim();
            if(key != 'path' && key != 'httpOnly' && key != 'expires') {
                var value = ( parts[ 1 ] || '' ).trim();
                cookies[key] = value;
            }
        }
    }
    return cookies;
}

   /*         
function proxied(uri, req, res) {
    console.log("proxying " + req.url + " to " + uri);
    var host = url.parse(req.url).host;
    
    if(!req.session.clients) {
        console.log('no clients in sess, creating...');
        req.session.clients = {};
    }
    var client = req.session.clients[host];
    if(!client) {
        console.log('no client, creating...');
        client = wwwdude.createClient();
        req.session.clients[host] = client;
    }
    
    client.get(uri, req.headers)
    .addListener('success', function(data, resp) {
        res.writeHead(200);
        res.end(data);
    })
    .send();
}*/