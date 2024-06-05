Parse text and return JSON for Tana Input API

# Text2Tana

## Usage

**1. Create a class instance with your custom schema**
```js
const custom_schema = {
  nodes: { myproject: 'VSGhxxJaJe9n' },
  supertags: { task: 'vGqW0xxzxY', anothertag: 'G2RxxN1wO6' },
  fields: { project: 'CQ2Ayxx1N23K' },
}
const tana = new Text2Tana(custom_schema)
```

**2. Create a Tana Input API payload from a text**
```js
const input = 'Read this blog post https://medium.com/@user/article #task project:myproject'
const payload = tana.api_payload(input)
```
This will create the following node and child nodes in your _Inbox_:
> * Inbox  
>   …
>   * Read this blog post _#task_  
>     &nbsp;&nbsp; `>` Project &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _My project_
>     * https://medium.com/@user/article

***OR***

```js
const input = '@myproject Investigate a complex subject #task'
const payload = tana.api_payload(input)
```
This will create the following node in your node _My project_:
> * My project  
>   …
>   * Investigate a complex subject _#task_

**3. Send the payload to Tana Input API**
```js
fetch('https://europe-west1-tagr-prod.cloudfunctions.net/addToNodeV2', {
  method: 'POST',
  headers: {'Content-Type': 'application/json', Authorization: 'Bearer xxxAPI_TOKENxxx',},
  body: JSON.stringify(payload),
})
```


## Token support
The parser currently supports the following tokens:

| Token     | Format        | Comment |
|-----------|---------------|---------|
| Target    | `@node`       | Target must start the string |
| URL       | `http(s)://`  | Cannot include the space character) |
| Supertag  | `#supertag`   ||
| Field     | `field:node`  | Currently only supporting a node as value |

## Settings and Schema
* These are the schema definitions and settings that are pre-defined in the class. 
* The schema must be extened with your specific IDs to be useful:
   * node : nodeId
   * supertag : supertagId
   * field : fieldId
* Settings can be modified, but it is optional

```
// standard Tana schema
schema = {
  nodes: { inbox: 'INBOX', schema: 'SCHEMA' },
  supertags: {},
  fields: { due: 'SYS_A61' },
}
```
```
// Text2Tana settings
settings = {
  symbols: { supertag: '#', field: ':', node: '@' },
  default: { target: 'inbox', type: 'plain' },
}
```

## Methods
The Text2Tana class have 3 methods:

### `api_payload` - Construct a complete payload from text
* **Input:** one line of text
* **Ouput:** a complete Tana Input API payload

### `api_node` - Convert a "natural language object" to a Tana Input API node
* **Input:** A node (possibly with children) in the "natural language object" format (returned from `this.parse`)
* **Output:** The node and its children in the Tana API format, with the IDs and settings from `this.schema` and `this.settings` applied

### `parse` - Parse a text string to a "natural language object"
* **Input:** one line of text
* **Output:** a "natural language object" with the values extracted from the input text

The "natural language object" is an intermediate containing the parsers interpretation of the text. 
It does not yet include any of the IDs etc. that are required to send the data to a specific Tana workspace.
