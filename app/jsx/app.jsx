
var $DEBUG = 1;
var appUrl = window.location.origin;

var ajax = require("../common/ajax-functions.js");

class NightlifeTop extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            search: {},
        };
    }

    componentDidMount() {
        /** Nothing to do.*/
    }

    render() {
        return (
            <div id="bug-list-id">
                <h1>NightlifeTop</h1>
                <hr/>
                <p>This is a nightlife app for doing stuff.</p>
            </div>
        );
    }

};

ReactDOM.render(<NightlifeTop />,
    document.getElementById('main')
);
