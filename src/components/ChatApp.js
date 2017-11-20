// TODO:
/*
Add back session storage functionality

*/

import React, { Component } from 'react';
import { connect } from 'react-redux';

// import components
import ChatTextInput from './ChatTextInput.js';
import ChatHeader from './ChatHeader.js';
import EntranceSplash from './EntranceSplash.js';
import UserList from './UserList.js';
import ToggleButton from './ToggleButton.js';
import ControlBar from './ControlBar.js';
import Chatroom from './Chatroom.js';

// import actions
import { fetchUsers, updateUsers, loginUser, loginComplete, loginFail, logoutUser, refreshMessages } from '../actions/index.js';


// master stateful component that tracks everything and passes change functions
class ChatApp extends Component {
    constructor(props) {
        super(props);
        // bind handle functions
        this.handleLogin = this.handleLogin.bind(this);
        this.handleNameTyping = this.handleNameTyping.bind(this);
        this.handleChatTyping = this.handleChatTyping.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.handleChatSend = this.handleChatSend.bind(this);
        this.handleClearMessages = this.handleClearMessages.bind(this);
        this.handleClearUsers = this.handleClearUsers.bind(this);
        // this.handleSlower = this.handleSlower.bind(this);
        // this.handleFaster = this.handleFaster.bind(this);
        this.longPoll = this.longPoll.bind(this);
        // this.handleHTTPToggle = this.handleHTTPToggle.bind(this);
        // this.handleDebugMode = this.handleDebugMode.bind(this);
        this.deprecated_refresh_timeout = this.deprecated_refresh_timeout.bind(this);

        // initial state configuration
        // refresh mode is either 0 (DDOS) or 1 (long polling)
        this.state = {
            max_messages: this.props.max_messages,
            username: this.props.username,
            messages: [],
            nameInput: '',
            chatInput: '',
            users: [],
            logged_in: this.props.logged_in,
            login_error: this.props.login_error,
            refresh_rate: this.props.refresh_rate,
            max_id: this.props.max_id,
            request_counter: 0,
            refresh_mode: this.props.refresh_mode,
            refresh_name: ["DDOS", "Long Polling"]
        }
    }

    // DEPRECATED
    /*
    handleDebugMode() {
        let new_debug_mode = !this.state.debug_mode;
        this.setState({ debug_mode: new_debug_mode });
    }
    */

    // DEPRECATED
    // switch between DDOS and long-polling
    /*
    handleHTTPToggle() {
        // If current mode is DDOS:
        if (this.state.refresh_mode === 0) {
            this.setState({ refresh_mode: 1 });
            // clearInterval(this.refresh_interval);
            this.longPoll();
        }
        // If current mode is long-polling: 
        else if (this.state.refresh_mode === 1) {
            this.setState({ refresh_mode: 0 });
            // start DDOS
            
            //this.refresh_interval = setInterval(
            //    () => this.refresh(),
            //    this.props.refresh_rate
            //);
            
            console.log("@#TOGGLE: REFRESH RATE: " + this.props.refresh_rate);
            setTimeout(this.deprecated_refresh_timeout, this.props.refresh_rate);
        }
    }
    */

    // DEPRECATED
    /*
    handleSlower() {
        let old_rate = this.state.refresh_rate;
        if (old_rate <= 5000) {
            this.setState({ refresh_rate: old_rate + 100 });
        }
        if (this.state.refresh_mode === 0) {
            clearInterval(this.refresh_interval);
            this.refresh_interval = setInterval(() => this.refresh(), old_rate + 100);
        }
        console.log("Slowed down!");
    }
    */

    // DEPRECATED 
    /*
    handleFaster() {
        let old_rate = this.state.refresh_rate;
        if (old_rate >= 201) {
            this.setState({ refresh_rate: old_rate - 100 });
        }
        // if app is in DDOS mode, clear the setInterval and start a new one at the new rate
        if (this.state.refresh_mode === 0) {
            clearInterval(this.refresh_interval);
            this.refresh_interval = setInterval(() => this.refresh(), old_rate - 100);
        }
        console.log("Sped up!");
    }
    */

    // TODO: Check w/ redux
    handleNameTyping(event) {
        this.setState({ nameInput: event.target.value })
    }

    // TODO: Check w/ redux
    handleChatTyping(event) {
        this.setState({ chatInput: event.target.value })
    }

    // Updated for Redux
    handleLogin(event) {
        event.preventDefault();
        // console.log("Login pressed!");
        // strip white space and @ symbols from username, distinguishes bot messags from user messages
        var username = this.state.nameInput.replace(/ /g, '');
        username = this.state.nameInput.replace(/@/g, '');
        // sessionStorage.setItem('username', username);
        // Force user to enter a name
        if (username === '') {
            this.setState({ login_error: "Please enter a username" });
            return;
        }
        // send login info to the backend server via redux
        this.props.handleLogin(username);
    }

    // Updated for Redux
    handleLogout() {
        var delete_name = this.props.username;
        this.props.handleLogout(delete_name);
        this.setState({ nameInput: '', chatInput: '' });
    }

    // TODO: Update for Redux
    handleChatSend(event) {
        event.preventDefault();
        // console.log("handleChatSend was called!");
        console.log(this.state.chatInput);
        let message = this.state.chatInput;
        let username = this.props.username;

        /*
        // Front-end only message list population
        // This might cause weird bugs in message list order
        // Or it might work just fine!
        let msgList = this.state.messages.slice();
        msgList.push({ message: this.state.chatInput, stamp: Date.now(), username: username });
        this.setState({ messages: msgList, chatInput: '' })
        console.log(msgList);
        */

        // send posted message info to the backend server
        fetch('/postmessage', { method: "POST", body: JSON.stringify({ message: message, username: username }) })
            .then(res => {
                if (res.ok) {
                    this.setState({ chatInput: '' });
                } else { throw Error(res.statusText) }
            }).catch(error => console.log(error));
    }

    // TODO: Update for redux
    handleClearMessages() {
        fetch('/clearhistory')
            .then(res => {
                if (res.ok) {
                    this.setState({ max_id: 0 })
                }
                else { throw Error(res.statusText) }
            }).catch(error => console.log(error));
    }

    // TODO: Update for redux
    handleClearUsers() {
        fetch('/clearusers')
            .then(res => {
                if (!res.ok) {
                    throw Error(res.statusText)
                }
            }).catch(error => console.log(error));
    }

    componentWillMount() {
        // Check to see if user already logged in
        //var stored_username = sessionStorage.getItem('username');
        //var stored_username = false;
        // console.log("Session username stored as: ");
        // console.log(stored_username);
        // get refresh going is user leaves and comes back
        // DEPRECATED at the moment
        // TODO: Restore remembering the user logic
        /*
        if (stored_username) {
            if (this.props.refresh_mode === 0) {
                // start DDOS                
                // this.refresh_interval = setInterval(
                //     () => this.refresh(),
                //    this.props.refresh_rate
                // );                
                setTimeout(this.deprecated_refresh_timeout, this.props.refresh_rate);
            } else if (this.props.refresh_mode === 1) {
                this.longPoll();
            }
            this.setState({ username: stored_username, logged_in: true, max_id: 0 });
        }
        */
    }

    longPoll() {
        if (this.props.refresh_mode === 0) {
            console.log("LongPoll called but DDOS mode is on, exiting...");
            return;
        }
        // console.log(" # @ Longpolling; REFRESH RATE: " + this.props.refresh_rate);
        // Don't fetch messages if not logged in
        if (!this.props.logged_in) {
            console.log("Not logged in; not longfetching data");
            //console.log(this.props.logged_in);
            setTimeout(this.longPoll, this.props.refresh_rate);
            return;
        }
        var prior_counter = this.state.request_counter;
        prior_counter += 1;
        this.setState({ request_counter: prior_counter });

        // call dispatch to redux store
        // console.log("@@~@~@~@~@ PROPS: ");
        // console.log(this.props);
        this.props.handleFetchUsers();
        // Deprecated
        /*
        fetch('/getusers')
            .then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    throw Error(res.statusText)
                }
            })
            //.then(res => { console.log(res); this.setState({ data: res }) })
            .then(res => {
                this.setState({ users: res });
            }).catch(error => {
                // Try again since there's likely a connection issue
                // setTimeout(this.longPoll, 1000);
                console.log(error);
            });
            */

        // console.log("Attempting long polling FC!");
        // fetch longpoll route
        var refresh_route = '/getmessageslong?max_id=';
        refresh_route += this.props.max_id;
        refresh_route += "&username=";
        refresh_route += this.props.username;
        // console.log(refresh_route);
        // use a callback to keep requesting new data from the server after the last set has been received
        this.props.handleRefresh(refresh_route, ()=> {
            // console.log("^^^^^^ lol trains");
            this.longPoll();
        });
    }

    componentDidMount() {
        if (this.props.refresh_mode === 0) {
            /*
            this.refresh_interval = setInterval(
                () => this.refresh(),
                this.props.refresh_rate
            );
            */
            setTimeout(this.deprecated_refresh_timeout, this.props.refresh_rate);
        } else if (this.props.refresh_mode === 1) {
            console.log("Component mounted, set to long polling though");
        }
    }

    deprecated_refresh_timeout() {
        console.log("Refresh! Rate: " + this.props.refresh_rate);
        this.refresh();
        if (this.props.refresh_mode === 0) {
            setTimeout(this.deprecated_refresh_timeout, this.props.refresh_rate);
        }
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    componentWillUpdate() {
        // console.log("~~~~~~~~New state or props!");
    }

    // most logic handled here, as props typically reflect state update in the redux store
    componentWillReceiveProps(nextProps) {
        // console.log("~~~~~~~~New props!");
        // console.log(this.props);
        // console.log(nextProps);
        // this.props.handleFetchUsers();
        // handle a prop change from DDOS to LongPoll
        if (this.props.refresh_mode === 0 && nextProps.refresh_mode === 1) {
            // no logic actually needed here, it's handled by deprecated refresh only firing if refresh mode is correct
            console.log("Toggle from DDOS to LongPoll");
        }

        // handle a prop change from LongPoll to DDOS
        if (this.props.refresh_mode === 1 && nextProps.refresh_mode === 0) {
            console.log("Toggle from LongPoll to DDOS");
            setTimeout(this.deprecated_refresh_timeout, this.props.refresh_rate);
        }

        // If a user just logged in, start the polling
        if (this.props.logged_in === false && nextProps.logged_in === true) {
            // LongPoll mode
            if (nextProps.refresh_mode === 1) {
                console.log(" # @ #@ ~ ~ ~ START LONG POLL");
                this.longPoll();
            }
            else if (nextProps.refresh_mode === 0) {
                setTimeout(this.deprecated_refresh_timeout, this.props.refresh_rate);
            }
        }

        

    }

    render() {
        // Conditional rendering fork: 
        // not logged in -> login screen
        // logged in -> chat application
        if (this.props.username) {
            return (
                <div>
                    <ChatHeader
                        handleLogout={this.handleLogout}
                        user={this.props.username}
                    />
                    <UserList />
                    <Chatroom
                        messages={this.props.messages}
                        max_messages={this.props.max_messages}
                    />
                    <ChatTextInput
                        handleChatTyping={this.handleChatTyping}
                        handleChatSend={this.handleChatSend}
                        chatInput={this.state.chatInput}
                    />
                    <br />
                    <br />
                    <ControlBar
                        handleClearMessages={this.handleClearMessages}
                        handleClearUsers={this.handleClearUsers}
                        handleLogout={this.handleLogout}
                    />
                    <div className="text-center">
                        <br />
                        <ToggleButton />
                    </div>
                </div>
            )
        }
        // otherwise, by default, render the login component
        return (
            <EntranceSplash
                handleLogin={this.handleLogin}
                handleNameTyping={this.handleNameTyping}
                nameInput={this.state.nameInput}
                login_error={this.state.login_error}
            />);
    }


    // Deprecated / optional - rapid short horrible polling
    refresh() {
        // Don't fetch messages if not logged in
        if (!this.props.logged_in) {
            console.log("Not logged in; not fetching getting data");
            //console.log(this.props.logged_in);
            return;
        }
        // track requests
        var prior_counter = this.state.request_counter;
        prior_counter += 1;
        this.setState({ request_counter: prior_counter });
        //console.log("Tick...");
        // get recipe data from the server asynchronously, state will refresh when it lands
        var refresh_route = '/getmessages?max_id=';
        refresh_route += this.props.max_id;
        refresh_route += "&username=";
        refresh_route += this.props.username;
        console.log(refresh_route);
        fetch(refresh_route)
            .then(res => {
                if (res.ok) {
                    return res.json()
                } else { throw Error(res.statusText) }
            }
            )
            //.then(res => { console.log(res); this.setState({ data: res }) })
            .then(res => {
                console.log("refresh response object:");
                console.log(res);
                // if the logout command was send, logout
                if (res.logout) {
                    console.log("Logout command received!");
                    //this.setState({logged_in: false, username: false, max_id: 0});
                    this.setState({ login_error: "You have been Logged out." });
                    this.handleLogout();
                    return;
                }

                // If there are new messages, add them to React's state
                if (res.update) {
                    var max_id;
                    if (res.rows.length > 0) {
                        max_id = res.rows[0].id;
                    } else {
                        max_id = 0;
                    }
                    this.setState({ messages: res.rows.reverse(), max_id: max_id });
                }
                // console.log("Max id is: " + max_id);
                else {
                    console.log("No new messages from the server or no messages at all");
                    // Make sure client shows blank screen if screen recently refreshed
                    if (this.props.max_id === 0) {
                        this.setState({ messages: [] });
                        console.log("Set messages state to empty array");
                    }
                }
            }).catch(error => console.log(error));
        //.then(() => console.log(this.state));

        this.props.handleFetchUsers();
        // DEPRECATED
        /*
        fetch('/getusers')
            .then(res => {
                if (res.ok) {
                    return res.json()
                } else { throw Error(res.statusText) }
            })
            //.then(res => { console.log(res); this.setState({ data: res }) })
            .then(res => {
                this.setState({ users: res });
            }).catch(error => console.log(error));
            */
    }
}

// return Object.assign({}, state, { username: action.username, logged_in: true, max_id: 0, login_error: false });


function mapStateToProps(state) {
    // console.log("ChatApp mapping state to props...");
    return {
        refresh_rate: state.refresh_rate,
        refresh_mode: state.refresh_mode,
        username: state.username,
        logged_in: state.logged_in,
        max_id: state.max_id,
        login_error: state.login_error,
        max_messages: state.max_messages,
        messages: state.messages,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        handleFetchUsers: () => {
            // console.log("HANDLING FETCHED USERS ~~@~@~@~@~@");
            // First action, alerting that the user fetch asyny has begun
            dispatch(fetchUsers());
            fetch('/getusers')
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        throw Error(res.statusText)
                    }
                })
                //.then(res => { console.log(res); this.setState({ data: res }) })
                .then(res => {
                    // console.log("@~@~@~@~@~@ Request received! @~@~@~@~@~@");
                    // console.log(res);
                    dispatch(updateUsers(res, false, "Users retrieved succesfully"));

                }).catch(error => {
                    console.log(error);
                    dispatch(updateUsers(false, true, "Error retrieving user list"));
                });

        },
        handleLogin: (username) => {
            console.log(`login for ${username} requested!`);
            // pre-ES6 equivalent username: username version below 
            // fetch('/login', { method: "POST", body: JSON.stringify({ username: username }) })
            dispatch(loginUser(username));
            fetch('/login', { method: "POST", body: JSON.stringify({ username }) })
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    } else { throw Error(res.statusText) }
                }
                )
                .then(res => {
                    // if (!res){ return false}
                    if (res.duplicate === false) {
                        // this.setState({ username: username, logged_in: true, max_id: 0, login_error: false, nameInput: '' });
                        // this.longPoll();
                        dispatch(loginComplete(username));
                    } else {
                        // this.setState({ login_error: 'Username already taken', nameInput: '' });
                        dispatch(loginFail(username));
                    }
                }).catch(error => console.log(error));
        },
        handleLogout: (username) => {
            console.log(`logOUT for ${username} requested!`);
            // Send logout to the server
            fetch('/logout', { method: "POST", body: JSON.stringify({ username: username }) })
                .then(res => {
                    if (res.ok) {
                        dispatch(logoutUser(username));
                        return res.json();
                    } else { throw Error(res.statusText) }
                }).catch(error => console.log(error));
            // this is race conditiony right now
            // dispatch(logoutUser(username));
        },
        handleRefresh: (refresh_route, callback) => {
            fetch(refresh_route)
                .then(res => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        console.log("Server is broken");
                        throw Error(res.statusText);
                    }
                })
                .then(res => {
                    console.log("Refresh server response:");
                    console.log(res);
                    //console.log("Received a longpoll response!");
                    //console.log(res);
                    // if the logout command was send, logout
                    // TODO: Figure out why this would happen and do something
                    if (res.logout) {
                        console.log("ERROR: LOGOUT received in refresh ? ? ? ? Eric what did you do ? ? ? ? ");
                        //this.setState({logged_in: false, username: false, max_id: 0});
                        // this.setState({ login_error: "You have logged out" });
                        // this.handleLogout();
                        return;
                    }

                    // If the response is an update
                    if (res.update) {
                        var max_id;
                        if (res.rows.length > 0) {
                            max_id = res.rows[0].id;
                        } else {
                            max_id = 0;
                        }
                        // this.setState({ messages: res.rows.reverse(), max_id: max_id });
                        dispatch(refreshMessages(res.rows.reverse(), max_id));
                        callback();
                    }

                    callback();

                    // TODO: DO YOU NEED THIS?
                    // test code only
                    //this.setState({ max_id: res.max_id });
                    
                    // TODO: Figure out how to get long polling moving again?
                    // setTimeout(this.longPoll, this.props.refresh_rate);
                })
                .catch(error => {
                    // Try again since there's likely a connection issue
                    console.log("Long poll error...");
                    // setTimeout(this.longPoll, 1000);
                    // TODO: Get long polling to work again
                    console.log(error);
                });
        }

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatApp);
