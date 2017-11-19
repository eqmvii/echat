import React, { Component } from 'react';

// equivalent versions of writing this react component
/*
const ReduxTest = ({ counter, onClickUp, onClickDown }) => (
    <div className="text-center">
        <p>- - - - - - - - - - - - - - - - - - - - </p>
        <h1>Redux Test</h1>
        <p><button onClick={onClickUp} className="btn btn-primary">Increase Counter</button></p>
        <p><button onClick={onClickDown} className="btn btn-primary">Decrease Counter</button></p>
        <p>Counter: {counter}</p>
    </div>
)
*/

class ReduxTest extends Component {
    render() {
        return (
            <div className="text-center">
                <p>- - - - - - - - - - - - - - - - - - - - </p>
                <h1>Redux Test</h1>
                <p><button onClick={this.props.onClickUp} className="btn btn-primary">Increase Counter</button></p>
                <p><button onClick={this.props.onClickDown} className="btn btn-primary">Decrease Counter</button></p>
                <p>Counter: {this.props.counter}</p>
            </div>
        );
    }
}

/*
class ReduxTest extends Component {
    constructor(props) {
        super(props);

        // bind handle functions
        this.handleClick = this.handleClick.bind(this);

        // set initial state
        this.state = {counter: 0};
    }

    handleClick() {
        this.setState({counter: this.state.counter + 1});
    }

    render() {
        return (
            <div className="text-center">
                <h1>This is the redux test container</h1>
                <p>It contains very little right now.</p>
                <p>
                    <button 
                        className="btn btn-primary" 
                        onClick={this.handleClick} 
                    >
                    Exciting Button
                    </button>
                </p>
                <h2>Counter: {this.state.counter}</h2>
            </div>
        )
    }
}
*/

export default ReduxTest;