/*
 * Server entry point file for the nightlife coordination app.
 */
'use strict';

var $DEBUG = 0;

// When deployed to heroku, don't use .env
if (process.env.NODE_ENV !== "production") {
    require('dotenv').load();
    $DEBUG = process.env.DEBUG || 0;
    if ($DEBUG) console.log("Loaded .env file OK. Node env: " 
        + process.env.NODE_ENV);
}

// Load required modules
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');

// Sources for this app
var routes = require('./app/routes/index.js');

var app = express();
app.set("view engine", "pug");

require('./app/config/passport')(passport);

app.url = process.env.APP_URL;
console.log("APP url: " + app.url);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

// Initialize resource paths for the server
app.use('/build', express.static(process.cwd() + '/build'));
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));
app.use('/pug', express.static(process.cwd() + '/pug'));

app.use(session({
	secret: process.env.SECRET_KEY,
	resave: false,
	saveUninitialized: true
}));

app.locals.pretty = true;

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: false}));

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Nightlife Server listening on port ' + port + '...');
});
