import initialState from './initialState.js';

// default to initial app state
const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'TEST_COUNTER_UP':
            return Object.assign({}, state, { counter: state.counter + 1 })
            break;
        case 'TEST_COUNTER_DOWN':
            return Object.assign({}, state, { counter: state.counter - 1 })
            break;
        case 'FASTER_REFRESH':
            var old_rate = state.refresh_rate;
            var new_rate = old_rate;
            if (old_rate >= 201) {
                new_rate -= 100;
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
            return Object.assign({}, state, { refresh_rate: new_rate })
            break;
        case 'SLOWER_REFRESH':
            var old_rate = state.refresh_rate;
            var new_rate = old_rate;
            if (old_rate <= 5000) {
                new_rate += 100;
            }
            // console.log("$REDUX: Slow down!");
            return Object.assign({}, state, { refresh_rate: new_rate })
            break;
        case 'HTTP_TOGGLE':
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
            break;
        case 'UPDATE_USER_LIST':
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
            break;
        case 'FETCH_USERS':
            // console.log("@~@~@~@~@~@ FETCH USERS  REDUCER CALLED");
            // console.log(action);
            return state;
            break;
        case 'TOGGLE_DEBUG_MODE':
            // console.log("@~@~@~ Toggle Debug Mode ~@~@~@~@");
            var new_debug_mode = !state.debug_mode;
            return Object.assign({}, state, { debug_mode: new_debug_mode });
            break;
        case 'LOGIN':
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
            break;
        case 'LOGOUT':
            // this.setState({ username: false, messages: [], nameInput: '', chatInput: '', users: [], logged_in: false });
            return Object.assign({}, state, { username: false, messages: [], logged_in: false });
            break;
        case 'REFRESH':
            // this.setState({ messages: res.rows.reverse(), max_id: max_id });
            // dispatch(refreshMessages(res.rows.reverse(), max_id));
            // console.log("Refresh Reducer Switch Called");
            // console.log(action);
            return Object.assign({}, state, { messages: action.messages, max_id: action.max_id });
            break;
        case 'HTTP_COUNTER_UP':
            var old_requests = state.request_counter;
            return Object.assign({}, state, { request_counter: old_requests + 1 });
            break;
        case 'CLEAR_MESSAGES':
            // this.setState({ max_id: 0 })
            return Object.assign({}, state, { max_id: 0 });
            break;
        case 'CLEAR_USERS':
            // no state change needed, but action exists for logging purposes
            return state;
            break;
        default:
            return state
    }

};

export default rootReducer;