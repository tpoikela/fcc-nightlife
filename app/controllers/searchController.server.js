
var oauthSignature = require('oauth-signature');
var n = require('nonce')();
var request = require('request');
var qs = require('querystring');
var Venue = require('../models/venues');

var yelpUrl = 'http://api.yelp.com/v2/search';

/* Original taken from https://arian.io/how-to-use-yelps-api-with-node/. Objects
 * created from this are responsible for performing Yelp search with given
 * parameters. */
var requestYelp = function(setParams, cb) {

    var httpMethod = 'GET';

    /* eslint-disable */
    // Required params
    var reqParams = {
        oauth_consumer_key: process.env.YELP_CONSUMER_KEY,
        oauth_token: process.env.YELP_TOKEN,
        oauth_nonce: n(),
        oauth_timestamp: n().toString().substr(0,10),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0'
    };
    /* eslint-enable */

    var params = Object.assign({}, setParams, reqParams);

    var consumerSecret = process.env.YELP_CONSUMER_SECRET;
    var tokenSecret = process.env.YELP_TOKEN_SECRET;

    /* Then we call Yelp's Oauth 1.0a server, and it returns a signature */
    /* Note: This signature is only good for 300 seconds after the
     * oauth_timestamp */
    var signature = oauthSignature.generate(httpMethod, yelpUrl, params,
        consumerSecret, tokenSecret, { encodeSignature: false});

    /* eslint-disable */
    /* We add the signature to the list of paramters */
    params.oauth_signature = signature;
    /* eslint-enable */

    /* Then we turn the paramters object, to a query string */
    var paramURL = qs.stringify(params);

    /* Add the query string to the url */
    var apiURL = yelpUrl + '?' + paramURL;

    console.log('Yelp search URL: |' + apiURL + '|');

    /* Then we use request to send make the API Request */
    request(apiURL, function(error, response, body) {
        return cb(error, response, body);
    });

};

var SearchController = function() {

    /** Converts data received from Yelp to applications's internal
     * data object.
     * @param {Object} venues Data from Yelp API
     * @returns {Array} Array of venue objects
     */

    var toVenueModelData = (venues) => {
        var res = [];
        venues.forEach((item) => {
            res.push({
                appID: item.id,
                name: item.name,
                url: item.url,
                image: item.image_url,
                location: {city: item.location.city},
                descr: item.snippet_text,
                going: []
            });
        });
        return res;
    };

    var getAppIDList = (venueData) => {
        var res = [];
        venueData.forEach( (item) => {
            res.push({appID: item.appID});
        });
        return res;
    };

    /* Updates going[] for newly retrieved search items using existin db data.*/
    var updateGoingVars = (dbData, venueData) => {
        console.log('Updating goingVars: db :' + JSON.stringify(dbData));
        dbData.forEach( (item) => {
            venueData.forEach( (vData) => {
                if (vData.appID === item.appID) {
                    console.log('Updated going[] for appID ' + vData.appID);
                    vData.going = item.going;
                }
            });
        });
    };

    /* Performs the search from Yelp.*/
    this.search = function(q, cb) {
        var query = {location: q};
        requestYelp(query, (err, resp, body) => {
            if (err) {
                console.error('requestYelp failed with error: ' + err);
                cb(err);
            }
            else {

                // Try this because JSON parse can fail
                try {
                    var barData = JSON.parse(body);
                    console.log('barData at the server: ' + body);
                    var venues = barData.businesses;
                    var venueData = toVenueModelData(venues);
                    var query = {$or: getAppIDList(venueData)};

                    console.log('BEFORE Venue.find in search()');
                    Venue.find(query, (err, data) => {
                        console.log('Venue.find search completed');
                        if (err) {
                            console.log('Venue.find() error: ' + err);
                            cb(err);
                        }
                        else {
                            updateGoingVars(data, venueData);
                            cb(null, venueData);
                        }
                    });
                }
                catch (e) {
                    console.log('An exception was caught in search(): ' + e);
                    cb(e);
                }
            }

        });

    };

};

module.exports = SearchController;

