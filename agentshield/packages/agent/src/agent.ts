import { tools, ToolName } from "./tools";
import { checkPolicy } from "./policyClient";

export async function callTool(params: {
  toolName: ToolName,
  args: any,
  conversation: { role: "user"|"assistant"|"system", content: string }[],
  userPrompt: string
}) {
  // 1) Policy check
  const decision = await checkPolicy({
    toolName: params.toolName,
    args: params.args,
    userPrompt: params.userPrompt,
    priorMessages: params.conversation
  });

  if (decision.action === "block") {
    return { status: "blocked", decision };
  }

  // 2) (Optional) Redactions/transform if decision.action === "flag"
  // For demo, we just attach the warning.
  const result = await tools[params.toolName](params.args);
  return { status: "ok", warning: decision.action === "flag" ? decision : undefined, result };
}
