
'use strict';

var $DEBUG = 1;
var appUrl = window.location.origin;

var _debug = function(msg) {
    if ($DEBUG) console.debug(msg);
};

var ajax = require('../common/ajax-functions.js');
var Navbar = require('./navbar.jsx');

var SearchInput = require('./searchinput.jsx');
var VenueList = require('./venuelist.jsx');

/** Top-level component for the app. Contains logic for ajax-calls and render()
 * for instantiating all child components.
 */
class NightlifeTop extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            error: null,
            isAuth: false,
            username: null,
            userID: null,
        };
        this.storageKey = 'nightlife-prev-search';
        this.search = this.search.bind(this);
        this.onGoingClick = this.onGoingClick.bind(this);
    }

    /** Sends a search req to server using ajax-get.*/
    search(q) {
        if (q) {
            var url = appUrl + '/search/' + q;
            _debug("Creating ajax-get with URL: " + url);
            ajax.get(url, (err, respText) => {
                if (err) {
                    this.setState({error: 'An error occurred during search'});
                }
                else {
                    var data = JSON.parse(respText);
                    sessionStorage.setItem(this.storageKey,
                        JSON.stringify({q: q}));
                    this.setState({data: data});
                }
            });
        }
        else {
            this.setState({error: "No search input given."});
        }
    }

    /** Updates venue going user data. Called after the user click Going
     * button.*/
    updateVenueData(obj) {
        var data = this.state.data;
        var vData = data.find( item => {
            return item.appID === obj.appID;
        });

        if (obj.going) {
            _debug("Adding user " + obj.userID + " to venue " + obj.appID);
            vData.going.push(this.state.userID);
        }
        else {
            var index = vData.going.indexOf(obj.userID);
            if (index >= 0) {
                _debug("Removing user " + obj.userID + " from venue " + obj.appID);
                vData.going.splice(index, 1);
            }
            else {
                console.error("No user ID " + obj.userID + " found for venue data.");
            }
        }
        this.setState({data: data});
    }

    /** Calls server to update the going vars for all shown venue data.*/
    updateGoingVars() {
        var url = appUrl + '/getgoing';
        var appIDs = this.state.data.map( item => {
            return {appID: item.appID};
        });
        if (appIDs.length === 0) {
            _debug("Returning because appIDs.len is 0.");
            return;
        }
        else {
            _debug("appIDs.len is " + appIDs.length);
        }

        var postData = {appIDs: appIDs};
        ajax.post(url, postData, (err, respText) => {
            if (err) {
                this.setState({error: 'Cannot get data from the server.'});
            }
            else {
                _debug("updateGoingVars post response OK: " + respText);
                var gotData = JSON.parse(respText);
                var venueData = this.state.data;

                _debug("BEFORE: venueData.len " + venueData.length);

                // Use ES6 destructuring
                gotData.forEach( ({appID, going}) => {
                    venueData.forEach( obj => {
                        if (appID === obj.appID) {
                            obj.going = going;
                        }
                    });

                });
                _debug("AFTER: venueData.len " + venueData.length);
                this.setState({data: venueData});
            }
        });
    }

    onGoingClick(obj) {
        var url = appUrl + '/going';
        var data = {appID: obj.appID, username: this.state.username,
            going: obj.going, userID: this.state.userID};
        _debug("onGoingClick(): data " + JSON.stringify(data));
        _debug("NightLifeTop sending ajax-post to " + url);
        ajax.post(url, data, (err, respText) => {
            if (err) {
                this.setState({error: 'An error occurred for /going'});
            }
            else {
                _debug("onGoingClick post response OK: " + respText);
                this.updateVenueData(data);
                this.updateGoingVars();
            }
        });

    }

    /** Sends ajax-get to server to check if user is authenticated. The returned
     * result is only used for GUI element hiding. */
    amIAuthorized() {
        var url = appUrl + '/amiauth';
        ajax.get(url, (err, respText) => {
            if (err) {
                this.setState({isAuth: false});
            }
            else {
                var data = JSON.parse(respText);
                _debug("amIAuthorized() respText: " + respText);
                this.setState({
                    isAuth: data.isAuth,
                    username: data.username,
                    userID: data.userID
                });
            }
        });

    }

    /** Restores previous search from sessionStorage, if any.*/
    restoreSessionData() {
        var dataJSON = sessionStorage.getItem(this.storageKey);
        if (dataJSON) {
            var parsed = JSON.parse(dataJSON);
            _debug("restoreSessionData: " + dataJSON);
            this.q = parsed.q;
            _debug("Restore query: " + this.q);
        }
    }

    componentDidMount() {
        _debug("NightlifeTop componentDidMount()");
        this.amIAuthorized();
        this.restoreSessionData();
        if (this.q) {
            _debug("Performing a query from sessionStorage: " + this.q);
            this.search(this.q);
        }
        this.updateGoingVars();
    }

    render() {
        var data = this.state.data;
        var error = this.state.error;
        var isAuth = this.state.isAuth;
        var userID = this.state.userID;
        var authMsg = isAuth ? "You're logged in as " + this.state.username
            : "Not logged in";

        return (
            <div id='nightlife-app-main-div'>
                <h1>NightlifeTop</h1>
                <hr/>
                <p>This is a nightlife app for doing stuff.</p>
                <p id="status-bar">Status: {authMsg}</p>
                <SearchInput onClick={this.search} />
                <p id='error-msg'>{error}</p>
                <VenueList
                    isAuth={isAuth}
                    data={data}
                    onGoingClick={this.onGoingClick}
                    userID = {userID}
                />
                <hr/>
            </div>
        );
    }

};

module.exports = NightlifeTop;
