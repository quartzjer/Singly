var port = process.argv[2];

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

function addQuery(q) {
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
        if(data)
            callback(JSON.parse(data));
        else
            callback(null);
    }).send();
}

addQuery('@singlyinc');