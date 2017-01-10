
var oauthSignature = require('oauth-signature');
var n = require('nonce')();
var request = require('request');
var qs = require('querystring');

var yelpUrl = 'http://api.yelp.com/v2/search';

/** Original taken from https://arian.io/how-to-use-yelps-api-with-node/.*/
var requestYelp = function(setParams, cb) {

    var categoryFilter = "nightlife,bars";
	var httpMethod = 'GET';

	// Requires params
    var reqParams = {
		oauth_consumer_key : process.env.YELP_CONSUMER_KEY,
		oauth_token : process.env.YELP_TOKEN,
		oauth_nonce : n(),
		oauth_timestamp : n().toString().substr(0,10),
		oauth_signature_method : 'HMAC-SHA1',
		oauth_version : '1.0'
    };

    var params = Object.assign({}, setParams, reqParams);

	var consumerSecret = process.env.YELP_CONSUMER_SECRET;
	var tokenSecret = process.env.YELP_TOKEN_SECRET;

	/* Then we call Yelp's Oauth 1.0a server, and it returns a signature */
	/* Note: This signature is only good for 300 seconds after the oauth_timestamp */
	var signature = oauthSignature.generate(httpMethod, yelpUrl, params,
		consumerSecret, tokenSecret, { encodeSignature: false});

	/* We add the signature to the list of paramters */
	params.oauth_signature = signature;

	/* Then we turn the paramters object, to a query string */
	var paramURL = qs.stringify(params);

	/* Add the query string to the url */
	var apiURL = yelpUrl+'?'+paramURL;

    console.log("Yelp search URL: " + apiURL);

	/* Then we use request to send make the API Request */
	request(apiURL, function(error, response, body){
		return cb(error, response, body);
	});

};

var SearchController = function() {

    var toVenueModelData = (venues) => {
        var res = [];
        venues.forEach((item) => {
            res.push({
                appID: item.id,
                name: item.name,
                url: item.url,
                image: item.image_url,
                location: {city: item.location.city},
                going: [],
            });
        });
        return res;
    };

    this.search = function(q, cb) {
		var query = {location: q};
		requestYelp(query, (err, resp, body) => {
			if (err) cb(err);
			//console.log("Got body from Yelp: " + JSON.stringify(body));
            var barData = JSON.parse(body);
            var venues = barData.businesses;
            var venueData = toVenueModelData(venues);
            cb(null, venueData);
		});

    }

};

module.exports = SearchController;

