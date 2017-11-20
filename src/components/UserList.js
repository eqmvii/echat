import React, { Component } from 'react';
import { connect } from 'react-redux';


// Subscribes to the store for list of users
class UserList extends Component {
    render() {
      var user_display_list = '';
      // console.log(this.props.users);
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

  function mapStateToProps(state) {
    // console.log("UserList mapping state to props...");
    return {users: state.users}
  }

  export default connect(mapStateToProps)(UserList);