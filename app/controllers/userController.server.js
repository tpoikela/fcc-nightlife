
// Used for MongoDB access
var User = require('../models/users.js');

const hash = require('../common/hash_password');

module.exports = function(path) {

    var errorHandler = function(err, res) {
        console.error('userController Server error: ' + err);
        res.sendStatus(500);
    };

    // Adds one user to the database. Fails if a user exists already. This is
    // used only for local registration. github users are added in passport.js
    this.addLocalUser = function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        if (username && password) {
            User.findOne({username: username}, function(err, user) {
                if (err) {errorHandler(err, res);}
                // If the user doesn't exist, create new one and store into DB
                else if (!user) {
					var newUser = new User();
                    newUser.username = username;
                    newUser.local = {};
                    newUser.local.username = username;
                    newUser.local.password = hash.getHash(password);

                    newUser.save(function(err) {
                        if (err) {errorHandler(err, res);}
                        else {
                            console.log('Register local user ' + username +
                                ' with pw ' + password);

                            res.url = '/auth/userLogin';
                            res.render(path + '/pug/signup_done.pug',
                                {ok: true, name: username});
                        }
                    });

                }
                else {
                    res.render(path + '/pug/signup_done.pug',
                        {ok: false, name: username});
                }
            });
        }
        else {
            res.sendStatus(400);
        }
    };

    var sendAuthenticatedUserInfo = function(res, username) {
        User.findOne({username: username})
            .populate('venues favourites')
            .exec(function(err, user) {
                if (err) {return errorHandler(err, res);}

                if (user) {
                    return res.json(user);
                }
                else {
                    var obj = {error:
                        'No user ' + username + ' found in database.'};
                    return res.json(obj);
                }
        });
    };

    /* Responds with info about the requested user (if authenticated).*/
    this.getUser = function(req, res) {
        if (req.isAuthenticated()) {
            console.log('getUser Req auth, user ' + JSON.stringify(req.user));
            var username = req.user.username;
            sendAuthenticatedUserInfo(res, username);
        }
        else {
            res.json({name: 'guest'});
        }
    };

    this.getUserID = function(username, cb) {
        User.findOne({username: username}, (err, user) => {
            if (err) {return cb(err);}
            else if (user) {return cb(null, user._id);}
            else {return cb(null, null);}
        });

    };

    /* Given username, fetches corresponding user data from the DB and passes
     * it to callback.*/
    this.getUserByName = function(username, cb) {
        User.findOne({username: username})
            // .populate('venues favourites')
            .populate('venues')
            .exec( (err, user) => {
            if (err) {return cb(err);}
            else if (user) {return cb(null, user);}
            else {return cb(null, null);}
        });
    };

    /* Adds a venue where user is going. Needs appID and username to perform
     * the update.*/
    this.updateUserVenueInfo = function(obj, cb) {
        this.getUserByName( obj.username, (err, user) => {
            if (err) { cb(err);}
            else if (user) {
                    if (obj.going) {user.addVenue(obj.venueID, cb);}
                    else {user.removeVenue(obj.venueID, cb);}
                }
                else {
                    // No user info was found
                    cb(null, null);
                }
        });
    };

};

