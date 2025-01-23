import React from 'react';
import classnames from 'classnames';
import tinycolor from 'tinycolor2';
import getHorizontalPositionInElement from './utils/getHorizontalPositionInElement';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import { ColorPalette } from './ColorPicker';
import styled from 'styled-components';

interface ColorStop {
  position: number;
  color: string;
}

type Gradation = ColorStop[];

const toHex = (color: string) => tinycolor(color).toHex8String();

interface HandleProps {
  stopId: number;
  value: ColorStop;
  onUpdate: (stopId: number, updates: Partial<ColorStop>) => void;
  onRemove: (stopId: number) => void;
  disabled?: boolean;
  numStops: number;
}

interface HandleState {
  dragging: boolean;
  dragged: boolean;
  open: boolean;
  dimmed: boolean;
}

class Handle extends React.Component<HandleProps, HandleState> {
  private elem: React.RefObject<HTMLDivElement>;

  constructor(props: HandleProps) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleDocumentMouseMove = this.handleDocumentMouseMove.bind(this);
    this.handleDocumentMouseUp = this.handleDocumentMouseUp.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.state = {
      dragging: false, // becomes true after mousedown
      dragged: false, // becomes true after mousemove after mousedown
      open: false,
      dimmed: false
    };
    this.elem = React.createRef();
  }

  static getDerivedStateFromProps(
    props: HandleProps,
    state: Partial<HandleState>
  ) {
    if (props.disabled) {
      return { dragging: false, dragged: false, open: false };
    }
    return null;
  }

  handleDocumentMouseMove(ev: MouseEvent) {
    const { disabled, onUpdate, stopId, numStops } = this.props;
    const removeThreshold = 30;
    ev.preventDefault();
    if (disabled) return;
    if (!this.state.dragging) return;
    this.setState({ dragged: true, open: false });
    const preview = this.elem.current!.parentNode!.parentNode as HTMLDivElement;
    const pos = getHorizontalPositionInElement(preview, ev.clientX);
    const box = preview.getBoundingClientRect();
    const dimmed =
      numStops > 2 &&
      (ev.clientY < box.top - removeThreshold ||
        ev.clientY > box.top + box.height + removeThreshold);
    this.setState({ dimmed });
    if (!dimmed) {
      onUpdate(stopId, { position: pos });
    }
  }

  handleDocumentMouseUp() {
    const { onRemove, stopId } = this.props;
    if (this.state.dimmed) {
      onRemove(stopId);
    }
    this.setState({ dragging: false });
    this.removeEventListeners();
  }

  removeEventListeners() {
    document.removeEventListener('mousemove', this.handleDocumentMouseMove);
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
  }

  handleMouseDown(ev: React.MouseEvent) {
    const { disabled } = this.props;
    if (disabled) return;
    document.addEventListener('mousemove', this.handleDocumentMouseMove);
    document.addEventListener('mouseup', this.handleDocumentMouseUp);
    this.setState({ dragging: true, dragged: false });
    ev.stopPropagation();
  }

  handleClick() {
    const { disabled } = this.props;
    if (disabled) return;
    if (this.state.dragged) return;
    this.setState({ open: !this.state.open });
  }

  handleColorChange(newColor: string) {
    const { disabled, onUpdate, stopId } = this.props;
    if (disabled) return;
    if (this.state.dragged) return;
    onUpdate(stopId, { color: newColor });
  }

  render() {
    const { disabled, value, stopId } = this.props;
    const { dimmed, open } = this.state;

    return (
      <div
        className={classnames('gradation-editor-color-stop', {
          disabled,
          dimmed
        })}
        style={{ left: value.position * 100 + '%' }}
      >
        <div
          className="gradation-editor-color-stop-handle"
          ref={this.elem}
          onMouseDown={this.handleMouseDown}
          onClick={this.handleClick}
          style={{ backgroundColor: toHex(value.color) }}
        />
        <Overlay
          show={open}
          target={this.elem.current!}
          placement="top"
          animation={false}
        >
          <Popover id={`gradation-editor-color-stop-id${stopId}`}>
            <ColorPalette
              withAlpha
              value={value.color}
              onChange={this.handleColorChange}
            />
          </Popover>
        </Overlay>
      </div>
    );
  }
}

const buildGradient = (value: Gradation) =>
  'linear-gradient(to right, ' +
  value.map(h => toHex(h.color) + ' ' + h.position * 100 + '%').join(', ') +
  ')';

const StyledDiv = styled.div`
  position: relative;
  width: 400px;
  height: 30px;
  &.block {
    width: auto;
  }
  padding: 0px 4px 10px;

  .gradation-editor-preview {
    height: 15px;
    position: relative;
    border: 1px solid gray;
  }

  .gradation-editor-color-stop {
    position: absolute;
  }

  .gradation-editor-color-stop-handle {
    position: absolute;
    &::after {
      content: '';
      display: block;
      position: absolute;
      background-color: inherit;
      width: 9px;
      height: 15px;
      left: -4px;
      top: 14px;
      border: 1px solid black;
      border-radius: 3px 3px 0 0;
      cursor: ew-resize;
      z-index: 2;
      .gradation-editor-color-stop.disabled & {
        border-color: gray;
        cursor: not-allowed;
      }
      .gradation-editor-color-stop.dimmed & {
        opacity: 0.3;
      }
    }
  }

  .gradation-editor-add-area {
    position: absolute;
    bottom: 0;
    height: 15px;
    left: 0;
    right: 0;
    z-index: 1;
    cursor: crosshair;
    &.disabled {
      cursor: not-allowed;
    }
  }
`;

interface GradationEditorProps {
  value: Gradation;
  onChange: (value: Gradation) => void;
  disabled?: boolean;
  maxStops?: number;
  className?: string;
  block?: boolean;
}

export default class GradationEditor extends React.Component<GradationEditorProps> {
  private counter: number;
  private map: Map<ColorStop, number>;
  private preview: React.RefObject<HTMLDivElement>;

  constructor(props: GradationEditorProps) {
    super(props);
    this.handleColorStopUpdate = this.handleColorStopUpdate.bind(this);
    this.handleAddColorStop = this.handleAddColorStop.bind(this);
    this.handleColorStopRemove = this.handleColorStopRemove.bind(this);
    this.counter = 1;
    this.map = new Map();
    this.preview = React.createRef();
  }

  handleColorStopUpdate(stopId: number, updates: Partial<ColorStop>) {
    const { value, onChange } = this.props;
    const newValue = value
      .map(s => {
        if (this.map.get(s) === stopId) {
          this.map.delete(s);
          const newStop = { ...s, ...updates };
          this.map.set(newStop, stopId);
          return newStop;
        } else {
          return s;
        }
      })
      .sort((a, b) => a.position - b.position);
    onChange(newValue);
  }

  handleColorStopRemove(stopId: number) {
    const { value, onChange } = this.props;
    const newValue = value.filter(s => {
      if (this.map.get(s) === stopId) {
        this.map.delete(s);
        return false;
      }
      return true;
    });
    onChange(newValue);
  }

  handleAddColorStop(ev: React.MouseEvent) {
    const { disabled, value, onChange, maxStops } = this.props;
    if (disabled) return;
    if (typeof maxStops === 'number' && value.length >= maxStops) return;
    const newValue = value.slice();
    const position = getHorizontalPositionInElement(
      this.preview.current!,
      ev.clientX
    );
    newValue.push({ position, color: '#ffffffff' });
    newValue.sort((a, b) => a.position - b.position);
    onChange(newValue);
  }

  componentWillUnmount() {
    this.map.clear();
  }

  render() {
    const { block, value, className, disabled } = this.props;
    const gradient = buildGradient(value);

    return (
      <StyledDiv
        className={classnames('gradation-editor', className, {
          block,
          disabled
        })}
      >
        <div
          ref={this.preview}
          className="gradation-editor-preview"
          style={{ background: gradient }}
        >
          {value.map(point => {
            let id = this.map.get(point);
            if (!id) {
              id = this.counter++;
              this.map.set(point, id);
            }
            return (
              <Handle
                disabled={disabled}
                key={id}
                stopId={id}
                value={point}
                numStops={this.props.value.length}
                onUpdate={this.handleColorStopUpdate}
                onRemove={this.handleColorStopRemove}
              />
            );
          })}
        </div>
        <div
          className={classnames('gradation-editor-add-area', { disabled })}
          onClick={this.handleAddColorStop}
        />
      </StyledDiv>
    );
  }
}

/**
 * Calculates the interpolated color of the given position.
 * @param gradation The gradation definition.
 * @param position The position from 0 to 1
 * @returns The 8-digit hex color string like `#ffffffff`.
 */
export const gradationColorAt = (gradation: Gradation, position: number) => {
  if (!Array.isArray(gradation) || gradation.length == 0) {
    throw new TypeError('Invalid gradation object.');
  }
  const numSteps = gradation.length;
  let i = -1;
  while (i < numSteps - 1 && gradation[i + 1].position < position) i++;
  if (i === -1) {
    return gradation[0].color; // more left than first
  }
  if (i === numSteps - 1) {
    return gradation[numSteps - 1].color; // more right than last
  }
  const left = gradation[i];
  const right = gradation[i + 1];
  const p = (position - left.position) / (right.position - left.position);
  const mix = tinycolor.mix(left.color, right.color, p * 100);
  return mix.toHex8String();
};

/**
 * Builds a list of interpolated colors as a typed array.
 * @param gradation The gradation definition.
 * @param steps The length of the resulting array.
 * @returns The built array.
 */
export const buildGradationSteps = (gradation: Gradation, steps = 256) => {
  const result = new Uint32Array(steps);
  for (let i = 0; i < steps; i++) {
    const color = gradationColorAt(gradation, i / (steps - 1));
    result[i] = parseInt(color.substring(1), 16);
  }
  return result;
};
