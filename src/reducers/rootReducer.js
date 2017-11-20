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
            console.log("$REDUX: Sped up!");
            //return {counter: state.counter - 1};
            return Object.assign({}, state, { refresh_rate: new_rate })
            break;
        case 'SLOWER_REFRESH':
            var old_rate = state.refresh_rate;
            var new_rate = old_rate;
            if (old_rate <= 5000) {
                new_rate += 100;
            }
            console.log("$REDUX: Slow down!");
            return Object.assign({}, state, { refresh_rate: new_rate })
            break;
        case 'HTTP_TOGGLE':
            console.log("HTTP Toggle pressed...");
            var new_mode;
            if (state.refresh_mode === 0) {
                new_mode = 1;
            }
            else {
                new_mode = 0;
            }
            console.log(`Old more: ${state.refresh_mode}. New mode: ${new_mode}`);
            return Object.assign({}, state, { refresh_mode: new_mode })
            break;
        case 'UPDATE_USER_LIST':
            console.log("@~@~@~@~@~@ USER LIST UPDATE REDUCER CALLED");
            console.log(action);
            // Merge new list of users into old list of users
            if (action.error === false){
            return Object.assign({}, state, { users: action.payload });
            }
            else {
                console.log(action.error_message);
                return Object.assign({}, state, { users: [{username: "Error pulling user list... server connection issue? "}] });                
            }           
            break;
        case 'FETCH_USERS':
            console.log("@~@~@~@~@~@ FETCH USERS  REDUCER CALLED");
            console.log(action);
            return state;
            break;
        default:
            return state
    }

};

export default rootReducer;