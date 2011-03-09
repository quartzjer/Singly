var rapp = require('./rapp.js'),
    fs = require('fs'),
    lfs = require('../../../Locker/Common/node/lfs.js');
    
function readEmails(filename, callback) {
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
                emails.push({email:fields[0], dateStamp:fields[1]});
            }
        } catch(err) {
        }
        callback(emails);
    });
    stream.on('error', function(err) {
        callback([]);
    });
}

readEmails('emails.txt', function (emails) {
    rapp.getData(emails, function(allData) {
        lfs.writeObjectToFile('rapp.json', allData);
        try {
            fs.mkdir('photos', 0755);
        } catch(err) {}
        for(var i in allData) {
            if(allData[i].image_url_raw) {
                var clean_name = rapp.getCleanName(allData[i]);
                var splitted = allData[i].image_url_raw.split(".");
                var ext =  splitted[splitted.length - 1];
                if(!ext || (ext.length > 4))
                    ext = 'jpg';
                var imageFileName = 'photos/' + clean_name + '.' + ext;
                console.log('imageFileName: ' + imageFileName);
                console.log('allData[i].image_url_raw: ' + allData[i].image_url_raw);
                lfs.writeContentsOfURLToFile(allData[i].image_url_raw, imageFileName);
            }
        }
    });
});