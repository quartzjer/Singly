var baseURL = 'http://localhost:8080/data';

function getContacts(skip, limit, sort, callback) {
    $.getJSON(baseURL + '/contacts', {skip:skip, limit:limit, sort:[sort]}, callback);
}

function addRow(contact) {
    console.log('adding contact:', contact);
    var contactsTable = $("#table #contacts");
    contactsTable.append('<div id="' + contact._id + '" class="contact"></div>');
    var theDiv = $("#table #contacts #" + contact._id);
    addPhoto(theDiv, contact);
    addName(theDiv, contact);
    addEmail(theDiv, contact);
    addTwitter(theDiv, contact);
    addLinkedIn(theDiv, contact);
    addGitHub(theDiv, contact);
    addKlout(theDiv, contact);
    addDate(theDiv, contact);
    contactsTable.append('<br>');
}

function addPhoto(div, contact) {
    var image_url;
    if(contact.rapportive)
        image_url = contact.rapportive.image_url_raw;
    else if(contact.twitter)
        image_url = contact.twitter.profile_image_url;
    else if(contact.github && contact.github.gravatar_id)
        image_url = 'https://secure.gravatar.com/avatar/' + contact.github.gravatar_id;
    if(image_url)
        div.append('<span class="column photo"><img src="' + image_url + '"></span>');
    else
        div.append('<span class="column photo"><img src="img/silhouette.png"></span>');
}

function addName(div, contact) {
    var name;
    if(contact.rapportive && contact.rapportive.name)
        name = contact.rapportive.name;
    else if(contact.twitter && contact.twitter.name)
        name = contact.twitter.name;
    else if(contact.github && contact.github.name)
        name = contact.github.name;
    div.append('<span class="column name">' + (name || '') + '</span>');
}

function addEmail(div, contact) {
    var email;
    if(contact.rapportive && contact.rapportive.email)
        email = contact.rapportive.email;
    else if(contact.github && contact.github.email)
        email = contact.github.email;
    div.append('<span class="column email">' + (email || '') + '</span>');
}

function addTwitter(div, contact) {
    var twitterUsername;
    if(contact.twitter)
        twitterUsername = contact.twitter.screen_name;
    else if(contact.rapportive && contact.rapportive.twitter_username)
        twitterUsername = contact.rapportive.memberships.twitter_username;
    
    if(twitterUsername) {
        div.append('<span class="column twitter">' +
                         '<a target="_blank" href="https://twitter.com/' + twitterUsername + '">@' 
                         + twitterUsername + '</a></span>');
    } else
        div.append('<span class="column twitter"></span>');
}

function addGitHub(div, contact) {
    var githubUsername;
    if(contact.github)
        githubUsername = contact.github.login;
    else if(contact.rapportive && contact.rapportive.membership && contact.rapportive.membership.github)
        githubUsername = contact.rapportive.membership.github.username;
    
    if(githubUsername) {
        div.append('<span class="column github">' +
                         '<a target="_blank" href="https://github.com/' + githubUsername + '">' 
                         + githubUsername + '</a></span>');
    } else
        div.append('<span class="column github"></span>');
}

function addLinkedIn(div, contact) {
    var linkedin, occupations;
    if(contact.rapportive) {
        if(contact.rapportive.memberships)
            linkedin = contact.rapportive.memberships.linkedin;
        if(contact.rapportive.occupations)
            occupations = contact.rapportive.occupations;
    }
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
//        console.log(linkText);
        div.append('<span class="column linkedin">' +
                         '<a target="_blank" href="' + linkedin.profile_url + '">' + linkText + '</a></span>');
    } else
        div.append('<span class="column linkedin"></span>');
}

function addKlout(div, contact) {
    var klout = contact.klout;
    var score;
    
    if(klout) {
        if(klout.score && klout.score.kscore)
            score = klout.score.kscore;
    }
    div.append('<span class="column klout">' + (score || '') + '</span>');
}

function addDate(div, contact) {
    var date = new Date().getTime();
    var min = date;
    if(contact.dates) {
        var dates = contact.dates;
        if(dates.rapportive && dates.rapportive.engaged)
            min = Math.min(min, dates.rapportive.engaged);
        if(dates.twitter && dates.twitter.engaged)
            min = Math.min(min, dates.twitter.engaged);
        if(dates.github && dates.github.engaged)
            min = Math.min(min, dates.github.engaged);
    }
    if(min < date)
        date = min;
    else
        date = null;
    if(date) {
        var d = new Date(date/1);
        console.log(d);
        div.append('<span class="column date">' + (d.getMonth() + 1) + '/' + d.getDate() + '/' + (d.getFullYear() - 2000) + '</span>');
    }
    else
        div.append('<span class="column date"></span>');
}


var sort = {'dates.rapportive.engaged':'desc', 'klout.score.kscore':'asc', 'rapportive.name':'desc', 'rapportive.email':'desc'};

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
    reload('dates.rapportive.engaged');
});
