import { webviewApi } from "@rubberduck/common";
import * as vscode from "vscode";
import { BackendClient, ChatPayload } from "../ai/BackendClient";
import { DiffEditorManager } from "../diff/DiffEditorManager";
import { DiffData } from "./DiffData";
import { RubberduckTemplate } from "./template/RubberduckTemplate";
import { Conversation } from "./Conversation";
import { getDiagnostics } from "./input/getDiagnostics";
import { getLanguage } from "./input/getLanguage";
import { getSelectedText } from "./input/getSelectedText";

/**
 * PS Conversation that uses BackendClient instead of AIClient
 * Includes mode and hint_level tracking
 */
export class PSConversation extends Conversation {
  private mode: "debug" | "explain" | "learn" | "reveal";
  private hintLevel: number;
  private readonly backendClient: BackendClient;

  constructor({
    id,
    initVariables,
    backendClient,
    updateChatPanel,
    template,
    diffEditorManager,
    diffData,
    mode = "debug",
    hintLevel = 1,
  }: {
    id: string;
    initVariables: Record<string, unknown>;
    backendClient: BackendClient;
    updateChatPanel: () => Promise<void>;
    template: RubberduckTemplate;
    diffEditorManager: DiffEditorManager;
    diffData: DiffData | undefined;
    mode?: "debug" | "explain" | "learn" | "reveal";
    hintLevel?: number;
  }) {
    // Pass a dummy AIClient to parent since we override executeChat
    super({
      id,
      initVariables,
      ai: null as any, // We won't use the parent's AI
      updateChatPanel,
      template,
      diffEditorManager,
      diffData,
    });

    this.backendClient = backendClient;
    this.mode = mode;
    this.hintLevel = hintLevel;
  }

  setMode(mode: "debug" | "explain" | "learn" | "reveal") {
    this.mode = mode;
  }

  setHintLevel(level: number) {
    this.hintLevel = Math.max(0, Math.min(4, level));
  }

  getMode() {
    return this.mode;
  }

  getHintLevel() {
    return this.hintLevel;
  }

  protected override async executeChat() {
    try {
      // Build payload according to ARCHITECTURE.md schema
      const payload = await this.buildPayload();

      // Filter response through anti-solution filter
      const stream = this.backendClient.streamText({ payload });

      let responseUntilNow = "";
      for await (const chunk of stream) {
        responseUntilNow += chunk;
        await this.handlePartialCompletion(
          responseUntilNow,
          this.template.response
        );
      }

      // Apply output filter before finalizing
      const filteredResponse = this.applyOutputFilter(responseUntilNow);

      // Handle full completion
      await this.handleCompletion(filteredResponse, this.template.response);
    } catch (error: any) {
      console.log(error);
      await this.setError(error?.message ?? "Unknown error");
    }
  }

  private async buildPayload(): Promise<ChatPayload> {
    const editor = vscode.window.activeTextEditor;
    const selectedText = await getSelectedText();
    const language = await getLanguage();
    const diagnostics = getDiagnostics(editor) || [];

    // Get code snippet (selection or full file content, bounded)
    let codeSnippet = "";
    if (selectedText) {
      codeSnippet = selectedText;
    } else if (editor) {
      const text = editor.document.getText();
      // Bound to prevent huge payloads (e.g., max 5000 chars)
      codeSnippet = text.substring(0, 5000);
    }

    // Get user's last message as explanation
    const lastUserMessage = [...this.messages]
      .reverse()
      .find((m) => m.author === "user");

    return {
      user_id: "default-user", // TODO: make configurable
      mode: this.mode,
      hint_level: this.hintLevel,
      ps_context: {
        code_snippet: codeSnippet,
        diagnostics: diagnostics,
        user_explanation: lastUserMessage?.content || "",
      },
      client_meta: {
        language: language || "plaintext",
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Output filter to prevent full solutions
   * Implements anti-solution policy from ARCHITECTURE.md
   */
  private applyOutputFilter(response: string): string {
    const trimmed = response.trim();

    // Check for long code blocks
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeBlocks = trimmed.match(codeBlockRegex) || [];

    for (const block of codeBlocks) {
      const lines = block.split("\n").length;
      const chars = block.length;

      // Block code over threshold (20 lines or 1200 chars)
      if (lines > 20 || chars > 1200) {
        return this.rewriteAsHint(
          "I started to give you the full solution, but that wouldn't help you learn. Instead, what specific part are you stuck on?"
        );
      }
    }

    // Check for solution-indicating phrases
    const solutionPhrases = [
      /here'?s?\s+the\s+(correct|final|complete|full)\s+(?:code|solution|answer)/i,
      /final\s+(?:code|solution|answer)/i,
      /complete\s+(?:code|solution|implementation)/i,
      /here'?s?\s+how\s+to\s+fix\s+it:?\s*```/i,
      /the\s+correct\s+(?:code|implementation)\s+is/i,
    ];

    for (const phrase of solutionPhrases) {
      if (phrase.test(trimmed)) {
        return this.rewriteAsHint(
          "I was about to hand you the answer. Let's take a step back - what do you think might be causing the issue?"
        );
      }
    }

    return trimmed;
  }

  private rewriteAsHint(message: string): string {
    // Return a short reflective response based on mode
    const reflections: Record<typeof this.mode, string[]> = {
      debug: [
        "Instead of showing the fix, let me ask: what values do you expect at that point?",
        "Before jumping to the solution, can you trace through what's happening step by step?",
        "What would happen if you added a print statement right before the error?",
      ],
      explain: [
        "Let's pause. Can you walk me through what you think this code is doing?",
        "Before I explain, what's your current understanding of this section?",
        "What do you think the purpose of this code is?",
      ],
      learn: [
        "I want to teach you the concept, not just give you code. What do you already know about this?",
        "Let's build this understanding together. What part is confusing?",
        "Instead of the answer, let's explore: what happens when you try X?",
      ],
      reveal: [
        "Even in reveal mode, I won't dump the full solution. What specific part do you need clarity on?",
        "I can point you in the right direction. What's the main thing blocking you?",
        "Let's narrow it down: which line or section is most confusing?",
      ],
    };

    const options = reflections[this.mode];
    const randomReflection =
      options[Math.floor(Math.random() * options.length)];

    return `${message}\n\n${randomReflection}`;
  }

  async toWebviewConversation(): Promise<webviewApi.Conversation> {
    const base = await super.toWebviewConversation();
    return {
      ...base,
      mode: this.mode,
      hintLevel: this.hintLevel,
    };
  }
}
