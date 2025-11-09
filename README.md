# Module Catalog MCP

> MCP Server for module search and recommendation

Part of the [Modsynth](https://github.com/modsynth) ecosystem.

## Features

- Search modules by keyword
- Get module recommendations
- Integration with Claude Code

## Installation

```bash
npm install -g @modsynth/module-catalog-mcp
```

## Usage with Claude Code

Add to your MCP settings:

```json
{
  "mcpServers": {
    "module-catalog": {
      "command": "npx",
      "args": ["-y", "@modsynth/module-catalog-mcp"]
    }
  }
}
```

## Tools

### search_modules
Search for modules by keyword, category, or technology.

### recommend_modules
Get module recommendations for a specific use case.

## Version

Current version: `v0.1.0`

## License

MIT
