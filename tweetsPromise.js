const https = require('https');
const secrets = require('./secrets.json');


function getNewsHeadlines() {

    return new Promise((resolve, reject) => {
        var newsOrgList = ['theonion', 'goodnewsnetwork', 'NatEnquirer'];
        getAccessTokens(newsOrgList).then((tokens) => {
            //now I have the access tokens, I need to send three requests - one to each news org
            //mapping the list will make me a new array of promises.
            var tweetPromiseArray = newsOrgList.map((org) => {
                //each getTweets resolves the raw tweets which is an array of objects w/ tweet data
                //when that is done, process the headlines
                return getTweets(org, tokens).then((tweetData) => {
                    return getHeadlines(org, tweetData);

                });
            });


            Promise.all(tweetPromiseArray).then((headlines) => {

                //this should be an array of arrays so I need to concat and sort by date before resolving.
                var merged = [].concat.apply([], headlines);

                merged.sort(function(a,b) {
                    let dateA = new Date(a.created);
                    let dateB = new Date(b.created);

                    return -1 * (dateA - dateB);
                });

                resolve(JSON.stringify(merged));
            });

        }).catch((e) => {
            console.log(e);
            reject(e);
        });
    });
}

function getAccessTokens() {
    return new Promise((resolve, reject) => {

        const options = {
            method: 'POST',
            host: 'api.twitter.com',
            path: '/oauth2/token',
            headers: {
                'Authorization': 'Basic ' + new Buffer(secrets.consumerKey + ":" + secrets.consumerSecret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
        };
/*
function httpRequest(params, postData) {
    return new Promise(function(resolve, reject) {
        var req = http.request(params, function(res) {
            // on bad status, reject
            // on response data, cumulate it
            // on end, parse and resolve
        });
        // on request error, reject
        // if there's post data, write it to the request
        // important: end the request req.end()
    });
}
*/
        const req = https.request(options, (res) => {
            //this is an asynch process so listen for data events, concat and then listen for end event to process
            var body = '';
            res.on('data', (chunk) => {
                body += chunk;
            }).on('end', () => {
                resolve(JSON.parse(body));
            });
        }); //end req

        //twitter specifically asks for this in the body.
        req.write('grant_type=client_credentials');

        //requests can throw errors so make sure to handle them.
        req.on('error', (e) => {
            reject(e);
        });

        //actually send the request.
        req.end();
    });
}

function getTweets(org, token) {
    return new Promise((resolve, reject) => {
        //destructuring to make it clearer what data is being used in the get request
        let {token_type, access_token} = token;

        //twitter wants us to do this...says so in the api docs.
        //but it also seems like a good check to make sure we got the right stuff back from twitter.
        if(token_type != 'bearer') {
            reject('incorrect access token type');
        }

        //setting options for request to get headlines.  Twitter gave the above commented out example
        const options = {
            method: 'GET',
            host: 'api.twitter.com',
            path: '/1.1/statuses/user_timeline.json?screen_name=' + org,
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        };

        //requesting tweets
        //first param is the options from above and second is a function that gets the response object from twitter.
        const req = https.request(options, (res) => {

            if(res.statusCode != 200) {
                reject('something went wrong, bad request.');
            }

            //assuming response was 200 we're all set to start getting data.
            var body = '';
            res.on('data', (chunk) => {
                body += chunk;
            }).on('end', () => {
                resolve(JSON.parse(body));
            });
        }); //end request

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}



    /*
    GET /1.1/statuses/user_timeline.json?count=100&screen_name=twitterapi HTTP/1.1
Host: api.twitter.com
User-Agent: My Twitter App v1.0.23
Authorization: Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%2FAAAAAAAAAAAA
                      AAAAAAAA%3DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Accept-Encoding: gzip
    */


function getHeadlines(org, tweets) {
    //filter out the tweets that have too many urls
    var goodTweets = tweets.filter((tweet) => {
        return tweet.entities.urls.length === 1;
    });

    console.log(goodTweets[0].user.entities);
    //get just the text and url from the good tweets
    //make sure to format this the same way we did for our json used in our ticker.
    var headlines = [];
    goodTweets.forEach(function(tweet) {
        let text = tweet.text + ' Source: ' + org;
        text = text.replace(tweet.entities.urls[0].url, '');
        headlines.push({
            "text" : text,
            "url" : tweet.entities.urls[0].url,
            "created" : tweet.created_at
        });
    });

    return(headlines);
}

module.exports.getNewsHeadlines = getNewsHeadlines;
