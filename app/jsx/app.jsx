
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
    }

    addToFavourites(e) {
        //TODO call top component handles for ajax-post
    }

    render() {
        var data = this.props.data;
        var goingButtonText = this.state.going ? "I'm going" : "Not going";
        return (
            <li>
                <button onClick={this.onGoingClick}>{goingButtonText}</button>
                <button onClick={this.addToFavourites}>Add to favourites</button>
                Data item: {data.name}
            </li>
        );
    }

}

/** This component generates the list of bars/restaurants based on the number of
 * items in the array given with props. */
class BarList extends React.Component {

    render() {
        var data = this.props.data;

        // Creates the list item contents
        var listItems = data.map( (item, index) => {
            return <BarListItem key={index} data={item} />
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
        };
        this.search = this.search.bind(this);
    }

    search(q) {
        var url = appUrl + '/search/' + q;
        console.log("Creating ajax-get with URL: " + url);
        ajax.get(url, (err, respText) => {
            if (err) {
                this.setState({error: 'An error occurred'});
            }
            else {
                var data = JSON.parse(respText);
                console.log("ajax-get return data " + respText);
                this.setState({data: data.businesses});
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
                this.setState({isAuth: data.isAuth});
            }
        });

    }

    componentDidMount() {
        this.amIAuthorized();
        // TODO grab previous search from session storage, if any
    }

    updateBarData(data) {
        // Store data using session storage
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
                <p>Status: {authMsg}</p>
                <SearchInput onClick={this.search} />
                <BarList data={data} />
                <hr/>
            </div>
        );
    }

};

ReactDOM.render(<NightlifeTop />,
    document.getElementById('main-app')
);
