
const chai = require("chai");
const expect = chai.expect;

const User = require("../app/models/users.js");

describe('User Schema', function() {

    it('should have a valid username', function() {
        var user = new User();
        var error = user.validateSync();
        expect(error.errors.username).to.exist;

        user.username = "Tuomas";
        error = user.validateSync();
        expect(typeof error).to.equal("undefined");

    });


});
