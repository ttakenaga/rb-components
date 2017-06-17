import React, { cloneElement } from 'react';

/**
 * Displays the specified component with its value
 * and maintains the value changes.
 */
export default class ValuePreview extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = { value: props.initialValue };
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(value) {
		this.setState({ value });
	}

	render() {
		const {
			valueProp = 'value',
			event = 'onChange',
			children
		} = this.props;
		const child = cloneElement(children, {
			[valueProp]: this.state.value,
			[event]: this.handleChange
		});
		return <div>
			{child}
			<div className='value'>
				{JSON.stringify(this.state.value)}
			</div>
		</div>;
	}
}
