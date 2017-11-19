import React, { Component } from 'react';

class ChatHeader extends Component {
    render() {
      return (
        <div>
          <h1>Welcome to <strong><span id="e">e</span><span id="c">c</span><span id="h">h</span><span id="a">a</span><span id="t">t</span></strong> {this.props.user}! <button className="btn btn-danger pull-right" onClick={this.props.handleLogout}><span className="glyphicon glyphicon-user" aria-hidden="true"></span> Logout</button> </h1>
        </div>
      )
    }
  }

export default ChatHeader;