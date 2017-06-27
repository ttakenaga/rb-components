import React from 'react';

import Calendar from '../lib/Calendar';
import DropdownDatePicker from '../lib/DropdownDatePicker';
import RelativeDatePicker from '../lib/RelativeDatePicker';
import DateRangePicker from '../lib/DateRangePicker';
import ValuePreview from './value-preview';

const DropdownDatePickerDemo = props => <div>
	<h4>Default</h4>
	<DropdownDatePicker {...props} />
	<h4>Blocked</h4>
	<DropdownDatePicker {...props} block bsSize='xs' bsStyle='primary' />
</div>;

const CalendarDemo = () => {
	return <div>
		<h3>Clickable Calendar</h3>
		<ValuePreview initialValue='2017-01-01'>
			<Calendar />
		</ValuePreview>
		<h3>Dropdown Date Picker</h3>
		<ValuePreview initialValue='2017-01-01'>
			<DropdownDatePickerDemo />
		</ValuePreview>
		<h3>Relative Date Picker</h3>
		<ValuePreview initialValue={null}>
			<RelativeDatePicker />
		</ValuePreview>
		<h3>Date Range Picker</h3>
		<ValuePreview initialValue={{ from: null, to: null }}>
			<DateRangePicker />
		</ValuePreview>
	</div>;
};

export default CalendarDemo;
