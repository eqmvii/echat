// default state that the echat is initialized with, and also used for testing

// let timestamp = new Date();

export default {
    max_messages: 14,
    username: false,
    messages: [],
    nameInput: '',
    chatInput: '',
    users: [],
    logged_in: false,
    login_error: false,
    refresh_rate: 250,
    max_id: 0,
    request_counter: -1,
    debug_mode: false,
    refresh_mode: 1,
    refresh_name: ["DDOS", "Long Polling"],
    counter: 0
  };

  // user objects, in case having them is helpful for testing:
  // {username: "Initial State User #1", stamp: timestamp, id: 0}, {username: "Initial State User #2", stamp: timestamp, id: -1}