import initialState from './initialState.js';

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'TEST_COUNTER_UP':
            return { counter: state.counter + 1 };
        case 'TEST_COUNTER_DOWN':
            return {counter: state.counter - 1};
        default:
        return state
    }
    
};

export default rootReducer;