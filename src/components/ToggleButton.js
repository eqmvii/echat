import React, { Component } from 'react';

class ToggleButton extends Component {
    render() {
      return (
        <button onClick={this.props.handleDebugMode} className="btn btn-info">Toggle Debug Mode</button>
      )
    }
  }

export default ToggleButton;