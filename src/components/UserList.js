import React, { Component } from 'react';

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
        </div>
      )
    }
  }

  export default UserList;