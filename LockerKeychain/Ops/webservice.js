
var keychain = require("lkeychain");



// KEYCHAIN
// put an object in the keychain
locker.post('/core/:svcId/keychain/putAuthToken', function(req, res) {
    var authTokenID = keychain.putAuthToken(req.param('authToken'), req.param('serviceType'), req.param('descriptor'));
    res.writeHead(200);
    res.end(JSON.stringify({'authTokenID':authTokenID}));
});

// permission an object in the keychain
locker.post('/core/:svcId/keychain/grantPermission', function(req, res) {
    keychain.grantPermission(req.param('authTokenID'), req.param('serviceID'));
    res.writeHead(200);
    res.end(JSON.stringify({'success':true}));
});

// get all objects' meta for a given service type in the keychain
locker.get('/core/:svcId/keychain/getTokenDescriptors', function(req, res) {
    var meta = keychain.getTokenDescriptors(req.param('serviceType'));
    res.writeHead(200, {
        'Content-Type':'text/json'
    });
    res.end(JSON.stringify(meta));
});

// get all objects' meta for a given service type in the keychain
locker.get('/core/:svcId/keychain/getAuthToken', function(req, res) {
    try {
        var meta = keychain.getAuthToken(req.param('authTokenID'), req.param('svcId'));
        res.writeHead(200, {
            'Content-Type':'text/json'
        });
        res.end(JSON.stringify(meta));
    } catch(err) {
        res.writeHead(401, {
            'Content-Type':'text/json'
        });
        sys.debug(err);
        res.end(JSON.stringify({error:'Permission denied'}));
    }
});

