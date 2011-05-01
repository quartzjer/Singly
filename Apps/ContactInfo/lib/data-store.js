require.paths.push(__dirname + '/../node-mongodb-native/lib');
var mongodb = require('mongodb'),
    BSON = require('mongodb').BSONNative,
    crypto = require('crypto');

var dbName = 'data';
var collectionName = 'test';
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
        ors.push('email': contact.email);
    if(contact.memberships) {
        if(contact.memberships.github.username) {
            ors.push('contact.memberships.github.username': contact.memberships.github.username);
            ors.push('contact.memberships.github.login': contact.memberships.github.username);
        } else if(contact.memberships.github.login) {
            ors.push('contact.memberships.github.username': contact.memberships.github.login);
            ors.push('contact.memberships.github.login': contact.memberships.github.login);
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
//exports.find = function();

exports.close = function() {
    db.close();
}


function genObjectID(clean_name) {
    var hash = crypto.createHash('md5');
    hash.update(clean_name);
    var hashStr = hash.digest('hex');
    var objID = new ObjectID(hashStr.substring(0, 12));
    return objID;
}
function genID() {
}
