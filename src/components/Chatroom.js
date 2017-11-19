import React, { Component } from 'react';

class Chatroom extends Component {
    render() {
      var padding = this.props.max_messages - this.props.messages.length;
      var message_list = this.props.messages.slice();
  
      // If no messages yet, render nothing
      if (this.props.messages.length < this.props.max_messages) {
        // return (<div><br /><br /><br /></div>);
        for (let i = 0; i < padding; i++) {
          // console.log("doing padding");
          message_list.push({ username: '', message: '' });
        }
      }
  
      // truncate!
      var truncate = this.props.messages.length - this.props.max_messages;
      if (this.props.messages.length > this.props.max_messages) {
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
          //console.log(time);
          // time_formatted = time.getHours() + ":" + time.getMinutes() + " ";
          time_formatted = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " ";
          newMessage = (<div key={i}>{time_formatted}&#60;<strong>{message_list[i].username}</strong>&#62; {message_list[i].message}</div>);
        }
        else {
          //newMessage = (<div key={i}>| {message_list[i]}</div>);
          newMessage = (<br key={i} />);
        }
  
        // console.log(newMessage);
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

export default Chatroom;