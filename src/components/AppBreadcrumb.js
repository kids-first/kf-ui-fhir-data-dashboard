import React from 'react';
import PropTypes from 'prop-types';
import {Breadcrumb} from 'semantic-ui-react';
import './AppBreadcrumb.css';

class AppBreadcrumb extends React.Component {
  goHome = () => {
    this.props.history.replace('/');
  };

  render() {
    const {history} = this.props;
    const linkNames = history.location.pathname.split('/');
    return (
      <React.Fragment>
        {linkNames.length > 1 && !!linkNames[1] ? (
          <Breadcrumb>
            <Breadcrumb.Divider icon="left chevron" />
            <Breadcrumb.Section link onClick={() => this.goHome()}>
              Home
            </Breadcrumb.Section>
          </Breadcrumb>
        ) : null}
      </React.Fragment>
    );
  }
}

AppBreadcrumb.propTypes = {
  history: PropTypes.object.isRequired,
};

export default AppBreadcrumb;
