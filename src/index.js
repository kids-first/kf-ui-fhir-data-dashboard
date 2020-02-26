import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import store from './store';
import ReduxApp from './components/ReduxApp';
import 'semantic-ui-css/semantic.min.css';
import 'react-virtualized/styles.css';
import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <ReduxApp />
  </Provider>,
  document.getElementById('root'),
);
