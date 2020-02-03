# Sample app demonstrating obtaining Mirakl access token using express and axios

Whew, that title was a mouthful !

## What the sample contains

This directory contains a sample web app:

* which demonstrates how to propose a "Login with your Mirakl account" button
* When the user clicks on the button, they get redirected to Mirakl auth server
* Where they can sign in
* And authorize a partner app to access their Mirakl resources
* After which they get redirected back to the partner site
* Which then exchanges an authorization code against an access token
* The access token can then be used to call Mirakl APIs

## How to run the sample

1. First, run `yarn install`
2. You then need to fill the `config.js` with (To obtain those, you need to contact Mirakl to set up a partner account):
    * the Mirakl auth server url
    * Your `client_id`
    * Your `client_secret`
3. Start the application: `node index.js`
4. Open `http://localhost:10000`
