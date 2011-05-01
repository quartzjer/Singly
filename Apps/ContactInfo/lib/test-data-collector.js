var dataCollector = require('./data-collector.js');

dataCollector.start(function() {
    dataCollector.addAccount('email', 'smurthas@gmail.com', new Date().getTime());
});