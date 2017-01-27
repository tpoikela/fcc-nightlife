
var Venue = require('../models/venues');
var User = require('../models/users');

var VenueController = function() {

    var addOrRemoveUser = (cmd, obj, cb) => {
        var appID = obj.appID;
        var username = obj.username;
        // First we must find the user ID
        User.getUserID(username, (err, userID) => {
            if (err) {cb(err);}

            if (userID) {
                Venue.findOne({appID: appID}, (err, venue) => {
                    if (err) {cb(err);}
                    if (venue) {
                        obj.userID = userID;
                        obj.venueID = venue._id;
                        if (cmd.add) {venue.addGoing(userID, cb);}
                        else {venue.removeGoing(userID, cb);}
                    }
                    else {
                        var newVenue = new Venue();
                        newVenue.name = obj.venue.name;
                        newVenue.url = obj.venue.url;
                        newVenue.location = obj.venue.location;
                        newVenue.appID = appID;
                        newVenue.going.push(userID);
                        newVenue.save((err) => {
                            if (err) {return cb(err);}
                            else {
                                console.log('Saved new venue ID ' + appID);
                                obj.userID = userID;
                                obj.venueID = newVenue._id;
                                return cb(null);
                            }
                        });
                    }

                });
            }
            else {
                var error = new Error('No ID for username found.');
                cb(error);
            }
        });

    };

    /* Calls either add or removeGoing based on obj.going value.*/
    this.handleGoingReq = function(obj, cb) {
        if (obj.going) {this.addGoing(obj, cb);}
        else {this.removeGoing(obj, cb);}
    };

    /* Adds one user going to the venue.*/
    this.addGoing = function(obj, cb) {
        addOrRemoveUser({add: true}, obj, cb);
    };

    /* Removes one user from the venue.*/
    this.removeGoing = function(obj, cb) {
        addOrRemoveUser({add: false}, obj, cb);
    };

    /* Given a list of appID objects, returns going lists for those IDs.*/
    this.getGoingUsers = function(appIDs, cb) {
        if (typeof appIDs === 'object') {
            var query = {$or: appIDs};
            Venue.find(query, (err, data) => {
                if (err) {cb(err);}
                else {cb(null, data);}
            });
        }
        else {
            var error = new Error('An array object must be supplied.');
            cb(error);
        }
    };

};


module.exports = VenueController;
