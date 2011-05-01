var dataCollector = require('./data-collector.js');

dataCollector.start(function() {
    dataCollector.addAccount('email', 'jeremie@jabber.org');
});