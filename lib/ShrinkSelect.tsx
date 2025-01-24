import React, { Fragment, ReactNode } from 'react';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import classnames from 'classnames';
import normalizeOptions, { Options } from './utils/normalizeOptions';
import styled from 'styled-components';

const DefaultRenderer: React.FC<{ caption: any }> = props => (
  <Fragment>{props.caption}</Fragment>
);

const StyledDropdown = styled(Dropdown)`
  &.dropdown-block {
    display: block;
    > .btn {
      float: none;
      text-align: left;
      &.btn-block {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    .dropdown-menu {
      min-width: 100%;
    }
  }
`;

export interface ShrinkSelectProps<T extends string | number = string> {
  options: Options;
  value: T;
  defaultSelect?: T;
  onChange?: (value: T) => void;
  bsSize?: string;
  bsStyle?: string;
  block?: boolean;
  disabled?: boolean;
  className?: string;
  renderer?: React.ComponentType<any>;
  /**
   * Set to true to use a number as a `value`
   */
  numericalValue?: boolean;
}

const ShrinkSelect = <T extends string | number = string>(
  props: ShrinkSelectProps<T>
): React.ReactElement<ShrinkSelectProps<T>> => {
  const {
    value,
    defaultSelect = null,
    onChange = () => {},
    bsSize = undefined,
    bsStyle = 'default',
    block = false,
    disabled,
    className,
    renderer: Renderer = DefaultRenderer,
    numericalValue = false
  } = props;

  const options = normalizeOptions(props.options);

  const title: ReactNode =
    value in options ? (
      <Renderer {...options[props.value]} />
    ) : defaultSelect !== null ? (
      options[defaultSelect].caption
    ) : (
      ' '
    );

  const handleChange = (key: string) => {
    if (typeof onChange === 'function') {
      onChange((numericalValue ? parseFloat(key) : key) as T);
    }
  };

  return (
    <StyledDropdown
      id="shrink-select-dropdown"
      className={classnames(
        'shrink-select',
        { 'dropdown-block': block },
        className
      )}
      disabled={disabled}
    >
      <Dropdown.Toggle
        bsStyle={bsStyle}
        bsSize={bsSize}
        /* 'block' is not in DropdownToggleProps, but it was hard to augment
           due to https://github.com/Microsoft/TypeScript/issues/14080
        // @ts-ignore */
        block={block}
      >
        {title}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {Object.keys(options).map(key => (
          <MenuItem key={key} onClick={() => handleChange(key)}>
            <Renderer {...options[key]} />
          </MenuItem>
        ))}
      </Dropdown.Menu>
    </StyledDropdown>
  );
};

export default ShrinkSelect;
