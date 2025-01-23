'use strict';

require('file-loader?name=index.html!./index.html');

import React from 'react';
import ReactDOM from 'react-dom';

import DemoApp from './demo-app';

function render(App) {
  ReactDOM.render(<App />, document.getElementById('main'));
}

render(DemoApp);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./demo-app', () => {
    const NextApp = require('./demo-app').default;
    render(NextApp);
  });
}
