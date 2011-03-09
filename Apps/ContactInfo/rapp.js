var wwwdude = require('wwwdude'),
    sys = require('sys'),
    fs = require('fs'),
    lfs = require('../../../Locker/Common/node/lfs.js');

var KLOUT_API_KEY = 'xz5sqcss2dx43ctsxxxngpa8';

function getDataFromEmail(emailAddr, callback) {
    wwwdude.createClient().get('http://rapportive.com/contacts/email/' + escape(emailAddr))
    .addListener('success', function(data, resp) {
        var item = JSON.parse(data);
        callback(item);
    });
}

function getDataFromTwitter(twitterHandle, callback) {
    wwwdude.createClient().get('http://rapportive.com/contacts/twitter/' + twitterHandle)
    .addListener('success', function(data, resp) {
        var item = JSON.parse(data);
        callback(item);
    });
}

function getKloutData(usernames, callback) {
    wwwdude.createClient().get('http://api.klout.com/1/klout.json?key=' + KLOUT_API_KEY + '&users=' + usernames)
    .addListener('success', function(data, resp) {
        var json = JSON.parse(data);
        console.log(data);
        callback(json);
    });
}


function doNextItem(emails, allData, i, callback) {
    if(i >= emails.length) {
        callback(allData);
        return;
    }
        
    var email = emails[i].email;
    console.log('email[' + i + '] = ' + email + '\n');
    getDataFromEmail(email, function(data) {
        var contact = data.contact;
        var clean_name = cleanName(contact.name || email.split("@")[0]);
        if(allData[clean_name])
            mergeTwo(allData[clean_name], contact);
        else 
            allData[clean_name] = contact;
        i++;
        if(contact.twitter_username) {
            getKloutData(contact.twitter_username, function(json) {
                if(json.status != 200) {
                    sys.debug('oh noez!');
                    callback(allData);
                }
                else {
                    contact.klout_score = json.users[0].kscore;
                    doNextItem(emails, allData, i, callback);
                }
            })
        } else {
            doNextItem(emails, allData, i, callback);
        }
    })
}

function cleanName(name) {
    if(!name)
        return;
    return name.toLowerCase().replace(/[\s\.,-]+/g,'');
}

exports.getCleanName = function(data) {
    return cleanName(data.name || data.email.split("@")[0]);;
}
function mergeTwo(obj1, obj2) {
    if(!(obj1 && obj2))
        return;
        
    console.log('merging: ' + sys.inspect(obj1) +'\nand\n'+ sys.inspect(obj2));
    for(var j in obj2) {
        if(!obj1[j]) {
            obj1[j] = obj2[j];
        } else {
            mergeTwo(obj1[j], obj2[j]);
        }
    }
}

exports.getKloutData = function(usernames, callback) {
    getKloutData(usernames, callback);
}
exports.getDataFromEmail = function(emailAddr, callback) {
    getDataFromEmail(emailAddr, callback);
}
exports.getDataFromTwitter = function(twitterHandle, callback) {
    getDataFromEmail(twitterHandle, callback);
}

exports.getData = function(items, callback) {
    doNextItem(items, {}, 0, function(allData) {
        if(callback) callback(allData);
    });
}
