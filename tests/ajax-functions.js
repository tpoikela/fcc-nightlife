
/** No requires. Run this on browser with tests/ajax.html.*/

const chai = require('chai');
const sinon = require('sinon');
var ajaxFunctions = require('../app/common/ajax-functions.js');

var expect = chai.expect;

describe('Ajax function GET failing', function() {

	var xhr, requests;

	beforeEach(function() {
		xhr = sinon.useFakeXMLHttpRequest();
		requests = [];
		xhr.onCreate = function(req) { requests.push(req); };
	});

	afterEach(function() {
		// Like before we must clean up when tampering with globals.
		xhr.restore();
	});


	// Test GET
    it('makes getRequests to query for user info', function(done) {
        var userData = {username: 'testUser', password: 'qwerty', obj: {}};
        var dataJSON = JSON.stringify(userData);

		ajaxFunctions.get('/testUrl', function(err, res) {
            console.log('RES' + res);
            var respData = JSON.parse(res);
            done();
            expect(err).to.equal(null);
            expect(respData).deep.equal(userData);
		});

        requests[0].respond(200, {'Content-Type': 'text/json'}, dataJSON);

    });

    // Test GET receiving 500 (internal server error)
    it('should behave when Get receives 500', function(done) {

		ajaxFunctions.get('/testUrl', function(err) {
            done();
            expect(err !== null).to.equal(true);
            expect(err).to.equal(500);
		});

        requests[0].respond(500);
    });

	//	Test POST
    it('Sends updated poll info via post requests', function(done) {

        var pollData = {opt: 1, name: 'xxx'};

		ajaxFunctions.post('/testUrl', pollData, function(err) {
            done();
            expect(err).to.equal(null);
		});

        expect(requests[0].requestBody).to.equal(JSON.stringify(pollData));
        requests[0].respond(200);

    });

    it('Can use also JSON strings for post', function(done) {

        var pollData = JSON.stringify({opt: 1, name: 'xxx',
            nestedObj: {name: 'nestedObj', dur: 999}
        });

		ajaxFunctions.post('/testUrl', pollData, function(err) {
            done();
            expect(err).to.equal(null);
		});

        expect(requests[0].requestBody).to.equal(pollData);
        requests[0].respond(200);

    });

    it('Fails gracefully when post receives error code', function(done) {
        var pollData = JSON.stringify({opt: 1, name: 'xxx',
            nestedObj: {name: 'nestedObj', dur: 999}
        });

		ajaxFunctions.post('/testUrl', pollData, function(err) {
            done();
            expect(err).to.equal(500);
		});

        requests[0].respond(500);
    });

});

