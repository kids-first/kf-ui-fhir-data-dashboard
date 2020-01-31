import React from 'react';
import PropTypes from 'prop-types';
import {Card, Icon} from 'semantic-ui-react';
import './Dashboard.css';

class Dashboard extends React.Component {
  render() {
    const {title, total, items, onClick} = this.props;
    return (
      <div className="dashboard">
        <h2>
          {title} ({total})
        </h2>
        <div className="dashboard__results">
          {Object.keys(items).map(itemType => (
            <Card key={itemType} onClick={() => onClick(itemType)}>
              <Card.Content>
                <Card.Header>{itemType}</Card.Header>
                <Card.Meta>Total: {items[itemType].count}</Card.Meta>
                <Card.Meta>Base type: {items[itemType].baseType}</Card.Meta>
                <Card.Description>
                  Click to explore {itemType}.
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Icon name="user" />
              </Card.Content>
            </Card>
          ))}
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  items: PropTypes.object,
  title: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  total: PropTypes.number,
};

Dashboard.defaultProps = {
  items: {},
  onClick: () => {},
  total: 0,
};

export default Dashboard;
