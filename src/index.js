import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import './index.css';

import App from './App';
import rootReducer from './reducers/rootReducer.js';

// TODO: Remove this when testing for integration is complete
// import ReduxTestContainer from './containers/ReduxTestContainer';

// import { registerServiceWorker, unregister } from './registerServiceWorker';
import { unregister } from './registerServiceWorker';


let store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={store}>
        <App />   
    </Provider >,
    document.getElementById('root')
);

// old code that caused caching issue
// Meant updates took n+1 refreshes, which seems... insane? 
// registerServiceWorker();

// do this instead:
unregister();
