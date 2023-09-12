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
