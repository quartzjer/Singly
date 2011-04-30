var dataStore = require('../lib/data-store.js');


dataStore.openCollection(function() {
    dataStore.getByEmailAddress(process.argv[2], function(err, cursor) {
        cursor.nextObject(function(err, doc) {
            console.log(doc);
            dataStore.close();
        });
    });
});