

var Venue = require('../models/venues');
var User = require('../models/users');

var VenueController = function() {

    var addOrRemoveUser = (cmd, obj, cb) => {
        var appID = obj.appID;
        var username = obj.username;
        // First we must find the user ID
        User.getUserID(username, (err, userID) => {
            if (err) cb(err);

            if (userID) {
                Venue.findOne({appID: appID}, (err, venue) => {
                    if (err) cb(err);
                    if (venue) {
                        if (cmd.add) venue.addGoing(userID, cb);
                        else venue.removeGoing(userID, cb);
                    }
                    else {
                        var newVenue = new Venue();
                        newVenue.appID = appID;
                        newVenue.going.push(userID);
                        newVenue.save((err) => {
                            if (err) cb(err);
                            console.log("Saved new venue ID " + appID);
                            cb(null);
                        });
                    }

                });
            }
            else {
                var error = new Error("No ID for username found.");
                cb(error);
            }
        });

    };

    /** Adds one user going to the venue.*/
    this.addGoing = function(obj, cb) {
        addOrRemoveUser({add: true}, obj, cb);
    }

    /** Removes one user from the venue.*/
    this.removeGoing = function(obj, cb) {
        addOrRemoveUser({add: false}, obj, cb);
    }

};

module.exports = VenueController;
