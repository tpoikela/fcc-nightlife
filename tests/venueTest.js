
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Venue = require('../app/models/venues.js');

const expect = chai.expect;

describe('Venue Model', () => {

    var venueUpdate = null;

    // Stub out the update which interacts with database
    beforeEach(() => {
        venueUpdate = sinon.stub(Venue, 'update');
    });

    afterEach(() => {
        venueUpdate.restore();
    });


    it('should have an ID, app ID and location', () => {
        var venue = new Venue();
        var error = venue.validateSync();

        expect(error.errors.name).to.exist;
        expect(error.errors.appID).to.exist;
    });

    it('can have people going there', (done) => {
        var userID = mongoose.Types.ObjectId();
        var venue = new Venue();
        venueUpdate.yields(null);

        var query = {$set: {going: sinon.match.any}};

        var cb = (err) => {
            expect(err).to.be.null;
            sinon.assert.calledOnce(venueUpdate);
            sinon.assert.calledWith(venueUpdate, {_id: venue._id}, query,
                 {}, sinon.match.any);
            done();
        };

        venue.addGoing(userID, cb);

    });

    it('can have people removed from the going list', (done) => {
        var userID = mongoose.Types.ObjectId();
        var venue = new Venue();
        venue.going.push(userID);
        venueUpdate.yields(null);

        var query = {$set: {going: sinon.match.any}};
        var cb = (err) => {
            expect(err).to.be.null;
            sinon.assert.calledOnce(venueUpdate);
            sinon.assert.calledWith(venueUpdate, {_id: venue._id},
                query, {}, sinon.match.any);
            done();
        };

        venue.removeGoing(userID, cb);

    });

});
