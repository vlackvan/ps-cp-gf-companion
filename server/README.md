# FutureGirlfriendPS Stub Server

This is a simple Node.js stub server for testing the FutureGirlfriendPS VS Code extension.

## Features

- Implements `POST /chat/stream` endpoint with SSE streaming
- Mock responses based on mode (debug/explain/learn/reveal) and hint level (0-4)
- Includes placeholder system prompt from PERSONALITY_EXTRACTION.md
- CORS enabled for local development

## Installation

```bash
cd server
npm install
```

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## Testing

Health check:

```bash
curl http://localhost:3000/health
```

Test chat endpoint:

```bash
curl -X POST http://localhost:3000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "debug",
    "hint_level": 1,
    "ps_context": {
      "code_snippet": "console.log(x);",
      "diagnostics": []
    },
    "client_meta": {
      "language": "javascript",
      "timestamp": 1234567890
    }
  }'
```

## Next Steps

For production:

- Replace with actual ChatGPT API integration
- Implement full personality extraction module
- Add user profile storage
- Implement memory/RAG features
