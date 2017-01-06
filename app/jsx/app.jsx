
var $DEBUG = 1;
var appUrl = window.location.origin;

var ajax = require("../common/ajax-functions.js");
var Navbar = require("./navbar.jsx");

class NightlifeTop extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            search: {},
            data: {}
        };
    }

    componentDidMount() {
        /** Nothing to do.*/
    }

    updateBarData(data) {
        // Store data using session storage
    }

    render() {
        //TODO grab data from session storage, if any
        return (
            <div id="bug-list-id">
                <h1>NightlifeTop</h1>
                <Navbar/>
                <hr/>
                <p>This is a nightlife app for doing stuff.</p>
                <hr/>
            </div>
        );
    }

};

ReactDOM.render(<NightlifeTop />,
    document.getElementById('main')
);
