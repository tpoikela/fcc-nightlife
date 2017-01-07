
/** Component which handles the search input updates.*/
class SearchInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            q: '',
        };

        // Mandatory binding for event handlers
        this.onSearchClick = this.onSearchClick.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        var q = e.target.value;
        this.setState({q: q});
    }

    onSearchClick(e) {
        this.props.onClick(this.state.q);
    }

    render() {
        var className = this.props.className;
        return (
            <div className={className}>
                <input
                    name='q'
                    value={this.state.q}
                    onChange={this.onChange}
                />
                <button onClick={this.onSearchClick}>Search</button>
            </div>
        );

    }
}

module.exports = SearchInput;

