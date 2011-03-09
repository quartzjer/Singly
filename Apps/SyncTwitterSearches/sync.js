var port = process.argv[2];

var updateInterval = 6;//in secs

var httpClient = require('wwwdude').createClient(),
    lfs = require('../../../Locker/Common/node/lfs.js');
var queries = lfs.loadMeData();
if(!queries.list)
    queries.list = [];

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

exports.addQuery = function (q) {
    if(!queries.list.contains(q)) {
    console.log('adding query ' + q);
        queries.list.push(q);
        updateData(q, function(data) {
            lfs.syncMeData(queries);
            console.log('done!');
        });
    }
}

function updateData(q, callback) {
    httpClient.get('http://localhost:' + port + '/pull_search?q=' + escape(q)).addListener('complete', function(data, resp) {
        if(callback) {
            if(data)
                callback(JSON.parse(data));
            else
                callback(null);
        }
    });
}

exports.updateData = updateData;


function updateAllData() {
    for(var i = 0; i < queries.list.length; i++)
        updateData(queries.list[i]);
}

var keepUpdating = true;

function startUpdateLoop() {
    if(!keepUpdating) {
        keepUpdating = true;
        return;
    }
    console.log('updating...');
    updateAllData();
    var num = (queries & queries.list) ? queries.list.length : 1;
    var interval = 3600 / 160 * num * 3 * 1000; //interval time in ms
    console.log('waiting ' + (interval / 1000) + 'secs until next update')
    setTimeout(startUpdateLoop, interval);
}

exports.startUpdateLoop = startUpdateLoop;


function stopUpdateLoop() {
    keepUpdating = false;
}
exports.stopUpdateLoop = stopUpdateLoop;

startUpdateLoop();