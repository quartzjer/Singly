//Fizz server

var port = process.argv[2];
var feedSourcePort = process.argv[3];
var twitterSourcePort = process.argv[4];
var gmailSourcePort = process.argv[5];
//console.log("feedSourcePort: " + feedSourcePort);
if(isNaN(port)) {
    console.log("node server.js <port number>");
    process.exit(1);
} else if(port <= 1024) {
    console.log("port number must be greater than 1024.");
    process.exit(1);
}

var sys = require("sys"),
    http = require("http"),  
    url = require("url"),  
    path = require("path"),  
    fs = require("fs"),
    express = require('express'),
    app = express.createServer(),
    wwwdude = require('wwwdude'),
    wwwdude_client = wwwdude.createClient({
        encoding: 'utf-8'
    });

app.get('/getfeed', function(req, res){
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    wwwdude_client.get('http://localhost:' + feedSourcePort + '/getfeed')
    .addListener('success', function(data, resp) {
        res.write(data);
        res.end();
    }).send();
});

app.get('/get_home_timeline', function(req, res){
    console.log('/get_home_timeline');
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    wwwdude_client.get('http://localhost:' + twitterSourcePort + '/get_home_timeline')
    .addListener('success', function(data, resp) {
        res.write(data);
        res.end();
    }).send();
});

app.get('/get_gmail', function(req, res){
    console.log('/get_gmail');
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    wwwdude_client.get('http://localhost:' + gmailSourcePort + '/get_home_timeline')
    .addListener('success', function(data, resp) {
        res.write(data);
        res.end();
    }).send();
});

app.get('/', function(req, res) {
    serveFile(path.join(process.cwd(), '/index.html'), res);
});

app.get('/*', function(req, res) {
    var uri = url.parse(req.url).pathname;  
    var filename = path.join(process.cwd(), uri);  
    serveFile(filename, res);
});

function serveFile(filename, response) {
    path.exists(filename, function(exists) {  
        if(!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});  
            response.write("404 Not Found\n");  
            response.end();  
            return;  
        }  

        fs.readFile(filename, "binary", function(err, file) {  
            if(err) {  
                response.writeHead(500, {"Content-Type": "text/plain"});  
                response.write(err + "\n");  
                response.end();  
                return;  
            }  

            //response.writeHead(200); 
            response.writeHead(200); 
            response.write(file, "binary");  
            response.end();  
        });  
    });
}


app.listen(port);
sys.puts("http://localhost:" + port + "/");