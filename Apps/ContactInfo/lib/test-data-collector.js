var dataCollector = require('./data-collector.js');

dataCollector.start(function() {
    dataCollector.addAccount('email', 'smurthas@gmail.com', {engagedAt:new Date().getTime()});
});