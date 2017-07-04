import React from 'react';

import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';

import ModalDemo from './modal';
import CalendarDemo from './calendar';
import SelectDemo from './select';
import ColorDemo from './color';
import ConditionEditorDemo from './condition-editor';
import PropertyEditorDemo from './property-editor';
import MiscDemo from './misc';

const DemoApp = () => <div>
	<Tabs id='demo-tabs' defaultActiveKey={'modals'} animation={false}
		mountOnEnter={true} unmountOnExit={true}
	>
		<Tab eventKey={'modals'} title='Modals'>
			<ModalDemo />
		</Tab>
		<Tab eventKey={'calendar'} title='Calendar'>
			<CalendarDemo />
		</Tab>
		<Tab eventKey={'shrinkselect'} title='Select'>
			<SelectDemo />
		</Tab>
		<Tab eventKey={'condition-editor'} title='ConditionEditor'>
			<ConditionEditorDemo />
		</Tab>
		<Tab eventKey={'color'} title='Color'>
			<ColorDemo />
		</Tab>
		<Tab eventKey={'property'} title='PropertyEditor'>
			<PropertyEditorDemo />
		</Tab>
		<Tab eventKey={'misc'} title='Misc'>
			<MiscDemo />
		</Tab>
	</Tabs>
</div>;

export default DemoApp;