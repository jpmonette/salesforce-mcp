# Salesforce MCP

A minimal [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/sdk) server for interacting with the Salesforce API using [jsforce](https://jsforce.github.io/).

## Preview

![](https://github.com/user-attachments/assets/33e245c6-710a-45a5-af4b-bb0e7b3fe153)

## Quick Start

```sh
git clone git@github.com:jpmonette/salesforce-mcp.git && cd salesforce-mcp
npm install
npm build
```

## Run with STDIO

```sh
node build/stdio.js
```

## Run with Streamable HTTP

```sh
node build/streamable.js
```

## Environment Variables

Set the following to authenticate with Salesforce:

| Variable              | Description              |
| --------------------- | ------------------------ |
| `SALESFORCE_USERNAME` | Your Salesforce username |
| `SALESFORCE_PASSWORD` | Your Salesforce password |

### Shell

```sh
export SALESFORCE_USERNAME=your_username
export SALESFORCE_PASSWORD=your_password
```

### Claude Desktop

```json
{
  "mcpServers": {
    "salesforce": {
      "command": "node",
      "args": ["/Users/jpmonette/Documents/Code/salesforce-mcp/build/stdio.js"],
      "env": {
        "SALESFORCE_USERNAME": "your_username",
        "SALESFORCE_PASSWORD": "your_password"
      }
    }
  }
}
```

## Contributing

Contributions, issues, and feature requests are welcome!

Feel free to check issues or submit pull requests.

## More Information

- Follow [@jpmonette](https://x.com/jpmonette) on X for updates
- [My blog](http://blogue.jpmonette.net/) to learn more about what I do!

## License

Copyright (C) 2013, Jean-Philippe Monette <contact@jpmonette.net>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
