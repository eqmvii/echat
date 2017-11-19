import React, { Component } from 'react';

//import components
import ChatTextInput from './ChatTextInput.js';
import ChatHeader from './ChatHeader.js';
import EntranceSplash from './EntranceSplash.js';
import UserList from './UserList.js';
import ToggleButton from './ToggleButton.js';
import ControlBar from './ControlBar.js';
import Chatroom from './Chatroom.js';

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
        this.handleSlower = this.handleSlower.bind(this);
        this.handleFaster = this.handleFaster.bind(this);
        this.longPoll = this.longPoll.bind(this);
        this.handleHTTPToggle = this.handleHTTPToggle.bind(this);
        this.handleDebugMode = this.handleDebugMode.bind(this);

        // initial state configuration
        // refresh mode is either 0 (DDOS) or 1 (long polling)
        this.state = {
            max_messages: 16,
            username: false,
            messages: [],
            nameInput: '',
            chatInput: '',
            users: [],
            logged_in: false,
            login_error: false,
            refresh_rate: 250,
            max_id: 0,
            request_counter: 0,
            debug_mode: false,
            refresh_mode: 1,
            refresh_name: ["DDOS", "Long Polling"]
        }
    }

    handleDebugMode() {
        let new_debug_mode = !this.state.debug_mode;
        this.setState({ debug_mode: new_debug_mode });
    }

    // switch between DDOS and long-polling
    handleHTTPToggle() {
        // If current mode is DDOS:
        if (this.state.refresh_mode === 0) {
            this.setState({ refresh_mode: 1 });
            clearInterval(this.refresh_interval);
            this.longPoll();
        }
        // If current mode is long-polling: 
        else if (this.state.refresh_mode === 1) {
            this.setState({ refresh_mode: 0 });
            // start DDOS
            this.refresh_interval = setInterval(
                () => this.refresh(),
                this.state.refresh_rate);
        }
    }

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

    handleNameTyping(event) {
        this.setState({ nameInput: event.target.value })
    }

    handleChatTyping(event) {
        this.setState({ chatInput: event.target.value })
    }

    // TODO: Add this kind of error handling elsewhere 
    handleLogin(event) {
        event.preventDefault();
        console.log("Login pressed!");
        // strip white space and @ symbols from username, distinguishes bot messags from user messages
        var username = this.state.nameInput.replace(/ /g, '');
        username = this.state.nameInput.replace(/@/g, '');
        sessionStorage.setItem('username', username);
        // Force user to enter a name
        if (username === '') {
            this.setState({ login_error: "Please enter a username" });
            return;
        }
        // send login info to the backend server
        fetch('/login', { method: "POST", body: JSON.stringify({ username: username }) })
            .then(res => {
                if (res.ok) {
                    return res.json()
                } else { throw Error(res.statusText) }
            }
            )
            .then(res => {
                // if (!res){ return false}
                if (res.duplicate === false) {
                    this.setState({ username: username, logged_in: true, max_id: 0, login_error: false, nameInput: '' });
                    this.longPoll();
                } else {
                    this.setState({ login_error: 'Username already taken', nameInput: '' });
                }
            }).catch(error => console.log(error));
    }

    handleLogout() {
        var delete_name = this.state.username;

        // Send logout to the server
        fetch('/logout', { method: "POST", body: JSON.stringify({ username: delete_name }) })
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else { throw Error(res.statusText) }
            }).catch(error => console.log(error));

        this.setState({ username: false, messages: [], nameInput: '', chatInput: '', users: [], logged_in: false });

        sessionStorage.removeItem('username');
        console.log("Logout pressed!");
    }

    handleChatSend(event) {
        event.preventDefault();
        // console.log("handleChatSend was called!");
        console.log(this.state.chatInput);
        let message = this.state.chatInput;
        let username = this.state.username;

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

    handleClearMessages() {
        fetch('/clearhistory')
            .then(res => {
                if (res.ok) {
                    this.setState({ max_id: 0 })
                }
                else { throw Error(res.statusText) }
            }).catch(error => console.log(error));
    }

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
        var stored_username = sessionStorage.getItem('username');
        console.log("Session username stored as: ");
        console.log(stored_username);
        // get refresh going is user leaves and comes back
        if (stored_username) {
            if (this.state.refresh_mode === 0) {
                // start DDOS
                this.refresh_interval = setInterval(
                    () => this.refresh(),
                    this.state.refresh_rate
                );
            } else if (this.state.refresh_mode === 1) {
                this.longPoll();
            }
            this.setState({ username: stored_username, logged_in: true, max_id: 0 });
        }
    }

    // Deprecated / optional - rapid short horrible polling
    refresh() {
        // Don't fetch messages if not logged in
        if (!this.state.logged_in) {
            console.log("Not logged in; not fetching getting data");
            //console.log(this.state.logged_in);
            return;
        }
        // track requests
        var prior_counter = this.state.request_counter;
        prior_counter += 1;
        this.setState({ request_counter: prior_counter });
        //console.log("Tick...");
        // get recipe data from the server asynchronously, state will refresh when it lands
        var refresh_route = '/getmessages?max_id=';
        refresh_route += this.state.max_id;
        refresh_route += "&username=";
        refresh_route += this.state.username;
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
                    if (this.state.max_id === 0) {
                        this.setState({ messages: [] });
                        console.log("Set messages state to empty array");
                    }
                }
            }).catch(error => console.log(error));
        //.then(() => console.log(this.state));

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
    }

    longPoll() {
        // Don't fetch messages if not logged in
        if (!this.state.logged_in) {
            console.log("Not logged in; not longfetching data");
            //console.log(this.state.logged_in);
            setTimeout(this.longPoll, this.state.refresh_rate);
            return;
        }
        var prior_counter = this.state.request_counter;
        prior_counter += 1;
        this.setState({ request_counter: prior_counter });

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

        console.log("Attempting long polling FC!");
        // fetch longpoll route
        var refresh_route = '/getmessageslong?max_id=';
        refresh_route += this.state.max_id;
        refresh_route += "&username=";
        refresh_route += this.state.username;
        console.log(refresh_route);
        fetch(refresh_route)
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    console.log("Server is super broken");
                    throw Error(res.statusText);
                }
            })
            .then(res => {
                console.log("Received a longpoll response!");
                console.log(res);

                // if the logout command was send, logout
                if (res.logout) {
                    console.log("Logout command received!");
                    //this.setState({logged_in: false, username: false, max_id: 0});
                    this.setState({ login_error: "You have logged out" });
                    this.handleLogout();
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
                    this.setState({ messages: res.rows.reverse(), max_id: max_id });
                }

                // test code only
                this.setState({ max_id: res.max_id });

                setTimeout(this.longPoll, this.state.refresh_rate);
            })
            .catch(error => {
                // Try again since there's likely a connection issue
                console.log("Long poll error, trying again...");
                setTimeout(this.longPoll, 1000);
                console.log(error);
            });
    }

    componentDidMount() {
        if (this.state.refresh_mode === 0) {
            this.refresh_interval = setInterval(
                () => this.refresh(),
                this.state.refresh_rate
            );
        } else if (this.state.refresh_mode === 1) {
            console.log("Component mounted, set to long polling though");
        }
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    render() {
        // Conditional rendering fork: 
        // not logged in -> login screen
        // logged in -> chat application
        if (this.state.username) {
            return (
                <div>
                    <ChatHeader
                        handleLogout={this.handleLogout}
                        user={this.state.username}
                    />
                    <UserList users={this.state.users} />
                    <Chatroom
                        messages={this.state.messages}
                        max_messages={this.state.max_messages}
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
                        handleSlower={this.handleSlower}
                        handleFaster={this.handleFaster}
                        handleHTTPToggle={this.handleHTTPToggle}
                        parent_state={this.state}                        
                    />
                    <div className="text-center">
                        <br />
                        <ToggleButton handleDebugMode={this.handleDebugMode} />
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
}

export default ChatApp;