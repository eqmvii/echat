// A container, which uses Connect to bind the store and a component
import { connect } from 'react-redux';
import ReduxTest from '../components/ReduxTest';
import { testCounterUp, testCounterDown } from '../actions/index.js';

const mapStateToProps = state => {
    return {        
        counter: state.counter
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onClickUp: () => {
            dispatch(testCounterUp())
        },
        onClickDown: () => {
            dispatch(testCounterDown())
        }
    }
}

const ReduxTestContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ReduxTest)

export default ReduxTestContainer;