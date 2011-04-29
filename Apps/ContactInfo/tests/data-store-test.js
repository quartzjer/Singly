var dataStore = require('../lib/data-store.js');


dataStore.openCollection(function() {
    dataStore.getContacts({skip:0, limit:20, sort:[['klout_score.kscore', 'desc']]}, function(err, docs) {
        for(var i in docs)
            if(docs[i] != null)
                console.log(docs[i].name);
    });
});

process.on('exit', function() {
    dataStore.close();
})