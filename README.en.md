# S Copy

<p align="center">
  <img src="logo.png" width="128" height="128" alt="S Copy Logo">
</p>

Quickly collect code locations (file path + line numbers) and batch feedback to AI CLI for precise fixes.

**[中文文档](README.md)**

## Use Case

When using AI CLI tools like Aider, Claude CLI, or other AI extensions, you need to tell the AI which files to modify. Manually copying file paths and line numbers is slow and error-prone. S Copy lets you one-click collect all locations that need modification, then copy them all at once to your AI.

## Features

- **Keyboard shortcut**: Select code and press `Cmd+;` (macOS) / `Ctrl+;` (Windows/Linux) to collect instantly
- **Context menu**: Right-click selected code in editor → "+ Collect"
- **Explorer context menu**: Right-click files/folders in Explorer → "+ Collect"
- **Per-item description**: Add individual descriptions to each collected item
- **Summary description**: Add an overall summary after collecting all items
- **One-click copy**: Click "✓ Copy All" to copy formatted content to clipboard
- **History**: View history in sidebar, search, re-copy, delete
- **Status bar badge**: Shows real-time count of collected items

## Installation

1. Search for `S Copy` in VS Code Extensions Marketplace
2. Click Install

Or install manually:

```bash
code --install-extension s-copy-0.1.0.vsix
```

## Quick Start

### 1. Collect Code Locations

Select code in the editor and press `Cmd+;` (macOS) or `Ctrl+;` (Windows/Linux):

Each time you collect, the status bar count increases by 1 and a toast notification appears.

### 2. Collect from Explorer

Right-click a file or folder in the Explorer sidebar and select "+ Collect" to add the entire file/folder to the list.

### 3. Add Descriptions

Click the S Copy icon in the Activity Bar to open the panel. Each collected item has a description input field below it. You can also add a summary description at the bottom.

### 4. Copy All

Click the "✓ Copy All" button, or press `Cmd+Enter`. The content is automatically copied to your clipboard.

**Output example:**

```
Header.tsx:20-30
Type definition error here

api.ts:15-22
This API needs to be changed

Please fix the type errors in the above code
```

Just paste it into your AI CLI.

## Operations

| Action | Method |
|--------|--------|
| Collect selected code | `Cmd+;` / `Ctrl+;` |
| Collect selected code | Right-click → "+ Collect" |
| Collect file/folder | Explorer right-click → "+ Collect" |
| Open panel | Click 📋 in status bar / Activity Bar icon |
| Copy all | Click button in panel / `Cmd+Enter` |
| Clear all | Click "Clear" button in panel |

## Sidebar Panel

The sidebar has two views:

- **Code Collection**: Current collected items list, add descriptions, delete items, clear all, copy all
- **History**: History grouped by project, search, re-copy, delete

Each item shows:

```
📄 Header.tsx:20-30
📄 api.ts:15-22
📁 src/
```

- 📄 File
- 📁 Folder
- ⚠ Unsaved file

## Configuration

Search for `s-copy` in VS Code Settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `s-copy.historyLimit` | 50 | Maximum number of history records |
| `s-copy.colors` | `["#4A90E2", ...]` | Code block color list |
| `s-copy.promptPlaceholder` | `e.g. Fix type errors...` | Summary input placeholder |
| `s-copy.showWelcome` | `true` | Show welcome guide on first use |

## FAQ

**Q: Keyboard shortcut conflict?**

A: Search for `s-copy.collect` in VS Code Keyboard Shortcuts settings and rebind to your preferred key.

**Q: Will collected data be lost?**

A: No. All data is stored in VS Code's globalState and persists across window closes and VS Code restarts.

**Q: Does it support multiple projects?**

A: Yes. History records are automatically grouped by project.

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Development mode (watch changes)
npm run watch

# Type check
npm run typecheck

# Lint
npm run lint
```

Press `F5` to start debugging. This will open a new VS Code window with the extension loaded.

## License

MIT
