'use strict';

require('file-loader?name=index.html!./index.html');
require('file-loader?name=rb-components.css!less-loader!../lib/rb-components.less');


import React from 'react';
import ReactDom from 'react-dom';

import IconButton from '../lib/IconButton';
import LoadingIndicator from '../lib/LoadingIndicator';
import { alert, confirm, prompt } from '../lib/Modal';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';

import ModalDemo from './modal';
import CalendarDemo from './calendar';

const Demo = () => <div>
	<Tabs id='demo-tabs' defaultActiveKey={'loading'}>
		<Tab eventKey={'loading'} title='Loading'>
			<LoadingIndicator />
		</Tab>
		<Tab eventKey={'modals'} title='Modals'>
			<ModalDemo />
		</Tab>
		<Tab eventKey={'calendar'} title='Calendar'>
			<CalendarDemo />
		</Tab>
	</Tabs>
</div>;

ReactDom.render(
	<Demo />,
	document.getElementById('main')
);
