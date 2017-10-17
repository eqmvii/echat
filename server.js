const express = require('express')
const app = express()
const { Client } = require('pg')

// Database connection code

var client;
var server_max_id = -1;



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
setInterval(cleanup, 2000);

function cleanup () {
    const LOGOUT_INTERVAL = 30;
    console.log("Cleaning up the DBs...");
    var right_now = Date.now();
    var query_string = "SELECT * FROM echat_users";

    // Check how long it's been since each user logged in or spoke
    client.query(query_string)
        .then(response => {
            for (let i = 0; i < response.rows.length; i++){
                console.log(right_now);
                console.log(response.rows[i].stamp.getTime());
                var seconds_past = (right_now - response.rows[i].stamp.getTime()) / 1000;
                console.log("Time elapse for " + response.rows[i].username + ": " + seconds_past);
                if (seconds_past > LOGOUT_INTERVAL){
                    logout_user(response.rows[i].username);
                }
            }
        })

    
}

function logout_user(username){
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
    // console.log("Get messages endpoint hit");
    // console.log(req.query);
    var max_id = req.query.max_id;
    // console.log("React max: " + max_id + " Server max: " + server_max_id);
    if (max_id == server_max_id) {
        // console.log("React matches server, send nothing");
        res.json([]);
    }
    else {
        console.log("React is behind, send update!");
        client.query('SELECT * FROM echat_messages ORDER BY stamp desc LIMIT 20', (err, response) => {
            // console.log("Max: " + response.rows[0].id);
            // console.log("Min: " + response.rows[response.rows.length - 1].id);
            if (response.rows.length > 0) {
                server_max_id = response.rows[0].id;
            }
            if (err) throw err;
            res.json(response.rows);

        });
    }
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
        // at this point, `body` has the entire request body stored in it as a string
        console.log("Login POST request name is: " + body.username);

        var name_check_query_string = "SELECT * FROM echat_users WHERE username = $1";
        var name_check_values = [body.username];



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
                    console.log("User already logged in");
                    res.json({duplicate: true, username: body.username});
                }
                else {
                    // Prepare to the new user to the username table
                    console.log("New user; not already logged in");
                    var query_string = "INSERT INTO echat_users (username) VALUES ($1)";
                    var values = [body.username];
                    console.log("It's query time! Query string / values: ");
                    console.log(query_string);
                    console.log(values);
                    client.query(query_string, values)
                        .then(resolve => {
                            var query_string = "INSERT INTO echat_messages (username, message) VALUES ($1, $2)";
                            var values = ['   WELCOME BOT   ', 'Welcome to echat, ' + body.username + '!'];
                            console.log("It's query time! Query string / values: ");
                            console.log(query_string);
                            console.log(values);
                            client.query(query_string, values);
                            server_max_id += 2;
                        })
                        .then(resolve => (res.json({duplicate: false, username: body.username})));
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
            if(resolve.rows.length > 0){
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
                        query_string = "INSERT INTO echat_messages (username, message) VALUES ($1, $2)";
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

function activity_update(username){
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