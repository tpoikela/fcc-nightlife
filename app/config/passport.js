'use strict';

var User = require('../models/users');

var LocalStrategy = require('passport-local').Strategy;

const hash = require('../common/hash_password');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser( function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // Strategy for local password verification
    passport.use(new LocalStrategy({

        /* These are defaults, so no need to specify them here
        userNameField: "username",
        passwordField: "password",
        passReqToCallback: true,
        */

        session: true
        },
        function(username, password, done) {
            User.findOne({'local.username': username}, function(err, user) {
              if (err) { return done(err); }
              if (!user) { return done(null, false); }

              var hashed = hash.getHash(password);

              if (user.local.password !== hashed) { return done(null, false); }
              return done(null, user);
            });
        }
    ));

};
