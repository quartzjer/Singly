var sys = require('sys'),
    rapp = require('./rapportive.js'),
    klout = require('./klout.js')('xz5sqcss2dx43ctsxxxngpa8');


function doNextItem(emails, allData, i, callback) {
    console.log('emails.length = ' + emails.length);
    if(i >= emails.length) {
        callback(allData);
        return;
    }
        
    var email = emails[i].email;
    var arr = emails[i].dateStamp.split(/[-\s:]/);
    var date = new Date(arr[0], arr[2] -1 , arr[1], arr[3], arr[4], arr[5]);
    console.log('email[' + i + '] = ' + email + '\n');
    rapp.getDataFromEmail(email, function(data) {
        var contact = data.contact;
        contact.email_signup_date = date;
        var clean_name = cleanName(contact.name || email.split("@")[0]);
        if(allData[clean_name])
            mergeTwo(allData[clean_name], contact);
        else 
            allData[clean_name] = contact;
        i++;
        if(allData[clean_name].twitter_username) {
                klout.getKloutUsers(allData[clean_name].twitter_username, function(json) {
                    if(json.status != 200) {
                        sys.debug('oh noez!');
                        callback(allData);
                    }
                    else {
                        var user = json.users[0];
                        allData[clean_name].klout_score = user.score;
                        klout.getKloutTopics(allData[clean_name].twitter_username, function(json) {
                            console.log(JSON.stringify(json));
                            if(json.status != 200) {
                                sys.debug('oh noez!');
                                callback(allData);
                            }
                            else {
                                if(json.users && json.users[0])
                                    allData[clean_name].klout_topics= json.users[0].topics;    
                                doNextItem(emails, allData, i, callback);
                            }
                        })
                    }
                });
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
    return cleanName(data.name || data.email.split("@")[0]);
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

exports.getData = function(items, callback) {
    doNextItem(items, {}, 0, function(allData) {
        if(callback) callback(allData);
    });
}
