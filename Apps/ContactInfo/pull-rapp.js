var rapp = require('./lib/rapp.js'),
    fs = require('fs'),
    sys = require('sys'),
    lfs = require('../../../Locker/Common/node/lfs.js'),
    csv = require('./lib/csv.js'),
    EventEmitter = require('events').EventEmitter;
    
    
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
    };
    
    var emitEmails = function (emails, i) {
        if(!i) i = 0;
        else if(i == emails.length) {
            self.emit('done');
            return;
        }
        self.emit('newEmail', emails[i]);
        setTimeout(function() {emitEmails(emails, ++i);}, Math.random() * 2000);
    };
    
    this.readEmails(function(emails) {
        emitEmails(emails, 0);
    });
};

EmailReader.prototype = new EventEmitter;

var emailReader = new EmailReader('emails.txt');

var csvFile = csv.openFile('contacts.csv', 
                ['Date', 'Name', 'Email', 'Location', 'Twitter', 'Linkedin', 
                 'Klout Score', 'Network Score', 'Amplification Score',
                 'True Reach', 'Topics', 'Occupations']);

var append = true;
if(process.argv[2] == '-c')
    append = false;

var options = {};
if(append) {
    options.flags = 'a';
} else {
    options.flags = 'w';
}

var json = fs.createWriteStream('contacts.json', options);
if(!append) json.write('{');

try {
    fs.mkdir('photos', 0755);
} catch(err) {}

emailReader.addListener('newEmail', function(email) {
    console.log(email);
    rapp.getDataFromEmail(email, function(cleanName, contact) {
        var ret = {};
        ret[cleanName] = contact;
       // console.log(contact);
//        var contact = allData;
        var str = JSON.stringify(ret);
        str = str.substring(1, str.length - 1);
        json.write(str + ',\n');
        writeContactToCSV(csvFile, contact);
        downloadPhoto(contact);
    });
});

process.on('exit', function () {
    json.write('}');
    json.end();
});

/*
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
                //stagger the photos over 2 mins
                setTimeout(function(){ lfs.curlFile(allData[i].image_url_raw, imageFileName); }, Math.random() * 120000);
            }
        }
    });
});*/

function downloadPhoto(contact) {
    if(!contact)
        return;
    if(contact.image_url_raw) {
        var clean_name = rapp.getCleanName(contact);
        var splitted = contact.image_url_raw.split(".");
        var ext =  splitted[splitted.length - 1];
        if(!ext || (ext.length > 4))
            ext = 'jpg';
        var imageFileName = 'photos/' + clean_name + '.' + ext;
        console.log('imageFileName: ' + imageFileName);
        console.log('allData[i].image_url_raw: ' + contact.image_url_raw);
        lfs.curlFile(contact.image_url_raw, imageFileName); 
    }
}

/*
function dumpCSV(allData) {
    var csvFile = csv.openFile('contacts.csv', 
                    ['Date', 'Name', 'Email', 'Location', 'Twitter', 'Linkedin', 
                     'Klout Score', 'Network Score', 'Amplification Score',
                     'True Reach', 'Topics', 'Occupations']);
    for(var i in allData) {
        writeContactToCSV(csvFile, allData[i])
    }
    csvFile.close();
}*/

function writeContactToCSV(csvFile, contact) {
    if(!contact)
        return;
        
    var linkedinProf = '';
    
    var ships = contact.memberships;
    for(var j in ships) {
        if(!ships[j]) continue;
        if(ships[j].icon_name == 'linkedin') {
            linkedinProf = ships[j].profile_url;
        }
    }
    
    var occupationsString = '';
    var occs = contact.occupations;
    for(var j in occs) {
        occupationsString += occs[j].job_title + ' at ' + occs[j].company;
        if(j != (occs.length - 1)) 
            occupationsString += ', ';
    }
    csvFile.appendLine([contact.email_signup_date, 
                        (contact.name? contact.name : ''),
                        (contact.email? contact.email : ''),
                        (contact.location? contact.location : ''),
                        (contact.twitter_username? contact.twitter_username : ''),
                        (linkedinProf? linkedinProf : ''),
                        (contact.klout_score? contact.klout_score.kscore : ''),
                        (contact.klout_score? contact.klout_score.network_score : ''),
                        (contact.klout_score? contact.klout_score.amplification_score : ''),
                        (contact.klout_score? contact.klout_score.true_reach : ''),
                        (contact.klout_topics? (contact.klout_topics.toString().replace(/,/g, ", ")) : ''),
                        occupationsString]);
    
}