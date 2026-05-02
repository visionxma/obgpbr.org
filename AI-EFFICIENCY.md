# AI Efficiency Tools

Use these tools to reduce token usage and improve code understanding.

## RTK

Always prefer `rtk` for shell commands that may produce output:

- `rtk git status`
- `rtk test "npm test"`
- `rtk read path/to/file`
- `rtk grep "pattern" src`

## Serena

Use Serena MCP for semantic code work before reading many files manually:

- Activate the current project with Serena at the start of a session.
- Use symbol overview/search/reference tools for cross-file navigation.
- Prefer Serena for refactors, symbol lookup, and understanding architecture.

## Repomix

Use Repomix when a compact whole-project snapshot is needed:

- Use the Repomix MCP `pack_codebase` tool for AI-friendly repository context.
- Prefer `compress: true` for large projects.
- Do not commit generated `repomix-output*.xml` files unless explicitly requested.
