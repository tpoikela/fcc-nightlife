
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const User = require('../app/models/users.js');

const expect = chai.expect;

describe('User Model', () => {

    var userUpdate = null;

    // Stub out the update which interacts with database
    beforeEach(() => {
        userUpdate = sinon.stub(User, 'update');
    });

    afterEach(() => {
        userUpdate.restore();
    });


    it('should have a valid username', () => {
        var user = new User();
        var error = user.validateSync();
        expect(error.errors.username).to.exist;

        user.username = 'Tuomas';
        error = user.validateSync();
        expect(typeof error.errors.username).to.equal('undefined');


    });

    it('should have login information', () => {
        var user = new User();
        var error = user.validateSync();
        expect(typeof error.errors.local).to.exist;
        console.log(JSON.stringify(error));

        var localInv = {password: 'xxx'};
        user.local = localInv;
        error = user.validateSync();
        console.log(JSON.stringify(error));
        expect(typeof error.errors.local.password).to.equal('undefined');
        expect(typeof error.errors.local.username).to.exist;

        var local = {username: 'xxx', password: 'xxx'};
        user.local = local;
        error = user.validateSync();
        expect(typeof error.errors.local).to.equal('undefined');
    });

    it('can have venues added to it', (done) => {
        var user = new User();
        user._id = mongoose.Types.ObjectId();
        user.username = 'xxx';
        user.local = {username: 'xxx', password: 'xxx'};

        var venueID = mongoose.Types.ObjectId();
        userUpdate.yields(null);

        var setQuery = {$set: {venues: [venueID]}};

        var cb = (err) => {
            expect(err).to.be.null;
            sinon.assert.calledOnce(userUpdate);
            sinon.assert.calledWith(userUpdate, {_id: venueID}, setQuery, {},
                sinon.match.any);
            done();
        };

        user.addVenue(venueID, cb);

    });


});
