

const sinon = require('sinon');
require('sinon-mongoose');

const Fact = require('./factory');
var User = require('../app/models/users');
var UserController = require('../app/controllers/userController.server');


describe('userController.server', function() {

    var req = null;
    var res = null;
    var ctrl = null;

    var findOne = null;
    var save = null;

    beforeEach(function() {
        // Mock req/res for all unit tests
        req = Fact.getMockedReq();
        res = Fact.getMockedRes();
        ctrl = new UserController(process.cwd());

        findOne = sinon.stub(User, 'findOne');
        save = sinon.stub(User.prototype, 'save');
    });

    afterEach(function() {
        Fact.restoreRes(res);
        findOne.restore();
        save.restore();
    });

    it('should add a local user into the database', sinon.test(function(done) {
        var user = Fact.createUser();
        req.body = {username: user.username, password: 'xxx'};

        findOne.yields(null, null);
        save.yields(null);

        Promise.all([ctrl.addLocalUser(req, res)]).then(
            function() {
                sinon.assert.calledOnce(res.render);
                sinon.assert.calledWith(res.render,
                    process.cwd() + '/pug/signup_done.pug',
                    {ok: true, name: user.username});
                done();
            },
            function() {
                console.error('An error happened in the test');
                done();
            }
        );
    }));

    it('should not overwrite existing user', function(done) {
        var user = Fact.createUser();
        req.body = {username: user.username, password: 'xxx'};

        findOne.yields(null, {username: user.username});

        Promise.all([ctrl.addLocalUser(req, res)]).then(
            function() {
                sinon.assert.calledOnce(res.render);
                sinon.assert.calledWith(res.render,
                    process.cwd() + '/pug/signup_done.pug',
                    {ok: false, name: user.username});
                done();
            },
            function() {
                console.error('An error happened in the test');
                done();
            }
        );

    });

    it('should send info about authenticated user', function(done) {
        var user = Fact.createUser();
        req.user = user;

        findOne.restore();

        sinon.mock(User).expects('findOne')
            .chain('populate').withArgs('venues favourites')
            .chain('exec').yields(null, user);

        Promise.all([ctrl.getUser(req, res)]).then(function() {
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, user);
            done();
        });

    });

    it('should send error msg if no user is found', function(done) {
        var user = Fact.createUser();
        req.user = user;
        findOne.restore();

        sinon.mock(User).expects('findOne')
            .chain('populate').withArgs('venues favourites')
            .chain('exec').yields(null, null);

        Promise.all([ctrl.getUser(req, res)]).then(function() {
            var msg = {error: 'No user ' + user.username +
                ' found in database.'};
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, msg);
            done();
        });

    });

    /*
    it('should update user with venue info', function(done) {
        var obj = {going: false, obj.username: 'xxx'};
        ctrl.updateUserVenueInfo(obj, (err, data) => {

        });
    });
    */

});
