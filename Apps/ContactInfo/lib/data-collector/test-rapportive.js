var rapportiveCollector = require('./rapportive.js');

rapportiveCollector.getEventEmitter().on('new-data', function(newDataEvent) {
    console.log('new-data:', newDataEvent);
});

var emails = ['smurthas@gmail.com','jasoncavnar@gmail.com','jer@jabber.org','temas@sparecog.net','tikvais@gmail.com',
              'sam.stoltze@gmail.com', 'simon@singly.com', 'simon@murtha-smith.com'];

function fireNext() {
    if(emails.length == 0)
        return;
    
    rapportiveCollector.getNewData({email:emails.shift()});
    setTimeout(fireNext, Math.random()*1000);
}

fireNext();