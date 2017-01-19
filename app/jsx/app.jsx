
'use strict';

var NightlifeTop = require('./top.jsx');
var ProfileTop = require('./profile.jsx');

var mainApp = document.querySelector('#main-app');
var profileTop = document.querySelector('#profile-app');

if (mainApp) {
    ReactDOM.render(<NightlifeTop />, mainApp);
}
else if (profileTop) {
    ReactDOM.render(<ProfileTop />, profileTop);
}

