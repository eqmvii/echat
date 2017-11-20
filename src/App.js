// App.js - frontend for echat
// A simple chat application in React
// With a Node/Express/PostgreSQL backend 
// By eqmvii - https://github.com/eqmvii
// TODO: Try socket.io for websocket, try webworker for auto refresh, add a chatbot (tarot card?)
// Unregister function in server.js

// library import
import React, { Component } from 'react';

// style import
import './App.css';

// component import
import ChatApp from './components/ChatApp.js';
import AboutEchat from './components/AboutEchat.js';
import ReduxTestContainer from './containers/ReduxTestContainer';


/*
// Debug variables. console.log for togglable non-error logging via dbv.dbm
var dbv = {
  refresh_modes: ['DDOS', 'Long Polling'],
  refresh_mode: 1,
  refresh_rate: 250,
  dbm: false,
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
*/

// container component for the entire application
class App extends Component {
  constructor(props) {
    super(props); // required in the constructor of a React component
    this.state = { data: "No request/response from the server yet...", ready: false };

    // bind this for use in below callback
    // Testing/using different this binding methods for learning and testing comprehension
    // var that = this;
    this.testConnection = this.testConnection.bind(this);
    this.testConnection();
  }

  testConnection() {
    // test connection to the server by fetching data to display 
    fetch('/test')
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw Error(res.statusText)
        }
      })
      .then(res => {
        console.log(res);
        this.setState({ data: res, ready: true });
      }).catch(error => {
        console.log(error);
        setTimeout(this.testConnection, 500);
      });
  }

  render() {
    if (this.state.ready === false) {
      return (<div className="jumbotron text-center">
        <h3>Page loading. PostgreSQL DB and Heroku (slowly) starting up.</h3>
        <h4>please enjoy this spinner while you wait...</h4>
        <br />
        <p><i className="fa fa-spinner fa-spin" style={{ fontSize: "38px" }}></i></p>
      </div>)
    }

    return (
      <div className="container">
        <div className="row">

          <div className="col-xs-8 col-xs-offset-2">
            <br />
            <ChatApp />
            <br />
          </div>          

        </div>
        
        <div className="row">

          <div className="col-xs-2"></div>

          <div className="col-xs-8">
            <p className="text-center">Made by <a href="https://github.com/eqmvii"><i className="fa fa-github" aria-hidden="true"></i> eqmvii</a>	&copy; 2017</p>
            <p className="text-center" style={{ visibility: "hidden" }}>Server test: {this.state.data}.</p>
            <AboutEchat />
          </div>

          <div className="col-xs-2"></div>

        </div>

      </div>
    );
  }
}

export default App;
