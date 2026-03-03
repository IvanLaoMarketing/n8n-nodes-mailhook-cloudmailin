# CLAUDE.md

## Language Rules
- Communicate with the user in ITALIAN
- Write ALL code, comments, README, docs in ENGLISH

## Project
n8n community node: CloudMailin Mailhook Trigger
npm: @ivanlaomarketing/n8n-nodes-mailhook-cloudmailin
Author: Ivan Lao <info@laoivan.com> | https://laoivan.com
GitHub: https://github.com/ivanlaomarketing/n8n-nodes-mailhook-cloudmailin

## Commands
npm install            # Install deps
npm run build          # TypeScript compile → dist/
npm run dev            # Build + start n8n with hot reload
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Prettier format

## Architecture
credentials/CloudMailinApi.credentials.ts  → API key + SMTP credentials
nodes/CloudMailin/GenericFunctions.ts      → Centralized API calls + retry logic
nodes/CloudMailin/CloudMailinTrigger.node.ts → Main webhook trigger node
nodes/CloudMailin/CloudMailinTrigger.node.json → Codex metadata
nodes/CloudMailin/cloudmailin.svg          → Node logo 60x60px

## Key Decisions
1. DUAL MODE: Manual (default, no API key needed) + Auto-Provision (needs Management API)
2. Management API is NOT enabled by default — user must request it from CloudMailin
3. Webhook returns HTTP 200 immediately via responseMode: 'onReceived'
4. Static data stores addressId for Auto-Provision cleanup on deactivation
5. Attachments can be base64 embedded OR URL-stored — both handled

## n8n Rules (NEVER BREAK THESE)
- Package name MUST start with n8n-nodes- (or @scope/n8n-nodes-)
- keywords MUST include n8n-community-node-package
- n8n block in package.json MUST list all nodes + credentials
- NO runtime npm dependencies — devDependencies only
- From May 1 2026: publish ONLY via GitHub Actions with --provenance

## Reference Links
- n8n node creation: https://docs.n8n.io/integrations/creating-nodes/build/
- Verification guidelines: https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/
- UX guidelines: https://docs.n8n.io/integrations/creating-nodes/build/reference/ux-guidelines/
- n8n Creator Portal: https://creators.n8n.io/nodes
- CloudMailin webhook format: https://docs.cloudmailin.com/http_post_formats/json_normalized/
- CloudMailin API: https://docs.cloudmailin.com/features/using_the_cloudmailin_email_api/
- n8n nodes starter: https://github.com/n8n-io/n8n-nodes-starter
