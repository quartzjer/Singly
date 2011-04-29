var fs = require('fs');

exports.openFile = function(filename, headers) {
    var options = {};
    if(!headers) {
        options.flags = 'a';
    } else {
        options.flags = 'w';
    }
    var strm = fs.createWriteStream(filename, options);
    var file = {stream:strm};
    file.appendLine = function(values) {
        for(var i in values) {
            this.stream.write('"' + values[i] + '",');
        }
        this.stream.write('\n');
    }
    file.close = function() {
        this.stream.end();
    }
    
    if(headers) file.appendLine(headers);
    return file;
}