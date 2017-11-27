import initialState from './initialState.js';
import * as types from '../constants/actionTypes.js';


// default to initial app state
const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.TEST_COUNTER_UP:
            return Object.assign({}, state, { counter: state.counter + 1 })
        case types.TEST_COUNTER_DOWN:
            return Object.assign({}, state, { counter: state.counter - 1 })
        case types.FASTER_REFRESH:
            var old_rate_fast = state.refresh_rate;
            var new_rate_fast = old_rate_fast;
            if (old_rate_fast >= 201) {
                new_rate_fast -= 100;
            }
            // TODO: Find somehow else to make this logic work
            // if app is in DDOS mode, clear the setInterval and start a new one at the new rate
            /*
           if (state.refresh_mode === 0) {
               clearInterval(this.refresh_interval);
               this.refresh_interval = setInterval(() => this.refresh(), old_rate - 100);
           }
           */
            // console.log("$REDUX: Sped up!");
            //return {counter: state.counter - 1};
            return Object.assign({}, state, { refresh_rate: new_rate_fast })
        case types.SLOWER_REFRESH:
            var old_rate_slow = state.refresh_rate;
            var new_rate_slow = old_rate_slow;
            if (old_rate_slow <= 5000) {
                new_rate_slow += 100;
            }
            // console.log("$REDUX: Slow down!");
            return Object.assign({}, state, { refresh_rate: new_rate_slow })
        case types.HTTP_TOGGLE:
            // console.log("HTTP Toggle pressed...");
            var new_mode;
            if (state.refresh_mode === 0) {
                new_mode = 1;
            }
            else {
                new_mode = 0;
            }
            // console.log(`Old mode: ${state.refresh_mode}. New mode: ${new_mode}`);
            return Object.assign({}, state, { refresh_mode: new_mode })
        case types.UPDATE_USER_LIST:
            // console.log("@~@~@~@~@~@ USER LIST UPDATE REDUCER CALLED");
            // console.log(action);
            // Merge new list of users into old list of users
            if (action.error === false) {
                return Object.assign({}, state, { users: action.payload });
            }
            else {
                console.log(action.error_message);
                return Object.assign({}, state, { users: [{ username: "Error pulling user list... server connection issue? " }] });
            }
        case types.FETCH_USERS:
            // console.log("@~@~@~@~@~@ FETCH USERS  REDUCER CALLED");
            // console.log(action);
            return state;
        case types.TOGGLE_DEBUG_MODE:
            // console.log("@~@~@~ Toggle Debug Mode ~@~@~@~@");
            var new_debug_mode = !state.debug_mode;
            return Object.assign({}, state, { debug_mode: new_debug_mode });
        case types.LOGIN:
            if (action.error === false && action.done === true) {
                // this.setState({ username: username, logged_in: true, max_id: 0, login_error: false, nameInput: '' });
                return Object.assign({}, state, { username: action.username, logged_in: true, max_id: 0, login_error: false });
            }
            else if (action.error){
                return Object.assign({}, state, { login_error: action.status });                
            }
            else {
                return state;
            }
        case types.LOGOUT:
            // this.setState({ username: false, messages: [], nameInput: '', chatInput: '', users: [], logged_in: false });
            return Object.assign({}, state, { username: false, messages: [], logged_in: false });
        case types.REFRESH:
            // this.setState({ messages: res.rows.reverse(), max_id: max_id });
            // dispatch(refreshMessages(res.rows.reverse(), max_id));
            // console.log("Refresh Reducer Switch Called");
            // console.log(action);
            return Object.assign({}, state, { messages: action.messages, max_id: action.max_id });
        case types.HTTP_COUNTER_UP:
            var old_requests = state.request_counter;
            return Object.assign({}, state, { request_counter: old_requests + 1 });
        case types.CLEAR_MESSAGES:
            // this.setState({ max_id: 0 })
            return Object.assign({}, state, { max_id: 0 });
        case types.CLEAR_USERS:
            // no state change needed, but action exists for logging purposes
            return state;
        default:
            return state
    }

};

export default rootReducer;