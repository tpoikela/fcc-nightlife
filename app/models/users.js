'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Validation = require('../common/validation.js');

var validator = new Validation();

var ObjectId = mongoose.Schema.Types.ObjectId;

/** A schema for an user in the database.*/
var User = new Schema({

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

    favourites: [],
    going: [{type: ObjectId, ref: 'Venue' }]

},
{collection: "nightlife_users"} // Selects the collection name explicitly
);

module.exports = mongoose.model('User', User);

