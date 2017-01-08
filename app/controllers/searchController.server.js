
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

    /*
    var params = {categoryFilter: categoryFilter, limit: 5};
    for (var key in setParams) params[key] = setParams[key];
    for (var key in reqParams) params[key] = reqParams[key];
    */
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

    var data = [
        {name: "xxx"},
        {name: "yyy"},
        {name: "ccc"},
    ];

    this.search = function(req, res) {
        console.log("SearchController search was called. Body: " + 
            JSON.stringify(req.body)
        );
        console.log("req.params: " + JSON.stringify(req.params));

		var query = {location: req.params.q};
		requestYelp(query, (err, resp, body) => {
			if (err) throw new Error(err);
			//console.log("Got body from Yelp: " + JSON.stringify(body));
            var barData = JSON.parse(body);
			res.json(barData);
		});

    }

};

module.exports = SearchController;

