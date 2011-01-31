
var port = process.argv[2];
if(isNaN(port)) {
    console.log("node server.js <port number>");
    process.exit(1);
} else if(port <= 1024) {
    console.log("port number must be greater than 1024.");
    process.exit(1);
}

var sys = require("sys"),  
    url = require("url"),  
    path = require("path"),  
    fs = require("fs"),
    express = require('express'),
    app = express.createServer();
    
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

            response.writeHead(200);  
            response.write(file, "binary");  
            response.end();  
        });  
    });
}


app.listen(port);
sys.puts("http://localhost:" + port + "/");