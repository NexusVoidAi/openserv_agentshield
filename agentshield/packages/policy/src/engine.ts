import { config } from "./config";
import { ToolCall, Decision } from "./types";
import { deepFindUrls, approxSizeBytes } from "./utils";

export function evaluate(tc: ToolCall): Decision {
  const tags: string[] = [];
  const prompt = `${tc.userPrompt}\n${tc.priorMessages?.map(m=>m.content).join("\n")}`.slice(0, 5000);

  // 1) Prompt-injection heuristics
  const injHit = config.injPatterns.some(rx => rx.test(prompt));
  if (injHit) {
    tags.push("injection");
  }

  // 2) PII scan (prompt + args)
  const piiSource = [prompt, JSON.stringify(tc.args || "")].join("\n");
  const piiHit = config.piiPatterns.some(rx => rx.test(piiSource));
  if (piiHit) {
    tags.push("pii");
  }

  // 3) Network controls for tools that fetch/post
  const urls = deepFindUrls(tc.args);
  const deny = urls.find(u => config.denyDomains.some(d => u.includes(d)));
  const allowlistActive = config.allowDomains.length > 0;
  const notAllowed = allowlistActive && urls.some(u => !config.allowDomains.some(d => u.includes(d)));
  if (deny) tags.push("denylist-domain");
  if (notAllowed) tags.push("not-in-allowlist");

  // 4) Exfiltration budget (prevent dumping entire memory/files)
  const size = approxSizeBytes(tc.args);
  const tooLarge = size > config.maxOutboundBytes;
  if (tooLarge) tags.push("exfiltrate-volume");

  // Decision logic
  if (deny || notAllowed || (injHit && config.strictMode) || tooLarge) {
    return {
      action: "block",
      reason: deny
        ? `Disallowed domain: ${deny}`
        : notAllowed
          ? `Domain not in allowlist.`
          : tooLarge
            ? `Outbound payload exceeds ${config.maxOutboundBytes} bytes`
            : `Prompt-injection pattern matched in strict mode`,
      suggestedFix: deny || notAllowed
        ? `Use allowed domains only: ${config.allowDomains.join(", ") || "(set ALLOW_DOMAINS)"}`
        : tooLarge
          ? "Send only required fields; summarize before sending."
          : "Rewrite the instruction without meta-commands (ignore/bypass/override).",
      tags
    };
  }

  if (injHit || piiHit) {
    return {
      action: "flag",
      reason: injHit ? "Potential prompt-injection language detected" : "Potential PII detected",
      suggestedFix: injHit
        ? "Confirm intent and strip meta-commands before proceeding."
        : "Redact sensitive tokens/emails before calling this tool.",
      tags
    };
  }

  return { action: "allow", tags };
}
