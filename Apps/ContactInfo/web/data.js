var baseURL = 'http://localhost:8080/data';

function getContacts(skip, limit, callback) {
    $.getJSON(baseURL + '/contacts', {skip:skip, limit:limit}, callback);
}

$(function() {
    console.log('heeeelooo, jquery!');
    getContacts(0, 3, function(json) {
        console.log(json);
    });
})