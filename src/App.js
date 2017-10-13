import React, { Component } from 'react';
import './App.css';

// object filled with debug variables
// Use dbv.log for all logging, and 
var dbv = {
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
            maxLength="20"

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

    this.state = { username: false, messages: [], nameInput: '', chatInput: '' }
  }

  handleNameTyping(event) {
    this.setState({ nameInput: event.target.value })
  }

  handleChatTyping(event) {
    this.setState({ chatInput: event.target.value })
  }

  handleLogin(event) {
    event.preventDefault();
    this.setState({ username: this.state.nameInput });
    dbv.log("Login pressed!");

    // send login info to the backend server
    fetch('/login', { method: "POST", body: JSON.stringify(this.state.nameInput) })
      .then(res => { res.json(); console.log(res); });
  }

  handleLogout() {
    this.setState({ username: false, nameInput: '' });
    dbv.log("Logout pressed!");
  }

  handleChatSend(event) {
    event.preventDefault();
    // alert("Message to be sent: " + this.state.chatInput);
    // copy the entire old state array of messages
    let msgList = this.state.messages.slice();
    msgList.push(this.state.chatInput);
    this.setState({ messages: msgList, chatInput: '' })
    dbv.log(msgList);
  }

  render() {
    // Conditional rendering fork: 
    // not logged in -> login screen
    // logged in -> chat application
    if (this.state.username) {
      return (
        <div>
          <ChatHeader handleLogout={this.handleLogout} />
          <UserList users={this.state.username} />
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
        <h1>echat <button className="btn btn-danger" onClick={this.props.handleLogout}>Logout</button> </h1>
      </div>
    )
  }
}

class UserList extends Component {
  render() {
    return (
      <div>
        <div className="alert alert-success"><strong>Current users: </strong>{this.props.users}</div>
        <br />
      </div>
    )
  }
}

class Chatroom extends Component {
  render() {

    // If no messages yet, render nothing
    if (this.props.messages.length === 0) {
      return (<div><br /><br /><br /></div>);
    }

    // tag and render the list of messages
    // TODO: Make the key the messages unique key from the db
    var messagesToDisplay = [];
    for (let i = 0; i < this.props.messages.length; i++) {
      let newMessage = (<li key={i}>{this.props.messages[i]}</li>);
      messagesToDisplay.push(newMessage);
    }
    return (
      <div>
        <ul>
          {messagesToDisplay}
        </ul>
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


// stateless container component for the entire application
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

          <div className="col-xs-2"><br /><br /><br />Left gutter</div>
          <div className="col-xs-8">
            <br />
            <ChatApp />
            <br />
            <br />
            <p className="text-center">Hello, world! React is rendering this JSX code.</p>
            <p className="text-center">Server response: {this.state.data} </p>
          </div>

          <div className="col-xs-2"><br /><br /><br />Right gutter</div>

        </div>
        <div className="row">

          <div className="col-xs-2"></div>

          <div className="col-xs-8">
            Made by <a href="https://github.com/eqmvii">eqmvii</a>
          </div>

          <div className="col-xs-2"></div>

        </div>

      </div>
    );
  }
}

export default App;
