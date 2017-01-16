
/*
 * Functional test for checking that registration, login, search and adding a
 * user to a venue work properly.
 * 1. Get the main page
 * 2. Click signup
 * 3. Enter username and password
 * 4. Press signup
 * 5. Go to login page
 * 6.
 */

/** Use only this variables as ID in the test.*/
var ids = {

};

const chai = require('chai');
const assert = require('assert');

var serverPort = 7070;
var appUrl = 'http://localhost:' + serverPort;

// Set up the webdriver
var webdriver = require('selenium-webdriver');
By = webdriver.By,
until = webdriver.until;

var browser = new webdriver.Builder()
    //.forBrowser('chrome')
    .forBrowser('phantomjs')
    //.forBrowser('firefox')
    .build();

// Go to the main page
browser.get(appUrl);

var username = Math.random();
var password = Math.random();

var calledNum = 0;
var setCredentials = function(user, pw) {

    var promise = new Promise( (resolve, reject) => {
        if (!user || !pw) {
            reject("User and password must be specified");
        }
        else {
            ++calledNum;
            console.log("setCredentials called " + calledNum + " times");
            var inputUsername = browser.findElement(By.name('username'));
            var inputPassword = browser.findElement(By.name('password'));

            Promise.all([
                inputUsername.sendKeys(user),
                inputPassword.sendKeys(pw),
                inputUsername.getAttribute('value'),
                inputPassword.getAttribute('value')
            ]).then( (values) => {
                assert.equal(values[2], username, "Username attr correct");
                assert.equal(values[3], password, "Password attr correct");
                console.log("setCredentials Asserted username and password.");
                resolve();
            });
        }

    });
    return promise;
};

var signupNewUser = function(user, pw) {
    var promise = new Promise( (resolve, reject) => {
        // Go to the login page
        console.log("Now signing up a new user: " + user + " pw: " + pw);
        browser.findElement(By.css('[href^="/signup"]')).click().then( () => {

            setCredentials(user, pw).then( () => {
                // Submits the name/pw tot the server
                browser.findElement(By.css('button')).click().then( () => {
                    browser.wait(until.titleIs('Signup OK'), 1000).then( () => {
                        console.log("Signup OK now");

                        browser.findElement(By.css('[href^="/login"]')).click().then( () => {
                            console.log("signupNewUser Now finally clicked |signup| button");
                            resolve({user: user, pw: pw});
                        });
                    });
                });
            });

        });

    });
    return promise;
};

var loginRegisteredUser = function(user_pw) {

    var promise = new Promise( (resolve, reject) => {
        var user = user_pw.user;
        var pw = user_pw.pw;

        console.log("Now logging in the new user: " + user + " pw: " + pw);
        browser.findElement(By.css('[href^="/login"]')).click().then( () => {

            setCredentials(user, pw).then( () => {
                browser.findElement(By.css('button')).then( (btn) => {
                    console.log("loginRegisteredUser Trying to click login button");

                    if (btn) {
                        console.log("Clicking the button  to login");
                        btn.click();
                    }
                    else {
                        console.log("Couldn't find button for logging in.");

                    }

                    browser.wait(until.titleMatches(/home/), 1000).then( () => {

                        browser.findElement(By.id('status-bar')).then( (elem) => {

                            setTimeout( () => {
                                elem.getText().then( (text) => {
                                    console.log("Asserting logged in status.");
                                    assert.equal(text, "Status: You're logged in");
                                    resolve();
                                });
                            }, 2000);

                        });
                    });
                });
            });

        });

    });
    return promise;
};

var doVenueSearch = function() {
    var promise = new Promise( (resolve, reject) => {
        console.log("Finally performing a venue search");

        var qElem = browser.findElement(By.css('input')).then( (elem) => {
            elem.sendKeys('rovaniemi');

            browser.findElement(By.css('button')).click().then( () => {
                console.log("Clicked the search button.");
                browser.wait(until.elementLocated(By.className('venue-list-item')), 1000).then( () => {
                    browser.findElements(By.className('venue-list-item')).then( (values) => {
                        assert.ok(values.length > 0, "Got more than 1 search results OK.");
                        resolve();
                    });
                });
            });

        });

    });
    return promise;
};


// Actual test execution here
signupNewUser(username, password)
    .then(loginRegisteredUser)
    .then(doVenueSearch)
    .then( () => {
        console.log("Finally quitting..");
        browser.quit();
    });


