var sys = require("sys"),
    http = require("http"),
    https = require("https"),
    url = require("url"),
    fs = require("fs"),
    spawn = require('child_process').spawn;

//var downloadfile = 'https://ssl.gstatic.com/s2/profiles/images/silhouette200.png';
var downloadfile = 'http://media.linkedin.com/mpr/mprx/0_tm_nI-29afttQOZFpdt5Il7V2Ic0X4eFr7BdIlao1aifRyxbOePs5AsXG5Bhb0WIPSTeX9KhubhY';
//var downloadfile = 'http://profile.ak.fbcdn.net/hprofile-ak-snc4/186255_583639127_7375968_n.jpg';
var filename = 'test.jpg';
    
function getFile(requestURL, filename) {
    var port = (url.parse(requestURL).protocol == 'http:') ? 80 : 443;
    var host = url.parse(requestURL).hostname;
    var client;
    if(port == 80) 
        client = http;
    else 
        client = https;
    var request = https.get({ host: host, path: url.parse(requestURL).pathname }, function(res) {
        var downloadfile = fs.createWriteStream(filename, {'flags': 'a'});
        res.setEncoding('binary');
        res.on('data', function (chunk) {
            downloadfile.write(chunk, encoding='binary');
        });
        res.on('error', function(error) {
            console.log('oh noes!');
        });
        res.on('end', function() {
            downloadfile.end();
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
}

function curlFile(url, filename) {
    spawn('curl', [url, '-o', filename]);
}

//getFile(downloadfile, filename);
curlFile(downloadfile, filename);