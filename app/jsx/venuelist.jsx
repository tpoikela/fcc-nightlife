
'use strict';

var React = require('react');

const VenueListItem = require('./venue-list-item.jsx');

/** This component generates the list of bars/restaurants based on the number of
 * items in the array given with props. */
class VenueList extends React.Component {

    render() {
        var className = this.props.className || 'venue-list-div';
        var data = this.props.data;
        var onGoingClick = this.props.onGoingClick;
        var isAuth = this.props.isAuth;
        var userID = this.props.userID;

        // Creates the list item contents
        var listItems = data.map( (item, index) => {
            var going = false;

            if (userID) {
                var userIndex = item.going.indexOf(userID);
                going = (userIndex >= 0);
            }

            return (<VenueListItem
                data={item}
                going={going}
                isAuth={isAuth}
                key={index}
                onGoingClick={onGoingClick}
            />);
        });

        return (
            <div className={className}>
                <ul>
                    {listItems}
                </ul>
            </div>
        );
    }
}

VenueList.propTypes = {
    className: React.PropTypes.string,
    data: React.PropTypes.objec,
    isAuth: React.PropTypes.bool,
    onGoingClick: React.PropTypes.func,
    userID: React.PropTypes.string
};


module.exports = VenueList;

