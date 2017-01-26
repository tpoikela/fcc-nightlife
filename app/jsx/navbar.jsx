
'use strict';

var React = require('react');

class Navbar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='container'>
                <ul>
                    <li><a href='/login'>Login</a></li>
                    <li><a href='/signup'>Signup</a></li>
                    <li><a href='/about'>About</a></li>
                </ul>
            </div>
        );
    }

}

module.exports = Navbar;
