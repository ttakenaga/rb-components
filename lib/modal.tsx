// Utility modal dialogs.
// These can be used similarly to standard dialogs like alert() and prompt(),
// but are non-blocking and have Promise support.

import React, { useState, useRef, Fragment, useEffect, ReactNode } from 'react';
import keycode from 'keycode';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import { createRoot } from 'react-dom/client';
import Icon from './Icon';
import classnames from 'classnames';
import wrapDisplayName from './utils/wrapDisplayName';
import { Sizes } from 'react-bootstrap';

type DialogBase<T> = React.ComponentType<{
  onResolve: (value: T) => void;
  onReject: (value: any) => void;
}>;

type Dialog<T> = React.ComponentType<{
  onResolve: (value: T) => void;
  onReject: (value: any) => void;
  onExited: () => void;
  bsSize?: Sizes;
  backdrop?: string | boolean;
  className?: string;
  keyboard?: boolean;
}>;

/**
 * HoC that wraps a plain compmonent and turns it into a
 * stateful dialog that can be used with `modal`.
 */
const createDialog = <T extends any>(WrappedComponent: DialogBase<T>) => {
  const Enhanced: Dialog<T> = props => {
    const [show, setShow] = useState(true);
    const settledValue = useRef<any>();
    const isResolve = useRef<boolean>();

    const handleSettle = (resolve: boolean, value: any) => {
      setShow(false);
      settledValue.current = value;
      isResolve.current = resolve;
    };

    const handleResolve = (settledValue: any) =>
      handleSettle(true, settledValue);
    const handleReject = (settledValue: any) =>
      handleSettle(false, settledValue);
    const handleHide = () => handleSettle(true, null);

    const handleExited = () => {
      onExited();
      if (isResolve.current) {
        onResolve(settledValue.current);
      } else {
        onReject(settledValue.current);
      }
    };
    const {
      bsSize,
      backdrop,
      className,
      keyboard,
      onResolve,
      onReject,
      onExited,
      ...rest
    } = props;

    return (
      <Modal
        show={show}
        onExited={handleExited}
        onHide={handleHide}
        bsSize={bsSize}
        backdrop={backdrop}
        className={className}
        keyboard={keyboard}
      >
        <WrappedComponent
          {...rest}
          onResolve={handleResolve}
          onReject={handleReject}
        />
      </Modal>
    );
  };
  Enhanced.displayName = wrapDisplayName('Dialog', WrappedComponent);
  return Enhanced;
};

/**
 * Opens a modal dialog and returns the result via Promise.
 * @param DialogContent The dialog content component.
 *   This is a plain React component, but it will be passed
 *   `onResolve` and `onReject` props, with which you can close the dialog.
 * @returns {Promise<any>} Dialog result, usually a user response.
 */
export const modal = <T extends any>(
  DialogContent: DialogBase<T>,
  options: {
    bsSize?: Sizes;
    backdrop?: string | boolean;
    className?: string;
    keyboard?: boolean;
  }
) => {
  const { bsSize, backdrop = 'static', className, keyboard = true } = options;

  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);

    const exited = () => {
      Promise.resolve().then(() => {
        root.unmount();
        document.body.removeChild(container);
      });
    };

    const Dialog = createDialog(DialogContent);
    root.render(
      <Dialog
        onResolve={resolve}
        onReject={reject}
        onExited={exited}
        bsSize={bsSize}
        backdrop={backdrop}
        className={className}
        keyboard={keyboard}
      />
    );
  });
};

interface DialogOptions {
  title?: ReactNode;
  icon?: string;
  cancelable?: boolean;
  bsSize?: Sizes;
}

/**
 * Async version of native `alert`, with some options.
 */
export const alert = (text: ReactNode, options: DialogOptions = {}) => {
  const {
    title = 'Message',
    icon = 'info-sign',
    cancelable = true,
    bsSize
  } = options;
  const buttons = { OK: { response: true, style: 'primary', autoFocus: true } };
  return choice(text, buttons, {
    title,
    icon,
    cancelable,
    bsSize
  }) as Promise<void>;
};

/**
 * Async version of native `confirm`, with some options.
 */
export const confirm = (text: ReactNode, options: DialogOptions = {}) => {
  const {
    title = 'Confirm',
    icon = 'info-sign',
    cancelable = true,
    bsSize
  } = options;
  const buttons: Buttons = {
    OK: { response: true, style: 'primary', autoFocus: true },
    Cancel: { response: false, style: 'link' }
  };
  return choice(text, buttons, {
    title,
    icon,
    cancelable,
    bsSize
  }) as Promise<boolean>;
};

interface ButtonDef {
  response: any;
  style: string;
  autoFocus?: boolean;
}

type Buttons = { [key: string]: ButtonDef };

type Choices = string[] | { [key: string]: string | ButtonDef };

/**
 * Opens a dialog with arbitrary buttons.
 * @param text Message shown to the user.
 * @param choices Buttons to show. Can be in one of the following forms.
 *  - `[ 'Green', 'Black' ]`
 *  - `{ Green: 'gr', Black: 'bl' }`
 *  - `{ Green: { response: 'gr', style: 'primary' }, Black: { response: 'bl', style: 'warning' }}`
 * @param options Options.
 * @return The user response.
 *   Resolves with null if dialog's close button is clicked.
 */
export const choice = (
  text: ReactNode,
  choices: Choices,
  options: DialogOptions = {}
) => {
  const {
    title = 'Choose',
    icon = 'info-sign',
    cancelable = false,
    bsSize
  } = options;

  const normalizedChoices = Array.isArray(choices)
    ? (() => {
        const obj: { [key: string]: string | ButtonDef } = {};
        choices.forEach(choice => (obj[choice] = choice));
        return obj;
      })()
    : choices;

  Object.keys(normalizedChoices).forEach(key => {
    if (typeof normalizedChoices[key] !== 'object')
      normalizedChoices[key] = {
        response: normalizedChoices[key],
        style: 'default'
      };
  });
  return modal(
    props => (
      <ChoiceDialog
        text={text}
        title={title}
        icon={icon}
        closeButton={!!cancelable}
        buttons={choices as Buttons}
        {...props}
      />
    ),
    { keyboard: !!cancelable, bsSize }
  );
};

const IconOrElement: React.FC<{ icon: any }> = ({ icon }) => {
  return typeof icon === 'string' ? (
    <Fragment>
      <Icon icon={icon} />
      &ensp;
    </Fragment>
  ) : React.isValidElement(icon) ? (
    icon
  ) : null;
};

const ChoiceDialog: React.FC<{
  icon: string;
  title: ReactNode;
  text: ReactNode;
  buttons: Buttons;
  closeButton?: boolean;
  onResolve: (value: any) => void;
}> = props => {
  const { icon, title, text, buttons, closeButton = true } = props;
  return (
    <Fragment>
      <Modal.Header closeButton={closeButton}>
        <IconOrElement icon={icon} />
        {title}
      </Modal.Header>
      <Modal.Body>{text}</Modal.Body>
      <Modal.Footer>
        {Object.keys(buttons).map(key => {
          const b = buttons[key];
          return (
            <Button
              bsStyle={b.style}
              onClick={() => props.onResolve(b.response)}
              key={key}
              autoFocus={!!b.autoFocus}
            >
              {key}
            </Button>
          );
        })}
      </Modal.Footer>
    </Fragment>
  );
};

/**
 * Async version of native `propmpt`, with some options.
 * @param text The text message shown in the dialog.
 * @param value Initial value of the text box.
 * @param options Options.
 * @returns The string input by the user.
 */
export const prompt = (
  text: ReactNode,
  value?: string,
  options: DialogOptions & { password?: boolean; validator?: Function } = {}
): Promise<string | null> => {
  const {
    title = 'Input',
    icon = 'info-sign',
    password = false,
    validator,
    bsSize
  } = options;
  return modal(
    props => (
      <PromptDialog
        text={text}
        icon={icon}
        title={title}
        value={value}
        password={password}
        validator={validator}
        {...props}
      />
    ),
    { bsSize }
  ) as Promise<string | null>;
};

const PromptDialog: React.FC<{
  icon?: any;
  password?: boolean;
  title?: ReactNode;
  text: ReactNode;
  onResolve: (value: any) => void;
  value?: string;
  validator?: any;
}> = props => {
  const { icon, password, title, text, onResolve, validator } = props;
  const [value, setValue] = useState<string>(() =>
    typeof props.value === 'string' ? props.value : ''
  );

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current!.select();
  }, []);

  const validate = (value: string) => {
    if (typeof validator !== 'function') return null;
    const result = validator(value);
    return typeof result === 'string' ? result : null;
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    validate(value)
  );

  const handleChange = (event: any) => {
    const value = event.target.value;
    setValue(value);
    setErrorMessage(validate(value));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode == keycode.codes.enter) {
      handleOkClick();
    }
  };

  const handleOkClick = () => {
    if (typeof errorMessage === 'string') return;
    onResolve(value);
  };

  const isError = typeof errorMessage === 'string';

  return (
    <div>
      <Modal.Header closeButton>
        <IconOrElement icon={icon} />
        {title}
      </Modal.Header>
      <Modal.Body>
        <div className={classnames('form-group', { 'has-error': isError })}>
          <label className="control-label">{text}</label>
          <input
            type={password ? 'password' : 'text'}
            className="form-control"
            ref={inputRef}
            autoFocus
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <div className="control-label">{isError ? errorMessage : ''}</div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle="primary" disabled={isError} onClick={handleOkClick}>
          OK
        </Button>
        <Button bsStyle="link" onClick={() => onResolve(null)}>
          Cancel
        </Button>
      </Modal.Footer>
    </div>
  );
};

/**
 * Shows progress dialog when doing something.
 * @param text The message shown to the user.
 * @param task Some unsettled Promise object to wait for.
 * @returns Settles with the same value as the passed promise.
 */
export const withProgressDialog = (text: ReactNode, task: Promise<any>) => {
  return modal(props => <ProgressDialog text={text} task={task} {...props} />, {
    keyboard: false
  });
};

const ProgressDialog: React.FC<{
  onResolve: (value: any) => void;
  onReject: (value: any) => void;
  text: ReactNode;
  task: Promise<any>;
}> = props => {
  const { text, task, onResolve, onReject } = props;

  useEffect(() => {
    task.then(onResolve).catch(onReject);
  }, [onReject, onResolve, task]);

  return (
    <div>
      <Modal.Header>{text}</Modal.Header>
      <Modal.Body>
        <ProgressBar active now={100} />
      </Modal.Body>
    </div>
  );
};
