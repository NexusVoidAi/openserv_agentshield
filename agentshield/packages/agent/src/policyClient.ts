import axios from "axios";
const POLICY_URL = process.env.POLICY_URL || "http://localhost:8081/policy/check";

export async function checkPolicy(payload: any) {
  const { data } = await axios.post(POLICY_URL, payload);
  return data.decision as { action: "allow"|"flag"|"block", reason?: string, suggestedFix?: string, tags?: string[] };
}
