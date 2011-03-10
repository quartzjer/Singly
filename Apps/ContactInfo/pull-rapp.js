var rapp = require('./rapp.js'),
    fs = require('fs'),
    sys = require('sys'),
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
            console.log('lines.length = ' + lines.length);
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
        dumpCSV(allData);
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
//                lfs.writeContentsOfURLToFile(allData[i].image_url_raw, imageFileName);
                lfs.curlFile(allData[i].image_url_raw, imageFileName);
            }
        }
    });
});


function dumpCSV(allData) {
    var stream = fs.createWriteStream('allData.csv');
    stream.write('Date, Name, Email, Location, Twitter, Linkedin, Klout Score, Network Score, Amplification Score, True Reach, Topics, Occupations\n');
    for(var i in allData) {
        var linkedinProf = '';
        
        var ships = allData[i].memberships;
        for(var j in ships) {
            if(ships[j].icon_name == 'linkedin') {
                linkedinProf = ships[j].profile_url;
            }
        }
        
        var occupationsString = '';
        var occs = allData[i].occupations;
        for(var j in occs) {
            occupationsString += occs[j].job_title + ' at ' + occs[j].company;
            if(j != (occs.length - 1)) 
                occupationsString += ', ';
        }
        var pers = allData[i];
        stream.write('"' + pers.email_signup_date + '",' + 
                     '"' + (pers.name? pers.name : '') + '",' + 
                     '"' + (pers.email? pers.email : '') + '",' + 
                     '"' + (pers.location? pers.location : '') + '",' +
                     '"' + (pers.twitter_username? pers.twitter_username : '') + '",' + 
                     '"' + (linkedinProf? linkedinProf : '') + '",' + 
                     '"' + (pers.klout_score? pers.klout_score.kscore : '') + '",' +
                     '"' + (pers.klout_score? pers.klout_score.network_score : '') + '",' +
                     '"' + (pers.klout_score? pers.klout_score.amplification_score : '') + '",' +
                     '"' + (pers.klout_score? pers.klout_score.true_reach : '') + '",' +
                     '"' + (pers.klout_topics? (pers.klout_topics.toString().replace(/,/g, ", ")) : '') + '",' +
                     '"' + occupationsString + '"\n');
    }
    stream.end();
}