// App.js - frontend for echat
// A simple chat application in React
// With a Node/Express/PostgreSQL backend 
// By eqmvii - https://github.com/eqmvii
// TODO: Try socket.io for websocket, try webworker for auto refresh

import React, { Component } from 'react';
import './App.css';

// object filled with debug variables
// Use dbv.log for all non-error logging, 
// toggle debugmode (dbm) for production
var dbv = {
  refresh_modes: ['DDOS', 'Long Polling'],
  refresh_mode: 1,
  refresh_rate: 350,
  dbm: true,
  logged_in: false,
  username: "Eric",
  max_messages: 16,
  log: function (message) {
    if (this.dbm) {
      console.log(message);
    }
  },
  slower: function () {
    if (this.refresh_rate <= 5000) {
      this.refresh_rate += 100;
    }
    console.log("Slowed down! Now at: " + this.refresh_rate);
  },
  faster: function () {
    if (this.refresh_rate >= 201) {
      this.refresh_rate -= 100;
    }
  }
}

dbv.log("Logging is enabled.");
if (dbv.logged_in) {
  dbv.log("You are logged in!");
}

// component to render the introduction / login screen
class EntranceSplash extends Component {
  constructor(props) {
    super(props);
    // bind handle functions
    //this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { inputval: '' }
  }

  render() {
    var error_message = (<div></div>);
    if (this.props.login_error !== false) {
      error_message = <div className="alert alert-danger"><strong>Error:</strong> {this.props.login_error}</div>
    }
    return (
      <div className="text-center">
        <h3>Welcome to echat! </h3>
        {error_message}
        <br />
        <form onSubmit={this.props.handleLogin}>
          <input
            type="text"
            value={this.props.nameInput}
            onChange={this.props.handleNameTyping}
            maxLength="12"
          />
          <br />
          <br />
          <button type="submit" className="btn btn-primary btn-large" >Enter echat</button>
        </form>
      </div>
    )
  }
}

// master stateful component that tracks everything and passes change functions
class ChatApp extends Component {
  constructor(props) {
    super(props);
    // bind handle functions
    this.handleLogin = this.handleLogin.bind(this);
    this.handleNameTyping = this.handleNameTyping.bind(this);
    this.handleChatTyping = this.handleChatTyping.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleChatSend = this.handleChatSend.bind(this);
    this.handleClearMessages = this.handleClearMessages.bind(this);
    this.handleClearUsers = this.handleClearUsers.bind(this);
    this.handleSlower = this.handleSlower.bind(this);
    this.handleFaster = this.handleFaster.bind(this);
    this.longPoll = this.longPoll.bind(this);
    this.handleHTTPToggle = this.handleHTTPToggle.bind(this);
    this.handleDebugMode = this.handleDebugMode.bind(this);

    this.state = {
      username: false,
      messages: [],
      nameInput: '',
      chatInput: '',
      users: [],
      logged_in: false,
      login_error: false,
      refresh_rate: dbv.refresh_rate,
      max_id: 0,
      request_counter: 0,
      debug_mode: dbv.dbm
    }

  }

  handleDebugMode() {
    dbv.dbm = !dbv.dbm;
    this.setState({debug_mode: dbv.dbm});
  }

  // switch between DDOS and long-polling
  handleHTTPToggle() {
    // If current mode is DDOS:
    if (dbv.refresh_mode === 0) {
      dbv.refresh_mode = 1;
      clearInterval(this.refresh_interval);
      this.longPoll();
    }
    // If current mode is long-polling: 
    else if (dbv.refresh_mode === 1) {
      dbv.refresh_mode = 0;
      // start DDOS
      this.refresh_interval = setInterval(
        () => this.refresh(),
        dbv.refresh_rate
      );
    }
  }

  handleSlower() {
    dbv.slower();
    if (dbv.refresh_mode === 0) {
      clearInterval(this.refresh_interval);
      this.refresh_interval = setInterval(() => this.refresh(), dbv.refresh_rate);
    }
    this.setState({ refresh_rate: dbv.refresh_rate });
  }

  handleFaster() {
    dbv.faster();
    if (dbv.refresh_mode === 0) {
      clearInterval(this.refresh_interval);
      this.refresh_interval = setInterval(() => this.refresh(), dbv.refresh_rate);
    }
    this.setState({ refresh_rate: dbv.refresh_rate });
  }

  handleNameTyping(event) {
    this.setState({ nameInput: event.target.value })
  }

  handleChatTyping(event) {
    this.setState({ chatInput: event.target.value })
  }

  // TODO: Add this kind of error handling elsewhere 
  handleLogin(event) {
    event.preventDefault();
    dbv.log("Login pressed!");
    // strip white space from username, distinguishes bot messags from user messages
    var username = this.state.nameInput.replace(/ /g, '');
    sessionStorage.setItem('username', username);
    // send login info to the backend server
    fetch('/login', { method: "POST", body: JSON.stringify({ username: username }) })
      .then(res => {
        if (res.ok) {
          return res.json()
        } else { throw Error(res.statusText) }
      }
      )
      .then(res => {
        // if (!res){ return false}
        if (res.duplicate === false) {
          this.setState({ username: username, logged_in: true, max_id: 0, login_error: false, nameInput: '' });
          this.longPoll();
        } else {
          this.setState({ login_error: 'Username already taken', nameInput: '' });
        }
      }).catch(error => console.log(error))
      ;

  }

  handleLogout() {
    var delete_name = this.state.username;

    // Send logout to the server
    fetch('/logout', { method: "POST", body: JSON.stringify({ username: delete_name }) })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else { throw Error(res.statusText) }
      }).catch(error => console.log(error));

    this.setState({ username: false, messages: [], nameInput: '', chatInput: '', users: [], logged_in: false });

    sessionStorage.removeItem('username');
    dbv.log("Logout pressed!");
  }

  handleChatSend(event) {
    event.preventDefault();
    // dbv.log("handleChatSend was called!");
    dbv.log(this.state.chatInput);
    let message = this.state.chatInput;
    let username = this.state.username;

    /*
    // Front-end only message list population
    // This might cause weird bugs in message list order
    // Or it might work just fine!
    let msgList = this.state.messages.slice();
    msgList.push({ message: this.state.chatInput, stamp: Date.now(), username: username });
    this.setState({ messages: msgList, chatInput: '' })
    dbv.log(msgList);
    */

    // send posted message info to the backend server
    fetch('/postmessage', { method: "POST", body: JSON.stringify({ message: message, username: username }) })
      .then(res => {
        if (res.ok) {
          this.setState({ chatInput: '' });
        } else { throw Error(res.statusText) }
      }).catch(error => console.log(error));
  }

  handleClearMessages() {
    fetch('/clearhistory')
      .then(res => {
        if (res.ok) {
          this.setState({ max_id: 0 })
        }
        else { throw Error(res.statusText) }
      }).catch(error => console.log(error));
  }

  handleClearUsers() {
    fetch('/clearusers')
      .then(res => {
        if (!res.ok) {
          throw Error(res.statusText)
        }
      }).catch(error => console.log(error));
  }

  componentWillMount() {
    // Check to see if user already logged in
    var stored_username = sessionStorage.getItem('username');
    dbv.log("Session username stored as: ");
    dbv.log(stored_username);
    // get refresh going is user leaves and comes back
    if (stored_username) {
      if (dbv.refresh_mode === 0) {
        // start DDOS
        this.refresh_interval = setInterval(
          () => this.refresh(),
          dbv.refresh_rate
        );
      } else if (dbv.refresh_mode ===1) {
        this.longPoll();
      }
      this.setState({ username: stored_username, logged_in: true, max_id: 0 });
    }
  }

  // Currenlt uses dumb short horrible polling
  // TODO: Use long polling, explore socket.io
  refresh() {

    // Don't fetch messages if not logged in
    if (!this.state.logged_in) {
      dbv.log("Not logged in; not fetching getting data");
      //dbv.log(this.state.logged_in);
      return;
    }
    // track requests
    var prior_counter = this.state.request_counter;
    prior_counter += 1;
    this.setState({ request_counter: prior_counter });
    //dbv.log("Tick...");
    // get recipe data from the server asynchronously, state will refresh when it lands
    var refresh_route = '/getmessages?max_id=';
    refresh_route += this.state.max_id;
    refresh_route += "&username=";
    refresh_route += this.state.username;
    dbv.log(refresh_route);
    fetch(refresh_route)
      .then(res => {
        if (res.ok) {
          return res.json()
        } else { throw Error(res.statusText) }
      }
      )
      //.then(res => { dbv.log(res); this.setState({ data: res }) })
      .then(res => {
        dbv.log("refresh response object:");
        dbv.log(res);
        // if the logout command was send, logout
        if (res.logout) {
          dbv.log("Logout command received!");
          //this.setState({logged_in: false, username: false, max_id: 0});
          this.setState({ login_error: "Logged out due to inactivity" });
          this.handleLogout();
          return;
        }

        // If there are new messages, add them to React's state
        if (res.update) {
          var max_id;
          if (res.rows.length > 0) {
            max_id = res.rows[0].id;
          } else {
            max_id = 0;
          }
          this.setState({ messages: res.rows.reverse(), max_id: max_id });
        }
        // dbv.log("Max id is: " + max_id);
        else {
          dbv.log("No new messages from the server or no messages at all");
          // Make sure client shows blank screen if screen recently refreshed
          if (this.state.max_id === 0) {
            this.setState({ messages: [] });
            dbv.log("Set messages state to empty array");
          }
        }
      }).catch(error => console.log(error));
    //.then(() => dbv.log(this.state));

    fetch('/getusers')
      .then(res => {
        if (res.ok) {
          return res.json()
        } else { throw Error(res.statusText) }
      })
      //.then(res => { dbv.log(res); this.setState({ data: res }) })
      .then(res => {
        this.setState({ users: res });
      }).catch(error => console.log(error));
  }

  longPoll() {
    // Don't fetch messages if not logged in
    if (!this.state.logged_in) {
      dbv.log("Not logged in; not longfetching data");
      //dbv.log(this.state.logged_in);
      setTimeout(this.longPoll, dbv.refresh_rate);
      return;
    }
    var prior_counter = this.state.request_counter;
    prior_counter += 1;
    this.setState({ request_counter: prior_counter });

    fetch('/getusers')
      .then(res => {
        if (res.ok) {
          return res.json()
        } else {
          throw Error(res.statusText)
        }
      })
      //.then(res => { dbv.log(res); this.setState({ data: res }) })
      .then(res => {
        this.setState({ users: res });
      }).catch(error => console.log(error));

    dbv.log("Attempting long polling FC!");
    // fetch longpoll route
    var refresh_route = '/getmessageslong?max_id=';
    refresh_route += this.state.max_id;
    refresh_route += "&username=";
    refresh_route += this.state.username;
    dbv.log(refresh_route);
    fetch(refresh_route)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          dbv.log("Server is super broken");
          throw Error(res.statusText);
        }
      })
      .then(res => {
        dbv.log("Received a longpoll response!");
        dbv.log(res);

        // if the logout command was send, logout
        if (res.logout) {
          dbv.log("Logout command received!");
          //this.setState({logged_in: false, username: false, max_id: 0});
          this.setState({ login_error: "Logged out due to inactivity" });
          this.handleLogout();
          return;
        }

        // If the response is an update
        if (res.update) {
          var max_id;
          if (res.rows.length > 0) {
            max_id = res.rows[0].id;
          } else {
            max_id = 0;
          }
          this.setState({ messages: res.rows.reverse(), max_id: max_id });
        }

        // test code only
        this.setState({ max_id: res.max_id });

        setTimeout(this.longPoll, dbv.refresh_rate);
      })
      .catch(error => console.log(error));

  }

  componentDidMount() {
    if (dbv.refresh_mode === 0) {
      this.refresh_interval = setInterval(
        () => this.refresh(),
        dbv.refresh_rate
      );
    } else if (dbv.refresh_mode === 1) {
      dbv.log("Component mounted, set to long polling though");
    }
  }

  componentWillUnmount() {
    clearInterval(this.refresh_interval);
  }

  render() {
    // Conditional rendering fork: 
    // not logged in -> login screen
    // logged in -> chat application
    if (this.state.username) {
      return (
        <div>
          <ChatHeader
            handleLogout={this.handleLogout}
            user={this.state.username}
          />
          <UserList users={this.state.users} />
          <Chatroom messages={this.state.messages} />
          <ChatTextInput
            handleChatTyping={this.handleChatTyping}
            handleChatSend={this.handleChatSend}
            chatInput={this.state.chatInput}
          />
          <br />
          <br />
          <ControlBar
            handleClearMessages={this.handleClearMessages}
            handleClearUsers={this.handleClearUsers}
            handleLogout={this.handleLogout}
            parent_state={this.state}
            handleSlower={this.handleSlower}
            handleFaster={this.handleFaster}
            handleHTTPToggle={this.handleHTTPToggle}
          />
          <div className="text-center">
            <br />
            <ToggleButton handleDebugMode={this.handleDebugMode}/>
          </div>
        </div>
      )

    }
    // otherwise, by default, render the login component
    return (
      <EntranceSplash
        handleLogin={this.handleLogin}
        handleNameTyping={this.handleNameTyping}
        nameInput={this.state.nameInput}
        login_error={this.state.login_error}
      />);
  }

}

class ChatHeader extends Component {
  render() {
    return (
      <div>
        <h1>Welcome to echat, {this.props.user}! <button className="btn btn-danger pull-right" onClick={this.props.handleLogout}>Logout</button> </h1>
      </div>
    )
  }
}

class ToggleButton extends Component {
  render() {
    return (
      <button onClick={this.props.handleDebugMode} className="btn btn-info">Toggle Debug Mode</button>
    )
  }
}

class ControlBar extends Component {
  render() {
    if (this.props.parent_state.debug_mode) {
      return (<div>
        <div className="text-center btn-toolbar">
          <button className="btn btn-primary" onClick={this.props.handleClearMessages}>Clear Chat</button>
          <button className="btn btn-secondary" onClick={this.props.handleLogout}>Logout</button>
          <button className="btn btn-warning" onClick={this.props.handleClearUsers}>Logout All</button>
          <button className="btn btn-danger" onClick={this.props.handleSlower}>Slower Refresh</button>
          <button className="btn btn-success" onClick={this.props.handleFaster}>Faster Refresh</button>
          <button className="btn btn-info" onClick={this.props.handleHTTPToggle}>Toggle DDOS/Long-Polling</button>
        </div>
        <div className="text-center">
          <br />
          <h3>Debug Information (open console for more)</h3>
          <ul className="text-left">
            <li><strong>HTTP refresh requests:</strong> {this.props.parent_state.request_counter}</li>
            <li><strong>Refresh mode:</strong> {dbv.refresh_modes[dbv.refresh_mode]}</li>
            <li><strong>Refresh every: </strong> {this.props.parent_state.refresh_rate / 1000} seconds </li>
            <li><strong>Your username:</strong> {this.props.parent_state.username}</li>
            <li><strong>Messages:</strong> {this.props.parent_state.messages.length}</li>
            <li><strong>Users:</strong> {this.props.parent_state.users.length}</li>
            <li><strong>Highest message ID:</strong> {this.props.parent_state.max_id}</li>
          </ul>
          <br />
        </div>
      </div>
      )
    }
    else { return false }
  }
}

class UserList extends Component {
  render() {
    var user_display_list = '';
    for (let i = 0; i < this.props.users.length; i++) {
      user_display_list += this.props.users[i].username;
      if (i < (this.props.users.length - 1)) {
        user_display_list += ', ';
      }

    }
    return (
      <div>
        <div className="alert alert-success"><strong>Current users: </strong>{user_display_list}</div>
        <br />
      </div>
    )
  }
}

class Chatroom extends Component {
  render() {
    var padding = dbv.max_messages - this.props.messages.length;
    var message_list = this.props.messages.slice();

    // If no messages yet, render nothing
    if (this.props.messages.length < dbv.max_messages) {
      // return (<div><br /><br /><br /></div>);
      for (let i = 0; i < padding; i++) {
        // dbv.log("doing padding");
        message_list.push({ username: '', message: '' });
      }
    }

    // truncate!
    var truncate = this.props.messages.length - dbv.max_messages;
    if (this.props.messages.length > dbv.max_messages) {
      for (let i = 0; i < truncate; i++) {
        message_list.shift();
      }
    }


    // tag and render the list of messages
    // TODO: Make the key the messages unique key from the db
    var messagesToDisplay = [];
    var newMessage, time, time_formatted;
    for (let i = 0; i < message_list.length; i++) {
      if (message_list[i].message !== '') {
        time = new Date(message_list[i].stamp);
        //dbv.log(time);
        // time_formatted = time.getHours() + ":" + time.getMinutes() + " ";
        time_formatted = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " ";
        newMessage = (<div key={i}>{time_formatted}&#60;<strong>{message_list[i].username}</strong>&#62; {message_list[i].message}</div>);
      }
      else {
        //newMessage = (<div key={i}>| {message_list[i]}</div>);
        newMessage = (<br key={i} />);
      }


      // dbv.log(newMessage);
      messagesToDisplay.push(newMessage);
    }
    return (
      <div id="chatroom">

        {messagesToDisplay}

        <br />
      </div>
    )
  }
}

class ChatTextInput extends Component {
  render() {
    return (
      <div>
        <form onSubmit={this.props.handleChatSend}>
          <label>Message</label>
          <input
            type="text"
            value={this.props.chatInput}
            onChange={this.props.handleChatTyping}
            maxLength="80"
          ></input>
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    )
  }
}


// container component for the entire application
class App extends Component {
  constructor(props) {
    super(props); // required in the constructor of a React component
    this.state = { data: "No request/response from the server yet..." };

    // bind this for use in below callback
    // Not using an arrow function to preserve readability 
    var that = this;

    // test connection to the server by fetching data to display
    fetch('/test')
      .then(function (res) {
        if (res.ok) {
          return res.json();
        } else {
          throw Error(res.statusText)
        }
      })
      .then(function (res) {
        dbv.log(res);
        that.setState({ data: res });
      }).catch(error => console.log(error));
  }

  render() {
    return (
      <div className="container">
        <div className="row">

          <div className="col-xs-2"></div>
          <div className="col-xs-8">
            <br />
            <ChatApp />
            <br />
          </div>

          <div className="col-xs-2"></div>

        </div>
        <div className="row">

          <div className="col-xs-2"></div>

          <div className="col-xs-8">
            <p className="text-center">Made by <a href="https://github.com/eqmvii">eqmvii</a>. Server test: {this.state.data}.</p>
          </div>

          <div className="col-xs-2"></div>

        </div>

      </div>
    );
  }
}

export default App;
