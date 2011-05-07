var stem = require('./porter').stemmer;

exports.splitAndStem = function(text) {
    return splitText(text);
}

function splitText(text) {
    if(!text)
        return [];
    if(typeof text == 'number')
        text = text.toString();
    else if(typeof text != 'string')
        return [];
    var tmp = text.split(/[^a-zA-Z0-9]/g);
    var finalArray = [];
    tmp.forEach(function(term) {
        var term = stem(term);
        if(term)
            finalArray.push(term.toLowerCase());
    });
    return finalArray;
}

function removeDoubleEnding(term) {
    if(term.length > 2 && term.substring(term.length - 1) == term.substring(term.length - 2, term.length - 1))
        return term.substring(0, term.length - 1);
    return term;
}