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
        if(term && term.length > 0)
            term = term.toLowerCase();
        if(term.length <= 1)
            return;
        if(term.substring(term.length - 1) == 's')
            term = term.substring(0, term.length - 1);
        if(term.substring(term.length - 3) == 'ing') {
            term = term.substring(0, term.length - 3);
            term = removeDoubleEnding(term);
        }
        if(term.substring(term.length - 2) == 'er') {
            term = term.substring(0, term.length - 2);
            term = removeDoubleEnding(term);
        }
        if(term.substring(term.length - 2) == 'ed') {
            term = term.substring(0, term.length - 2);
            term = removeDoubleEnding(term);
        }
        finalArray.push(term);
    });
    return finalArray;
}

function removeDoubleEnding(term) {
    if(term.length > 2 && term.substring(term.length - 1) == term.substring(term.length - 2, term.length - 1))
        return term.substring(0, term.length - 1);
    return term;
}