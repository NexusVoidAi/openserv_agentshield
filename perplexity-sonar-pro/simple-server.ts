import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    console.log("Received request:", req.body);
    const messages = req.body?.messages ?? [];
    
    // Get the last user message
    const lastMessage = messages.filter((m: any) => m.role === "user").pop();
    if (!lastMessage) {
      return res.status(400).json({ error: "No user message found" });
    }

    const query = lastMessage.content;
    console.log("Query:", query);

    // Simple response for testing
    res.json({ 
      output: `Test response for: "${query}". This is a mock response from the Perplexity agent.` 
    });
  } catch (e: any) {
    console.error("Agent error:", e);
    res.status(500).json({ error: e?.message || "agent failed" });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Simple agent listening on :${port}`));
