# Per-Customer Rate Limiting in Express with Stanza

This example shows how to do per-customer rate limiting with Stanza in Express.js.

## Dependencies
- Node 16
- Express 4
- [Stanza Account](https://www.stanza.systems/)

## Creating a Stanza Guard, Split by Customer id

- Create a service in Stanza named `frontdoor`, using environment `local`
- Create a guard in Stanza named `customer_main_limiter`, using environment `local`, traffic type `inbound`

Edit the guard config of `customer_main_limiter` to be the following:

```
{
  "quotaConfig": {
    "enabled": true,
    "tagConfig": {
      "tagName": "customer_id"
    },
    "childDefaultConfigs": {
      "customer_id": {
        "rate": 3,
        "burst": 3
      }
    }
  }
}
```

This guard allocates each customer three requests per second, based on the tag customer_id - which the sample code parses from a header. It could be taken from anywhere in the code.

## Adding Stanza to Express

Install the Stanza Node library

```
npm install @getstanza/node
```

Create a Stanza init file with the following contents

```
const { init } = require('@getstanza/node')

init({
  hubUrl: 'https://hub.stanzasys.co:9020',
  apiKey: process.env.STANZA_API_KEY,
  serviceName: 'frontdoor',
  serviceRelease: '1',
  environment: 'local',
  requestTimeout: 2000,
  skipTokenCache: true
}).catch(() => {})


```

Set `STANZA_API_KEY` in your `.env` file based on the `.sample.env`



## Creating a guard to rate limit customers

In your express application, create a middleware function that references `customer_main_limiter`:

```
const customerLimiter = (req, res, next) => {
  const customerId = req.get('x-customer-id')

  void stanzaGuard({
    guard: 'customer_main_limiter',
    tags: [{
      key: 'customer_id',
      value: customerId }]
  }).call(next).catch(next)
}
```

Add the guard as a middleware at the root of your app.

```
app.use('*', customerLimiter)
```

Handle instances of `StanzaGuardError` as desired. Note that in-code error handling provides a plethora of options other than 429. Return static assets, cached responses, etc.

```
app.use(((err, req, res, next) => {
  if (err instanceof StanzaGuardError) {
    res.status(429).send('Too many requests')
  } else {
    next(err)
  }
}))

```

## Running this Sample

```
npm install
npm start
```

## Load Test This Sample

This sample contains a load test script to illustrate functionality. Run using:
```
npx artillery run load-test.yml
```