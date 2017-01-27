
'use strict';

var React = require('react');

/** Component which handles the search input updates.*/
class SearchInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            q: ''
        };

        // Mandatory binding for event handlers
        this.onSearchClick = this.onSearchClick.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        var q = e.target.value;
        this.setState({q: q});
    }

    onSearchClick() {
        this.props.onClick(this.state.q);
    }

    render() {
        var className = this.props.className || 'search-input-div';
        return (
            <div className={className}>
                <input className='fa fa-2x search-input'
                    name='q'
                    onChange={this.onChange}
                    placeholder='Where are you?'
                    value={this.state.q}
                />
                <button id='q-button' onClick={this.onSearchClick}>
                    <i className='search-icon fa fa-search fa-2x'/>
                </button>
            </div>
        );

    }
}

SearchInput.propTypes = {
    className: React.PropTypes.string,
    onClick: React.PropTypes.func
};

module.exports = SearchInput;

