/* Basic functional smoke test to check that the search works.
 * 1. Get the main page.
 * 2. Find search button.
 * 3. Enter the search term.
 * 4. Press the search button.
 * 5. Verify results.
 */

var expect = require('chai').expect;

var test = require('selenium-webdriver/testing');
var webdriver = require('selenium-webdriver');

const By = webdriver.By;
const until = webdriver.until;

var serverPort = 7070;
var appUrl = 'http://localhost:' + serverPort;

var browser = new webdriver.Builder()
    // .forBrowser('chrome')
    .forBrowser('phantomjs')
    // .forBrowser('firefox')
    .build();


var getMainPage = function() {
    var promise = new Promise( (resolve, reject) => {
        browser.get(appUrl).then( () => {
            resolve();
        })
        .catch( () => {
            reject('No main page found');
        });
    });
    return promise;
};

var findSearchButton = function() {
    var promise = new Promise( (resolve, reject) => {
        browser.findElement(By.css('#q-button')).then( (btn) => {
            if (btn) {
                resolve(btn);
            }
            else {
                reject('No query button found with #button');
            }
        });
    });
    return promise;
};

var enterSearchTerm = function(btn) {
    var promise = new Promise( (resolve, reject) => {
        browser.findElement(By.css('.search-input')).then( (elem) => {
            if (btn && elem) {
                elem.sendKeys('rovaniemi').then( () => {
                    resolve([btn, elem]);
                })
                .catch( () => {
                    reject('Could not send the input keys');
                });
            }
            else {
                reject('Could not enter search term');
            }

        });
    });
    return promise;
};

var pressSearchButton = function(arr) {
    var promise = new Promise( (resolve, reject) => {
        var btn = arr[0];
        var elem = arr[1];
        if (btn && elem) {
            btn.click();
            resolve();
        }
        else {
            reject('btn and elem must be defined');
        }
    });
    return promise;
};

var waitForSearchResults = function() {
    var promise = new Promise( (resolve, reject) => {
        browser.wait(until.elementLocated(By.className('venue-list-item')),
            1000)
            .then( () => {
                browser.findElement(By.css('.venue-list-item')).then(
                    (elems) => {
                    if (elems) {
                        resolve(elems);
                    }
                    else {
                        reject('No elems found with .venue-list-item');
                    }
                });
            })
            .catch( () => {
                reject('Looks like something went wrong with the search.');
            });
    });
    return promise;
};

var verifySearchResults = function(elems) {
    var promise = new Promise( (resolve, reject) => {
        var error = 0;
        if (error) {reject('xxx');}
        else {
            expect(elems.length > 0).to.be.true;
            resolve();
        }
    });
    return promise;
};

test.describe('How basic venue search works', () => {

    it('should perform on search and get the results', function(done) {
        this.timeout(10000);
        getMainPage()
        .then(findSearchButton)
        .then(enterSearchTerm)
        .then(pressSearchButton)
        .then(waitForSearchResults)
        .then(verifySearchResults)
        .then( () => {
            done();
        })
        .catch( (reason) => {
            console.log('Went to catch()');
            done(new Error(reason));
        });
    });

});
