
'use strict';

var $DEBUG = 1;
var appUrl = window.location.origin;

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
            search: {},
            data: [],
            error: '',
            isAuth: false,
            username: '',
        };
        this.storageKey = 'nightlife-prev-search';
        this.search = this.search.bind(this);
        this.onGoingClick = this.onGoingClick.bind(this);
    }

    /** Sends a search req to server using ajax-get.*/
    search(q) {
        var url = appUrl + '/search/' + q;
        if ($DEBUG) console.log("Creating ajax-get with URL: " + url);
        ajax.get(url, (err, respText) => {
            if (err) {
                this.setState({error: 'An error occurred for search'});
            }
            else {
                var data = JSON.parse(respText);
                if ($DEBUG) console.log("ajax-get return data " + respText);
                this.setState({data: data});
                sessionStorage.setItem(this.storageKey,
                    JSON.stringify(data));
            }
        });
    }

    /** Sends ajax to the server along with the username.*/
    onGoingClick(obj) {
        var url = appUrl + '/going';
        var data = {appID: obj.appID, username: this.state.username,
            going: obj.going};
        if ($DEBUG) console.log("NightLifeTop sending ajax-post to " + url);
        ajax.post(url, data, (err, respText) => {
            if (err) {
                this.setState({error: 'An error occurred for /going'});
            }
            else {
                if ($DEBUG) console.log("onGoingClick post response OK: " + respText);
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
                if ($DEBUG) console.log("Got username " + data.username + " from server");
                this.setState({
                    isAuth: data.isAuth,
                    username: data.username
                });
            }
        });

    }

    /** Restores previous search from sessionStorage, if any.*/
    restoreSessionData() {
        var dataJSON = sessionStorage.getItem(this.storageKey);
        if (dataJSON) {
            var data = JSON.parse(dataJSON);
            this.setState({data: data});
        }
    }

    componentDidMount() {
        if ($DEBUG) console.log("NightlifeTop componentDidMount()");
        this.amIAuthorized();
        this.restoreSessionData();
    }

    render() {
        var data = this.state.data;
        var error = this.state.error;
        var isAuth = this.state.isAuth;
        var authMsg = isAuth ? "You're logged in" : "Not logged in";

        return (
            <div id='bug-list-id'>
                <h1>NightlifeTop</h1>
                <hr/>
                <p>This is a nightlife app for doing stuff.</p>
                <p>{error}</p>
                <p id="status-bar">Status: {authMsg}</p>
                <SearchInput onClick={this.search} />
                <VenueList data={data} onGoingClick={this.onGoingClick}
                />
                <hr/>
            </div>
        );
    }

};

ReactDOM.render(<NightlifeTop />,
    document.getElementById('main-app')
);
