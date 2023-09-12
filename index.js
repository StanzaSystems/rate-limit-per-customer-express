const express = require('express')
const app = express()
const port = 3008
const cors = require('cors')
require('dotenv').config()
console.log(process.env.STANZA_API_KEY)
require('./stanzaInit')
const {stanzaGuard, StanzaGuardError } = require('@getstanza/node')

const corsOptions = {
  origin: '*'
}

app.use(cors(corsOptions))
app.use(express.json())

const customerLimiter = (req, res, next) => {
  const customerId = req.get('x-customer-id')

  void stanzaGuard({
    guard: 'customer_main_limiter',
    tags: [{
      key: 'customer_id',
      value: customerId }]
  }).call(next).catch(next)
}

app.use('*', customerLimiter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(((err, req, res, next) => {
  if (err instanceof StanzaGuardError) {
    res.status(429).send('Too many requests')
  } else {
    next(err)
  }
}))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})