var k = require('../lib/data-collector/klout.js');

k.getNewData({username:'brunomelo'}, function(err, resp) {
    console.log(err);
    console.log(resp);
});