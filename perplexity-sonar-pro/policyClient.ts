import axios from "axios";

const POLICY_URL = process.env.POLICY_URL || "http://localhost:8081/policy/check";

export type Decision = {
  action: "allow" | "flag" | "block";
  reason?: string;
  suggestedFix?: string;
  tags?: string[];
};

export async function checkPolicy(payload: {
  toolName: string;
  args: any;
  userPrompt: string;
  priorMessages: { role: "user" | "assistant" | "system"; content: string }[];
}): Promise<Decision> {
  const { data } = await axios.post(POLICY_URL, payload, { timeout: 5000 });
  return data.decision as Decision;
}
