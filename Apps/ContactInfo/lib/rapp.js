var sys = require('sys'),
    rapp = require('./rapportive.js'),
    klout = require('./klout.js')('xz5sqcss2dx43ctsxxxngpa8'),
    EventEmitter = require('events').EventEmitter,
    github = new require('github').GitHubApi(true);

function getDateFromSignup(signup) {
    var arr = signup.dateStamp.split(/[-\s:]/);
    return new Date(arr[0], arr[2] -1 , arr[1], arr[3], arr[4], arr[5]);
}

function doNextItem(emails, allData, i, callback) {
    if(i >= emails.length) {
        callback(allData);
        return;
    }
        
    var email = emails[i].email;
    var date = getDateFromContact(emails[i]);
    console.log('\nemail[' + i + '] = ' + email);
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

exports.getDataFromEmail = function (signup, callback) {
    rapp.getDataFromEmail(signup.email, function(data) {
        var contact = data.contact;
        contact.email_signup_date = getDateFromSignup(signup);
        var clean_name = cleanName(contact.name || signup.email.split("@")[0]);
        
        //convert memberships to a dict of accountType : accountInfo
        var dictMember = {};
        if(contact.memberships) {
            for(var i in contact.memberships) {
                var accountType = contact.memberships[i].icon_name;
                dictMember[accountType] = contact.memberships[i];
            }
        }
        contact.memberships = dictMember;
        
        if(contact.twitter_username) {
            getKloutData(contact.twitter_username, function(err, kloutContact) {
                if(err) {
                    sys.debug(err);
                } else if(kloutContact) {
                    for(var i in kloutContact)
                        contact[i] = kloutContact[i];
                }
                
                if(contact.memberships.github) {
                    getGithubData(contact.memberships.github.username, function(err, githubProfile) {
                        if(!err && githubProfile) {
                            contact.memberships.github.profile = githubProfile;
                        }
                    }
                }
            });
            /*klout.getKloutUsers(contact.twitter_username, function(json) {
                if(json.status != 200) {
                    sys.debug('oh noez!');
                    if(callback) callback(contact);
                }
                else {
                    var user = json.users[0];
                    contact.klout_score = user.score;
                    klout.getKloutTopics(contact.twitter_username, function(json) {
                        console.log(JSON.stringify(json));
                        if(json.status != 200) {
                            sys.debug('oh noez!');
                            if(callback) callback(clean_name, contact);
                        }
                        else {
                            if(json.users && json.users[0])
                                contact.klout_topics= json.users[0].topics;  
                            if(callback) callback(clean_name, contact);  
                            //doNextItem(emails, allData, i, callback);
                        }
                    })
                }
            });*/
        } else {
            if(callback) callback(clean_name, contact);  
            //doNextItem(emails, allData, i, callback);
        }
    });
}

function getKloutData(twitter_username, callback) {
    klout.getKloutUsers(twitter_username, function(json) {
        if(json.status != 200) {
            sys.debug('oh noez!');
            if(callback) callback(new Error());
        }
        else {
            var user = json.users[0];
            var contact = {};
            contact.klout_score = user.score;
            klout.getKloutTopics(twitter_username, function(json) {
                console.log(JSON.stringify(json));
                if(json.status != 200) {
                    sys.debug('oh noez!');
                    if(callback) callback(new Error(), contact);
                }
                else {
                    if(json.users && json.users[0])
                        contact.klout_topics = json.users[0].topics;  
                    if(callback) callback(null, contact);
                }
            })
        }
    });
}

var getGithubData = github.getUserApi().show;

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
        
    //console.log('merging: ' + sys.inspect(obj1) +'\nand\n'+ sys.inspect(obj2));
    for(var j in obj2) {
        if(!obj1[j]) {
            obj1[j] = obj2[j];
        } else {
            //mergeTwo(obj1[j], obj2[j]);
        }
    }
}

exports.getData = function(items, callback) {
    doNextItem(items, {}, 0, function(allData) {
        if(callback) callback(allData);
    });
}
