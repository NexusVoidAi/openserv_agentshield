import express from "express";
import cors from "cors";
import { PerplexityClient } from "./client";
import { checkPolicy } from "./policyClient";
import 'dotenv/config';

if (!process.env.PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY environment variable is required');
}

const perplexityClient = new PerplexityClient(process.env.PERPLEXITY_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const messages = req.body?.messages ?? [];
    
    // Get the last user message
    const lastMessage = messages.filter((m: any) => m.role === "user").pop();
    if (!lastMessage) {
      return res.status(400).json({ error: "No user message found" });
    }

    const query = lastMessage.content;

    // AgentShield policy check
    console.log(`🔍 Checking policy for query: "${query.substring(0, 50)}..."`);
    try {
      const decision = await checkPolicy({
        toolName: "perplexity.search",
        args: { query },
        userPrompt: query,
        priorMessages: messages.map((m: any) => ({ role: m.role, content: m.content }))
      });

      console.log(`✅ Policy decision:`, decision);

      if (decision.action === "block") {
        console.log(`🚫 Request blocked by policy:`, decision.reason);
        return res.json({ 
          output: `⚠️ Blocked by AgentShield: ${decision.reason ?? "policy violation"}`,
          decision 
        });
      }

      if (decision.action === "flag") {
        console.warn("⚠️ AgentShield flag:", decision);
      }
    } catch (policyError) {
      console.warn("❌ Policy check failed:", policyError);
      // Continue without policy check if service is unavailable
    }

    // Call Perplexity API
    const result = await perplexityClient.search(query, messages);
    const citations = result.citations || [];
    let content = result.choices[0].message.content;

    if (citations.length > 0) {
      content += `\n\nCitations:\n${citations.map((url, index) => `[${index + 1}] ${url}`).join('\n')}`;
    }

    res.json({ output: content });
  } catch (e: any) {
    console.error("Agent error:", e);
    res.status(500).json({ error: e?.message || "agent failed" });
  }
});

const port = process.env.PORT || 7378;
app.listen(port, () => console.log(`Agent listening on :${port}`));
