const Text2Tana = function (schema = {}, settings = {}) {
  // init //

  // standard Tana schema
  const standard_schema = {
    nodes: { inbox: 'INBOX', schema: 'SCHEMA', library: 'LIBRARY' },
    supertags: {},
    fields: { due: 'SYS_A61' },
  }
  // Text2Tana settings
  const standard_settings = {
    symbols: { supertag: '#', field: ':', node: '@' },
    default: { target: 'inbox', type: 'plain' },
  }

  // merge schema and settings
  schema = {
    nodes: { ...standard_schema.nodes, ...schema.nodes },
    supertags: { ...standard_schema.supertags, ...schema.supertags },
    fields: { ...standard_schema.fields, ...schema.fields },
  }
  settings = {
    symbols: { ...standard_settings.symbols, ...settings.symbols },
    default: { ...standard_settings.default, ...settings.default },
  }
  // core //

  // construct a complete Tana payload from a text
  const api_payload = one_line => {
    const o = parse(one_line)
    const targetNodeId = schema.nodes[o.target || settings.default.target]
    const nodes = [api_node(o)]
    return { targetNodeId, nodes }
  }

  // input: a node (possibly with children) in the "natural language object" format (returned from parse)
  // output: a node and its children in Tana API format, with the IDs and settings from schema applied
  const api_node = o => {
    const name = o.name || ''
    const dataType = o.type || settings.default.type
    const supertags = (o.supertags || []).map(t => ({ id: schema.supertags[t] }))
    const fields = (o.fields || []).map(f => ({
      attributeId: schema.fields[f.field],
      type: 'field',
      children: [{ id: schema.nodes[f.value], dataType: 'reference' }],
    }))
    const urls = (o.urls || []).map(u => ({ name: u, dataType: 'url' }))
    return { name, dataType, supertags, children: [...fields, ...urls] }
  }

  // parse a text string to a "natural language object"
  const parse = input_text => {
    const input = { text: ` ${input_text} ` }
    const output = {}

    // extract from input. current support:
    //   target     "@node" (only if it appears in the beginning)
    //   urls       autodetect "http(s)" as URLs (cannot include the space character)
    //   supertags  " #supertag"
    //   fields     "field:value"
    const target = extract(
      `^\\s*${settings.symbols.node}(${Object.keys(schema.nodes).join('|')})\\b`,
      input
    )
    if (typeof target[0][0] !== 'undefined') output.target = target[0][0]

    const urls = extract(`https?:\\/\\/\\S+`, input) // should be extracted before supertags
    if (urls[0].length > 0) output.urls = urls.map(u => u[0])
    const supertags = extract(
      `${settings.symbols.supertag}(${Object.keys(schema.supertags).join('|')})\\b`,
      input
    )
    if (typeof supertags[0] !== 'undefined') output.supertags = supertags.map(t => t[0])

    const fields_with_nodes = extract(
      `\\b(${Object.keys(schema.fields).join('|')})${settings.symbols.field}(${Object.keys(
        schema.nodes
      ).join('|')})\\b`,
      input
    )
    if (typeof fields_with_nodes[0][1] !== 'undefined')
      output.fields = fields_with_nodes.map(f => ({ field: f[0], value: f[1] }))

    // remove consecutive spaces and trim
    output.name = input.text.replaceAll(/\s+/gi, ' ').trim()

    return output
  }

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
        if (a[a.length - 1] != '') {
          groups.push(a.slice(a.length === 1 ? 0 : 1, a.length))
          input.text = input.text.replace(a[0], ' ') // modify the referenced object
        }
      })
    }
    return groups || [[]]
  }

  // return "public" functions
  return { api_payload, api_node, parse, schema, settings }
}
export default Text2Tana
