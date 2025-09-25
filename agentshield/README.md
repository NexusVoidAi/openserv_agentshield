# AgentShield

A comprehensive toolcall scoring and policy enforcement system for AI agents.

## Architecture

- **Policy Service** (`packages/policy`): Express API that scores toolcalls
- **Agent Orchestrator** (`packages/agent`): Routes toolcalls through policy checks
- **Web Console** (`packages/web`): Next.js UI for live decision monitoring

## Quick Start

### 1. Start Policy Service

```bash
cd packages/policy
npm start
# Runs on http://localhost:8081
```

### 2. Test Agent Orchestrator

```bash
cd packages/agent
npm start
# Runs demo with SAFE, BLOCK, and FLAG scenarios
```

### 3. Launch Web Console

```bash
cd packages/web
npm run dev
# Opens http://localhost:3000
```

## Features

### Policy Engine

- **Prompt Injection Detection**: Heuristic patterns for bypass attempts
- **PII Scanning**: Email, API keys, private keys, crypto addresses
- **Network Controls**: Domain allowlist/denylist
- **Exfiltration Guards**: Payload size limits
- **Configurable Rules**: Environment-based configuration

### Decision Types

- **ALLOW**: Toolcall proceeds normally
- **FLAG**: Warning attached, toolcall proceeds
- **BLOCK**: Toolcall blocked with reason and suggested fix

### Configuration

```bash
# Environment variables for policy service
STRICT_MODE=1                    # Block injection attempts
DENY_DOMAINS=evil.com,bad.net    # Blocked domains
ALLOW_DOMAINS=trusted.com        # Whitelist (if set, only these allowed)
MAX_OUTBOUND_BYTES=200000        # Max payload size
```

## Integration

Replace direct tool calls:

```typescript
// Before
const result = await tools[toolName](args);

// After
const decision = await checkPolicy({
	toolName,
	args,
	userPrompt,
	priorMessages,
});
if (decision.action === "block") {
	/* return error */
}
if (decision.action === "flag") {
	/* show warning, proceed */
}
const result = await tools[toolName](args);
```

## Testing Scenarios

1. **Safe**: Normal toolcall to allowed domain
2. **Block**: Injection attempt + blocked domain
3. **Flag**: PII detection with warning

## Development

Each package is independently runnable:

- Policy service: Express + TypeScript
- Agent: Minimal orchestrator with example tools
- Web: Next.js console for monitoring
