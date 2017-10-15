import React, { Component } from 'react';
import './App.css';

// object filled with debug variables
// Use dbv.log for all logging, and 
var dbv = {
  refresh_rate: 200,
  dbm: true,
  logged_in: false,
  username: "Eric",
  log: function (message) {
    if (this.dbm) {
      console.log(message);
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
    return (
      <div className="text-center">
        <h3>Welcome to echat! </h3>
        <br />
        <form onSubmit={this.props.handleLogin}>
          <input
            type="text"
            value={this.props.nameInput}
            onChange={this.props.handleNameTyping}
            maxLength="12"

          ></input>
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
    // this.handleSubmit = this.handleSubmit.bind(this);
    // this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleNameTyping = this.handleNameTyping.bind(this);
    this.handleChatTyping = this.handleChatTyping.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleChatSend = this.handleChatSend.bind(this);

    this.state = { username: false, messages: [], nameInput: '', chatInput: '', users: [], logged_in: false }

  }

  handleNameTyping(event) {
    this.setState({ nameInput: event.target.value })
  }

  handleChatTyping(event) {
    this.setState({ chatInput: event.target.value })
  }

  handleLogin(event) {
    event.preventDefault();
    this.setState({ username: this.state.nameInput, logged_in: true, max_id: 0 });
    dbv.log("Login pressed!");
    sessionStorage.setItem('username', this.state.nameInput);
    // send login info to the backend server
    fetch('/login', { method: "POST", body: JSON.stringify({username: this.state.nameInput}) });

  }

  handleLogout() {
    var delete_name = this.state.username;
    
    // Send logout to the server
    fetch('/logout', { method: "POST", body: JSON.stringify({ username: delete_name }) })
     .then(res => { res.json(); dbv.log(res); });

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
    // alert("Message to be sent: " + this.state.chatInput);
    // copy the entire old state array of messages
    let msgList = this.state.messages.slice();
    msgList.push(this.state.chatInput);
    this.setState({ messages: msgList, chatInput: '' })
    dbv.log(msgList);
    */


    // send posted message info to the backend server
    fetch('/postmessage', { method: "POST", body: JSON.stringify({ message: message, username: username }) })
      .then(() => (this.setState({ chatInput: '' }) ));

    

  }

  componentWillMount() {
    // Check to see if user already logged in
    var stored_username = sessionStorage.getItem('username');
    dbv.log("Session username stored as: ");
    dbv.log(stored_username);
    if (stored_username) {
      this.setState({ username: stored_username, logged_in: true, max_id: 0 });
    }
  }

  refresh() {
    // Don't fetch messages if not logged in
    if(!this.state.logged_in){
      console.log("Not logged in not getting data HMPH");
      console.log(this.state.logged_in);
      return;
    }
    //dbv.log("Tick...");
    // get recipe data from the server asynchronously, state will refresh when it lands
    var refresh_route = '/getmessages?max_id=';
    refresh_route += this.state.max_id;
    fetch(refresh_route)
      .then(res => res.json())
      //.then(res => { console.log(res); this.setState({ data: res }) })
      .then(res => {
        // dbv.log(res[0]);
        if (res.length > 0){
          var max_id = res[0].id;
          this.setState({ messages: res.reverse(), max_id: max_id });
        }
        // dbv.log("Max id is: " + max_id);
        else {
          dbv.log("No new messages from the server");
        }
      });
    //.then(() => console.log(this.state));

    fetch('/getusers')
    .then(res => res.json())
    //.then(res => { console.log(res); this.setState({ data: res }) })
    .then(res => {
      this.setState({ users: res });
    });
  }

  componentDidMount() {
    this.refresh_interval = setInterval(
      () => this.refresh(),
      dbv.refresh_rate
    );
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
        </div>
      )

    }
    // otherwise, by default, render the login component
    return (
      <EntranceSplash
        handleLogin={this.handleLogin}
        handleNameTyping={this.handleNameTyping}
        nameInput={this.state.nameInput}
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

class UserList extends Component {
  render() {
    var user_display_list = '';
    for (let i = 0; i < this.props.users.length; i++) {
      user_display_list += this.props.users[i].username;
      if (i < (this.props.users.length -1)) {
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
    // messages is an array of objects with key value pairs
    // dbv.log("Rendering the chatroom!");
    var max_messages = 20;
    // dbv.log(this.props.messages.length);
    // dbv.log(this.props.messages);
    // dbv.log("Padding: ");
    var padding = max_messages - this.props.messages.length;
    // dbv.log(padding);
    var message_list = this.props.messages.slice();

    // If no messages yet, render nothing
    if (this.props.messages.length < max_messages) {
      // return (<div><br /><br /><br /></div>);
      for (let i = 0; i < padding; i++) {
        // console.log("doing padding");
        message_list.push({ username: '', message: ''});
      }
    }

    // truncate!
    var truncate = this.props.messages.length - max_messages;
    if (this.props.messages.length > max_messages) {
      for (let i = 0; i < truncate; i++) {
        // console.log("doing truncating");
        message_list.shift();
      }

    }


    // tag and render the list of messages
    // TODO: Make the key the messages unique key from the db
    var messagesToDisplay = [];
    var newMessage;
    for (let i = 0; i < message_list.length; i++) {
      if (message_list[i].message !== '') {
        newMessage = (<div key={i}>&#60;{message_list[i].username}&#62; {message_list[i].message}</div>);
      }
      else {
        //newMessage = (<div key={i}>| {message_list[i]}</div>);
        newMessage = (<br key={i} />);
      }


      // dbv.log(newMessage);
      messagesToDisplay.push(newMessage);
    }
    return (
      <div>

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
          return "Error: Tried, but failed, to get data from the server.";
        }
      })
      .then(function (res) {
        dbv.log(res);
        that.setState({ data: res });
      })
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
