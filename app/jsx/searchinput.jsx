
/** Component which handles the search input updates.*/
class SearchInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            q: '', // Required for <input>
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
        var className = this.props.className || 'search-input-div';
        return (
            <div className={className}>
                <input className='fa search-input'
                    name='q'
                    value={this.state.q}
                    onChange={this.onChange}
                    placeholder='Where are you?'
                />
                <button id='q-button' onClick={this.onSearchClick}>
                    <i className='search-icon fa fa-search fa-2x'></i>
                </button>
            </div>
        );

    }
}

module.exports = SearchInput;

