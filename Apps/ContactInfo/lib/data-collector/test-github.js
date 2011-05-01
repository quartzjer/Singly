var githubCollector = require('./github.js');

githubCollector.getEventEmitter().on('new-data', function(newDataEvent) {
    console.log('new-data:', newDataEvent);
});

var usernames = ['smurthasmith','quartzjer','rand','temas'];

function fireNext() {
    if(usernames.length == 0)
        return;
    
    githubCollector.getNewData({username:usernames.shift()});
    setTimeout(fireNext, Math.random()*1000);
}

fireNext();