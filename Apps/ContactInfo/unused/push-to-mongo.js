var contacts = JSON.parse(require('fs').readFileSync('data/contacts.json'));
var dataStore = require('../lib/data-store.js');

var i = 0;

var keys = [];

for(var j in Object.keys(contacts)) {
    if(Object.keys(contacts)[j] && Object.keys(contacts)[j] != null && Object.keys(contacts)[j] != undefined)
        keys.push(Object.keys(contacts)[j]);
}

//console.log(keys);
/*
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});*/
var EventEmitter = require('events').EventEmitter;
var eventer = new EventEmitter;


function putNextContact(i, callback) {
    if(i == keys.length) {
        callback();
        return;
    }
    var key = keys[i];
//    console.log(key);
    i++;
    if(!key || key == null || key == undefined) {
        console.log('undefinfed, continuing');
        eventer.emit('next', i, callback);
        return;
    }
    dataStore.putContact(key, contacts[key], function(err) {
        if(err) {
            console.log(err);
        }
        eventer.emit('next', i, callback);
    });
}

console.log('eventer', eventer);
eventer.addListener('next', putNextContact);

try {
dataStore.openCollection(function() {
    eventer.emit('next', 0, function() {
        dataStore.close();
    })
});
} catch(err) {
    console.log(err);
    dataStore.close();
}
