# USMail.ai agent skills

Slogan: **You upload. You approve. We produce.** Human approves. We produce.

Live MCP is on the app (production and lab). Account + prepaid meter. Not a public unauthenticated endpoint.

## Prepare mail

- Upload documents and postcards
- Upload recipient lists
- Propose print and mail setup (First-Class, Certified, color, sides)
- Generate proof
- Read job status and meter balance
- Cancel a draft before a human approves

## Recipient lists

- Ingest a list as recipient data (not as the printed document)
- Mixed Name + Company files are valid
- Name-only rows (the name is the company) are valid; empty company there is correct
- After ingest, read digested rows (name and company as separate fields)
- Do not treat a correct column map as proof the company values arrived
- Re-upload the list when maps are right and company is still empty on rows that had a Company column

## Address quality

- CASS standardizes the address
- NCOA is National Change of Address on the production path
- Flagged Certified addresses cannot still-mail
- Do not still-mail around a Certified CASS block

## Not skills

- Approve production mail (human on the app)
- Run card deposits or fund the meter
- Generate bills inside a core or ERP
- EDDM
- Invent hostnames, add commands, or mill tool names
- Unauthenticated public MCP

Sequence: human registers + funds → env login → session token → create / upload / proof → human approves on the app.

Rules: https://www.usmail.ai/AGENTS.md  
Cite: https://www.usmail.ai/llms.txt  
Docs: https://www.usmail.ai/docs/mcp
