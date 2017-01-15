
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
        this.setState({going: !this.state.going});
        var obj = {going: this.state.going, appID: this.props.data.appID};
        this.props.onGoingClick(obj);
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
        return (
            <li className='bar-list-item'>
                <img src={image}/>
                <button onClick={this.onGoingClick}>{goingButtonText}</button>
                <button onClick={this.addToFavourites}>Add to favourites</button>
                <a href={url}>{data.name}</a>
                <span className='li-going'>{nGoing} going</span>
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

        // Creates the list item contents
        var listItems = data.map( (item, index) => {
            return <VenueListItem onGoingClick={onGoingClick} key={index} data={item} />
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

