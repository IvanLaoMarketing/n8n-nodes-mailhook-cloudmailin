# @ivanlaomarketing/n8n-nodes-mailhook-cloudmailin

[![npm](https://img.shields.io/npm/v/@ivanlaomarketing/n8n-nodes-mailhook-cloudmailin)](https://www.npmjs.com/package/@ivanlaomarketing/n8n-nodes-mailhook-cloudmailin)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![n8n](https://img.shields.io/badge/n8n-community--node-orange)](https://docs.n8n.io/)

Receive inbound emails as n8n workflow triggers — the Make.com Mailhook
equivalent for n8n, powered by CloudMailin.

## Features
- Trigger workflows when an email arrives (real-time, not polling)
- Manual setup mode — no API key needed, works for all accounts
- Auto-provision mode — auto creates/deletes CloudMailin addresses
- Clean simplified output: from, to, subject, bodyText, bodyHtml, attachments
- Smart filters: by sender, subject, require attachments
- Handles both embedded (base64) and URL-stored attachments
- SPF & TLS metadata included

## Prerequisites
- n8n self-hosted or cloud instance
- CloudMailin account (free: 10,000 emails/month) — cloudmailin.com

## Installation
In n8n → Settings → Community Nodes → Install:
```
@ivanlaomarketing/n8n-nodes-mailhook-cloudmailin
```

## Quick Start (Manual Setup)
1. Add CloudMailin Trigger to your workflow
2. Select Setup Mode: Manual Setup
3. Activate workflow → copy the Webhook URL
4. In CloudMailin Dashboard → edit address → paste URL as Target
5. Set Format: JSON (Normalized) → Save

## Output Example
```json
{
  "from": "sender@example.com",
  "to": "abc123@cloudmailin.net",
  "subject": "New Order #999",
  "bodyText": "Order details...",
  "bodyHtml": "<p>Order details...</p>",
  "attachments": [{ "fileName": "invoice.pdf", "size": 45678, "content": "..." }],
  "hasAttachments": true,
  "spfResult": "pass",
  "tlsUsed": true
}
```

## Auto-Provision Mode
Auto-Provision mode automatically creates a CloudMailin email address when the
workflow is activated and deletes it when deactivated. This requires access to
the CloudMailin Management API, which is not enabled by default. Contact
CloudMailin support at https://www.cloudmailin.com/contact_us to request access.

---
Made by Ivan Lao — laoivan.com
LinkedIn: https://www.linkedin.com/in/ivanlaomarketing/
YouTube: https://www.youtube.com/@IvanLaoMarketing
Telegram: https://t.me/IvanLaoMarketingAutomation
