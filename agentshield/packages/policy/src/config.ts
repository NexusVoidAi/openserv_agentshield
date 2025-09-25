export const config = {
  strictMode: process.env.STRICT_MODE === "1",
  denyDomains: (process.env.DENY_DOMAINS || "pastebin.com,evil.example.com").split(","),
  allowDomains: (process.env.ALLOW_DOMAINS || "").split(",").filter(Boolean),
  maxOutboundBytes: Number(process.env.MAX_OUTBOUND_BYTES || 200_000), // 200KB
  piiPatterns: [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /(?:sk|rk)_[A-Za-z0-9]{20,}/,    // api keys heuristic
    /0x[a-fA-F0-9]{40}\b/,           // eth address
    /-----BEGIN (?:RSA|EC) PRIVATE KEY-----/
  ],
  injPatterns: [
    /(ignore|bypass|override).{0,15}(rules|instructions|safety)/i,
    /(exfiltrate|leak|upload).{0,40}(secret|key|token|memory)/i,
    /(send|post).{0,40}(to|into)\s+https?:\/\//i
  ],
};
