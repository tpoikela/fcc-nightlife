
'use strict';

var React = require('react');

var $DEBUG = 1;
var appUrl = window.location.origin;

var _debug = function(msg) {
    if ($DEBUG) {console.debug(msg);}
};

var _err = function(msg) {
    console.error('[ERROR] ' + msg);
};

var ajax = require('../common/ajax-functions.js');

var SearchInput = require('./searchinput.jsx');
var VenueList = require('./venuelist.jsx');

var UserController = require('../controllers/userController.client');

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
            loading: false,
            userID: null,
            username: null
        };

        this.userCtrl = new UserController(appUrl);

        this.storageKey = 'nightlife-prev-search';
        this.search = this.search.bind(this);
        this.onGoingClick = this.onGoingClick.bind(this);
    }

    /** Sends a search req to server using ajax-get.
     * @param {String} q Search query
     * @returns {undefined}
     * */
    search(q) {
        if (q) {
            var url = appUrl + '/search/' + q;
            _debug('Creating ajax-get with URL: ' + url);
            this.setState({loading: true});
            ajax.get(url, (err, respText) => {
                if (err) {
                    this.setState({error: 'An error occurred during search',
                        loading: false});
                }
                else {
                    var data = JSON.parse(respText);
                    sessionStorage.setItem(this.storageKey,
                        JSON.stringify({q: q}));
                    this.setState({data: data, loading: false});
                }
            });
        }
        else {
            this.setState({error: 'No search input given.'});
        }
    }

    /** Adds user to a venue. Called after the user click Going
     * button.
     * @param {Object} obj Contains userID and venue info.
     * @returns {undefined}
     * */
    updateVenueData(obj) {
        var data = this.state.data;
        var vData = data.find( item => {
            return item.appID === obj.appID;
        });

        if (obj.going) {
            _debug('Adding user ' + obj.userID + ' to venue ' + obj.appID);
            vData.going.push(this.state.userID);
        }
        else {
            var index = vData.going.indexOf(obj.userID);
            if (index >= 0) {
                var msg = 'Removing user ' + obj.userID + ' from ' + obj.appID;
                _debug(msg);
                vData.going.splice(index, 1);
            }
            else {
                _err('No user ID ' + obj.userID + ' found for venue data.');
            }
        }
        this.setState({data: data});
    }

    /** Given appID, returns corresponding venue from the data.
     * @param {String} appID ID for the venue
     * @returns {Object} Or null
     * */
    getVenueByID(appID) {
        var venue = this.state.data.find( (item) => {
            return item.appID === appID;
        });
        if (venue) {
            return venue;
        }
        else {
            return null;
        }
    }

    /** Calls server to update the going vars for all shown venue data.
     * @returns {undefined}
     * */
    updateGoingVars() {
        var url = appUrl + '/getgoing';
        var appIDs = this.state.data.map( item => {
            return {appID: item.appID};
        });
        if (appIDs.length === 0) {
            _debug('Returning because appIDs.len is 0.');
            return;
        }
        else {
            _debug('appIDs.len is ' + appIDs.length);
        }

        var postData = {appIDs: appIDs};
        ajax.post(url, postData, (err, respText) => {
            if (err) {
                this.setState({error: 'Cannot get data from the server.'});
            }
            else {
                _debug('updateGoingVars post response OK: ' + respText);
                var gotData = JSON.parse(respText);
                var venueData = this.state.data;

                _debug('BEFORE: venueData.len ' + venueData.length);

                // Use ES6 destructuring
                gotData.forEach( ({appID, going}) => {
                    venueData.forEach( obj => {
                        if (appID === obj.appID) {
                            obj.going = going;
                        }
                    });

                });
                _debug('AFTER: venueData.len ' + venueData.length);
                this.setState({data: venueData});
            }
        });
    }

    onGoingClick(obj) {
        var url = appUrl + '/going';
        var venue = this.getVenueByID(obj.appID);
        var data = {venue: venue, appID: obj.appID,
            username: this.state.username,
            going: obj.going, userID: this.state.userID};
        _debug('onGoingClick(): front-end data ' + JSON.stringify(data));
        _debug('NightLifeTop sending ajax-post to ' + url);
        ajax.post(url, data, (err, respText) => {
            if (err) {
                this.setState({error: 'An error occurred.'});
            }
            else {
                _debug('onGoingClick post response OK: ' + respText);
                this.updateVenueData(data);
                this.updateGoingVars();
            }
        });

    }

    /** Sends ajax-get to server to check if user is authenticated. The saved
     * result is only used for GUI element hiding.
     * @returns {undefined}
     * */
    amIAuthorized() {
        this.userCtrl.amIAuthorized( (err, data) => {
            if (err) {
                this.setState({isAuth: false});
            }
            else {
                this.setState({
                    isAuth: data.isAuth,
                    username: data.username,
                    userID: data.userID
                });
            }
        });
    }

    /** Restores previous search from sessionStorage, if any.
     * @returns {undefined}
     * */
    restoreSessionData() {
        var dataJSON = sessionStorage.getItem(this.storageKey);
        if (dataJSON) {
            var parsed = JSON.parse(dataJSON);
            _debug('restoreSessionData: ' + dataJSON);
            this.q = parsed.q;
            _debug('Restore query: ' + this.q);
        }
    }

    componentDidMount() {
        _debug('NightlifeTop componentDidMount()');
        this.amIAuthorized();
        this.restoreSessionData();
        if (this.q) {
            _debug('Performing a query from sessionStorage: ' + this.q);
            this.search(this.q);
        }
        this.updateGoingVars();
    }

    render() {
        var data = this.state.data;
        var error = this.state.error;
        var isAuth = this.state.isAuth;
        var userID = this.state.userID;

        var loading = this.state.loading;
        var venueList = null;

        // Select whether to render a list or spinner while loading
        if (!loading) {
            venueList = (<VenueList
                    data={data}
                    isAuth={isAuth}
                    onGoingClick={this.onGoingClick}
                    userID = {userID}
            />);
        }
        else {
            venueList = (<div>
                <i className='fa fa-spin fa-spinner fa-2x'/>
            </div>);
        }

        return (
            <div id='nightlife-app-main-div'>
                <p>Search for a place near you:</p>
                <SearchInput onClick={this.search} />
                <p className='error-text' id='error-msg'>{error}</p>
                {venueList}
            </div>
        );
    }

}

module.exports = NightlifeTop;
