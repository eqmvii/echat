const express = require('express')
const app = express()
const { Client } = require('pg')

// Database connection code

var client;
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
client.query('SELECT * FROM test_table;', (err, res) => {
    if (err) throw err;
    console.log("Read succeeded; rows: ");
    for (let row of res.rows) {
        console.log("Row read from PostgreSQL table: ");
        console.log(JSON.stringify(row));
    }
});
// End database connection and testing code (modularize?)

// Port 3001 by default or else whatever Heroku tells it to be 
const port = process.env.PORT || 3001;

// express looks up files relative to the static directory,
// so the folder name doesn't become part of the url
app.use(express.static('build'));

// API endpoint for testing
app.get('/test', function (req, res) {
    console.log("test endpoint hit");
    client.query('SELECT * FROM test_table;', (err, response) => {
        if (err) throw err;
        res.json(response.rows[0].name);
    });
});

// Start up the server:
app.listen(port, function () {
    console.log('App up and listening on port ' + port + '!')
});