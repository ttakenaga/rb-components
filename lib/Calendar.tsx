import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import moment from 'moment';
import classnames from 'classnames';
import { useUncontrolled } from 'uncontrollable';
import styled from 'styled-components';

export const defaultDateFormat = 'YYYY-MM-DD';

const StyledDiv = styled.div`
  text-align: center;
  display: inline-block;
  .calendar-nav {
    text-align: center;
  }
  .calendar-table {
    margin-left: auto;
    margin-right: auto;
    cursor: pointer;
    td,
    th {
      width: 100% /7;
      padding: 0 2px;
    }
    td.not-this-month {
      color: #999;
    }
    td:hover {
      background-color: #eee;
    }
    td.selected {
      background-color: #ccc;
    }
    &.disabled {
      cursor: not-allowed;
      td:hover {
        background-color: transparent;
      }
      td.selected {
        background-color: #ddd;
      }
    }
  }
`;

export interface YearMonth {
  year: number;
  month: number;
}

interface ControlledCalendarProps {
  value: any;
  onChange: (val: any) => void;
  format?: string;
  disabled?: boolean;
  yearMonth?: YearMonth | null;
  onYearMonthChange?: (yearMonth: YearMonth) => void;
}

const Calendar: React.FC<ControlledCalendarProps> = initialProps => {
  const props = useUncontrolled<ControlledCalendarProps>(initialProps, {
    yearMonth: 'onYearMonthChange'
  });
  const {
    value,
    onChange,
    format = defaultDateFormat,
    disabled,
    yearMonth,
    onYearMonthChange
  } = props;

  const resolveYearMonthProp = () => {
    const ym = yearMonth;
    if (
      ym != null &&
      ym != undefined &&
      ym.year &&
      ym.month >= 1 &&
      ym.month <= 12
    ) {
      return ym;
    }
    const date = new Date();
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  };
  const { year, month } = resolveYearMonthProp();

  const nav = useCallback(
    (delta: moment.DurationInputArg1, unit: moment.DurationInputArg2) => {
      if (typeof onYearMonthChange !== 'function') return;
      const newDate = moment({ year, month: month - 1 }).add(delta, unit);
      onYearMonthChange({ year: newDate.year(), month: newDate.month() + 1 });
    },
    [month, year, onYearMonthChange]
  );

  const divRef = useRef<HTMLDivElement>(null);

  const prevYear = useCallback(() => nav(-1, 'year'), [nav]);
  const nextYear = useCallback(() => nav(+1, 'year'), [nav]);
  const prevMonth = useCallback(() => nav(-1, 'month'), [nav]);
  const nextMonth = useCallback(() => nav(+1, 'month'), [nav]);

  useEffect(() => {
    const handleWheel = (ev: WheelEvent) => {
      if (disabled) return;
      ev.preventDefault();
      if (ev.deltaY > 0) nextMonth();
      if (ev.deltaY < 0) prevMonth();
    };
    const div = divRef.current;
    if (!div) return;
    div.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      div.removeEventListener('wheel', handleWheel);
    };
  }, [year, month, disabled, nextMonth, prevMonth]);

  return (
    <StyledDiv
      ref={divRef}
      className={classnames('calendar', { 'text-muted': disabled, disabled })}
    >
      <div className="calendar-nav">
        <Navicon glyph="backward" onClick={prevYear} disabled={disabled} />
        <Navicon
          glyph="triangle-left"
          onClick={prevMonth}
          disabled={disabled}
        />
        {year} - {month}
        <Navicon
          glyph="triangle-right"
          onClick={nextMonth}
          disabled={disabled}
        />
        <Navicon glyph="forward" onClick={nextYear} disabled={disabled} />
      </div>
      <CalendarTable
        yearMonth={{ year, month }}
        format={format}
        onChange={onChange}
        value={value}
        disabled={disabled}
      />
    </StyledDiv>
  );
};

export default Calendar;

const Navicon: React.FC<{
  glyph: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ glyph, onClick, disabled }) => (
  <Button bsSize="xs" bsStyle="link" onClick={onClick} disabled={disabled}>
    <Glyphicon glyph={glyph} />
  </Button>
);

const split = <T extends any>(array: T[], every: number): T[][] => {
  const result = [];
  let i = 0;
  while (i < array.length) {
    result.push(array.slice(i, i + every));
    i += every;
  }
  return result;
};

const CalendarTable: React.FC<{
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  yearMonth: YearMonth;
  format: string;
}> = React.memo(props => {
  const [hasFocus, setHasFocus] = useState(false);
  const {
    yearMonth: { year, month },
    value,
    disabled,
    onChange,
    format = defaultDateFormat
  } = props;

  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleDateSelect = useCallback(
    (
      ev:
        | React.MouseEvent<HTMLTableCellElement>
        | React.KeyboardEvent<HTMLTableCellElement>
    ) => {
      if (disabled) return;
      const target = ev.target as HTMLTableCellElement;
      if (target.dataset.date) {
        const date = moment.unix(Number(target.dataset.date));
        if (typeof onChange === 'function') {
          onChange(date.format(format));
        }
      }
    },
    [disabled, format, onChange]
  );

  const focusRelative = useCallback(
    (ev: any, delta: moment.DurationInputArg1) => {
      const children = Array.from(tbodyRef.current!.querySelectorAll('td'));
      const fromDate = moment.unix(ev.target.dataset.date);
      const toDate = fromDate.add(delta, 'day').unix();
      const nextNode = children.find(el => el.dataset.date === String(toDate));
      if (nextNode) {
        nextNode.focus();
        ev.preventDefault();
        ev.stopPropagation();
      }
    },
    []
  );

  const handleTableFocus = useCallback(
    (ev: React.FocusEvent<HTMLTableElement>) => {
      const children = Array.from(tbodyRef.current!.querySelectorAll('td'));
      if (ev.target === tableRef.current) {
        const valueMoment =
          value !== undefined ? moment(value, format).unix() : undefined;
        const selected = children.find(
          el => el.dataset.date === String(valueMoment)
        );
        if (selected) selected.focus();
        else tbodyRef.current!.querySelector('td')!.focus();
      }
      setHasFocus(true);
    },
    [format, value]
  );

  const handleTableBlur = useCallback(() => setHasFocus(false), []);

  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLTableCellElement>) => {
      const key = ev.key.toLowerCase();
      switch (key) {
        case 'enter':
        case 'space':
          handleDateSelect(ev);
          ev.preventDefault();
          break;
        case 'right':
          focusRelative(ev, 1);
          break;
        case 'left':
          focusRelative(ev, -1);
          break;
        case 'up':
          focusRelative(ev, -7);
          break;
        case 'down':
          focusRelative(ev, 7);
          break;
      }
    },
    [focusRelative, handleDateSelect]
  );

  if (!year || !month) return <div>Invalid year month</div>;

  const start = moment({ year, month: month - 1, day: 1 }).startOf('week');
  const last = moment({ year, month: month - 1 })
    .endOf('month')
    .endOf('week')
    .startOf('day');
  const lastTimestamp = last.unix();

  const valueMoment = value !== undefined ? moment(value, format) : undefined;

  const days = [];
  let i = 0;
  for (;;) {
    const date = start.clone().add(i, 'day');
    days.push(date);
    if (date.unix() >= lastTimestamp) break;
    i++;
  }
  const weeks = split(days, 7);

  const day = (date: moment.Moment) => {
    const classNames = classnames({
      selected: valueMoment && date.isSame(valueMoment, 'day'),
      'not-this-month': date.month() !== month - 1
    });
    return (
      <td
        key={date.dayOfYear()}
        tabIndex={disabled ? undefined : -1}
        data-date={date.unix()}
        onClick={handleDateSelect}
        onKeyDown={handleKeyDown}
        className={classNames}
      >
        {date.date()}
      </td>
    );
  };

  const classNames = classnames('calendar-table', {
    'text-muted': disabled,
    disabled
  });

  return (
    <table
      className={classNames}
      tabIndex={disabled ? undefined : hasFocus ? -1 : 0}
      onFocus={handleTableFocus}
      onBlur={handleTableBlur}
      ref={tableRef}
    >
      <thead>
        <tr>
          <th>Su</th>
          <th>Mo</th>
          <th>Tu</th>
          <th>We</th>
          <th>Th</th>
          <th>Fr</th>
          <th>Sa</th>
        </tr>
      </thead>
      <tbody ref={tbodyRef}>
        {weeks.map(week => (
          <tr key={week[0].dayOfYear()}>{week.map(date => day(date))}</tr>
        ))}
      </tbody>
    </table>
  );
});
