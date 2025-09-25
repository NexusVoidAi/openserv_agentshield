import { z } from "zod";

export const ToolCallSchema = z.object({
  toolName: z.string(),
  args: z.any().optional(),
  userPrompt: z.string().default(""),
  priorMessages: z.array(z.object({
    role: z.enum(["user","assistant","system"]).default("user"),
    content: z.string()
  })).default([]),
  metadata: z.object({
    userId: z.string().optional(),
    ip: z.string().optional(),
  }).optional()
});

export type ToolCall = z.infer<typeof ToolCallSchema>;

export type Decision = {
  action: "allow" | "flag" | "block",
  reason?: string,
  suggestedFix?: string,
  tags?: string[],         // e.g., ["injection", "pii", "denylist-domain"]
  redactions?: Record<string, string> // e.g., { "args.password": "***" }
}
