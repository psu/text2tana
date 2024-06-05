import Text2Tana from './text2tana.mjs'
;(async () => {
  const custom_schema = {
    nodes: {
      myproject: 'VSGhexxxxe9n',
    },
    supertags: {
      task: 'vGqWxxxxY',
      incoming: '8mMbxxxfGJK',
    },
    fields: { project: 'C_Q2AyxxxN23K' },
  }
  const tana = new Text2Tana(custom_schema)
  const payload = tana.api_payload(
    '@inbox This is an example of what Text2Tana can do. Check it out! https://github.com/psu/text2tana'
  )
  const response = await fetch('https://europe-west1-tagr-prod.cloudfunctions.net/addToNodeV2', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer xxxAPI_TOKENxxx',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const content = await response.json()
  console.log(content)
})()
