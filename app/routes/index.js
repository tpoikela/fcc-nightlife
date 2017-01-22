'use strict';

var path = process.cwd();
var ctrlPath = path + '/app/controllers';
const UserController = require(ctrlPath + '/userController.server.js');
const SearchController = require(ctrlPath + '/searchController.server.js');
const VenueController = require(ctrlPath + '/venueController.server.js');

var $DEBUG = 0;

var _log = function(msg) {
    console.log("\t" + msg);
};

/** Function for debug logging requests.*/
var reqDebug = function(req) {
	_log("Headers: " + JSON.stringify(req.headers));
	_log("Body: "    + JSON.stringify(req.body));
	_log("Params: "  + JSON.stringify(req.params));
	_log("Url:"      + JSON.stringify(req.url));
	_log("Text:"     + JSON.stringify(req.text));
	_log("Content:"  + JSON.stringify(req.content));
	_log("Query:"    + JSON.stringify(req.query));
};

module.exports = function (app, passport) {

    /** Renders a pug template.*/
    var renderPug = function(req, res, pugFile) {
        var isAuth = req.isAuthenticated();
        res.render(path + "/pug/" + pugFile, {isAuth: isAuth});
    };

    /** loggedIn func from clementine.js. */
	var isLoggedIn = function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

    var logError = function(route, err) {
        console.error("[ERROR@SERVER] route " + route + ' | ' + err);
    };

    // CONTROLLERS
    var userController = new UserController(path);
    var searchController = new SearchController();
    var venueController = new VenueController();

    //----------------------------------------------------------------------
    // ROUTES
    //----------------------------------------------------------------------

	app.route('/')
		.get((req, res) => {
            renderPug(req, res, "index.pug");
            //res.sendFile(path + "/pug/index.pug");
		});

	app.route('/about')
		.get((req, res) => {
            renderPug(req, res, "about.pug");
		});

	app.route('/signup')
		.get((req, res) => {
            renderPug(req, res, "signup.pug");
		});

	app.route('/login')
		.get((req, res) => {
            renderPug(req, res, "login.pug");
		});

	app.route('/loginFailed')
		.get((req, res) => {
            res.render(path + "/pug/login.pug", 
                {isAuth: false, loginFailed: true});
        });

    // If a user logs out, return to main page
	app.route('/logout')
		.get((req, res) => {
			req.logout();
			res.redirect('/');
		});

	app.route('/profile')
		.get(isLoggedIn, (req, res) => {
            renderPug(req, res, "profile.pug");
		});

    // Handle registration of user
    app.route('/forms/signup')
        .post((req, res) => {
            if ($DEBUG) {
                console.log("Got a signup form GET request..");
                reqDebug(req);
            }
            userController.addLocalUser(req, res);
        });

    // Called by client to check their authentication status
	app.route('/amiauth')
		.get((req, res) => {
            var data = {isAuth: false};
            if (req.isAuthenticated()) {
                data.isAuth = true;
                data.username = req.user.username;
                userController.getUserID(data.username, (err, userID) => {
                    if (err) {
                        logError('/amiauth', err);
                        res.json({error: "Failed to authenticate"});
                    }
                    else {
                        data.userID = userID;
                        res.json(data);
                    }
                });
            }
            else {
                res.json(data);
            }
		});

    //----------------------------------
    // Routes for manipulating user data
    //----------------------------------

    /** Marks user as going or not going for an event. */
    app.route('/going')
        .post(isLoggedIn, (req, res) => {
            var obj = {
                venue: req.body.venue,
                username: req.body.username,
                appID: req.body.appID,
                going: req.body.going,
            };
            console.log("User: " + req.user.username + ' obj: ' + obj.username);
            console.log("appID: " + obj.appID);
            reqDebug(req);

            if (req.user.username === obj.username) {
                venueController.handleGoingReq(obj, (err) => {
                    if (err) {
                        logError('/going venueCtrl', err);
                        res.sendStatus(500);
                    }
                    else {
                        // obj should contain userID + venueID now
                        userController.updateUserVenueInfo(obj, (err) => {
                            if (err) {
                                logError('/going userCtrl', err);
                                res.sendStatus(500);
                            }
                            else res.sendStatus(200);
                        });
                    }
                });
            }
            else {
                res.sendStatus(401); // Mismatch between usernames
            }
        });

    /** Returns data about going users for requested venues.*/
    app.route('/getgoing')
        .post((req, res) => {
            var appIDs = req.body.appIDs;
            if (appIDs && appIDs.length) {
                venueController.getGoingUsers(appIDs, (err, venues) => {
                    if (err) {
                        logError('/getgoing', err);
                        res.sendStatus(500);
                    }
                    else {
                        res.json(venues);
                    }
                });
            }
            else {
                res.sendStatus(400);
            }
        });

    app.route('/user/:name')
        .get(isLoggedIn, (req, res) => {
            var username = req.params.name;
            if (username === req.user.username) {
                // TODO send actual user profile data
                userController.getUserByName(username, (err, data) => {
                    if (err) {
                        logError('/user/' + username, err);
                        res.sendStatus(500);
                    }
                    else {
                        // TODO don't send password
                        res.json(data);
                    }
                });
            }
            else {
                res.sendStatus(403); // Forbidden
            }
        });
    //---------------------
    // Routes for searching
    //---------------------
    app.route('/search/:q')
        .get((req, res) => {
            console.log("SearchController search was called. Body: " + 
                JSON.stringify(req.body)
            );
            console.log("get /search/:q req.params: " + JSON.stringify(req.params));
            var q = req.params.q;
            searchController.search(q, (err, data) => {
                if (err) {
                    logError('/search/:q', err);
                    res.sendStatus(500);
                }
                else if (data) {
                    res.json(data);
                }
                else {
                    res.sendStatus(500);
                }
            });
        });

    //--------------------------------------
    // User registration and authentication
    //--------------------------------------

	app.route('/api/:id')
		.get((req, res) => {
            userController.getUser(req, res);
		});

    // Logs user in via form (after successful authentication
	app.route('/auth/userlogin')
        .post(passport.authenticate('local', 
            { failureRedirect: '/loginFailed' }),
		(req, res) => {
			res.redirect('/');
		});

};
