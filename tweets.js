const https = require('https');
const secrets = require('./secrets.json');
//this is the first function called by the route above. The purpose is to get the access tokens from twitter
//the cb here is the function we will use to actually get the headlines once we've got the tokens.
function getAccessTokens(cb) {

    //here we will use built in node modules to send the http reuests to the twitter api
    //first set the optons for the token-request
    //the information for this comes from the twitter app only auth documentation
    //note that this is a post request. Twitter expects something in the body - see below where we call res.write();
    const options = {
        method: 'POST',
        host: 'api.twitter.com',
        path: '/oauth2/token',
        headers: {
            'Authorization': 'Basic ' + new Buffer(secrets.consumerKey + ":" + secrets.consumerSecret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    };

    //requesting access token
    //the requeset method takes two parmeters: and object that contains the params for the https request and function that will receieve the response object from twitter.
    const req = https.request(options, (res) => {
        if(req.statusCode != 200) {
            console.log('Status is not 200');
        }

        //handle response data
        //this is an asynch process so listen for data events, concat and then listen for end event to process
        var body = '';
        res.on('data', (chunk) => {
            body += chunk;
        }).on('end', () => {
            //the data comes back as a string so parse into JSON so we can access the properties
            //parse the body into json, json.stringify and parse throw errors so must use try/catch
            try {
                var access = JSON.parse(body);
                console.log(access);
                //cb was the first param of this function and in this case references the getTweets function.
                //the first param here is null, because the function is expecting an error as the first param.
                //this is a method of error handling.
                //the second param is the access token JSON object
                cb(null, access);

            } catch (e) {
                console.error('json parse error', e);
                cb(e);
            }
        });
    });

    //twitter specifically asks for this in the body.
    req.write('grant_type=client_credentials');

    //requests can throw errors so make sure to handle them.
    req.on('error', (e) => {
        console.error(e);
    });

    //actually send the request.
    req.end();
}



//this function is the callback passed to getAccessTokens so it is called once the access token comes back
function getTweets(err, data, cb) {
    if(err) {
        console.log('err');
        return;
    }

    //destructuring to make it clearer what data is being used in the get request
    let {token_type, access_token} = data;

    //twitter wants us to do this...says so in the api docs.
    //but it also seems like a good check to make sure we got the right stuff back from twitter.
    if(token_type != 'bearer') {
        console.log('incorrect access token type');
        return;
    }

    /*
    GET /1.1/statuses/user_timeline.json?count=100&screen_name=twitterapi HTTP/1.1
Host: api.twitter.com
User-Agent: My Twitter App v1.0.23
Authorization: Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2FAAAAAAAAAAAA
                      AAAAAAAA%3DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Accept-Encoding: gzip
    */

    //setting options for request to get headlines.  Twitter gave the above commented out example
    const options = {
        method: 'GET',
        host: 'api.twitter.com',
        path: '/1.1/statuses/user_timeline.json?screen_name=theonion',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    };

    //requesting tweets
    //first param is the options from above and second is a function that gets the response object from twitter.
    const req = https.request(options, (res) => {

        if(res.statusCode != 200) {
            console.log('something went wrong, bad request.');
            return;
        }

        //assuming response was 200 we're all set to start getting data.
        var body = '';
        res.on('data', (chunk) => {
            body += chunk;
        }).on('end', () => {

            //parse the body into json
            try {
                var tweets = JSON.parse(body);
                console.log('parse successfull...');
                //here we send first null since there is no error.
                //pass in the tweets we've gotten from twitter to the callback which in this case is getHeadlines which will filter the tweets we got back from twitter.
                cb(null, tweets);

            } catch (e) {
                console.error('json parse error', e);
                //cb(e);
            }
        });
    }); //end request

    req.on('error', (e) => {
        console.error(e);
    });

    req.end();

}

function getHeadlines(err, tweets, cb) {
    if(err) {
        console.error(err);
        return;
    }

    //filter out the tweets that have too many urls
    var goodTweets = tweets.filter((tweet) => {
        return tweet.entities.urls.length === 1;
    });

    //get just the text and url from the good tweets
    //make sure to format this the same way we did for our json used in our ticker.
    var headlines = [];
    goodTweets.forEach(function(tweet) {
        headlines.push({
            "text" : tweet.text,
            "url" : tweet.entities.urls[0].url
        });
    });

    //take the headlines array and stringify it so we can send it in the response.
    //send the response back!
    try {
        var jsonHL = JSON.stringify(headlines);
        console.log('json headlines: ', jsonHL);
        cb(null, jsonHL);

    } catch (e) {
        console.log(e);
        cb(e);

    }
}

module.exports.getAccessTokens = getAccessTokens;
module.exports.getTweets = getTweets;
module.exports.getHeadlines = getHeadlines;
