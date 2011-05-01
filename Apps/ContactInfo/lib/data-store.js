require.paths.push(__dirname + '/../node-mongodb-native/lib');
var mongodb = require('mongodb'),
    BSON = require('mongodb').BSONNative,
    crypto = require('crypto');

var dbName = 'people';
var collectionName = 'data';
var server = new mongodb.Server('localhost', mongodb.Connection.DEFAULT_PORT, {});
var db = new mongodb.Db(dbName, server, {native_parser:true});
var coll;

var ObjectID = db.bson_serializer.ObjectID;

exports.openCollection = function(callback) {
    db.open(function(err, db) {
        db.collection(collectionName, function(err, collection) {
            coll = collection;
            callback(err, collection);
        });
    });
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
    coll.find({'email': emailAddress}, callback);
}


exports.getContacts = function(options, callback) {
    coll.find({}, options).toArray(function(err, docs) {
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
    if(dataEvent.type == 'rapportive') {
        or = [{'rapportive.email' : data.email}];
        if(data.memberships.github.username)
            or.push({'github.login': data.memberships.github.username});
        if(data.memberships.twitter.username) {
            or.push({'twitter.screen_name': data.memberships.twitter.username});
            or.push({'klout.username': data.memberships.twitter.username});
        }
        console.log('adding rapportive data for', data.email);
    } else if(dataEvent.type == 'twitter') {
        or = [{'twitter.screen_name' : data.screen_name}, {'rapportive.twitter_username' : data.screen_name},
              {'rapportive.memberships.twitter.username' : data.screen_name}, {'klout.username':data.screen_name}];
        console.log('adding twitter data for ', data.screen_name);
    } else if(dataEvent.type == 'github') {
        or = [{'github.login' : data.login}, {'rapportive.memberships.github.username' : data.login}];
        console.log('adding github data for ', data.login);
    } else if(dataEvent.type == 'klout') {
        or = [{'twitter.screen_name' : data.username}, {'rapportive.twitter_username' : data.username},
              {'rapportive.memberships.twitter.username' : data.username}, {'klout.username':data.username}];
        console.log('adding klout data for ', data.username, 'with score', data.score.kscore, 'and topics', data.topics);
    }
    if(or)
        set(dataEvent.type, data, or, (callback? callback : function(){});
}

function set(type, data, or, callback) {
    var set = {};
    set[type] = data;
    coll.update({$or: or}, {$set: set}, {safe:true, upsert:true}, callback);
}



exports.close = function() {
    db.close();
}