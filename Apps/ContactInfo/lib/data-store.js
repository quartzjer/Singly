require.paths.push(__dirname + '/../node-mongodb-native/lib');
var mongodb = require('mongodb'),
    BSON = require('mongodb').BSONNative,
    crypto = require('crypto'),
    stemmer = require('./stemmer.js');

var config = {dataStoreHost:'localhost'};
try {
    config = JSON.parse(require('fs').readFileSync('config.json'));
} catch(err) {console.error(err);}

console.log(config.dataStoreHost);

var dbName = 'people';
var collectionName = 'dataTest';
var server = new mongodb.Server(config.dataStoreHost, mongodb.Connection.DEFAULT_PORT, {});
var db = new mongodb.Db(dbName, server, {native_parser:true});
var coll;

var ObjectID = db.bson_serializer.ObjectID;

var ensureIndicies = ['rapportive.data.name', 'rapportive.data.email', 'twitter.data._username_lowercase', 
                      'klout.data.score.kscore', 'dates.rapportive.engaged'];

exports.openCollection = function(callback) {
    db.open(function(err, openedDB) {
        if(err) {
            console.error('error opening database', err);
            db.close();
            return;
        } else if(!db) {
            db.log('could not open database', db);
            dataStore.close();
            return;
        }
        openedDB.collection(collectionName, function(err, collection) {
            coll = collection;
           // coll.ensureIndex({'rapportive.data.name':1});
            callback(err, collection);
            for(var i in ensureIndicies) {
                var query = {};
                query[ensureIndicies[i]] = 1;
                console.log('ensuring index on ' + ensureIndicies[i]);
                coll.ensureIndex(query, function(err, res) {
                    if(err) console.error(err);
                });
            }
        });
    });
}

exports.getContacts = function(text, options, callback) {
    var terms = stemmer.splitAndStem(text);
    var query = {};
    if(terms && terms.length > 0)
        query = {terms: {$all:terms}};
    console.log(query);
    coll.find(query, options).toArray(function(err, docs) {
        callback(err, docs);
    });
}

exports.updateGithubData = function(githubUserInfo, callback) {
    coll.update({'memberships.github.username' : githubUserInfo.username}, 
                {$set:{'memberships.github' : githubUserInfo}}, function(err) {
        if(err) { //could not find anyone with that github username
            var contact
        }
    })
}


exports.put = function(dataEvent, callback) {
    var data = dataEvent.data;
    var or;
    var errSet = {};
    if(dataEvent.type == 'rapportive') {
        or = [{'rapportive.data.email' : data.email}, {'github.data.email' : data.email}];
        if(data.memberships) {
            if(data.memberships.github && data.memberships.github.username) {
                or.push({'github._username_lowercase': data.memberships.github.username.toLowerCase()});
            }
            if(data.memberships.twitter && data.memberships.twitter.username) {
                or.push({'twitter._username_lowercase': data.memberships.twitter.username.toLowerCase()});
                or.push({'klout.data.username': data.memberships.twitter.username.toLowerCase()});
            }
            if(dataEvent.error && data.email)
                errSet = {$set:{'rapportive.email':data.email}};
        }
        console.log('adding rapportive data for', data.email);
    } else if(dataEvent.type == 'twitter') {
        if(!data._username_lowercase) {
            console.error('ERROR: no _username_lowercase for twitter data:', data);
            return;
        }
        or = [{'twitter.data._username_lowercase' : data._username_lowercase},
              {'rapportive.data.twitter_username' : data._username_lowercase},
              {'rapportive.data.memberships.twitter.username' : data._username_lowercase},
              {'klout.data.username':data._username_lowercase}];
        console.log('adding twitter data for', data._username_lowercase);
    } else if(dataEvent.type == 'github') {
        if(!data._username_lowercase) {
            console.error('ERROR: no _username_lowercase for github data:', data);
            return;
        }
        or = [{'github.data._username_lowercase' : data._username_lowercase}, 
              {'rapportive.data.memberships.github.username' : data._username_lowercase}];
        console.log('adding github data for', data._username_lowercase);
    } else if(dataEvent.type == 'klout') {
        if(!data.username || !data.score || ! data.topics) {
            console.error('ERROR: bad data from klout:', data);
            return;
        }
        or = [{'twitter.data._username_lowercase' : data.username.toLowerCase()},
              {'rapportive.data.twitter_username' : data.username.toLowerCase()},
              {'rapportive.data.memberships.twitter.username' : data.username.toLowerCase()}, 
              {'klout.data.username':data.username.toLowerCase()}];
        console.log('adding klout data for ', data.username.toLowerCase(), 
                    'with score', data.score.kscore, 'and topics', data.topics);
    }
    if(or)
        doSet(dataEvent, errSet, or, callback);
}

exports.putError = function(dataEvent, callback) {
    var data = dataEvent.data;
    var or;
    var errSet = {};
    if(dataEvent.type == 'rapportive') {
        or = [{'rapportive.data.email' : data.email}];
        errSet = {$set:{'rapportive.data.email':data.email}};
        console.log('adding rapportive error data for', data.email);
    } else if(dataEvent.type == 'twitter') {
        if(!data._username_lowercase) {
            console.error('ERROR: no _username_lowercase for twitter data:', data);
            return;
        }
        or = [{'rapportive.data.twitter_username' : data._username_lowercase},
              {'rapportive.data.memberships.twitter.username' : data._username_lowercase},
              {'klout.data.username':data._username_lowercase}];
        errSet = {$set:{'twitter.data._username_lowercase':data._username_lowercase}};
        console.log('adding twitter error data for', data._username_lowercase);
    } else if(dataEvent.type == 'github') {
        if(!data._username_lowercase) {
            console.error('ERROR: no _username_lowercase for github data:', data);
            return;
        }
        or = [{'rapportive.data.memberships.github.username' : data._username_lowercase}];
        errSet = {$set:{'github.data._username_lowercase':data._username_lowercase}};
        console.log('adding github error data for', data._username_lowercase);
    } else if(dataEvent.type == 'klout') {
        if(!data.username || !data.score || ! data.topics) {
            console.error('ERROR: bad data from klout:', data);
            return;
        }
        or = [{'twitter.data._username_lowercase' : data.username.toLowerCase()},
              {'rapportive.data.twitter_username' : data.username.toLowerCase()},
              {'rapportive.data.memberships.twitter.username' : data.username.toLowerCase()}, 
              {'klout.data.username':data.username.toLowerCase()}];
        console.log('adding klout data for ', data.username.toLowerCase(), 
                    'with score', data.score.kscore, 'and topics', data.topics);
    }
    if(or)
        doSet(dataEvent, errSet, or, callback);
    
}


// sets the data into the db for the given data collection event match the given or clause
function doSet(dataEvent, errSet, or, callback) {
    var set = {};
    set[dataEvent.type] = {data:dataEvent.data};
    var date = 'dates.' + dataEvent.type + '.updated';
    set[date] = new Date().getTime();
    coll.update({$or: or}, {$set: set}, {safe:true, upsert:true}, function(err, doc) {
        if(err && callback)
            callback(err);
        else {
            console.log('doc', doc);
            updateSearchText({$or:or}, true, function(err, doc) {
                if(err)
                    console.error('error updating search text!', err);
                if(doc)
                    console.log('doc for updating search text:', doc);
                
            })
//            var searchText = getSearchText(contact);
            setDates(or, dataEvent, function(err) { });
            setOther(dataEvent, function(err) { });
            //ya, this is weird
            if(callback) callback();
        }
    });
}

function setOther(dataEvent, callback) {
    console.log('setOther:', dataEvent.source_event.other);
    var other;
    if(dataEvent && dataEvent.source_event)
        other = dataEvent.source_event.other;
    if(dataEvent.type == 'rapportive') {
        //nothing yet
    } else if(dataEvent.type == 'twitter') {
        if(other && other.following) {
            console.log('adding following ' + other.following + ' to ' +
                            dataEvent.data.screen_name.toLowerCase());
            coll.update({'twitter.data._username_lowercase': dataEvent.data.screen_name.toLowerCase()},
                        {$addToSet : {'twitter.following' : other.following}}, {safe:true}, function(err) {
                callback(err);
            });
        }
    } else if(dataEvent.type == 'github') {
        if(other && other.following) {
            coll.update({'github.data._username_lowercase': dataEvent.data.login.toLowerCase()},
                        {$addToSet : {'github.following' :other.following}}, {safe:true}, function(err) {
                callback(err);
            });
        }
    } else if(dataEvent.type == 'klout') {
        //nothing yet
    }
}

// set the created date (if it has just been created)
// set the engaged date (if the person has just engaged)
function setDates(or, dataEvent, callback) {
    //set created date if it doesn't already exist
    setDate(or, dataEvent.type, 'created', new Date().getTime(), function(err) {
        if(err && callback)
            callback(err);
        else {
            //if the person has just engaged via this channel, set the engaged date
            if(dataEvent.source_event.other && dataEvent.source_event.other.engaged) {
//                console.log(dataEvent.source_event);
                setDate(or, dataEvent.type, 'engaged', dataEvent.source_event.other.engaged, function(err) {
                    if(callback) callback(err);
                });
            } else if(callback) {
                callback();
            }
        }
    });
}

// sets a date value if it has not already been set
function setDate(or, accountType, dateType, value, callback) {
    var set = {};
    var date = 'dates.' + accountType + '.' + dateType;
    set[date] = value;
    var query = {$or: or};
    query[date] = { $exists : false };
    coll.update(query, {$set: set}, {safe:true}, function(err, doc) {
        if(callback) callback(err);
    });
};

exports.addTag = function(id, tag, callback) {
    coll.update({"_id":new ObjectID(id)}, {$addToSet: {"tags": tag.toLowerCase()}}, function(err) {
        if(err)
            callback(err);
        else {
            addSearchText(id, tag, function(err) {
                callback(err);
            });
        }
    });
}

exports.dropTag = function(id, tag, callback) {
    coll.update({"_id":new ObjectID(id)}, {$pull: {"tags": tag.toLowerCase()}}, callback);
}

exports.setNotes = function(id, notes, callback) {
    coll.update({"_id":new ObjectID(id)}, {$set: {"notes": notes}}, callback);
    addSearchText(id, notes, function(){});
}



exports.close = function() {
    db.close();
}


// indexing
exports.updateAllSearchText = function(callback) {
    updateSearchText({}, true, callback);
}

function updateSearchText(query, clean, callback) {
    coll.find(query, function(err, cursor) {
        console.log('got resp from first query');
        if(!err && cursor) {
            cursor.each(function(err, contact) {
                if(!contact)
                    return;
                if(!contact.terms || clean) {
                    addEmptyTermsArray(contact._id, function() {
                        setTerms(contact, function() {});
                    });
                } else {
                    setTerms(contact, function(){});
                }
            });
        }
   });
}

function setTerms(contact, callback) {
    try {
        var searchText = getSearchText(contact);
        addSearchText(contact._id, getSearchText(contact), callback);
    } catch(err) {
        console.log(err);
    }
}

function addEmptyTermsArray(id, callback) {
    coll.update({_id: new ObjectID(id)}, {$set:{"terms":[]}}, callback);
}

function addSearchText(id, text, callback) {
    if(!id || !text || text.length < 1) {
        callback();
        return;
    }
    var terms = stemmer.splitAndStem(text);
    if(!id || terms.length < 1) {
        callback();
        return;
    }
    console.log('num terms', terms.length);
//    coll.update({"_id":new ObjectID(id)}, {$addToSet: {"terms": {$each: terms}}}, {safe:true}, callback);
    coll.findAndModify({"_id":new ObjectID(id)}, [], {$addToSet: {"terms": {$each: terms}}}, {}, callback);
}

function getSearchText(contact) {
    var searchText = '';
    if(contact.rapportive)
        searchText += ' ' + getRapportiveSearchText(contact.rapportive.data);
    if(contact.twitter)
        searchText += ' ' + getTwitterSearchText(contact.twitter.data);
    if(contact.github)
        searchText += ' ' + getGithubSearchText(contact.github.data);
    if(contact.klout)
        searchText += ' ' + getKloutSearchText(contact.klout.data);
    if(contact.tags) {
        contact.tags.forEach(function(tag) {
            searchText += ' ' + tag;
        });
    }
    return searchText;
}

function getRapportiveSearchText(data) {
    var searchText = '';
    if(data.email)
        searchText =+ ' ' + data.email;
    if(data.name)
        searchText += ' ' + data.name;
    if(data.memberships) {
        var memberships = data.memberships;
        if(memberships.github && memberships.github.username)
            searchText += ' ' + memberships.github.username;
        if(memberships.twitter && memberships.twitter.username)
            searchText += ' ' + data.memberships.twitter.username;
    }
    if(data.occupations) {
        data.occupations.forEach(function(occ) {
            if(occ.company)
                searchText += ' ' + occ.company;
            if(occ.job_title)
                searchText += ' ' + occ.job_title;
        });
    }
    searchText += ' ' + data.name;
    return searchText;
}

function getTwitterSearchText(data) {
    var searchText = '';
    if(data.screen_name)
        searchText += ' ' + data.screen_name;
    if(data.location)
        searchText += ' ' + data.location;
    if(data.name)
        searchText += ' ' + data.name;
    if(data.description)
        searchText += ' ' + data.description;
    return searchText;
}

function getGithubSearchText(data) {
    var searchText = '';
    if(data.login)
        searchText += ' ' + data.login;
    if(data.location)
        searchText += ' ' + data.location;
    if(data.name)
        searchText += ' ' + data.name;
    if(data.description)
        searchText += ' ' + data.description;
    return searchText;
}

function getKloutSearchText(data) {
    var searchText = '';
    if(data.topics) {
        data.topics.forEach(function(topic) {
            searchText += ' ' + topic;
        });
    }
    return searchText;
}









exports.putContact = function(contact, callback) {
    var ors = [];
    if(contact.email)
        ors.push({'email': contact.email});
    if(contact.memberships) {
        if(contact.memberships.github.username) {
            ors.push({'contact.memberships.github.username': contact.memberships.github.username});
            ors.push({'contact.memberships.github.login': contact.memberships.github.username});
        } else if(contact.memberships.github.login) {
            ors.push({'contact.memberships.github.username': contact.memberships.github.login});
            ors.push({'contact.memberships.github.login': contact.memberships.github.login});
        }
    }
    coll.update({'email':contact.email}, contact, {safe:true, upsert:true}, callback);
}

exports.getByEmailAddress = function(emailAddress, callback) {
    coll.find({'rapportive.email': emailAddress}, callback);
}

