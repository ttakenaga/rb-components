'use strict';

require('file-loader?name=index.html!./index.html');

import React from 'react';
import { createRoot } from 'react-dom/client';

import DemoApp from './demo-app';

const root = createRoot(document.getElementById('main'));
root.render(<DemoApp />);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./demo-app', () => {
    const NextApp = require('./demo-app').default;
    root.render(NextApp);
  });
}
