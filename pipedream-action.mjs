import Text2Tana from 'text2tana'

export default {
  name: 'Text2Tana - Create Payload',
  description: 'Create a payload for the Tana Input API',
  key: 'text2tana_create_payload',
  version: '0.0.13',
  type: 'action',
  props: {
    text: { type: 'string', label: 'Text to parse' },
    nodes: {
      type: 'string',
      label: 'Node mapping as JSON',
      description: 'Eg. {"myproject": "wQZKLlsyFJw", "anothernode": "yeICdpTSWEK"}',
      optional: true,
    },
    supertags: {
      type: 'string',
      label: 'Supertag mapping as JSON',
      optional: true,
    },
    fields: {
      type: 'string',
      label: 'Field mapping as JSON',
      optional: true,
    },
  },
  async run({ $ }) {
    const custom_schema = {}
    try {
      if (this.nodes) custom_schema.nodes = JSON.parse(this.nodes)
    } catch {
      throw new Error('When loading Node mapping. JSON formatting error?')
    }
    try {
      if (this.supertags) custom_schema.supertags = JSON.parse(this.supertags)
    } catch {
      throw new Error('When loading Supertag mapping. JSON formatting error?')
    }
    try {
      if (this.fields) custom_schema.fields = JSON.parse(this.fields)
    } catch {
      throw new Error('When loading Field mapping. JSON formatting error?')
    }
    const tana = new Text2Tana(custom_schema)
    const payload = tana.api_payload(this.text)
    $.export('$summary', 'Payload successfully created')
    return payload
  },
}
