import React from 'react';

import IconButton from '../lib/IconButton';
import {
  alert,
  confirm,
  choice,
  prompt,
  modal,
  withProgressDialog
} from '../lib/modal';
import Modal from 'react-bootstrap/lib/Modal';

const onAlertClick = async () => {
  await alert('Alert!');
};

const onConfirmClick = async () => {
  const answer = await confirm('Are you sure?');
  if (answer) {
    await alert('You clicked OK');
  } else {
    await alert('You clicked Cancel');
  }
};

const onChoiceClick = async () => {
  const choices = {
    'Yes, I will delete it': { response: 'yes', style: 'danger' },
    'No, I will reconsider it': { response: 'no', style: 'default' }
  };
  const answer = await choice('Select your decision', choices, {
    cancelable: false
  });
  await alert('You selected: ' + answer);
};

const onPromptClick = async () => {
  const answer = await prompt('Input something', '', { bsSize: 'small' });
  await alert('Your input is: ' + answer);
};

const onValidatePromptClick = async () => {
  const validator = str => (str.match(/^[a-fA-F0-9]+$/) ? null : 'Invalid');
  const answer = await prompt('Input hex number', '012abc', { validator });
  await alert('Your input is: ' + answer);
};

const MyCustomDialog = props => (
  <Modal.Body>
    <h3>Hello, {props.message}</h3>
    <div className="btn-group">
      <IconButton
        icon="star"
        onClick={() => props.onResolve(10)}
        bsStyle="primary"
      >
        OK
      </IconButton>
      <IconButton
        icon="exclamation-sign"
        onClick={() => props.onReject(20)}
        bsStyle="warning"
      >
        Reject
      </IconButton>
    </div>
  </Modal.Body>
);

const onCustomClick = async () => {
  try {
    const result = await modal(
      props => <MyCustomDialog message="World" {...props} />,
      { keyboard: false, bsSize: 'small' }
    );
    alert('Resolved with ' + result);
  } catch (err) {
    alert('Rejected with ' + err);
  }
};

const fortune = ms =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (Math.random() > 0.5) resolve('Lucky!');
      else reject('Bad!');
    }, ms)
  );

const onProgressClick = async () => {
  try {
    const result = await withProgressDialog(
      'Waiting for 2 seconds...',
      fortune(2000)
    );
    await alert('Resolved with ' + result);
  } catch (err) {
    await alert('Rejected with ' + err);
  }
};

export default function ModalDemo() {
  return (
    <div>
      <h3>Standard Dialogs</h3>
      <p>
        Utility modal dialogs. These can be used similarly to standard dialogs
        like <code>alert()</code> and <code>prompt()</code>, but are
        non-blocking and have Promise support.
      </p>
      <div className="btn-group">
        <IconButton icon="alert" bsStyle="warning" onClick={onAlertClick}>
          Alert
        </IconButton>
        <IconButton
          icon="question-sign"
          bsStyle="info"
          onClick={onConfirmClick}
        >
          Confirm
        </IconButton>
        <IconButton icon="list" bsStyle="success" onClick={onChoiceClick}>
          Choice
        </IconButton>
        <IconButton icon="star" bsStyle="danger" onClick={onCustomClick}>
          Custom Dialog
        </IconButton>
        <IconButton icon="comment" bsStyle="primary" onClick={onPromptClick}>
          Prompt
        </IconButton>
        <IconButton
          icon="comment"
          bsStyle="primary"
          onClick={onValidatePromptClick}
        >
          Prompt with validation
        </IconButton>
      </div>
      <h3>Promise Wrapper</h3>
      <p>
        You can wrap any promise with this function to display a modal progress
        bar.
      </p>
      <IconButton icon="time" bsStyle="success" onClick={onProgressClick}>
        With Progress
      </IconButton>
    </div>
  );
}
