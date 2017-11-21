import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleDebug } from '../actions/index.js';


class ToggleButton extends Component {
  render() {
    return (<button onClick={this.props.handleDebugToggle} className="btn btn-info">Toggle Debug Menu</button>)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    handleDebugToggle: () => {
      dispatch(toggleDebug());
    }
  }
}

// provide first argument but make it null for only using dispatch
export default connect(null, mapDispatchToProps)(ToggleButton);