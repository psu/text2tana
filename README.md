# Text2Tana

## Description

**Text2Tana** is a small parser that can take a single line of text and convert it to the JSON format used by [Tana Input API](https://tana.inc/docs/input-api) (addToNodeV2).

The goal is to keep the input simple and easy to type (and remember how to type), while supporting the different formats that are supported by the Input API.
Use it to support use cases you repeat several times a day, for example adding to-dos, bookmarks or quick notes to Tana.

**Text2Tana**'s focus is to _add new nodes_ to Tana using the _existing_ schema.

## Usage

**1. Create a new object with your custom schema**

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

This text:

> Read this blog post https<area>://medium.com/@user/article #task project:myproject

Becomes these nodes:

> - Inbox  
>   …
>   - Read this blog post _#task_  
>     &nbsp;&nbsp; `>` Project &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _My project_
>     - https<area>://medium.com/@user/article

```js
const input = '@myproject Investigate a complex subject #task'
const payload = tana.api_payload(input)
```

This text:

> @myproject Investigate a complex subject #task

Becomes this node:

> - My project  
>   …
>   - Investigate a complex subject _#task_

**3. Send the payload to Tana Input API**

```js
fetch('https://europe-west1-tagr-prod.cloudfunctions.net/addToNodeV2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer xxxAPI_TOKENxxx' },
  body: JSON.stringify(payload),
})
```

## Token support

The parser currently supports the following tokens:

| Token    | Format             | Comment                                              |
| -------- | ------------------ | ---------------------------------------------------- |
| Target   | @nodename          | Target be the very first thing in the text           |
| URL      | http(s)://         | URLs with spaces are not supported                   |
| Supertag | #tagname           |                                                      |
| Field    | fieldname:nodename | Currently support only for a node reference as value |

## Custom Schema

Those are the schema definitions pre-defined in **Text2Tana**:

```js
// Tana built-in schema
schema = {
  nodes: { inbox: 'INBOX', schema: 'SCHEMA', library: 'LIBRARY' },
  supertags: {},
  fields: { due: 'SYS_A61' },
}
```

For **Text2Tana** to be useful, you want to extend the built-in schema with a mapping that is specific to your workspace.
This has to be done manually in the code with the format shown above. See also [Usage](#usage).

- `nodename`, `tagname`, `fieldname` should be a short name that you choose, for example "prj" for the supertag "Project".
- `nodeID` is the unique code Tana uses for all nodes. This is the easiest way to find the nodeID:
  1. Zoom in on the node, or open the field definition or supertag configuration.
  2. Run the command _Copy link_ (hit `Cmd+K` and enter the command).
  3. Copy the code after the equal sign: https<area>://app.tana.inc?nodeid=`CQ2xxx1N23K`

<table>
  <thead><tr><th>Mapping</th><th colspan=2>Usage</th></tr></thead>
  <tbody>
    <tr><td rowspan=2><code>nodename: 'nodeID'</code></td><td>Target</td><td>@<b>nodename</b></td></tr>
    <tr><td>Field types with a <br>node reference as value<sup><a href="#user-content-1">[1]</a></sup></td><td>field:<b>nodename</b></td></tr>
    <tr><td><code>tagname: 'nodeID'</code></td><td>Supertag</td><td>#<b>tagname</b></td></tr>
    <tr><td><code>fieldname: 'nodeID</code></td><td>Field</td><td><b>fieldname</b>:value</td></tr>
  </tbody>
</table>

## Settings

Settings can be modified or updated in a similar way, but it is optional.

```js
// Text2Tana settings
settings = {
  symbols: { supertag: '#', field: ':', node: '@' },
  default: { target: 'inbox', type: 'plain' },
}
```

## Methods

The returned **Text2Tana** object has 3 methods:

### `api_payload` - Construct a complete payload from text

- **Input:** One line of text.
- **Output:** A complete Tana Input API payload.

### `api_node` - Convert a "natural language object" to a Tana Input API node

- **Input:** A node (possibly with children) in the "natural language object" format (returned from `this.parse`).
- **Output:** The node and its children in the Tana API format, with the IDs and settings from `this.schema` and `this.settings` applied.

### `parse` - Parse a text string to a "natural language object"

- **Input:** One line of text.
- **Output:** A "natural language object" with the values extracted from the input text.

The "natural language object" is an intermediate object containing the parser's interpretation of the text.
It does not yet include any of the IDs etc. that are required to send the data to a specific Tana workspace.

In addition to the methods, schema and settings, are also returned.

## Changelog

### 1.0.0

- Initial release.
- **1.0.1**
  - Remove class syntax.

## Roadmap

- Support for all node data types: ~~plain~~, field, ~~url~~, date, reference, boolean, file
- Default field token: `:fieldvalue`
- Support for all field types: Plain, ~~Options~~, ~~Options from supertag~~, Date, Number, ~~Tana User~~, Url, E-Mail, Checkbox
- Support formatting: `**bold**` `__italic__` `~~striked~~` `^^highlight^^`
- Support inline link, reference, and date.
- Support for node description.
- Helper splitting text into child nodes (incl. handling multiline).
- Support for multiple field values.

---

<a name="1"><b>1:</b></a> List of field types and what node data type it expects (needs testing):

| Field type             | Node data type |
| ---------------------- | -------------- |
|  Plain                 | plain          |
|  Number                | plain?         |
|  E-Mail                | plain?         |
|  Options               | reference      |
|  Options from supertag | reference      |
|  Tana User             | reference      |
|  Date                  | date           |
|  Url                   | url            |
|  Checkbox              | boolean        |
