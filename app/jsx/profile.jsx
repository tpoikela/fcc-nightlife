
'use strict';

const appUrl = window.location.origin;
const ajax = require('../common/ajax-functions.js');
const UserController = require('../controllers/userController.client');

/** Renders one venue item for the profile page with all controls.*/
class ProfileVenueItem extends React.Component {

    constructor(props) {
        super(props);
        this.onRemoveClick = this.onRemoveClick.bind(this);
    }

    onRemoveClick() {
        this.props.onRemoveClick(this.props.venue.appID);
    }

    render() {
        var venue = this.props.venue;
        var venueStr = JSON.stringify(venue);

        return (
            <li>
                {venueStr}
                <button onClick={this.onRemoveClick}>Remove</button>
            </li>
        );
    }

}

/** This component is used at the profile page of a user.*/
class ProfileTop extends React.Component {

    constructor(props) {
        super(props);
        this.userCtrl = new UserController(appUrl);

        this.onRemoveClick = this.onRemoveClick.bind(this);

        this.state = {
            username: null,
            userID: null,
            error: null,
        };
    }

    log(msg) {
        console.log("ProfileTop Log: " + msg);
    }

    // TODO: Remove a venue where user is going to
    onRemoveClick(appID) {
        console.log("onRemoveClick with appID: " + appID);

    }

    checkAuthorisation() {
        this.userCtrl.amIAuthorized( (err, data) => {
            if (err) {
                this.setState({error: 'Error occurred, Please refresh.'});
            }
            else {
                this.setState({
                    username: data.username,
                    userID: data.userID,
                });
            }

            this.log('DEBUG: state.userID: ' + this.state.userID);
            this.getUserInfo();

        });
    }

    /** Get user info from the server.*/
    getUserInfo() {
        var username = this.state.username;
        this.userCtrl.getUserProfileData(username, (err, data) => {
            if (err) this.setState({error: "An error occurred."});
            else {
                this.log("ProfileTop got data: " + JSON.stringify(data));
                this.setState({venues: data.venues});
            }
        });
    }

    componentDidMount() {
        this.checkAuthorisation();
    }

    render() {
        var username = this.state.username;
        var userID = this.state.userID;
        var venues = this.state.venues;

        // Generate the list of venues here
        var venueHtml = null;
        if (venues) {
            venueHtml = venues.map( (item, index) => {
                return (<ProfileVenueItem key={index} venue={item} 
                    onRemoveClick={this.onRemoveClick} />);
            });
        }

        return (
            <div>
                <p>Welcome {username}</p>
                <p>User ID: {userID}</p>
                <p>You're currently going to the following places:</p>
                <ul>
                    {venueHtml}
                </ul>
            </div>
        );

    }

}

module.exports = ProfileTop;
