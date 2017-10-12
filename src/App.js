import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { data: "ERROR: NO SERVER RESPONSE" };  
    
    // get test data from the server asynchronously, state refreshes when it arrives
    fetch('/test')
    .then(res => res.json())
    .then(res => { this.setState({ data: res }) })

  }

  render() {
    return (
      <div className="App">
        <p>React is rendering this text. This is an update.</p>
        <p>Server response: {this.state.data} </p>

      </div>
    );
  }
}

export default App;
