import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleMode, slowerRefresh, fasterRefresh } from '../actions/index.js';

class ControlBar extends Component {
  render() {
    if (this.props.parent_state.debug_mode) {
      return (<div>
        <div className="text-center btn-toolbar">
          <button className="btn btn-primary" onClick={this.props.handleClearMessages}>Clear Chat</button>
          <button className="btn btn-secondary" onClick={this.props.handleLogout}>Logout</button>
          <button className="btn btn-warning" onClick={this.props.handleClearUsers}>Logout All</button>
          <button className="btn btn-info" onClick={this.props.toggleMode}>Toggle DDOS/Long-Polling</button>
          <button className="btn btn-danger" onClick={this.props.handleSlower}>Slower Refresh</button>
          <button className="btn btn-success" onClick={this.props.handleFaster}>Faster Refresh</button>
        </div>
        <div className="text-center">
          <br />
          <h3>Debug Information (open console for more)</h3>
          <ul className="text-left">
            <li><strong>HTTP refresh requests:</strong> {this.props.parent_state.request_counter}</li>
            <li><strong>Refresh Mode:</strong> {this.props.parent_state.refresh_name[this.props.parent_state.refresh_mode]}</li>
            <li><strong>Refresh every: </strong> {this.props.parent_state.refresh_rate / 1000} seconds </li>
            <li><strong>Your username:</strong> {this.props.parent_state.username}</li>
            <li><strong>Messages:</strong> {this.props.parent_state.messages.length}</li>
            <li><strong>Users:</strong> {this.props.parent_state.users.length}</li>
            <li><strong>Highest message ID:</strong> {this.props.parent_state.max_id}</li>
          </ul>
          <br />
        </div>
      </div>
      )
    }
    else { return false }
  }
}


function mapStateToProps(state) {
  // console.log("ControlBar mapping state to props...");
  return { parent_state: state }
}

const mapDispatchToProps = dispatch => {
  return {
    handleFaster: () => {
      dispatch(fasterRefresh())
    },
    handleSlower: () => {
      dispatch(slowerRefresh())
    },
    toggleMode: () => {
      dispatch(toggleMode())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlBar);

