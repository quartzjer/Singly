var fs = require('fs');

function getDate(dateStamp) {
    var arr = dateStamp.split(/[-\s:]/);
    return new Date(arr[0], arr[2] -1 , arr[1], arr[3], arr[4], arr[5]);
}

var EmailReader = function(filename) {
    this.filename = filename;
    var self = this;
    this.readEmails = function (callback) {
        var stream = fs.createReadStream(filename, {'encoding': 'utf-8'});
        var data = "";
        stream.on('data', function(newData) {
            data += newData;
        });
        stream.on('end', function() {
            try {
                var lines = data.split('\n');
                var emails = [];
                for(var i in lines) {
                    if(!lines[i])
                        continue;
                    var fields = lines[i].split(';');
                    emails.push({email:fields[0], dateStamp:getDate(fields[1]).getTime()});
                }
            } catch(err) {
            }
            callback(emails);
        });
        stream.on('error', function(err) {
            callback([]);
        });
    };
};

exports.EmailReader = EmailReader;