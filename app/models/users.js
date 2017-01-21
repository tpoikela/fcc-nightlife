'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Validation = require('../common/validation.js');

var validator = new Validation();

var ObjectId = mongoose.Schema.Types.ObjectId;

/** A schema for an user in the database.*/
var UserSchema = new Schema({

    // Used to access the information in database
    username: {
        required: true,
        type: String,
        validate: {
            validator: validator.validateName,
            message: "Name cannot contain < or >",
        },
    },

    // Used for local user and password auth
    local: {
        username: String,
        password: String,
    },

    favourites: [{type: ObjectId, ref: 'Venue'}],
    venues: [{type: ObjectId, ref: 'Venue'}],

},
{collection: "nightlife_users"} // Selects the collection name explicitly
);

/** Returns user ID corresponding to the given user.*/
UserSchema.statics.getUserID = function(username, cb) {
    this.model('User').findOne({username: username}, (err, data) => {
        if (err) cb(err);
        if (data) return cb(null, data._id);

        var error = new Error("No user with given ID found.");
        cb(error);

    });

};

/** Adds one venue for the user.*/
UserSchema.methods.addVenue = function(venueID, cb) {
    var venues = this.venues;
    venues.push(venueID);
    var obj = {venues: venues};
    this.updateInfo(obj, cb);
};

/** Removes one venue from the user.*/
UserSchema.methods.removeVenue = function(venueID, cb) {
    var venues = this.venues;
    var index = venues.indexOf(venueID);
    if (index >= 0) {
        venues.splice(index, 1);
        var obj = {venues: venues};
        this.updateInfo(obj, cb);
    }
    else {
        var err = new Error("User not going to this venue");
        cb(err);
    }

};

/** Updates the user info with given object. Note that obj must match the user
 * schema.*/
UserSchema.methods.updateInfo = function(obj, cb) {
    var setVals = {$set: obj};
    this.model('User').update({_id: this._id}, setVals, {}, (err) => {
        if (err) cb(err);
        cb(null);
    });

};

module.exports = mongoose.model('User', UserSchema);

