
/*
 * Functional test for checking that registration, login, search and adding a
 * user to a venue work properly.
 * 1. Get the main page
 * 2. Click signup
 * 3. Enter username and password
 * 4. Press signup
 * 5. Go to login page
 */

/** Use only this variables as ID in the test.*/

const assert = require('assert');

var serverPort = 7070;
var appUrl = 'http://localhost:' + serverPort;

var test = require('selenium-webdriver/testing');
var webdriver = require('selenium-webdriver');

const By = webdriver.By;
const until = webdriver.until;
const byClass = By.className;

var browser = new webdriver.Builder()
    // .forBrowser('chrome')
    .forBrowser('phantomjs')
    // .forBrowser('firefox')
    .build();

// Go to the main page
browser.get(appUrl);

var username = Math.random();
var password = Math.random();

var calledNum = 0;
var setCredentials = function(user, pw) {

    var promise = new Promise( (resolve, reject) => {
        if (!user || !pw) {
            reject('User and password must be specified');
        }
        else {
            ++calledNum;
            console.log('setCredentials called ' + calledNum + ' times');
            var inputUsername = browser.findElement(By.name('username'));
            var inputPassword = browser.findElement(By.name('password'));

            Promise.all([
                inputUsername.sendKeys(user),
                inputPassword.sendKeys(pw),
                inputUsername.getAttribute('value'),
                inputPassword.getAttribute('value')
            ]).then( (values) => {
                assert.equal(values[2], username, 'Username attr correct');
                assert.equal(values[3], password, 'Password attr correct');
                console.log('setCredentials Asserted username and password.');
                resolve();
            })
            .catch( (reason) => {
                reject(reason);
            });
        }

    });
    return promise;
};

var signupNewUser = function(user, pw) {
    var promise = new Promise( (resolve, reject) => {
        // Go to the login page
        console.log('Now signing up a new user: ' + user + ' pw: ' + pw);
        browser.findElement(By.css('[href^="/signup"]')).click().then( () => {

            setCredentials(user, pw).then( () => {
                // Submits the name/pw tot the server
                browser.findElement(By.css('button')).click().then( () => {
                    browser.wait(until.titleIs('CoordiNite Signup OK'), 1000)
                    .then( () => {
                        console.log('Signup OK now');

                        browser.findElement(By.css('[href^="/login"]')).click()
                        .then( () => {
                            console.log('signupNewUser Click |signup| button');
                            resolve({user: user, pw: pw});
                        });
                    });
                });
            });

        })
        .catch( reason => {
            reject(reason);
        });

    });
    return promise;
};

var loginRegisteredUser = function(userPw) {

    var promise = new Promise( (resolve, reject) => {
        var user = userPw.user;
        var pw = userPw.pw;

        console.log('Now logging in the new user: ' + user + ' pw: ' + pw);
        browser.findElement(By.css('[href^="/login"]')).click().then( () => {

            setCredentials(user, pw).then( () => {
                browser.findElement(By.css('button')).then( (btn) => {

                    if (btn) {
                        console.log('Clicking the button  to login');
                        btn.click();
                    }
                    else {
                        console.error("Couldn't find button for logging in.");
                        reject();
                    }

                    browser.wait(until.titleMatches(/CoordiNite Home/), 1000)
                    .then( () => {

                        browser.findElement(By.css('[href^="/profile"]'))
                            .then( (elem) => {
                            if (elem) {
                                resolve({user: user, pw: pw});
                            }
                            else {
                                reject('No profile elem found by CSS.');
                            }
                        });
                    });
                });
            });

        });

    });
    return promise;
};

var doVenueSearch = function() {
    var venueItem = 'venue-list-item';
    var promise = new Promise( (resolve, reject) => {

        browser.findElement(By.css('input')).then( (elem) => {
            elem.sendKeys('rovaniemi');

            browser.findElement(By.css('button')).click().then( () => {
                console.log('Clicked the search button.');
                browser.wait(until.elementLocated(byClass(venueItem)), 1000)
                .then( () => {
                    browser.findElements(byClass(venueItem))
                    .then( (values) => {
                        assert.ok(values.length > 0,
                            'Got more than 1 search results OK.');
                        resolve();
                    })
                    .catch( (reason) => {
                        reject(reason);
                    });
                })
                .catch( (reason) => {
                    reject(reason);
                });
            });

        })
        .catch( (reason) => {
            reject(reason);
        });

    });
    return promise;
};


test.describe('How signup, login and search work', () => {

    it('should signup and login a user, then do a search', function(done) {
        this.timeout(10000);
        // Actual test execution here
        signupNewUser(username, password)
            .then(loginRegisteredUser)
            .then(doVenueSearch)
            .then( () => {
                console.log('Finally quitting..');
                done();
                browser.quit();
            })
            .catch( (reason) => {
                done(new Error(reason));
            });
    });
});


