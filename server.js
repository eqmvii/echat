const express = require('express')
const app = express()
const { Client } = require('pg')

// Database connection code

var client;
var server_max_id = -1;

var time_settings = {
    run_cleanup: (5 * 60 * 1000),
    kick_idle: (10 * 60 * 1000),
    delete_chat: (20 * 60 * 1000)
}



// set credentials based on local or production
if (!process.env.PORT) {
    client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'password',
        port: 5432,
    });
    client.connect();
} else {
    client = new Client({
        // this uses the database connection info from Heroku
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    client.connect();
    // test the remote connection 
    client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            console.log("Row read from PostgreSQL general info: ");
            console.log(JSON.stringify(row));
        }
    });

}

// test read of the database, local or production
client.query('SELECT * FROM echat_messages', (err, res) => {
    if (err) throw err;
    console.log("Read succeeded; rows: ");
    for (let row of res.rows) {
        console.log("Row read from PostgreSQL table: ");
        console.log(JSON.stringify(row));
    }
});
// End database connection and testing code (modularize?)

// DB cleanup code, automatically logout users after a certain period of time
setInterval(cleanup, time_settings.run_cleanup);

function cleanup() {
    console.log("Cleaning up the DBs...");
    var right_now = Date.now();
    var users_query_string = "SELECT * FROM echat_users";
    var messages_query_string = "SELECT * FROM echat_messages ORDER BY stamp desc LIMIT 1";

    // Check how long it's been since each user logged in or spoke
    client.query(users_query_string)
        .then(response => {
            for (let i = 0; i < response.rows.length; i++) {
                console.log(right_now);
                console.log(response.rows[i].stamp.getTime());
                var mseconds_past = (right_now - response.rows[i].stamp.getTime());
                console.log("Time elapse for " + response.rows[i].username + ": " + mseconds_past);
                if (mseconds_past > time_settings.kick_idle) {
                    logout_user(response.rows[i].username);
                }
            }
        });

    // Clear chat history after 20 minutes of idle
    client.query(messages_query_string)
        .then(response => {
            console.log("Testing message idle time for message table deletion...");
            if (response.rows.length < 1) {
                return;
            }
            var most_recent_message = response.rows[0].stamp;
            var elapsed_time = (right_now - most_recent_message.getTime());
            console.log(elapsed_time);
            if (elapsed_time > time_settings.delete_chat) {
                console.log("Idle timeout hit, deleting chat");
                var delete_query_string = "DELETE FROM echat_messages;";
                client.query(delete_query_string);
                server_max_id = -1;
            }
        });
}

function logout_user(username) {
    console.log("Due to inactivity, I will logout " + username);
    var query_string = "DELETE FROM echat_users WHERE username = $1";
    var values = [username];
    client.query(query_string, values)
        .then(() => {
            query_string = "INSERT INTO echat_messages (username, message) VALUES ($1, $2)";
            values = ['   GOODBYE BOT   ', 'Goodbye ' + username + ', you have been logged out due to inactivity.'];
            client.query(query_string, values);
            // slightly hacky way to force clients to refresh
            server_max_id += 2;
        });
}

// Port 3001 by default or else whatever Heroku tells it to be 
const port = process.env.PORT || 3001;

// express looks up files relative to the static directory,
// so the folder name doesn't become part of the url
app.use(express.static('build'));

// API endpoint for testing
app.get('/test', function (req, res) {
    // TODO: Use a query string and only respond with an update if an update exists
    console.log("test endpoint hit");
    client.query('SELECT * FROM test_table;', (err, response) => {
        if (err) throw err;
        res.json(response.rows[0].name);
    });
});

// API endpoint for testing
app.get('/clearhistory', function (req, res) {
    // TODO: Use a query string and only respond with an update if an update exists
    console.log("clear chat history endpoint hit");
    client.query('DELETE FROM echat_messages;', (err, response) => {
        if (err) throw err;
        //res.json(response.rows[0].name);
        server_max_id = -1;
        res.end();

    });
});


// API endpoint for testing
app.get('/getmessages', function (req, res) {
    var get_messages_response_object = {logout: false, rows: [], update: false, max_id: server_max_id};
    // console.log("Get messages endpoint hit");
    // console.log(req.query);
    var max_id = parseInt(req.query.max_id, 10);
    // console.log("React max: " + max_id + " Server max: " + server_max_id);
    // See if the user has been auto-logged out, and if so, boot them
    var logged_query_string = "SELECT * FROM echat_users WHERE username = $1";
    var values = [req.query.username];
    client.query(logged_query_string, values).then((response) => {
        if (response.rows.length === 0) {
            console.log("###The user isn't logged in...");
            get_messages_response_object.logout = true;
            res.json(get_messages_response_object);
        }
        else {

            // Send response data
            if (max_id === server_max_id) {
                // console.log("React max: " + max_id + " Server max: " + server_max_id);
                // console.log("React matches server, send nothing");
                res.json(get_messages_response_object);
            }
            else {
                // console.log("React max: " + max_id + " Server max: " + server_max_id);
                // console.log("React might be behind, send update!");
                client.query('SELECT * FROM echat_messages ORDER BY stamp desc LIMIT 20', (err, response) => {
                    // console.log("Max: " + response.rows[0].id);
                    // console.log("Min: " + response.rows[response.rows.length - 1].id);
                    if (response.rows.length > 0) {
                        server_max_id = response.rows[0].id;
                    }
                    if (err) throw err;
                    get_messages_response_object.update = true;
                    get_messages_response_object.rows = response.rows;
                    res.json(get_messages_response_object);

                });
            }

        }

    })


});

// API endpoint for testing
app.get('/getusers', function (req, res) {
    // console.log("Get messages endpoint hit");
    client.query('SELECT * FROM echat_users ORDER BY username', (err, response) => {
        if (err) throw err;
        res.json(response.rows);

    });
});

// login endpoint
app.post('/login', function (req, res) {
    // TODO: Prevent duplicate users
    console.log("Login requested");
    // clear the old user table   

    /*
    // TODO: Make this not insane for multiple users.
    client.query('DELETE FROM echat_users', (err, data) => {
        console.log("Deleted the users table.");
    });
    */

    // parse the body of the POST request
    // node.js boiilterplate for handling 
    // a body stream from the PUT request
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        body = JSON.parse(body);
        var username = body.username;
        // at this point, `body` has the entire request body stored in it as a string
        console.log("Login POST request name is: " + username);

        var name_check_query_string = "SELECT * FROM echat_users WHERE username = $1";
        var name_check_values = [username];



        /*
        client.query(query_string, values, (err, data) => {
            //console.log("wurt");
            if (err) {
                console.log(err);
            }
            
            res.end();
        });
        */

        // update user table, add greeting chat message, end HTTP request. With promises!
        client.query(name_check_query_string, name_check_values)
            .then(resolve => {
                if (resolve.rows.length > 0) {
                    // console.log("User already logged in");
                    res.json({ duplicate: true, username: username });
                }
                else {
                    // Prepare to the new user to the username table
                    console.log("New user; not already logged in");
                    var query_string = "INSERT INTO echat_users (username) VALUES ($1)";
                    var values = [username];
                    console.log("It's query time! Query string / values: ");
                    console.log(query_string);
                    console.log(values);
                    client.query(query_string, values)
                        .then(resolve => {
                            var query_string = "INSERT INTO echat_messages (username, message) VALUES ($1, $2)";
                            var values = ['   WELCOME BOT   ', 'Welcome to echat, ' + username + '!'];
                            console.log("It's query time! Query string / values: ");
                            console.log(query_string);
                            console.log(values);
                            client.query(query_string, values);
                            server_max_id += 2;
                        })
                        .then(resolve => (res.json({ duplicate: false, username: username })));
                }
            });



    });


});

// post message endpoint
app.post('/postmessage', function (req, res) {

    console.log("Add message requested");
    // clear the old user table   

    // parse the body of the POST request
    // node.js boiilterplate for handling 
    // a body stream from the PUT request
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        // at this point, `body` has the entire request body stored in it as a string
        console.log("Message POST request body is: " + body);
        body = JSON.parse(body);
        login_test(body.username);

        // Add the new user to the username table
        let query_string = "INSERT INTO echat_messages (username, message) VALUES ($1, $2) RETURNING id";
        let values = [body.username, body.message];
        console.log("It's query time! Query string / values: ");
        console.log(query_string);
        console.log(values);
        client.query(query_string, values, (err, data) => {
            if (err) {
                console.log(err);
            };
            // console.log("msg post data: ");
            // console.log(data.rows[0].id);
            server_max_id = data.rows[0].id;
            activity_update(body.username);
            res.end();
        });
    });


});

function login_test(username) {
    console.log("Login test called for " + username);
    var name_check_query_string = "SELECT * FROM echat_users WHERE username = $1";
    var name_check_values = [username];
    client.query(name_check_query_string, name_check_values)
        .then(resolve => {
            if (resolve.rows.length > 0) {
                console.log("user already logged in");
            }
            else {
                // user was not in loggedin table, so add user there
                var query_string = "INSERT INTO echat_users (username) VALUES ($1)";
                var values = [username];
                console.log("It's query time! Query string / values: ");
                console.log(query_string);
                console.log(values);
                client.query(query_string, values)
                    .then(() => {
                        query_string = "INSERT INTO echat_messages (username, message) VALUES ($1, $2) returning id";
                        values = ['   WELCOME BOT   ', "Welcome back to echat, " + username + "! You're back after being idle!"];
                        console.log("It's query time! Query string / values: ");
                        console.log(query_string);
                        console.log(values);
                        client.query(query_string, values);
                        server_max_id += 2;
                    }

                    );
            }
        });
}

function activity_update(username) {
    var now = new Date();
    var query_string = "UPDATE echat_users SET stamp = $1 WHERE username = $2";
    var values = [now, username];
    client.query(query_string, values);
}





// post message endpoint
app.post('/logout', function (req, res) {
    console.log("Logout requested");
    // clear the old user table   

    // parse the body of the POST request
    // node.js boiilterplate for handling 
    // a body stream from the PUT request
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        // at this point, `body` has the entire request body stored in it as a string
        body = JSON.parse(body);
        console.log("logout POST request body is: " + body.username);


        // Add the new user to the username table
        let query_string = "DELETE FROM echat_users WHERE username = $1";
        let values = [body.username];
        console.log("It's query time! Query string / values: ");
        console.log(query_string);
        console.log(values);
        client.query(query_string, values, (err, data) => {
            if (err) {
                console.log(err);
            };
            res.json("ok all is good thank you");
        });
    });


});

// TODO: Cleanup function
// Logout a user who hasn't sent a message in 10 minutes

// TODO: Investigate using sessions for logging in (maybe for the next app?)

// Start up the server:
app.listen(port, function () {
    console.log('App up and listening on port ' + port + '!')
});