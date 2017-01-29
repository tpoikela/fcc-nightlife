'use strict';

const mongoose = require('mongoose');
const Validation = require('../common/validation.js');

const Schema = mongoose.Schema;

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
            message: 'Name cannot contain < or >'
        }
    },

    // Used for local user and password auth
    local: {
        required: true,
        type: Object,
        username: {
            required: true,
            type: String
        },
        password: {
            required: true,
            type: String
        },
        validate: {
            validator: function(v) {
                return v.hasOwnProperty('username')
                    && v.hasOwnProperty('password');
            },
            message: 'username and password must exist.'
        }

    },

    favourites: [{type: ObjectId, ref: 'Venue'}],
    venues: [{type: ObjectId, ref: 'Venue'}]

},
// Selects the collection name explicitly
{collection: 'nightlife_users'}
);

/* Calls given callback with user ID corresponding to the given user.*/
UserSchema.statics.getUserID = function(username, cb) {
    this.model('User').findOne({username: username}, (err, data) => {
        if (err) {return cb(err);}
        if (data) {return cb(null, data._id);}

        var error = new Error('No user with given ID found.');
        return cb(error);
    });
};

/* Adds one venue for the user.*/
UserSchema.methods.addVenue = function(venueID, cb) {
    var venues = this.venues;
    venues.push(venueID);
    var obj = {venues: venues};
    this.updateInfo(obj, cb);
};

/* Removes one venue from the user.*/
UserSchema.methods.removeVenue = function(venueID, cb) {
    var venues = this.venues;

    var index = venues.findIndex( (item) => {
        console.log('===> Comp: ' + venueID + ' to ' + item);
        if (item.equals(venueID)) {return true;}
        return false;
    });

    if (index >= 0) {
        venues.splice(index, 1);
        var obj = {venues: venues};
        this.updateInfo(obj, cb);
    }
    else {
        var msg = `User ${this.username} not going to venue ${venueID}`;
        var err = new Error(msg);
        cb(err);
    }

};

/* Updates the user info with given object. Note that obj must match the user
 * schema.*/
UserSchema.methods.updateInfo = function(obj, cb) {
    var setVals = {$set: obj};
    this.model('User').update({_id: this._id}, setVals, {}, (err) => {
        if (err) {cb(err);}
        cb(null);
    });

};

module.exports = mongoose.model('User', UserSchema);

