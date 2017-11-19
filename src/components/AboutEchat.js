import React, { Component } from 'react';

class AboutEchat extends Component {
    render() {
      return (
        <div>
          <h1>About echat</h1>
          <p>The echat application is full stack live chat program. 
            The front end is written in React, the back end is a combination of Node.js, Express, and PostgreSQL, and the whole thing is deployed via Heroku.</p>
          <p>It was created as a hobby project to practice using Express/React/PostgreSQL - in other words, it's deliberately frivolous.</p>
          <h3>Features</h3>
          <p>Most basically, echat allows you to select a username and chat with everyone else currently using echat. Some specific features include:</p>
          <ul>
            <li><strong>Unique Usernames:</strong> a user can't login with a username that's already in use.</li>
            <li><strong>Long Polling:</strong> auto refresh is accomplished with HTTP requests via long polling to reduce server load.</li>
            <li><strong>Auto Logout:</strong> users are kicked after a few minutes of inactivity.</li>
            <li><strong>Auto Message Clearing:</strong> after a longer period of inactivity, all chat messages are also cleared from the database.</li>
            </ul>
          <h3>Debug Mode</h3>
          <p>If you press the "Toggle Debug Mode" button, an array of buttons and diagnostic information will appear, in addition to enabling console logging of various debugging information.</p>
          <ul>
            <li><strong>Clear Chat:</strong> deletes all chat messages.</li>
            <li><strong>Logout:</strong> logs out only the user that pressed the button out.</li>
            <li><strong>Logout All:</strong> logs out all active users and returns them to the login screen.</li>
            <li><strong>Toggle DDOS/Long-Polling:</strong> changes between Long Polling Mode (default) and DDOS Mode (...not recommended)
              <ul>
                <li><strong>Long Polling Mode: </strong>
                  an HTTP request is sent to the server, and then the server waits to respond until there are updates to the database to report to the client. 
                  A "no updates" response is sent after several seconds even if there is no change to the database to avoid HTTP timeout errors, particularly because of the Heroku platform.</li>
                <li><strong>DDOS Mode: </strong> 
                  a new HTTP request is sent at the refresh interval, which ranges from as fast as almost 10 times per second to as slow as roughly once every 5 seconds.
                  This was the first way I thought about making a chat application, but has abysmal performance and scaling implications.
                  No points for guessing why I call it DDOS mode.</li>
                </ul>
                </li>
            <li><strong>Slower refresh:</strong> increases the frequency of HTTP requests for new messages (DDOS mode) or increases the time between long polling HTTP requests (Long-Polling Mode)</li>
            <li><strong>Faster refresh:</strong> reduced the frequency of HTTP requests for new messages (DDOS mode) or reduces the time between long polling HTTP requests (Long Polling Mode)</li>
  
            </ul>
            <br />
            <br />
            <br />
        </div>
        
      )
    }
  }

  export default AboutEchat;