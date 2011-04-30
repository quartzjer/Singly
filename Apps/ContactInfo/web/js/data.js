var baseURL = 'http://localhost:8080/data';

function getContacts(skip, limit, sort, callback) {
    $.getJSON(baseURL + '/contacts', {skip:skip, limit:limit, sort:[sort]}, callback);
}

function addRow(contact) {
    console.log('adding contact');
    var contactsTable = $("#table #contacts");
    contactsTable.append('<div id="' + contact._id + '" class="contact"></div>');
    var theDiv = $("#table #contacts #" + contact._id);
    addPhoto(theDiv, contact.image_url_raw);
    theDiv.append('<span class="column name">' + (contact.name || '') + '</span>');
    theDiv.append('<span class="column email">' + contact.email + '</span>');
    if(contact.twitter_username)
        theDiv.append('<span class="column twitter"><a target="_blank" href="http://twitter.com/' + contact.twitter_username + '">@' + contact.twitter_username + '</a></span>');
    else
        theDiv.append('<span class="column twitter"></span>');
    addLinkedIn(theDiv, contact.memberships.linkedin, contact.occupations);
    addGitHub(theDiv, contact.memberships.github);
    addKlout(theDiv, contact.klout_score);
    contactsTable.append('<br>');
}

function addPhoto(div, image_url) {
    if(image_url)
        div.append('<span class="column photo"><img src="' + image_url + '"></span>');
    else
        div.append('<span class="column photo"><img src="img/silhouette.png"></span>');
}

function addLinkedIn(div, linkedin, occupations) {
    if(linkedin) {
        var linkText = '';
        if(!occupations || occupations.length == 0) {
            linkText = 'Profile';
        } else if(occupations[0].job_title) {
            linkText = occupations[0].job_title;
            if(occupations[0].company)
                linkText += ' at ' + occupations[0].company;
        } else if(occupations[0].company) {
            linkText = occupations[0].company;
        }
        console.log(linkText);
        div.append('<span class="column linkedin">' +
                         '<a target="_blank" href="' + linkedin.profile_url + '">' + linkText + '</a></span>');
    } else
        div.append('<span class="column linkedin"></span>');
}

function addGitHub(div, github) {
    if(github) {
        div.append('<span class="column github">' +
                         '<a target="_blank" href="' + github.profile_url + '">' + github.username + '</a></span>');
    } else
        div.append('<span class="column github"></span>');
}

function addKlout(div, klout) {
    if(klout) {
        div.append('<span class="column klout">' + klout.kscore + '</span>');
    } else
        div.append('<span class="column klout"></span>');
}


var sort = {'klout_score.kscore':'asc', 'name':'desc', 'email':'desc'};

function reload(sortField) {
    var direction = 'asc';
    if(sort[sortField]) {
        if(sort[sortField] == 'asc') 
            direction = 'desc';
        else
            direction = 'asc';
    }
    sort[sortField] = direction;
    console.log([sortField, direction]);
    getContacts(0, 100, [sortField, direction], function(contacts) {
        var contactsTable = $("#table #contacts").html('');
        for(var i in contacts) {
            addRow(contacts[i]);
//            console.log(contacts[i]);
        }
        //console.log(contacts);
    });
}
$(function() {
    console.log('heeeelooo, jquery!');
    reload('name');
});
