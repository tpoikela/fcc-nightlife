
'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

/* A schema for a venue where people can go to. It must have name and unique
 * ID.
 */
var VenueSchema = new Schema({

    appID: {
        unique: true,
        required: true,
        type: String
    },

    name: {
        required: true,
        type: String
    },

    location: {
        type: Object,
        city: {
            type: String
        }
    },

    descr: {
        type: String
    },

    url: {
        type: String
    },

    img: {
        type: String
    },

    going: [{type: ObjectId, ref: 'User'}]

},
{collection: 'nightlife_venues'}
);

/* Updates the object with a going user.*/
VenueSchema.methods.addGoing = function(userID, cb) {
    var going = this.going;
    var index = going.indexOf(userID);
    if (index < 0) {
        going.push(userID);
        var setVals = {$set: {going: going}};
        this.model('Venue').update({_id: this._id}, setVals, {}, cb);
    }
    else {
        var err = new Error('User already going to the venue. Cannot add.');
        cb(err);
    }
};

/* Removes one going user.*/
VenueSchema.methods.removeGoing = function(userID, cb) {
    var index = this.going.indexOf(userID);
    if (index >= 0) {
        this.going.splice(index, 1);
        console.log(JSON.stringify(this.going));
        var setVals = {$set: {going: this.going}};
        this.model('Venue').update({_id: this._id}, setVals, {}, cb);
    }
    else {
        var err = new Error('User is not going to the venue. Cannot remove.');
        cb(err);
    }

};

module.exports = mongoose.model('Venue', VenueSchema);
