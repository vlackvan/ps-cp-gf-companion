import zod from "zod";
import { errorSchema } from "./ErrorSchema";

export const outgoingMessageSchema = zod.discriminatedUnion("type", [
  zod.object({
    type: zod.literal("startChat"),
  }),
  zod.object({
    type: zod.literal("enterOpenAIApiKey"),
  }),
  zod.object({
    type: zod.literal("clickCollapsedConversation"),
    data: zod.object({
      id: zod.string(),
    }),
  }),
  zod.object({
    type: zod.literal("deleteConversation"),
    data: zod.object({
      id: zod.string(),
    }),
  }),
  zod.object({
    type: zod.literal("exportConversation"),
    data: zod.object({
      id: zod.string(),
    }),
  }),
  zod.object({
    type: zod.literal("sendMessage"),
    data: zod.object({
      id: zod.string(),
      message: zod.string(),
      mode: zod.enum(["debug", "explain", "learn", "reveal"]).optional(),
      hintLevel: zod.number().min(0).max(4).optional(),
    }),
  }),
  zod.object({
    type: zod.literal("updateMode"),
    data: zod.object({
      id: zod.string(),
      mode: zod.enum(["debug", "explain", "learn", "reveal"]),
    }),
  }),
  zod.object({
    type: zod.literal("updateHintLevel"),
    data: zod.object({
      id: zod.string(),
      hintLevel: zod.number().min(0).max(4),
    }),
  }),
  zod.object({
    type: zod.literal("reportError"),
    error: errorSchema,
  }),
  zod.object({
    type: zod.literal("dismissError"),
    data: zod.object({
      id: zod.string(),
    }),
  }),
  zod.object({
    type: zod.literal("retry"),
    data: zod.object({
      id: zod.string(),
    }),
  }),
  zod.object({
    type: zod.literal("applyDiff"),
  }),
  zod.object({
    type: zod.literal("insertPromptIntoEditor"),
    data: zod.object({
      id: zod.string(),
    }),
  }),
]);

/**
 * A message sent from the webview to the extension.
 */
export type OutgoingMessage = zod.infer<typeof outgoingMessageSchema>;
