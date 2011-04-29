var sys = require('sys'),
    rapp = require('./rapportive.js'),
    klout = require('klout-js')('xz5sqcss2dx43ctsxxxngpa8'),
    EventEmitter = require('events').EventEmitter,
    GitHubApi = require('github').GitHubApi,
    github = new GitHubApi(true);
    
exports.getDataFromEmail = function (emailAddress, callback) {
    console.log(emailAddress);
    rapp.getDataFromEmail(emailAddress, function(data) {
//        console.log(data);
        var contact = data.contact;
//        contact.email_signup_date = getDateFromSignup(signup);
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
                    console.log('githubName:', contact.memberships.github.username);
                    github.getUserApi().show(contact.memberships.github.username, function(err, githubProfile) {
                        if(!err && githubProfile) {
                            contact.memberships.github.profile = githubProfile;
                        }
                        callback(clean_name, contact);
                    });
                } else {
                    callback(clean_name, contact);
                }
            });
        } else {
            if(callback) callback(clean_name, contact);  
            //doNextItem(emails, allData, i, callback);
        }
    });
}

function getKloutData(twitter_username, callback) {
    klout.klout(twitter_username, function(err, json) {
        if(json.status != 200) {
            sys.debug('oh noez!');
            if(callback) callback(new Error());
        }
        else {
            var user = json.users[0];
            var contact = {};
            contact.klout_score = user.score;
            klout.topics(twitter_username, function(err, json) {
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
        
    for(var j in obj2) {
        if(!obj1[j]) {
            obj1[j] = obj2[j];
        } else {
            //mergeTwo(obj1[j], obj2[j]);
        }
    }
}