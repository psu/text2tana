const i = {
  text: 'mtest',
  apikey:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaWxlSWQiOiJZclhDUnIxU0N1IiwiY3JlYXRlZCI6MTcxNzYwNzI0ODI0NiwidG9rZW5JZCI6IkpIbUxlMXREbkRQdyJ9.eC6g_FVDZm7oGrPczg3X9hWWlwotZgUmKB3GAet8U0c',
  settings: {},
  schema: {},
}
import Text2Tana from './text2tana.mjs'
;(async () => {
  const t = new Text2Tana(i.schema, i.settings),
    p = t.api_payload(i.text),
    q = console.log(JSON.stringify(p)),
    r = await fetch('https://europe-west1-tagr-prod.cloudfunctions.net/addToNodeV2', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + i.apikey, 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    }),
    c = await r.json()
  console.log(JSON.stringify(c))
})()
