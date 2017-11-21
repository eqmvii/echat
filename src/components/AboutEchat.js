import React, { Component } from 'react';

class AboutEchat extends Component {
    render() {
      return (
        <div>
          <h1>About echat</h1>
          <p>This is a live chat program. Pick a username and chat with everyone else using the app!</p>
            <p>The front-end was initially written in React and is now React+Redux, the back end is a combination of Node.js, Express, and PostgreSQL. The whole thing is deployed to Heroku.</p>
          <div className="alert alert-danger"><strong>Redux Transition: </strong>The app was recently refactored from React to React + Redux. Debugging is ongoing!!</div>
          <h3>Features</h3>
          <p>Most basically, echat allows you to select a username and chat with everyone else currently using echat. Some specific features include:</p>
          <ul>
            <li><strong>Unique Usernames:</strong> a user can't login with a username that's already in use.</li>
            <li><strong>Long Polling:</strong> auto refresh is accomplished with HTTP requests via long polling to reduce server load.</li>
            <li><strong>Auto Logout:</strong> users are kicked after a few minutes of inactivity.</li>
            <li><strong>Auto Message Clearing:</strong> after a longer period of inactivity, all chat messages are also cleared from the database.</li>
            </ul>
          <h3>Debug Mode</h3>
          <p>If you press the "Toggle Debug Menu" button, a button toolbar and diagnostic information will appear.</p>
          <ul>
            <li><strong>Clear Chat:</strong> deletes all chat messages for all users.</li>
            <li><strong>Logout:</strong> logs out only the user that pressed the button.</li>
            <li><strong>Logout All:</strong> logs out all active users and returns them to the login screen.</li>
            <li><strong>Toggle DDOS/Long-Polling:</strong> changes between Long Polling Mode (default) and DDOS Mode (...not recommended)
              <ul>
                <li><strong>Long Polling Mode: </strong>
                  an HTTP request is sent to the server, and then the server waits to respond until there are updates to the database to report to the client. 
                  A "no updates" response is sent after several seconds even if there is no change to the database to avoid HTTP timeout errors, particularly because of the Heroku platform.</li>
                <li><strong>DDOS Mode: </strong> 
                  a new HTTP request is sent at the refresh interval, which ranges from as fast as almost 10 times per second to as slow as roughly once every 5 seconds.
                  This was the first way I thought about making a chat application, but (obviously) has abysmal performance and scaling implications.
                  No points for guessing why I call it DDOS Mode.</li>
                </ul>
                </li>
            <li><strong>Slower refresh:</strong> increases the frequency of HTTP requests for new messages (DDOS Mode) or increases the time between long polling HTTP requests (Long Polling Mode)</li>
            <li><strong>Faster refresh:</strong> reduced the frequency of HTTP requests for new messages (DDOS Mode) or reduces the time between long polling HTTP requests (Long Polling Mode)</li>
  
            </ul>
            <br />
            <br />
            <br />
        </div>
        
      )
    }
  }

  export default AboutEchat;