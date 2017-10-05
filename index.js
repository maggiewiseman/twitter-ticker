const express = require('express');
const tweets = require('./tweetsPromise');
const app = express();


app.get('/headlines', (req, res) => {

    tweets.getNewsHeadlines().then((headlines) => {
        res.send(headlines);
    }).catch((e)=> {
        console.log(e);
    });
});

//this route will allow us to serve the js, html and css files from the public directory on the server.
app.use(express.static(__dirname + '/public'));

//Back to Express... give a port for the server to start
app.listen(8080, () => console.log('listening on port 8080'));
