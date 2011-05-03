var rapportiveCollector = require('./data-collector/rapportive.js');
var twitterCollector = require('./data-collector/twitter.js');
var githubCollector = require('./data-collector/github.js');
var kloutCollector = require('./data-collector/klout.js');

var dataStore = require('./data-store.js');

exports.start = function(callback) {
    dataStore.openCollection(callback);
}

function processNewAccount(type, account, other) {
    console.log('processNewAccount:', type, account);
    var type = type.toLowerCase();
    if(type == 'email' || type == 'emailaddress') {
        rapportiveCollector.getNewData({email:account, other:other});
    } else if(type == 'twitter') {
        twitterCollector.getNewData({username:account, other:other});
        kloutCollector.getNewData({username:account, other:other});
    } else if(type == 'github') {
        githubCollector.getNewData({username:account, other:other});
    } else {
        throw new Error('account type "' + type + '" not found!');
    }
}

rapportiveCollector.getEventEmitter().on('new-data', dataStore.put);
twitterCollector.getEventEmitter().on('new-data', dataStore.put);
githubCollector.getEventEmitter().on('new-data', dataStore.put);
kloutCollector.getEventEmitter().on('new-data', dataStore.put);

rapportiveCollector.getEventEmitter().on('new-data', processRapportiveEvent);

// look for memberships within the rapportive data and pass those back in
function processRapportiveEvent(rapportiveEvent) {
    var memberships = rapportiveEvent.data.memberships;
    if(memberships) {
        for(var type in memberships) {
            if(type == 'twitter')
                processNewAccount('twitter', memberships[type].username);
            else if(type == 'github')
                processNewAccount('github', memberships[type].username);
        }
    }
}


exports.addAccount = processNewAccount;