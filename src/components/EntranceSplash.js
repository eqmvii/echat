import React, { Component } from 'react';

// component to render the introduction / login screen
class EntranceSplash extends Component {
    render() {
      var error_message = (<div></div>);
      if (this.props.login_error !== false) {
        error_message = <div className="alert alert-danger"><strong>Error:</strong> {this.props.login_error}</div>
      }
      return (
        <div className="text-center">
          <h2>Welcome to <strong><span id="e">e</span><span id="c">c</span><span id="h">h</span><span id="a">a</span><span id="t">t</span></strong> </h2>
          {error_message}
          <br />
          <br />
          <form onSubmit={this.props.handleLogin}>
          <label>Chose a username: </label>
          <br />
            <input
              type="text"
              value={this.props.nameInput}
              onChange={this.props.handleNameTyping}
              maxLength="12"
            />
            <br />
            <br />
            <button type="submit" className="btn btn-success btn-lg" ><strong>Enter Chat</strong></button>
          </form>
          <br />
          <br />
        </div>
      )
    }
  }

export default EntranceSplash;