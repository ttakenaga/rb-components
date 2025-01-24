import React, { Fragment, ReactNode } from 'react';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import normalizeOptions, {
  Options,
  NormalizedOptions
} from './utils/normalizeOptions';
import classnames from 'classnames';
import styled from 'styled-components';

type Renderer = React.ComponentType<{
  caption: ReactNode;
  renderAs: string;
}>;

const DefaultRenderer: Renderer = props => <Fragment>{props.caption}</Fragment>;

const StyledDropdown = styled(Dropdown)`
  .multiselect-popover > li {
    &:hover {
      background-color: #f5f5f5;
    }
    &.checked {
      background-color: #d0d0d0;
    }
  }

  .multiselect {
    position: relative;
  }
`;

const StyledUl = styled.ul`
  padding: 0;
  white-space: nowrap;
`;

const StyledLi = styled.li`
  list-style-type: none;
  cursor: pointer;
  padding: 3px 10px;
`;

const MultiSelectDropdown: React.FC<{
  value: any[];
  onItemChange: (index: number, checked: boolean) => void;
  disabled?: boolean;
  renderer: Renderer;
  showSelectedMax: number;
  options: NormalizedOptions;
  glue: string;
  noneText?: string;
  className?: string;
}> = props => {
  const {
    renderer: Renderer,
    value,
    showSelectedMax,
    noneText,
    glue,
    options,
    onItemChange,
    className,
    disabled
  } = props;

  let caption: any = [];
  if (value.length === 0) {
    caption = noneText;
  } else if (value.length > showSelectedMax) {
    caption = `${value.length} selected`;
  } else {
    value.forEach((sel, i) => {
      const renderItem = options[sel];
      if (i > 0) caption.push(glue);
      caption.push(<Renderer key={i} renderAs="list" {...renderItem} />);
    });
  }

  return (
    <StyledDropdown
      id="multiselect-dropdown-comp"
      className={classnames('multiselect', className)}
      disabled={disabled}
    >
      <Dropdown.Toggle>{caption}</Dropdown.Toggle>
      <Dropdown.Menu className="multiselect-popover multiselect-checkboxes">
        <CheckBoxArray
          renderer={Renderer}
          value={value}
          options={options}
          onItemChange={onItemChange}
          tabIndex={-1}
        />
      </Dropdown.Menu>
    </StyledDropdown>
  );
};

const CheckBoxArray: React.FC<{
  renderer: Renderer;
  value: any[];
  options: NormalizedOptions;
  onItemChange: (index: number, checked: boolean) => void;
  disabled?: boolean;
  tabIndex?: number;
}> = props => {
  const {
    renderer: Renderer,
    value = [],
    options,
    onItemChange,
    disabled,
    tabIndex
  } = props;

  return (
    <>
      {Object.keys(options).map((key, i) => {
        const checked = value.some(sel => sel == key); // lazy equiality('==') needed
        const checkedClass = checked ? 'checked' : '';
        const renderItem = options[key];
        return (
          <StyledLi
            key={i}
            role="presentation"
            onClick={() => {
              !disabled && onItemChange(i, checked);
            }}
            className={checkedClass}
          >
            <input
              type="checkbox"
              checked={checked}
              readOnly
              tabIndex={tabIndex}
              disabled={disabled}
            />
            &ensp;
            <Renderer {...renderItem} renderAs="select" />
          </StyledLi>
        );
      })}
    </>
  );
};

/**
 * Dropdown + Multiselect component.
 */
const MultiSelect: React.FC<{
  value: any[];
  onChange?: (value: any[]) => void;
  disabled?: boolean;
  renderer?: Renderer;
  showSelectedMax?: number;
  options: Options;
  type?: 'dropdown' | 'checkbox';
  glue?: string;
  noneText?: string;
  numericalValue?: boolean;
  className?: string;
}> = props => {
  const {
    renderer = DefaultRenderer,
    showSelectedMax = 3,
    value = [],
    type = 'dropdown',
    glue = ', ',
    noneText = '(None)',
    onChange,
    numericalValue,
    className,
    disabled
  } = props;

  // Normalize options
  const options = normalizeOptions(props.options);

  const handleItemChange = (clickedIndex: number, checked: boolean) => {
    const newValue: any[] = [];
    Object.keys(options).forEach((key, i) => {
      const insertingKey = numericalValue ? parseFloat(key) : key;
      if (clickedIndex !== i) {
        if (value.indexOf(insertingKey) !== -1) newValue.push(insertingKey);
      } else {
        if (!checked) newValue.push(insertingKey);
      }
    });
    onChange && onChange(newValue);
  };

  if (type === 'dropdown') {
    return (
      <MultiSelectDropdown
        value={value}
        className={className}
        disabled={disabled}
        options={options}
        renderer={renderer}
        glue={glue}
        showSelectedMax={showSelectedMax}
        noneText={noneText}
        onItemChange={handleItemChange}
      />
    );
  } else {
    const classNames = classnames(
      className,
      'list-unstyled',
      'multiselect-checkboxes',
      { 'text-muted': disabled }
    );
    return (
      <StyledUl className={classNames}>
        <CheckBoxArray
          value={value}
          disabled={disabled}
          options={options}
          renderer={renderer}
          onItemChange={handleItemChange}
        />
      </StyledUl>
    );
  }
};

export default MultiSelect;
