const express = require('express')
const app = express()

// Port is set to 3001 by default or else whatever Heroku tells it to be 
const port = process.env.PORT || 3001;

// express looks up files relative to the static directory, so it doesn't become part of the url
// this is a middleware function
app.use(express.static('build'))

// Hello world test for server response
app.get('/', function (req, res) {
  res.send('Hello World!')
})


// Test endpoint for testing
app.get('/test', function (req, res) {
    console.log("test endpoint hit");
    res.json("Success! This text delivered from the server.");
  })




// Start up the server:
app.listen(port, function () {
    console.log('App up and listening on port ' + port + '!')
})