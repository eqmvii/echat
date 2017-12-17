// TODO:
/*
Add back session storage functionality
Add more unit tests for redux elements
BUG: Toggling causes too many long poll calls to stack up
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
import { fetchUsers, updateUsers, loginUser, loginComplete, loginFail, logoutUser, refreshMessages, httpCounter, clearMessages, clearUsers } from '../actions/index.js';


// master stateful component that tracks everything and passes change functions
class ChatApp extends Component {
    constructor(props) {
        // boilerplate for the class
        super(props);

        // bind handle functions
        this.handleLogin = this.handleLogin.bind(this);
        this.handleNameTyping = this.handleNameTyping.bind(this);
        this.handleChatTyping = this.handleChatTyping.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.handleChatSend = this.handleChatSend.bind(this);
        this.longPoll = this.longPoll.bind(this);
        this.deprecated_refresh_timeout = this.deprecated_refresh_timeout.bind(this);
        this.refresh_DDOS = this.refresh_DDOS.bind(this);

        // initial local state configuration
        // most of the app's state is actually held in the redux store
        this.state = {
            nameInput: '',
            chatInput: '',
        }
    }

    handleNameTyping(event) {
        this.setState({ nameInput: event.target.value })
    }

    handleChatTyping(event) {
        this.setState({ chatInput: event.target.value })
    }

    handleLogin(event) {
        event.preventDefault();
        // strip white space and @ symbols from username, distinguishes bot messags from user messages
        var username = this.state.nameInput.replace(/ /g, '');
        username = this.state.nameInput.replace(/@/g, '');
        // sessionStorage.setItem('username', username);
        // Force user to enter a name
        if (username === '') {
            this.props.handleBlankUsername();
            return;
        }
        // send login info to the backend server via redux
        this.props.handleLogin(username);
    }

    handleLogout() {
        var delete_name = this.props.username;
        this.props.handleLogout(delete_name);
        this.setState({ nameInput: '', chatInput: '' });
    }

    handleChatSend(event) {
        event.preventDefault();
        // don't send empty data to the server
        if (!this.state.chatInput) {
            return;
        }
        let message = this.state.chatInput;
        let username = this.props.username;

        // send posted message info to the backend server
        fetch('/postmessage', { method: "POST", body: JSON.stringify({ message: message, username: username }) })
            .then(res => {
                if (res.ok) {
                    this.setState({ chatInput: '' });
                } else { throw Error(res.statusText) }
            }).catch(error => console.log(error));
    }

    longPoll(toggle) {
        // don't execute the longPoll code if toggle was hit before a setTimeout triggered
        if (this.props.refresh_mode === 0 && toggle !== true) {
            console.log("LongPoll called but DDOS mode is on, exiting...");
            return;
        }
        // Don't fetch messages if not logged in
        if (!this.props.logged_in) {
            setTimeout(this.longPoll, this.props.refresh_rate);
            return;
        }

        // fetching users and fetching messages race
        this.props.handleFetchUsers();
        var refresh_route = '/getmessageslong?max_id=';
        refresh_route += this.props.max_id;
        refresh_route += "&username=";
        refresh_route += this.props.username;
        // use a callback to keep requesting new data from the server once the last set has been received
        this.props.handleRefresh(refresh_route, () => {
            this.longPoll();
        });
    }

    deprecated_refresh_timeout() {
        this.refresh_DDOS();
        if (this.props.refresh_mode === 0) {
            setTimeout(this.deprecated_refresh_timeout, this.props.refresh_rate);
        }
    }

    // Rapid short horrible polling
    refresh_DDOS() {
        // Don't fetch messages if not logged in
        if (!this.props.logged_in) {
            return;
        }
        // fetch users and fetch messages race
        this.props.handleFetchUsers();
        var refresh_route = '/getmessages?max_id=';
        refresh_route += this.props.max_id;
        refresh_route += "&username=";
        refresh_route += this.props.username;
        this.props.handle_refresh_DDOS(refresh_route);
    }

    // = = = = = = = = = = = = = react life cycle methos = = = = = = = = = = = = = 

    componentDidMount() {
        if (this.props.logged_in === true && this.props.username !== false) {
            if (this.props.refresh_mode === 1) {
                console.log("Mounted & started long polling refresh");
                this.longPoll();
            }
            else if (this.props.refresh_mode === 0) {
                setTimeout(this.deprecated_refresh_timeout, this.props.refresh_rate);
                console.log("Mounted & started DDOS refresh");
            }
        }
    }

    // Chat logic handled here, as props typically reflect state update in the redux store
    // TODO: Handle turning on chat refresh if a user arrives via a page re-load, sessionStorage, etc.
    componentWillReceiveProps(nextProps) {
        // handle a prop change from DDOS to LongPoll
        if (this.props.refresh_mode === 0 && nextProps.refresh_mode === 1) {
            // sending 'true' as an argument will force long polling to start even though app is currently in DDOS mode
            this.longPoll(true);
            console.log("Toggle from DDOS to LongPoll");
        }

        // handle a prop change from LongPoll to DDOS
        if (this.props.refresh_mode === 1 && nextProps.refresh_mode === 0) {
            console.log("Toggle from LongPoll to DDOS");
            setTimeout(this.deprecated_refresh_timeout, this.props.refresh_rate);
        }

        // If a user just logged in, start the polling
        if (this.props.logged_in === false && nextProps.logged_in === true) {
            if (nextProps.refresh_mode === 1) {
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
                        handleClearMessages={this.props.handleClearMessages}
                        handleClearUsers={this.props.handleClearUsers}
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
                login_error={this.props.login_error}
            />);
    }
}

//  = = = = = = = = = = = = = redux connection code = = = = = = = = = = = = = 

function mapStateToProps(state) {
    return {
        refresh_rate: state.refresh_rate,
        refresh_mode: state.refresh_mode,
        username: state.username,
        logged_in: state.logged_in,
        max_id: state.max_id,
        login_error: state.login_error,
        max_messages: state.max_messages,
        messages: state.messages,
        request_counter: state.request_counter
    }
}

const mapDispatchToProps = dispatch => {
    return {
        handleFetchUsers: () => {
            dispatch(fetchUsers());
            fetch('/getusers')
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        throw Error(res.statusText)
                    }
                })
                .then(res => {
                    dispatch(updateUsers(res, false, "Users retrieved succesfully"));
                }).catch(error => {
                    console.log(error);
                    dispatch(updateUsers(false, true, "Error retrieving user list"));
                });
        },
        handleBlankUsername: () => {
            dispatch(loginFail('', "Must enter a username"));
        },
        handleLogin: (username) => {
            console.log(`login for ${username} requested!`);
            dispatch(loginUser(username));
            fetch('/login', { method: "POST", body: JSON.stringify({ username }) })
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    } else { throw Error(res.statusText) }
                }
                )
                .then(res => {
                    if (res.duplicate === false) {
                        dispatch(loginComplete(username));
                    } else {
                        dispatch(loginFail(username, "Username already taken"));
                    }
                }).catch(error => console.log(error));
        },
        handleLogout: (username) => {
            console.log(`logOUT for ${username} requested!`);
            fetch('/logout', { method: "POST", body: JSON.stringify({ username: username }) })
                .then(res => {
                    if (res.ok) {
                        dispatch(logoutUser(username));
                        return res.json();
                    } else { throw Error(res.statusText) }
                }).catch(error => console.log(error));
        },
        handleRefresh: (refresh_route, callback) => {
            dispatch(httpCounter());
            fetch(refresh_route)
                .then(res => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        console.log("Server is broken.");
                        throw Error(res.statusText);
                    }
                })
                .then(res => {
                    // if the server resoponds with a logout command, logout
                    if (res.logout) {
                        fetch('/logout', { method: "POST", body: JSON.stringify({ username: res.username }) })
                            .then(res => {
                                if (res.ok) {
                                    dispatch(logoutUser(res.username));
                                    dispatch(loginFail(res.username, "Somebody pressed the 'logout all users' button!"));
                                    return res.json();
                                } else { throw Error(res.statusText) }
                            }).catch(error => console.log(error));
                        return;
                    }
                    // If the server responds with an update
                    if (res.update) {
                        var max_id;
                        if (res.rows.length > 0) {
                            max_id = res.rows[0].id;
                        } else {
                            max_id = 0;
                        }
                        dispatch(refreshMessages(res.rows.reverse(), max_id));
                    }
                    // either way, begin the next long polling session
                    callback();
                })
                .catch(error => {
                    console.log(error);
                    // if there was an error, still execute the callback and try long polling again
                    callback();                    
                });
        },
        handleClearMessages: () => {
            fetch('/clearhistory')
                .then(res => {
                    if (res.ok) {
                        dispatch(clearMessages());
                    }
                    else { throw Error(res.statusText) }
                }).catch(error => console.log(error));
        },
        handleClearUsers: () => {
            dispatch(clearUsers());
            fetch('/users', { method: "DELETE"})
                .then(res => {
                    if (!res.ok) {
                        throw Error(res.statusText)
                    }
                }).catch(error => console.log(error));
        },
        handle_refresh_DDOS: (refresh_route) => {
            dispatch(httpCounter());
            fetch(refresh_route)
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    } else { throw Error(res.statusText) }
                }
                )
                .then(res => {
                    // if the logout command was send, logout
                    if (res.logout) {
                        console.log("Logout command received in DDOS mode!");
                        fetch('/logout', { method: "POST", body: JSON.stringify({ username: res.username }) })
                            .then(res => {
                                if (res.ok) {
                                    dispatch(logoutUser(res.username));
                                    dispatch(loginFail(res.username, "Somebody pressed the 'logout all users' button :("));
                                    return res.json();
                                } else { throw Error(res.statusText) }
                            }).catch(error => console.log(error));
                        return;
                    }
                    if (res.update) {
                        var max_id;
                        if (res.rows.length > 0) {
                            max_id = res.rows[0].id;
                        } else {
                            max_id = 0;
                        }
                        dispatch(refreshMessages(res.rows.reverse(), max_id));
                    }
                }).catch(error => console.log(error));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatApp);
