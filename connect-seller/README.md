# Sample app demonstrating integration for a Mirakl Connect Seller

## What the sample contains

This directory contains a sample web app which demonstrates how to:

* use the `client_id`, `client_secret` and `company_id` given in the "API Integrations" details page in order to acquire an access token
* periodically renew the access token
* use the access token to authenticate a call to a Mirakl Connect API

## How to run the sample

1. Run `yarn install`
2. Fill in the `config.js` file with:
    * the Mirakl auth server url
    * your `client_id` (retrieved from the "Settings > API integration" page)
    * your `client_secret` (retrieved from "Settings > API integration" page)
    * your `company_id` (retrieved from "Settings > API integration" page)
    * the Mirakl Connect platform url
3. Start the application: `node index.js`
4. Open `http://localhost:10001`
