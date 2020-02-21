import React from 'react';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'react-router-dom';
class DecisionRoute extends React.Component {
  render() {
    const {
      renderComponent,
      component: Component,
      redirectPath,
      ...rest
    } = this.props;
    console.log('this.props', this.props);
    return (
      <Route
        {...rest}
        render={props =>
          renderComponent ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={{pathname: redirectPath, state: {from: this.props.location}}}
            />
          )
        }
      />
    );
  }
}

DecisionRoute.propTypes = {
  renderComponent: PropTypes.bool.isRequired,
  component: PropTypes.elementType.isRequired,
  redirectPath: PropTypes.string.isRequired,
};

export default DecisionRoute;
