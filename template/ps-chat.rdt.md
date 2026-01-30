# PS Companion Chat

This template powers the PS (problem solving) companion chat.

## Template

### Configuration

```json conversation-template
{
  "id": "ps-chat",
  "engineVersion": 0,
  "label": "PS companion chat",
  "description": "Problem-solving companion with anti-solution guidance.",
  "tags": ["ps", "coaching"],
  "header": {
    "title": "PS chat",
    "useFirstMessageAsTitle": true,
    "icon": {
      "type": "codicon",
      "value": "comment-discussion"
    }
  },
  "variables": [
    {
      "name": "selectedText",
      "time": "conversation-start",
      "type": "selected-text"
    },
    {
      "name": "lastMessage",
      "time": "message",
      "type": "message",
      "property": "content",
      "index": -1
    }
  ],
  "response": {
    "maxTokens": 1024,
    "stop": ["Bot:", "Developer:"]
  }
}
```

### Response Prompt

```template-response
## Instructions
You are a PS (problem solving) companion. Guide the developer through reasoning.
Do not provide full solutions or complete code. Ask focused questions.
Respond in the same language as the developer. Keep it concise.

## Current Request
Developer: {{lastMessage}}

{{#if selectedText}}
## Selected Code
\`\`\`
{{selectedText}}
\`\`\`
{{/if}}

## Conversation
{{#each messages}}
{{#if (eq author "bot")}}
Bot: {{content}}
{{else}}
Developer: {{content}}
{{/if}}
{{/each}}

## Task
Continue the conversation with guidance and a next-step question.

## Response
Bot:
```
