
'use strict';

var React = require('react');

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
        var link = <a href={venue.url}>{venue.name}</a>;

        return (
            <li>
                {link}
                <button className='btn-night'
                    onClick={this.onRemoveClick}
                    >Remove
                </button>
            </li>
        );
    }

}


ProfileVenueItem.propTypes = {
    onRemoveClick: React.PropTypes.func,
    venue: React.PropTypes.object
};

module.exports = ProfileVenueItem;
