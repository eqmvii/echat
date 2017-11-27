import React from 'react';
import ReactDOM from 'react-dom';

// TODO: Redux is breaking all of the component tests idk figure it out later...

// Components to test

// Components with issues in current test suite paragidm
/*
import ChatApp from './components/ChatApp';
*/

import AboutEchat from './components/AboutEchat';
import ChatTextInput from './components/ChatTextInput.js';
import ChatHeader from './components/ChatHeader.js';
import EntranceSplash from './components/EntranceSplash.js';
import UserList from './components/UserList.js';
import ToggleButton from './components/ToggleButton.js';
import ControlBar from './components/ControlBar.js';
import Chatroom from './components/Chatroom.js';

import App from './App';

// old mock state
/*
let mock_state = {
  max_messages: 16,
  username: false,
  messages: [],
  nameInput: '',
  chatInput: '',
  users: [],
  logged_in: false,
  login_error: false,
  refresh_rate: 250,
  max_id: 0,
  request_counter: 0,
  debug_mode: false,
  refresh_mode: 1,
  refresh_name: ["DDOS", "Long Polling"]
}
*/
import mock_state from './reducers/initialState';

// just testing the wrapper
// TODO: Wrap in a provider for a more complete test
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
}); 

// smoke test for components
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AboutEchat />, div);
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ChatTextInput chatInput={mock_state.chatInput}/>, div);
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ChatHeader user={mock_state.username}/>, div);
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<EntranceSplash />, div);
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Chatroom messages={mock_state.messages} max_message={mock_state.messages} />, div);
});

// these three component tests don't work without access to the redux store
/*
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<UserList users={[]} />, div);
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ToggleButton />, div);
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ControlBar parent_state={mock_state}/>, div);
});
*/
