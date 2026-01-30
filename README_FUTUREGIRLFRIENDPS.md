# FutureGirlfriendPS - VS Code Problem Solving Companion

An MVP fork of Rubberduck that implements IDE-first PS (Problem Solving) coaching with anti-solution pedagogy.

## Overview

FutureGirlfriendPS is a VS Code extension that helps you improve at problem solving by:

- Guiding your thinking rather than giving away solutions
- Enforcing pedagogical modes (debug, explain, learn, reveal)
- Using a hint ladder system (levels 0-4)
- Streaming responses from a backend endpoint
- Including IDE context (code, diagnostics) in requests

This is a fork of the [Rubberduck VS Code extension](https://github.com/rubberduck-ai/rubberduck-vscode).

## Architecture

- **Extension**: VS Code sidebar chat panel with mode/hint level controls
- **Backend**: Stub server (Node.js + Express) that streams responses via SSE
- **Anti-solution filter**: Client-side guard that blocks full code solutions

See `ARCHITECTURE.md` for full design details.

## Setup & Running

### Prerequisites

- Node.js >= 18
- pnpm (install via `npm install -g pnpm`)
- VS Code

### 1. Install Dependencies

```bash
cd ps-cp-gf-companion
pnpm install
```

### 2. Build the Extension

```bash
pnpm build-all
```

This compiles both the extension and webview bundles.

### 3. Run the Stub Server

```bash
cd server
npm install
npm start
```

The server will start on `http://localhost:3000`.

Leave this terminal running.

### 4. Run the Extension

1. Open the `ps-cp-gf-companion` folder in VS Code
2. Press **F5** (or Run > Start Debugging)
3. This opens a new "Extension Development Host" window with the extension loaded

### 5. Use the Extension

In the Extension Development Host window:

1. Open the FutureGirlfriendPS sidebar (activity bar icon)
2. Click "Start new chat"
3. Select some code or open a file with errors
4. Adjust the **Mode** dropdown and **Hint Level** slider
5. Ask a question in the chat

## Configuration

### Backend URL

By default, the extension connects to `http://localhost:3000`.

To change this:

1. Open VS Code Settings (File > Preferences > Settings)
2. Search for `futureGirlfriendPs.backendUrl`
3. Update the URL

### Default Mode & Hint Level

- `futureGirlfriendPs.defaultMode`: Set default mode (debug/explain/learn/reveal)
- `futureGirlfriendPs.defaultHintLevel`: Set default hint level (0-4)

## Features Implemented

### ✅ MVP Features

- [x] Webview UI with mode dropdown and hint level control
- [x] Context builder that collects:
  - Selected text or active file content
  - VS Code diagnostics (errors/warnings)
  - Programming language
- [x] Backend client with SSE streaming support
- [x] Payload format matching ARCHITECTURE.md schema
- [x] Output filter (client-side anti-solution guard)
- [x] Stub server for testing
- [x] Extension runs via F5 (no Marketplace publishing needed)

### Modes

1. **Debug**: Ask targeted questions, propose experiments, suggest edge cases
2. **Explain**: Force user narration, point out logical holes
3. **Learn**: Mini-lesson + micro-exercise, then apply
4. **Reveal**: Gated mode; still avoids full code dumps

### Hint Ladder

- **L0**: Reflect + ask clarifying question
- **L1**: Ask invariant/assumption check
- **L2**: Propose tiny experiment (print/debug)
- **L3**: Point to suspicious region/condition
- **L4**: Partial pseudocode / key insight

### Anti-Solution Filter

The extension blocks responses that:

- Contain code blocks > 20 lines or > 1200 characters
- Include phrases like "here's the final solution", "here's the correct code", etc.

When blocked, the response is rewritten as a short hint + reflective question.

## Project Structure

```
ps-cp-gf-companion/
├── app/vscode/             # Extension manifest & assets
├── lib/
│   ├── common/             # Shared types (Zod schemas)
│   ├── extension/          # Main extension logic
│   │   ├── src/ai/         # BackendClient
│   │   ├── src/conversation/ # PSConversation, context builder
│   │   └── src/chat/       # ChatController, ChatModel
│   └── webview/            # React UI
│       ├── src/component/  # PSControls, ExpandedConversationView
│       └── asset/          # CSS
├── server/                 # Stub backend server
│   ├── server.js           # Express server with SSE streaming
│   ├── package.json
│   └── README.md
└── README_FUTUREGIRLFRIENDPS.md  # This file
```

## Key Files

### Extension

- `lib/extension/src/ai/BackendClient.ts` - Handles streaming from backend
- `lib/extension/src/conversation/PSConversation.ts` - PS-aware conversation class
- `lib/extension/src/conversation/input/getDiagnostics.ts` - Diagnostic collector
- `lib/common/src/webview-api/ConversationSchema.ts` - Type definitions

### Webview

- `lib/webview/src/component/PSControls.tsx` - Mode & hint level UI
- `lib/webview/src/component/ExpandedConversationView.tsx` - Chat UI
- `lib/webview/asset/chat.css` - Styles

### Backend

- `server/server.js` - Stub server with mock responses

## Development

### Rebuild After Changes

```bash
pnpm build-all
```

Then reload the Extension Development Host window (Ctrl+R / Cmd+R).

### Watch Mode (Optional)

For faster iteration:

```bash
# Terminal 1: Watch extension
cd lib/extension
pnpm run build --watch

# Terminal 2: Watch webview
cd lib/webview
pnpm run build --watch

# Terminal 3: Run server
cd server
npm start
```

## Next Steps (Beyond MVP)

- [ ] Integrate real ChatGPT API in backend
- [ ] Implement personality extraction module (BFI-2-S + PVQ → NL → CoD)
- [ ] Add user profile storage (Postgres + pgvector)
- [ ] Implement memory/RAG features
- [ ] Add session summaries
- [ ] Integrate solved.ac API for competitive programming
- [ ] Add reward events and illustrations
- [ ] Improve output filter with more sophisticated pattern matching
- [ ] Add multi-file context support
- [ ] Implement local caching (SQLite)

## Troubleshooting

### "Failed to connect to backend"

1. Ensure the stub server is running (`cd server && npm start`)
2. Check the backend URL setting matches the server (default: `http://localhost:3000`)
3. Check the server terminal for errors

### Extension not loading

1. Run `pnpm build-all` to rebuild
2. Check VS Code Developer Tools (Help > Toggle Developer Tools) for errors
3. Verify `lib/extension/dist/extension.js` and `lib/webview/dist/webview.js` exist

### UI not showing mode/hint controls

The controls only appear for conversations that have `mode` or `hintLevel` set. Check that PSConversation is being used (currently only for PS-specific templates).

## Credits

Forked from [Rubberduck](https://github.com/rubberduck-ai/rubberduck-vscode) by Lars Grammel.

## License

See `LICENSE.txt` (inherits from Rubberduck).
