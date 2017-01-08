
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

const Venue = require('../app/models/venues.js');

var mongoose = require('mongoose');

describe('Venue Schema', () => {

    var venueUpdate = null;

    beforeEach(() => {
        venueUpdate = sinon.stub(Venue, "update");
    });

    afterEach(() => {
        venueUpdate.restore();
    });


    it('should have an ID', () => {
        var venue = new Venue();
        var error = venue.validateSync();

        expect(error.errors.name).to.exist;
        expect(error.errors.appID).to.exist;
        expect(error.errors.location).to.exist;
    });

    it('can have people going there', (done) => {
        var userID = mongoose.Types.ObjectId();
        var venue = new Venue();
        venueUpdate.yields(null);

        var query = {$set: {going: [userID]}};

        var cb = (err) => {
            expect(err).to.be.null;
            sinon.assert.calledOnce(venueUpdate);
            sinon.assert.calledWith(venueUpdate, {_id: venue._id}, query,
                {}, cb); // Still failing
            done();
        };

        venue.addGoing(userID, cb);

    });

    it('can have people removed from the list', function() {
        var userID = mongoose.Types.ObjectId();
        var venue = new Venue();
        venue.going.push(userID);
        venueUpdate.yields(null);

        var query = {$set: {going: []}};
        venue.removeGoing(userID, (err) => {
            expect(err).to.be.null;
            sinon.assert.calledOnce(venueUpdate);
            sinon.assert.calledWith(venueUpdate, {_id: venue._id}, query,
                {}, sinon.match.any); // Still failing
            done();
        });

    });


});
