import React from 'react';
import PropTypes from 'prop-types';
import {Breadcrumb} from 'semantic-ui-react';
import {withRouter} from 'react-router';
import {capitalize} from '../utils/common';
import './AppBreadcrumb.css';

class AppBreadcrumb extends React.Component {
  getLink = (linkNames, i) => {
    const path = linkNames.slice(0, i + 1).join('/');
    console.log('path', path);
    return path;
  };
  render() {
    const linkNames = this.props.location.pathname.split('/');
    return (
      <div className="app-breadcrumb">
        {linkNames.map((link, i) => {
          const name = capitalize(link);
          return i > 0 && i < linkNames.length - 1 ? (
            <Breadcrumb key={link}>
              <Breadcrumb.Divider icon="left chevron" />
              <Breadcrumb.Section
                link
                onClick={() =>
                  this.props.history.push(this.getLink(linkNames, i))
                }
              >
                {name}
              </Breadcrumb.Section>
            </Breadcrumb>
          ) : null;
        })}
      </div>
    );
  }
}

AppBreadcrumb.propTyps = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(AppBreadcrumb);
