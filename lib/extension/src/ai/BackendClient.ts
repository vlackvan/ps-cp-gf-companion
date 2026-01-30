import * as vscode from "vscode";
import { Logger } from "../logger";

function getBackendUrl(): string {
  return vscode.workspace
    .getConfiguration("futureGirlfriendPs")
    .get("backendUrl", "http://localhost:3000")
    .replace(/\/$/, ""); // Remove trailing slash
}

export interface ChatPayload {
  user_id?: string;
  mode: "debug" | "explain" | "learn" | "reveal";
  hint_level: number;
  ps_context: {
    problem_statement?: string;
    user_explanation?: string;
    code_snippet: string;
    diagnostics: Array<{
      severity: "error" | "warning" | "information" | "hint";
      message: string;
      range: [[number, number], [number, number]];
    }>;
    stdin_sample?: string;
    expected?: string;
    actual?: string;
  };
  client_meta: {
    language: string;
    file_hash?: string;
    timestamp: number;
  };
}

export class BackendClient {
  private readonly logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this.logger = logger;
  }

  async *streamText({
    payload,
  }: {
    payload: ChatPayload;
  }): AsyncGenerator<string, void, unknown> {
    const backendUrl = getBackendUrl();
    const endpoint = `${backendUrl}/chat/stream`;

    this.logger.log([
      "--- Backend Request ---",
      `Endpoint: ${endpoint}`,
      `Mode: ${payload.mode}`,
      `Hint Level: ${payload.hint_level}`,
      `Language: ${payload.client_meta.language}`,
      "--- End Request ---",
    ]);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}: ${response.statusText}`
        );
      }

      if (!response.body) {
        throw new Error("Response body is empty");
      }

      // Handle SSE streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              return;
            }
            if (data) {
              try {
                const parsed = JSON.parse(data);
                if (parsed.token) {
                  yield parsed.token;
                } else if (parsed.content) {
                  yield parsed.content;
                }
              } catch (e) {
                // If not JSON, yield the data as-is
                yield data;
              }
            }
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        yield buffer;
      }
    } catch (error: any) {
      this.logger.log([
        "--- Backend Error ---",
        error?.message || String(error),
        "--- End Error ---",
      ]);

      throw new Error(
        `Failed to connect to backend at ${endpoint}: ${
          error?.message || String(error)
        }\n\nPlease ensure:\n1. The backend server is running\n2. The backendUrl setting is correct (currently: ${backendUrl})`
      );
    }
  }
}
