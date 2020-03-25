import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {tabletWidth} from '../config';
import {Search, Button} from 'semantic-ui-react';
import './SearchBar.css';

export class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: props.data,
      isLoading: false,
      value: '',
      fluid: window.innerWidth <= tabletWidth,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize = () => {
    if (window.innerWidth > tabletWidth && this.state.fluid) {
      this.setState({fluid: false});
    } else if (window.innerWidth <= tabletWidth && !this.state.fluid) {
      this.setState({fluid: true});
    }
  };

  handleResultSelect = (e, {result}) => {
    this.setState(
      {
        value: result.title,
        results: [result],
      },
      () => this.props.handleResultSelect(this.state.results),
    );
  };

  handleSearchClear = () => {
    this.setState(
      {
        results: this.props.data,
        isLoading: false,
      },
      () => {
        this.props.handleResultSelect(this.state.results);
      },
    );
  };

  handleSearchChange = e => {
    this.setState({isLoading: true, value: e.target.value}, () => {
      if (this.state.value === '') {
        this.handleSearchClear();
      }

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i');
      const isMatch = result => re.test(result.title);

      this.setState(
        {
          isLoading: false,
          results: _.filter(this.props.data, isMatch),
        },
        () => {
          this.props.handleSearchChange(this.state.value);
        },
      );
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.handleSubmit(this.state.value);
  };

  clearResults = () => {
    this.setState(
      {
        value: '',
      },
      () => this.props.clearResults(),
    );
  };

  render() {
    const {isLoading, value, results} = this.state;
    const searchBar = (
      <Search
        className={this.props.className}
        input={{fluid: this.state.fluid}}
        placeholder={this.props.placeholder}
        loading={isLoading}
        onResultSelect={this.handleResultSelect}
        onSearchChange={_.debounce(this.handleSearchChange, 500, {
          leading: true,
        })}
        results={results}
        value={value}
        data={this.props.data}
        open={this.props.open}
      />
    );

    return (
      <div className="search-bar">
        {this.props.searchOnClick ? (
          <form className="search-bar__form" onSubmit={this.handleSubmit}>
            {searchBar}
            <Button type="submit" className="search-bar__button">
              Search
            </Button>
            <Button
              className="search-bar__button"
              onClick={() => this.clearResults()}
            >
              Clear
            </Button>
          </form>
        ) : (
          searchBar
        )}
      </div>
    );
  }
}

SearchBar.propTypes = {
  data: PropTypes.array,
  handleResultSelect: PropTypes.func,
  placeholder: PropTypes.string,
  handleSearchChange: PropTypes.func,
  open: PropTypes.bool,
  searchOnClick: PropTypes.bool,
  clearResults: PropTypes.func,
  handleSubmit: PropTypes.func,
};

SearchBar.defaultProps = {
  data: [],
  handleResultSelect: () => {},
  placeholder: 'Search for a resource',
  handleSearchChange: () => {},
  open: undefined,
  searchOnClick: false,
  clearResults: () => {},
  handleSubmit: () => {},
};

export default SearchBar;
