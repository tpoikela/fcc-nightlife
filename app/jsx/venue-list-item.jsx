

'use strict';

var React = require('react');

/** VenueListItem renders data for a single item representing one venue where
 * people can go to. It renders an image of the place, a link to Yelp site and
 * few control buttons.
 */
class VenueListItem extends React.Component {

    constructor(props) {
        super(props);
        this.onGoingClick = this.onGoingClick.bind(this);
        this.addToFavourites = this.addToFavourites.bind(this);
    }

    onGoingClick() {
        var newGoingState = !this.props.going;
        var obj = {going: newGoingState, appID: this.props.data.appID};
        this.props.onGoingClick(obj);
    }

    addToFavourites() {
        // TODO call top component handles for ajax-post
        var obj = {appID: this.props.data.appID};
        return obj;
    }

    render() {
        var data = this.props.data;
        var goingButtonText = !this.props.going ? 'Go' : 'Cancel';
        var nGoing = data.going.length;
        var url = data.url;
        var image = data.image;
        var descr = data.descr;
        var descrComp = null;
        if (descr) {
            descrComp = <p className='venue-descr'>{descr}</p>;
        }

        // Generate buttons only for authenticated users
        var isAuth = this.props.isAuth;
        var buttons = null;
        if (isAuth) {
            buttons = (
                <span className='venue-list-item-btn'>
                    <button onClick={this.onGoingClick}>
                        {goingButtonText}
                    </button>
                    <button onClick={this.addToFavourites}>
                        Add to favourites
                    </button>
                </span>
            );
        }

        var userGoing = 'You are not going.';
        if (this.props.going) {
            if (nGoing > 1) {userGoing = "You're also going!";}
            else {userGoing = "You're going!";}
        }

        return (
            <li className='venue-list-item'>
                <img className='img-venue-thumbnail' src={image}/>
                <div style={{display: 'inline-block'}}>
                    <a href={url}>{data.name}</a>
                    {buttons}
                </div>
                <p className='li-going'> | {nGoing} going | {userGoing}</p>
                {descrComp}
            </li>
        );
    }

}

VenueListItem.propTypes = {
    data: React.PropTypes.object,
    going: React.PropTypes.bool,
    isAuth: React.PropTypes.bool,
    onGoingClick: React.PropTypes.func

};

module.exports = VenueListItem;
