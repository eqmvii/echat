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
        <input type="text" value={this.props.nameInput} onChange={this.props.handleNameTyping}></input>
        <br />
        <br />
        <button type="submit" className="btn btn-primary btn-large" >Enter echat</button>
      </form>
      </div>
    )
  }
}

// Logout button for the chat, to return to the login screen
class LogoutButton extends Component {
  render() {
    return (<button className="btn btn-danger">Logout</button>);
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

    this.state = { username: false, messages: [], nameInput: '' }
  }

  handleNameTyping(event){
    this.setState({nameInput: event.target.value})
  }

  handleLogin (event) {
    event.preventDefault();
    this.setState ({username: this.state.nameInput});
    dbv.log("Login pressed!");
  }

  render() {
    // Conditional rendering fork: 
    // not logged in -> login screen
    // logged in -> chat application
    if (this.state.username) {
      return (
        <div>
          <ChatHeader />
          <UserList users={this.state.username}/>
          <Chatroom />
          <ChatTextInput />
        </div>
      )

    }
    // otherwise, by default, render the login component
    return (<EntranceSplash handleLogin={this.handleLogin} handleNameTyping={this.handleNameTyping} nameInput={this.state.nameInput}/>);
  }

}

class ChatHeader extends Component {
  render() {
    return (
      <div>
        <h1>echat <LogoutButton /> </h1>
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
    return (
      <div>
        <table>
          <tbody>
          <tr>
            <td>
              12:35pm
            </td>
            <td>
              &lt;Eric&gt; This is the first fake message!
            </td>
          </tr>
          </tbody>
        </table>
        <br />
      </div>
    )
  }
}

class ChatTextInput extends Component {
  render() {
    return (
      <div>
        <input type="text"></input><button className="btn btn-primary">Send msg</button>
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
