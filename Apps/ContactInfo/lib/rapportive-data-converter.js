var csv = require('./csv.js');

var headers = ['Date', 'Name', 'Email', 'Location', 
               'Twitter', 'Linkedin', 'GitHub',
               'Klout Score', 'Network Score', 'Amplification Score',
               'True Reach', 'Topics', 'Occupations'];
var csvFile;

exports.open = function(filename, createNewFile) {
    if(createNewFile)
        csvFile = csv.openFile(filename, headers);
    else
        csvFile = csv.openFile(filename);
}

exports.writeContactToCSV = function(csvFile, contact) {
    if(!contact)
        return;
        
    var linkedinProf = '';
    var github;
    
    var ships = contact.memberships;
    for(var j in ships) {
        if(!ships[j]) continue;
        if(ships[j].icon_name == 'linkedin') {
            linkedinProf = ships[j].profile_url;
        } else if(ships[j].icon_name == 'github') {
            github = ships[j];
        }
    }
    
    var occupationsString = '';
    var occs = contact.occupations;
    for(var j in occs) {
        occupationsString += occs[j].job_title + ' at ' + occs[j].company;
        if(j != (occs.length - 1)) 
            occupationsString += ', ';
    }
    csvFile.appendLine([contact.email_signup_date, 
                        (contact.name? contact.name : ''),
                        (contact.email? contact.email : ''),
                        (contact.location? contact.location : ''),
                        (contact.twitter_username? contact.twitter_username : ''),
                        (linkedinProf? linkedinProf : ''),
                        (github? github.profile_url : ''),
                        (contact.klout_score? contact.klout_score.kscore : ''),
                        (contact.klout_score? contact.klout_score.network_score : ''),
                        (contact.klout_score? contact.klout_score.amplification_score : ''),
                        (contact.klout_score? contact.klout_score.true_reach : ''),
                        (contact.klout_topics? (contact.klout_topics.toString().replace(/,/g, ", ")) : ''),
                        occupationsString]);
    
}