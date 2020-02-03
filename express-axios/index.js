const express = require('express'),
    cookieParser = require('cookie-parser'),
    hbs = require('hbs'),
    crypto = require('crypto'),
    axios = require('axios');

const configFile = process.env.CONFIG ? process.env.CONFIG : './config';
console.log(`loading config from ${configFile}`);
const cfg = require(configFile);

console.log(`using mirakl auth server @ ${cfg.auth_url}`);

const app = express();

app.use(cookieParser(cfg.cookie_secret));
app.set('view engine', 'html');
app.engine('html', hbs.__express);

// This is the index page
// Where we will display a "Login with your mirakl account" to users
app.get('/', function (req, res) {
    // generate a random state to authenticate the callback later
    // this is not strictly required, but it's a good idea to ensure
    // that the workflow was really triggered by us and not by a malicious attacker
    var state = crypto.randomBytes(20).toString('hex');

    res.cookie('_state', state, {
        maxAge: 30 * 60 * 1000,
        httpOnly: true,
        signed: true
    });

    // in the view, generate a link to mirakl auth server/authorize with your client id and state
    res.render('index', {cfg: cfg, state: state});
});

// This is the callback handler
// Which will be called back by Mirakl auth server with the authorization code
app.get('/callback', (req, res) => {
    // When app-auth calls us back, it passes the authorization code
    const code = req.query.code,
        state = req.query.state,
        referenceState = req.signedCookies['_state'];

    if (referenceState !== state) {
        console.error('something fishy going on');
        throw new Error('Fishy Call');
    }

    // which we're going to exchange against an access token via a POST /oauth/token
    axios.request({
        // make a POST request
        method: 'post',
        // to the Github authentication API, with the client ID, client secret
        // and request token
        url: `${cfg.auth_url}/oauth/token`,
        // Set the content type header, so that we get the response in JSOn
        headers: {
            accept: 'application/json'
        },
        params: {
            grant_type: 'authorization_code',
            client_id: cfg.client_id, // we have to provide our client id
            client_secret: cfg.client_secret,  // we have to provide our client secret to authenticate the call (this is a serer-to-server exchange, the secret will not be leaked to the user)
            code: code // and we provide the authorization code
        }
    }).then((response) => {
        // The response contains the access token & possibly the refresh token
        const accessToken = response.data.access_token,
            refreshToken = response.data.refresh_token;

        console.log(`Success ! access_token=${accessToken}, refresh_token=${refreshToken}`);
        /* We need to store those 2 in a secure store (encrypted)
          and use the access token to make calls, e.g.:

          GET some_mirakl_api
          Authorization Bearer ${accessToken}

          Whenever the access token expires, we can refresh it using the refresh token
         */
    }).catch(err => console.error(err));
});

app.listen(10000);
