import React, { Component } from 'react';

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

export default ChatTextInput;