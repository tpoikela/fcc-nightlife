'use strict';

var ajax = require('../common/ajax-functions');

class UserController {

    constructor(appUrl) {
        this.appUrl = appUrl;
    }

    testFunc(msg) {
        console.log("Test function works: " + msg);
    }

    /** Sends ajax-get to server to check if user is authenticated. */
    amIAuthorized(cb) {
        var url = this.appUrl + '/amiauth';
        ajax.get(url, (err, respText) => {
            if (err) {
                console.error("userCtrl ERROR: " + err + ' for URL ' + url);
                cb(err);
            }
            else {
                var data = JSON.parse(respText);
                console.log("userCtrl amIAuthorized() respText: " + respText);
                cb(null, data);
            }
        });
    }

    /** Requests user profile data from the server.*/
    getUserProfileData(username, cb) {

    }

}

module.exports = UserController;
