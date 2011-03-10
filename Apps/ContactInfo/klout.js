var wwwdude = require('wwwdude');

module.exports = function(apiKey) {
    var client = {API_KEY:apiKey};
    client.getKloutScore = function (usernames, callback) {
        wwwdude.createClient().get('http://api.klout.com/1/klout.json?key=' + this.API_KEY + '&users=' + usernames)
        .addListener('success', function(data, resp) {
            var json = JSON.parse(data);
            callback(json);
        });
    };
    client.getKloutUsers = function (usernames, callback) {
        wwwdude.createClient().get('http://api.klout.com/1/users/show.json?key=' + this.API_KEY + '&users=' + usernames)
        .addListener('success', function(data, resp) {
            var json = JSON.parse(data);
            callback(json);
        });
    };
    client.getKloutTopics = function (usernames, callback) {
        wwwdude.createClient().get('http://api.klout.com/1/users/topics.json?key=' + this.API_KEY + '&users=' + usernames)
        .addListener('success', function(data, resp) {
            var json = JSON.parse(data);
            console.log(usernames + ': ' + data);
            callback(json);
        });
    };
    
    return client;
}
