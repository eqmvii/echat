let timestamp = new Date();

export default {
    max_messages: 16,
    username: "Initial State Username",
    messages: [],
    nameInput: '',
    chatInput: '',
    users: [{username: "Initial State User #1", stamp: timestamp, id: 0}, {username: "Initial State User #2", stamp: timestamp, id: -1}],
    logged_in: false,
    login_error: false,
    refresh_rate: 250,
    max_id: 0,
    request_counter: 0,
    debug_mode: true,
    refresh_mode: 1,
    refresh_name: ["DDOS", "Long Polling"],
    counter: 0
  };