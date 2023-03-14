const express = require('express'),
    cookieParser = require('cookie-parser'),
    hbs = require('hbs'),
    axios = require('axios');

/*
    This function calls the authentication API using the client_id, client_secret and company_id
    retrieved from the configuration file in order to acquire an access token that you can use to
    authenticate your calls to the Mirakl Connect APIs.
 */
const retrieveNewToken = () => {
    axios.request({
        method: 'post',
        url: `${cfg.auth_url}/oauth/token`,
        headers: {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
            grant_type: 'client_credentials',
            client_id: cfg.client_id, // We provide the client id,
            client_secret: cfg.client_secret,  // the client secret to authenticate the call (this is a server-to-server exchange, the secret is not leaked to the user)
            audience: cfg.company_id // and the company id
        }
    }).then((response) => {
        // The response contains the access token (valid 1 hour).
        token = response.data.access_token;

        /* We store it in a secure datastore (encrypted)
          and use the access token to make calls, e.g.:

          GET some_mirakl_api
          Authorization Bearer ${accessToken}

          We refresh this token every hour.
         */
        console.log("New access token acquired.")
    });
}

const { CronJob } = require('cron');
/*
    This procedure allows you to periodically acquire a new access token to ensure that
    the application always have a valid access token available to authenticate API calls.

    Develop an equivalent in your system.
 */
const refreshTokenJob = new CronJob(
    '0 */50 * * * *', // The token is valid for 60 minutes, so we refresh it every 50 minutes to keep a safe margin.
    async () => {
        console.log("Automatic periodic access token refresh");
        retrieveNewToken();
    },
    null,
    true
);

const configFile = process.env.CONFIG ? process.env.CONFIG : './config';
console.log(`loading config from ${configFile}`);
const cfg = require(configFile);

console.log(`using mirakl auth server @ ${cfg.auth_url}`);

refreshTokenJob.start();
const app = express();

// DO NOT DO THIS
// This is a convenient global variable for demo purpose that stores the current access token.
// In a real production environment you must encrypt the token to store it safely, decrypt it everytime you need it
// and never keep the decrypted value for long in memory.
let token;
retrieveNewToken(); // Get a token the first time

app.use(cookieParser(cfg.cookie_secret));
app.set('view engine', 'html');
app.engine('html', hbs.__express);

// This is the index page where we want to list all the orders from Connect.
app.get('/', function (req, res) {

    axios.request({
        method: 'get',
        url: `${cfg.connect_url}/api/orders`,
        headers: {
            accept: 'application/json',
            authorization: `Bearer ${token}` // We use the acquired access token to authenticate the call.
        }
    }).then((response) => {
        const orders = response.data.data;

        res.render('index', {cfg: cfg, orders: orders});
    }).catch(err => console.error(err));
});

app.listen(10001);
