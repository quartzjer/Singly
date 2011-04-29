var dataStore = require('./lib/data-store.js');


dataStore.openCollection(function() {
    dataStore.getByEmailAddress('max.schultz@gmail.com', function(err, cursor) {
        cursor.nextObject(function(err, doc) {
            console.log(doc);
            dataStore.close();
        });
    });
});