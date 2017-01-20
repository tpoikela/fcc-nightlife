
'use strict';

const appUrl = window.location.origin;
const ajax = require('../common/ajax-functions.js');
const UserController = require('../controllers/userController.client');

/** This component is used at the profile page of a user.*/
class ProfileTop extends React.Component {

    constructor(props) {
        super(props);
        this.userCtrl = new UserController(appUrl);

        this.state = {
            username: '',
            userID: '',
        };
    }

    componentDidMount() {
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

        });
    }

    render() {
        var username = this.state.username;
        var userID = this.state.userID;
        return (
            <div>
                <p>Placeholder for actual component.</p>
                <p>Welcome {username}</p>
                <p>User ID: {userID}</p>
            </div>
        );

    }

}

module.exports = ProfileTop;
