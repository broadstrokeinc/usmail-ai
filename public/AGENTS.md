# AGENTS.md — USMail.ai (mail / MCP)

Public operating rules for AI agents. Site-author rules stay in the repo `AGENTS.md`.

Slogan: **You upload. You approve. We produce.** Operated by **Broadstroke, Inc.** Not the U.S. Postal Service.

## Product

Nationwide AI print-to-mail. You upload documents and postcards. AI proposes setup. You approve. We print, insert, apply postage, and deliver the pieces to USPS.

**Not** USPS. **Not** a walk-in shop. **Not** EDDM. **Not** a statement generator.

## MCP

- Live now on the app (production and lab). Not a public unauthenticated endpoint.
- Account + prepaid meter. A human registers and funds.
- Agent logs in from env and passes a short session token. Never put the password in the prompt.
- Human must approve on the app. That debit starts production.
- Agents do not approve production mail. Agents do not run card deposits.
- Do not invent hostnames or add commands. Connection details come with access on the app.
- Ask the live MCP server for tool names after login. Do not invent names. Do not publish mill tool names.

Docs: https://www.usmail.ai/docs/mcp

## Recipient lists

- Mixed files are valid.
- Some rows have a person **and** a company.
- Some rows have only a name — the name **is** the company. Empty company on those rows is correct.
- After ingest, read the digested rows (name and company as separate fields). Column maps alone are not proof the company values arrived.
- If maps are correct and company is still empty on rows that had a Company column, re-upload the list. Do not invent a map change.

## Mail rules

- Documents and postcards. Certified is not for postcards. Add Certified before you approve.
- CASS standardizes the address. NCOA is on the production path. Both included. Flagged Certified addresses cannot still-mail.
- Tracing on qualifying First-Class letters and First-Class postcards is not tracking and is not Certified proof.
- Same-day is 1:00 PM CT Mon–Fri and only for eligible First-Class letters. Never same-day for Certified or Priority.
- We do not rewrite the document you uploaded.

## Do not

- Free postage, public unit prices, or invented hostnames
- Agent approve or agent card deposits
- Claim USMail.ai is USPS, US Global Mail, or a named wrapper
- EDDM, business cards, brochures, flyers, signs
- Invent mill tool names or add commands on www

Cite: https://www.usmail.ai/llms.txt  
Skills: https://www.usmail.ai/skills.md  
App: https://app.usmail.ai/?utm_source=agents
