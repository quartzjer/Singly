var fs = require('fs');

var contacts = JSON.parse(fs.readFileSync('../contacts.json'));

for(var i in contacts) {
    var ships = contacts[i].memberships;
    var newShips = {};
    if(ships) {
        for(var j in ships)
            newShips[ships[j].icon_name] = ships[j];
        contacts[i].memberships = newShips;
    }
}

fs.writeFileSync('contacts2.json', JSON.stringify(contacts));