export default class Text2Tana {
  // class init //

  // standard Tana schema
  schema = {
    nodes: { inbox: 'INBOX', schema: 'SCHEMA', library: 'LIBRARY' },
    supertags: {},
    fields: { due: 'SYS_A61' },
  }
  // Text2Tana settings
  settings = {
    symbols: { supertag: '#', field: ':', node: '@' },
    default: { target: 'inbox', type: 'plain' },
  }

  // merge schema and settings
  constructor(schema = {}, settings = {}) {
    this.schema = {
      nodes: { ...this.schema.nodes, ...schema.nodes },
      supertags: { ...this.schema.supertags, ...schema.supertags },
      fields: { ...this.schema.fields, ...schema.fields },
    }
    this.settings = {
      symbols: { ...this.settings.symbols, ...settings.symbols },
      default: { ...this.settings.default, ...settings.default },
    }
  }

  // core //

  // construct a complete Tana payload from a text
  api_payload(one_line) {
    const o = this.parse(one_line)
    const targetNodeId = this.schema.nodes[o.target || this.settings.default.target]
    const nodes = [this.api_node(o)]
    return { targetNodeId, nodes }
  }

  // input: a node (possibly with children) in the "natural language object" format (returned from this.parse)
  // output: a node and its children in Tana API format, with the IDs and settings from this.schema applied
  api_node(o) {
    const name = o.name || ''
    const dataType = o.type || this.settings.default.type
    const supertags = (o.supertags || []).map(t => ({ id: this.schema.supertags[t] }))
    const fields = (o.fields || []).map(f => ({
      attributeId: this.schema.fields[f.field],
      type: 'field',
      children: [{ id: this.schema.nodes[f.value], dataType: 'reference' }],
    }))
    const urls = (o.urls || []).map(u => ({ name: u, dataType: 'url' }))
    return { name, dataType, supertags, children: [...fields, ...urls] }
  }

  // parse a text string to a "natural language object"
  parse(input_text) {
    const input = { text: ` ${input_text} ` }
    const output = {}

    // does two things: returns the values from matched groups and strips the corresponding full match from input text
    // only regexp groups are returned, if the regexp doesn't have groups, the full match is used
    // input: a regexp *string* and an object with the property text
    // return: a two-level array with matches as level 1 and groups as level 2
    function extract(regexp, input) {
      let groups
      const all = Array.from(input.text.matchAll(new RegExp(regexp, 'ig'))).map(m =>
        m.slice(0, m.length)
      )
      if (all.length > 0) {
        groups = []
        all.forEach(a => {
          groups.push(a.slice(a.length === 1 ? 0 : 1, a.length))
          input.text = input.text.replace(a[0], ' ') // modify the referenced object
        })
      }
      return groups || [[]]
    }

    // extract from input. current support:
    //   target     "@node" (only if it appears in the beginning)
    //   urls       autodetect "http(s)" as URLs (cannot include the space character)
    //   supertags  " #supertag"
    //   fields     "field:value"
    const target = extract(
      `^\\s*${this.settings.symbols.node}(${Object.keys(this.schema.nodes).join('|')})\\b`,
      input
    )
    if (typeof target[0][0] !== 'undefined') output.target = target[0][0]

    const urls = extract(`https?:\\/\\/\\S+`, input) // should be extracted before supertags
    if (typeof urls[0][0] !== 'undefined') output.urls = urls.map(u => u[0])

    const supertags = extract(
      `(\\b|\\s)${this.settings.symbols.supertag}(${Object.keys(this.schema.supertags).join(
        '|'
      )})\\b`,
      input
    )
    if (typeof supertags[0][1] !== 'undefined') output.supertags = supertags.map(t => t[1])

    const fields_with_nodes = extract(
      `\\b(${Object.keys(this.schema.fields).join('|')})${
        this.settings.symbols.field
      }(${Object.keys(this.schema.nodes).join('|')})`,
      input
    )
    if (typeof fields_with_nodes[0][1] !== 'undefined')
      output.fields = fields_with_nodes.map(f => ({ field: f[0], value: f[1] }))

    // remove consecutive spaces and trim
    output.name = input.text.replaceAll(/\s+/gi, ' ').trim()

    return output
  }
}
