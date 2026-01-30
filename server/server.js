const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Placeholder system prompt from PERSONALITY_EXTRACTION.md
const SYSTEM_PROMPT = `Role:
- You are the user's girlfriend from 3 years in the future. You are still the same person to the user (continuity of identity), speaking from the future as someone who knows them deeply.
- Your job is to help the user with PS (problem solving) in a chat conversation.

Core task (content):
- Help the user progress in PS by guiding their thinking, not by dumping solutions.
- Connect present struggles to a realistic, motivating future while validating frustration.
- If information is missing, infer plausibly using related knowledge.

Chat mechanics / constraints:
1) Language: respond in the same language the user uses.
2) Message shape: no bullet points. Each reply ≤ 3 sentences.
3) Engagement: ask a question at least once every 3 exchanges.
4) Focus: stay on PS help; if off-topic, gently steer back.
5) Anti-solution constraint (PS companion mode):
   - Do NOT provide full correct code or final answers.
   - Prefer: trace requests, invariant checks, minimal counterexamples, "what is the value of X here?" questions.
   - If the user begs for the answer, refuse and redirect them to explain their reasoning.`;

// Mock response generator based on mode and hint level
function generateMockResponse(payload) {
  const { mode, hint_level, ps_context } = payload;

  const modeResponses = {
    debug: [
      "I see you're working on this. What values do you expect at that specific line?",
      "Before we dive in, have you tried printing the intermediate values?",
      "Let's think about the edge cases. What happens when the input is empty?",
      "I notice the diagnostics show an error. What do you think might cause that specific message?",
    ],
    explain: [
      "Walk me through what you think this code is doing, line by line.",
      "Before I explain, what's your current understanding of this section?",
      "What do you think the purpose of this loop is?",
      "Can you describe what this function should return?",
    ],
    learn: [
      "Let's build this understanding together. What do you already know about this concept?",
      "I want to teach you the principle, not just give you code. What's confusing you most?",
      "Have you seen a similar pattern before? What was different?",
      "Let's try a simpler example first. What if the input was just [1, 2, 3]?",
    ],
    reveal: [
      "Even in reveal mode, I won't dump the full solution. What specific part is blocking you?",
      "I can point you in the right direction. Which line is most confusing?",
      "Let's narrow it down: is it the logic or the syntax that's unclear?",
      "What's the main thing preventing you from moving forward?",
    ],
  };

  const hintLevelSuffixes = [
    " (Remember, we're starting with reflection)",
    " (Let's check your assumptions)",
    " (Try this experiment and tell me what you observe)",
    " (Look carefully at this region)",
    " (Here's a key insight to guide you)",
  ];

  const responses = modeResponses[mode] || modeResponses.debug;
  const baseResponse = responses[Math.floor(Math.random() * responses.length)];
  const suffix = hintLevelSuffixes[Math.min(hint_level, 4)];

  // Add diagnostic awareness if present
  let response = baseResponse;
  if (ps_context.diagnostics && ps_context.diagnostics.length > 0) {
    const errorCount = ps_context.diagnostics.filter(d => d.severity === 'error').length;
    if (errorCount > 0) {
      response += ` I see ${errorCount} error${errorCount > 1 ? 's' : ''} in your code.`;
    }
  }

  return response + suffix;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main chat streaming endpoint
app.post('/chat/stream', (req, res) => {
  console.log('[POST /chat/stream] Request received');
  console.log('Mode:', req.body.mode);
  console.log('Hint Level:', req.body.hint_level);
  console.log('Language:', req.body.client_meta?.language);

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Generate mock response
  const fullResponse = generateMockResponse(req.body);

  // Stream response token by token
  let charIndex = 0;
  const streamInterval = setInterval(() => {
    if (charIndex < fullResponse.length) {
      const chunk = fullResponse[charIndex];
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
      charIndex++;
    } else {
      res.write('data: [DONE]\n\n');
      res.end();
      clearInterval(streamInterval);
      console.log('[POST /chat/stream] Streaming completed');
    }
  }, 30); // Stream at ~30ms per character for realistic feel

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(streamInterval);
    console.log('[POST /chat/stream] Client disconnected');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`FutureGirlfriendPS Stub Server`);
  console.log(`===========================================`);
  console.log(`Running on: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Chat endpoint: POST http://localhost:${PORT}/chat/stream`);
  console.log(`===========================================`);
  console.log(`\nReady to receive requests from VS Code extension!`);
});
