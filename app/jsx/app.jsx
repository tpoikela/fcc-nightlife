
'use strict';

var $DEBUG = 1;
var appUrl = window.location.origin;

var ajax = require('../common/ajax-functions.js');
var Navbar = require('./navbar.jsx');

var SearchInput = require('./searchinput.jsx');


class BarListItem extends React.Component {

    constructor(props) {
        super(props);

        this.onGoingClick = this.onGoingClick.bind(this);
        this.addToFavourites = this.addToFavourites.bind(this);

        this.state = {
            going: false,
        };

    }

    onGoingClick(e) {
        this.setState({going: !this.state.going});
        //TODO call top component handles for ajax-post
        this.props.onGoingClick({appID: this.props.data.appID});
    }

    addToFavourites(e) {
        //TODO call top component handles for ajax-post
    }

    render() {
        var data = this.props.data;
        var goingButtonText = this.state.going ? "I'm going" : "Not going";
        var nGoing = data.going.length;
        return (
            <li className='bar-list-item'>
                <button onClick={this.onGoingClick}>{goingButtonText}</button>
                <button onClick={this.addToFavourites}>Add to favourites</button>
                Data item: {data.name} - {nGoing} going
            </li>
        );
    }

}

/** This component generates the list of bars/restaurants based on the number of
 * items in the array given with props. */
class BarList extends React.Component {

    render() {
        var data = this.props.data;
        var onGoingClick = this.props.onGoingClick;

        // Creates the list item contents
        var listItems = data.map( (item, index) => {
            return <BarListItem onGoingClick={onGoingClick} key={index} data={item} />
        });

        return (
            <div>
                <h2>List of places</h2>
                <ul>
                    {listItems}
                </ul>
            </div>
        );
    }
}

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
        console.log("Creating ajax-get with URL: " + url);
        ajax.get(url, (err, respText) => {
            if (err) {
                this.setState({error: 'An error occurred for search'});
            }
            else {
                var data = JSON.parse(respText);
                console.log("ajax-get return data " + respText);
                this.setState({data: data});
                sessionStorage.setItem(this.storageKey,
                    JSON.stringify(data));
            }
        });
    }

    /** Sends ajax to the server along with the username.*/
    onGoingClick(obj) {
        var url = appUrl + '/going';
        var data = {appID: obj.appID, username: this.state.username};
        console.log("NightLifeTop sending ajax-post to " + url);
        ajax.post(url, data, (err, respText) => {
            if (err) {
                this.setState({error: 'An error occurred for /going'});
            }
            else {
                console.log("onGoingClick post response OK: " + respText);
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
                console.log("Got username " + data.username + " from server");
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
        console.log("NightlifeTop componentDidMount()");
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
                <BarList data={data} onGoingClick={this.onGoingClick}
                />
                <hr/>
            </div>
        );
    }

};

ReactDOM.render(<NightlifeTop />,
    document.getElementById('main-app')
);
