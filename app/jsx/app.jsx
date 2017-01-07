
'use strict';

var $DEBUG = 1;
var appUrl = window.location.origin;

var ajax = require('../common/ajax-functions.js');
var Navbar = require('./navbar.jsx');

var SearchInput = require('./searchinput.jsx');

class NightlifeTop extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            search: {},
            data: {},
            error: ''
        };
        this.search = this.search.bind(this);
    }

    search(q) {
        // TODO send Ajax-request to server
        var url = appUrl + '/search/' + q;
        console.log("Creating ajax-get with URL: " + url);
        ajax.get(url, (err, respText) => {
            if (err) {
                this.setState({error: 'An error occurred'});
            }
            else {
                var data = JSON.parse(respText);
                console.log("ajax-get return data " + respText);
            }
        });
    }

    componentDidMount() {
        /** Nothing to do.*/
    }

    updateBarData(data) {
        // Store data using session storage
    }

    render() {
        var data = this.state.data;
        var error = this.state.error;
        //TODO grab data from session storage, if any
        return (
            <div id='bug-list-id'>
                <h1>NightlifeTop</h1>
                <hr/>
                <p>This is a nightlife app for doing stuff.</p>
                <p>{error}</p>
                <SearchInput onClick={this.search} />
                <hr/>
            </div>
        );
    }

};

ReactDOM.render(<NightlifeTop />,
    document.getElementById('main-app')
);
