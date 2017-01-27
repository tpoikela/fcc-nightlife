

var VenueController = require('../app/controllers/venueController.server.js');

const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;

var Venue = require('../app/models/venues.js');
var User = require('../app/models/users.js');

var mongoose = require('mongoose');

describe('VenueController', function() {

    var getUserID = null;
    var venueAddGoing = null;
    var venueRemoveGoing = null;
    var venueFindOne = null;
    var venueCtrl = null;

    beforeEach(() => {
        venueCtrl = new VenueController();
        getUserID = sinon.stub(User, 'getUserID');
        venueAddGoing = sinon.stub(Venue.prototype, 'addGoing');
        venueRemoveGoing = sinon.stub(Venue.prototype, 'removeGoing');
        venueFindOne = sinon.stub(Venue, 'findOne');
    });

    afterEach(() => {
        getUserID.restore();
        venueAddGoing.restore();
        venueRemoveGoing.restore();
        venueFindOne.restore();
        venueCtrl = null;
    });

    it('should add one going user to the venue', function(done) {
        var username = 'TestUser';
        var obj = {
            appID: 1234556,
            username: username
        };
        var userID = mongoose.Types.ObjectId();
        var venue = new Venue();
        venue.appID = obj.appID;

        getUserID.yields(null, userID);
        venueFindOne.yields(null, venue);
        venueAddGoing.yields(null);

        venueCtrl.addGoing(obj, (err) => {
            expect(err).to.be.null;
            sinon.assert.calledWith(getUserID, username, sinon.match.any);
            sinon.assert.calledWith(venueAddGoing, userID, sinon.match.any);
            done();
        });
    });

    it('should remove a user from the venue', function(done) {
        var username = 'TestUser';
        var obj = {
            appID: 1234556,
            username: username
        };
        var userID = mongoose.Types.ObjectId();
        var venue = new Venue();
        venue.appID = obj.appID;

        getUserID.yields(null, userID);
        venueFindOne.yields(null, venue);
        venueRemoveGoing.yields(null);

        venueCtrl.removeGoing(obj, (err) => {
            expect(err).to.be.null;
            sinon.assert.calledWith(getUserID, username, sinon.match.any);
            sinon.assert.calledWith(venueRemoveGoing, userID, sinon.match.any);
            done();
        });
    });


});
