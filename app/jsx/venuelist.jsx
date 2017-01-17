
/** VenueListItem renders data for a single item representing one venue where
 * people can go to. It renders an image of the place, a link to Yelp site and
 * few control buttons.
 */
class VenueListItem extends React.Component {

    constructor(props) {
        super(props);

        this.onGoingClick = this.onGoingClick.bind(this);
        this.addToFavourites = this.addToFavourites.bind(this);

        this.state = {
            going: false,
        };

    }

    onGoingClick(e) {
        var newGoingState = !this.state.going;
        var obj = {going: newGoingState, appID: this.props.data.appID};
        this.props.onGoingClick(obj);
        this.setState({going: newGoingState});
    }

    addToFavourites(e) {
        //TODO call top component handles for ajax-post
    }

    render() {
        var data = this.props.data;
        var goingButtonText = this.state.going ? "I'm going" : "Not going";
        var nGoing = data.going.length;
        var url = data.url;
        var image = data.image;
        var descr = data.descr;
        var descrComp = null;
        if (descr) {
            descrComp = <p className="venue-descr">{descr}</p>;
        }

        // Generate buttons only for authenticated users
        var isAuth = this.props.isAuth;
        var buttons = null;
        if (isAuth) {
            buttons = (
                <div id='venue-list-item-btn'>
                <button onClick={this.onGoingClick}>{goingButtonText}</button>
                <button onClick={this.addToFavourites}>Add to favourites</button>
                </div>
            );
        }

        return (
            <li className='venue-list-item'>
                <img src={image}/>
                {buttons}
                <a href={url}>{data.name}</a>
                <span className='li-going'> | {nGoing} going</span>
                {descrComp}
            </li>
        );
    }

}

/** This component generates the list of bars/restaurants based on the number of
 * items in the array given with props. */
class VenueList extends React.Component {

    render() {
        var data = this.props.data;
        var onGoingClick = this.props.onGoingClick;
        var isAuth = this.props.isAuth;

        // Creates the list item contents
        var listItems = data.map( (item, index) => {
            return <VenueListItem 
                onGoingClick={onGoingClick} isAuth={isAuth}
                key={index} data={item} />
        });

        return (
            <div>
                <h2>List of places</h2>
                <ul>
                    {listItems}
                </ul>
            </div>
        );
    }
}

module.exports = VenueList;

