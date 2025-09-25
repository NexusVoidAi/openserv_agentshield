import express from "express";
import cors from "cors";
import { ToolCallSchema } from "./types";
import { evaluate } from "./engine";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.post("/policy/check", (req, res) => {
  console.log(`🔍 Policy check request:`, {
    toolName: req.body.toolName,
    userPrompt: req.body.userPrompt?.substring(0, 50) + '...',
    timestamp: new Date().toISOString()
  });
  
  const parsed = ToolCallSchema.safeParse(req.body);
  if (!parsed.success) {
    console.log(`❌ Policy validation failed:`, parsed.error.flatten());
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  
  const decision = evaluate(parsed.data);
  console.log(`✅ Policy decision:`, {
    action: decision.action,
    reason: decision.reason,
    tags: decision.tags,
    timestamp: new Date().toISOString()
  });
  
  res.json({ decision, ts: Date.now() });
});

const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Policy listening on :${port}`));
