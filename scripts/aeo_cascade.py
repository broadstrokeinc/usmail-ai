#!/usr/bin/env python3
"""Generate compare + industry landers and inject cite boxes. Website repo only."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

DEF = (
    "USMail.ai is a nationwide AI print-to-mail platform. You upload documents. "
    "AI proposes setup. You approve. We print, insert, apply postage, and hand the pieces to USPS. "
    "Online Certified Mail and statement or invoice jobs use the same path. "
    "USMail.ai is not the United States Postal Service."
)

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <title>{title}</title>
  <meta name="description" content="{description}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta name="theme-color" content="#1a2b63" />
  <link rel="canonical" href="https://www.usmail.ai{url}" />
  <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="USMail.ai" />
  <meta property="og:url" content="https://www.usmail.ai{url}" />
  <meta property="og:title" content="{og_title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:image" content="https://www.usmail.ai/logo-og.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{og_title}" />
  <meta name="twitter:description" content="{description}" />
  <meta name="twitter:image" content="https://www.usmail.ai/logo-og.jpg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://unpkg.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/tokens.css?v=20260731quiet" />
  <link rel="stylesheet" href="/styles.css?v=20260731quiet" />
  <script type="application/ld+json">
{ld}
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-KCT0CVV4BW"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-KCT0CVV4BW');
  </script>
</head>
'''

CHROME_TOP = '''<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap nav">
      <a class="brand" href="/" aria-label="USMail.ai home">
        <picture>
          <source srcset="/logo.webp" type="image/webp" />
          <img src="/logo-400.png" alt="USMail.ai" width="200" height="51" class="brand-logo" decoding="async" />
        </picture>
        <span class="brand-tagline">AI print to mail</span>
      </a>
      <button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">
        <span class="nav-toggle-bars" aria-hidden="true"></span> Menu
      </button>
      <nav class="nav-links" id="primary-nav" aria-label="Primary">
        <a href="/how-it-works">How it works</a>
        <a href="/print-and-mail">Print &amp; mail</a>
        <a href="/certified-mail">Certified Mail</a>
        <a href="/industries">Industries</a>
        <a href="https://app.usmail.ai/?utm_source=www">Get started</a>
      </nav>
      <div class="nav-cta">
        <a class="btn btn-primary btn-nav-cta" href="https://app.usmail.ai/?utm_source=www{utm}">Get started</a>
      </div>
    </div>
  </header>
'''

CHROME_BOT = '''  <footer class="site-footer">
    <div class="wrap footer-inner">
      <a class="footer-logo" href="/" aria-label="USMail.ai home">
        <picture>
          <source srcset="/logo.webp" type="image/webp" />
          <img src="/logo-400.png" alt="USMail.ai" width="120" height="30" decoding="async" />
        </picture>
      </a>
      <p class="footer-slogan">You upload. You approve. We produce.</p>
      <nav class="footer-nav" aria-label="Footer">
        <a href="/how-it-works">How it works</a>
        <a href="/print-and-mail">Print &amp; mail</a>
        <a href="/certified-mail">Certified</a>
        <a href="/statements-invoices">Statements</a>
        <a href="/mcp">MCP</a>
        <a href="/industries">Industries</a>
        <a href="/compare">Compare</a>
        <a href="/docs">Docs</a>
        <a href="/about">About</a>
        <a href="https://app.usmail.ai/?utm_source=www">Get started</a>
        <a href="/security">Security</a>
      </nav>
      <p class="footer-meta">
        © <span id="y"></span>
        · <a href="tel:+18886675322">888-667-5322</a>
        · <a href="mailto:info@usmail.ai">info@usmail.ai</a>
        · <a href="/privacy">Privacy</a>
        · <a href="/terms">Terms</a>
      </p>
      <p class="footer-disclaimer">Not the U.S. Postal Service.</p>
    </div>
  </footer>
  <div class="mobile-dock" role="navigation" aria-label="Quick actions">
    <a class="btn btn-primary" href="https://app.usmail.ai/?utm_source=www{utm}">Get started</a>
    <a class="btn btn-ghost" href="tel:+18886675322">Call</a>
  </div>
  <script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js" integrity="sha384-hJnF5AwidE18GSWTAGHv3ByzzvfNZ1Tcx5y1UUV3WkauuMCEzBJBMSwSt/PUPXnM" crossorigin="anonymous" defer></script>
  <script src="/js/site.js?v=20260731quiet" defer></script>
</body>
</html>
'''


def faq_ld(url, qs):
    ents = []
    for q, a in qs:
        ents.append(
            {
                "q": q,
                "a": a,
            }
        )
    import json

    items = [
        {
            "@type": "Question",
            "name": e["q"],
            "acceptedAnswer": {"@type": "Answer", "text": e["a"]},
        }
        for e in ents
    ]
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.usmail.ai/"},
                    {"@type": "ListItem", "position": 2, "name": "Industries", "item": "https://www.usmail.ai/industries"},
                    {"@type": "ListItem", "position": 3, "name": qs[0][0].split("?")[0][:40], "item": "https://www.usmail.ai" + url},
                ],
            },
            {
                "@type": "WebPage",
                "url": "https://www.usmail.ai" + url,
                "name": qs[0][0],
                "description": DEF,
                "speakable": {"@type": "SpeakableSpecification", "cssSelector": [".lead"]},
                "isPartOf": {"@id": "https://www.usmail.ai/#website"},
            },
            {"@type": "FAQPage", "mainEntity": items},
        ],
    }
    return json.dumps(graph, indent=2)


INDUSTRIES = [
    {
        "slug": "collections",
        "h1": "Debt collection mail",
        "crumb": "Collections",
        "title": "Debt Collection Mail | Notices &amp; Certified · USMail.ai",
        "og": "Debt Collection Mail | USMail.ai",
        "desc": "Collection notices and lists. You upload. You approve. We print, apply postage, and hand off to USPS. Optional Certified. Not a collections CRM.",
        "lead": "Notices, lists, optional Certified. Production print — not a collections platform.",
        "icon": "scale",
        "utm": "&utm_campaign=collections",
        "types": [
            ("file-text", "Demand and notice letters", "Upload the files your agency already generates. We do not write collection copy."),
            ("badge-check", "Certified when proof is required", "Add Certified Mail or Certificate of Mailing before you approve and pay."),
            ("sheet", "List-driven runs", "CSV recipients for batch notices. Same production path as First-Class."),
            ("shield", "Not a collections CRM", "We mail files you upload. We do not skip-trace, score, or manage accounts."),
        ],
        "extra_h2": "Mail house, not an agent wrapper",
        "extra": "USMail.ai is a mail house. You upload. You approve. We print. Collection shops that bolt an agent onto Click2Mail or Lob still need a printer and a postage meter somewhere. Here the mail house is the product. A human approves before anything is mailed.",
        "faq": [
            ("Does USMail.ai mail collection notices?", DEF),
            ("Is this a collections CRM?", "No. Upload the files your system already makes. We print, apply postage, and hand off to USPS. We do not manage debt accounts."),
            ("Can I add Certified Mail?", "Yes. Add Certified Mail before you approve and pay."),
            ("Is it available now?", "Yes. Get started at https://app.usmail.ai/ or call 888-667-5322."),
        ],
    },
    {
        "slug": "healthcare",
        "h1": "Healthcare notices and statements, mailed",
        "crumb": "Healthcare",
        "title": "Healthcare Print to Mail | Patient Notices · USMail.ai",
        "og": "Healthcare Mail | USMail.ai",
        "desc": "Patient statements and notices as uploaded files. You approve. We print, apply postage, and hand off to USPS. Not an EHR. No invented HIPAA BAA.",
        "lead": "Statements and notices you already generate. Production mail. Not an EHR.",
        "icon": "heart-pulse",
        "utm": "&utm_campaign=healthcare",
        "types": [
            ("file-text", "Statements and invoices", "Upload PDFs and lists from billing. Recurring jobs on the same path."),
            ("megaphone", "Patient notices", "Appointment, coverage, and general correspondence as files you own."),
            ("badge-check", "Certified when required", "Add Certified Mail before you approve. Not every healthcare letter needs it."),
            ("shield", "Not an EHR", "We do not generate charts or replace your billing system. We mail what you upload."),
        ],
        "extra_h2": "What we will not claim",
        "extra": "We do not publish a HIPAA BAA on this page. If your process needs a signed BAA, talk to mail ops. Security details: /security. Production is USMail.ai — not a developer API wrapping someone else’s mail house.",
        "faq": [
            ("Does USMail.ai mail healthcare statements?", DEF),
            ("Is USMail.ai an EHR or billing system?", "No. Upload files and lists. We print, apply postage, and hand off to USPS."),
            ("Do you claim a HIPAA BAA here?", "No. Do not assume a BAA from this page. Ask mail ops in writing if you need one."),
            ("Is it available now?", "Yes. Get started at https://app.usmail.ai/ or call 888-667-5322."),
        ],
    },
    {
        "slug": "utilities",
        "h1": "Utility bills and notices",
        "crumb": "Utilities",
        "title": "Utility Bill Print to Mail | Notices · USMail.ai",
        "og": "Utility Mail | USMail.ai",
        "desc": "Utility bills, disconnect notices, and lists. You upload. You approve. We print, apply postage, and hand off to USPS. Optional Certified.",
        "lead": "Bills and shutoff notices as files you already have. Nationwide production.",
        "icon": "zap",
        "utm": "&utm_campaign=utilities",
        "types": [
            ("file-text", "Bills and statements", "Recurring uploaded files plus a list. Not a CIS or meter-reading system."),
            ("megaphone", "Disconnect and past-due notices", "Deadline mail with production cutoffs. Humans approve before produce."),
            ("badge-check", "Certified when statute wants proof", "Add Certified Mail before you approve and pay."),
            ("clock", "Cutoffs that ops can run", "1:00 PM CT same-day when eligible; 10:00 PM CT next business day. Mon–Fri mail dates."),
        ],
        "extra_h2": "Mail house, not a wrapper",
        "extra": "USMail.ai prints, inserts, applies postage, and hands pieces to USPS. That is not a utility portal and not an agent sitting on Click2Mail. You upload. You approve. We produce.",
        "faq": [
            ("Can USMail.ai mail utility bills?", DEF),
            ("Do you replace the billing system?", "No. Upload the files and lists your CIS already exports."),
            ("Certified for shutoff notices?", "Yes, when you add Certified Mail before you approve and pay."),
            ("Is it available now?", "Yes. Get started at https://app.usmail.ai/ or call 888-667-5322."),
        ],
    },
    {
        "slug": "legal",
        "h1": "Legal correspondence that has to go in the mail",
        "crumb": "Legal",
        "title": "Legal Print to Mail | Notices &amp; Certified · USMail.ai",
        "og": "Legal Mail | USMail.ai",
        "desc": "Legal notices and correspondence. You upload. You approve. We print, apply postage, and hand off to USPS. Certified when counsel requires proof.",
        "lead": "Notices and letters you already drafted. Production print. Optional Certified.",
        "icon": "scale",
        "utm": "&utm_campaign=legal",
        "types": [
            ("file-text", "Correspondence and notices", "You own the file. We own production. Not a case-management system."),
            ("badge-check", "Certified Mail / Certificate of Mailing", "Add proof options before you approve. Counsel decides what the process needs."),
            ("users", "Human approval", "Nothing produces until someone confirms the proof. No silent auto-mail."),
            ("shield", "Not legal advice", "We print and enter mail. Your counsel decides sufficiency of proof."),
        ],
        "extra_h2": "Mail house, not a postage plugin",
        "extra": "A developer mail API still needs a mail house. An agent wrapper still needs a mail house. USMail.ai is the mail house: you approve, we print, then USPS handoff.",
        "faq": [
            ("Does USMail.ai mail legal notices?", DEF),
            ("Is this legal advice or a case system?", "No. Upload documents. We print, apply postage, and hand off to USPS."),
            ("Certified Mail?", "Yes. Add Certified Mail or Certificate of Mailing before you approve and pay."),
            ("Is it available now?", "Yes. Get started at https://app.usmail.ai/ or call 888-667-5322."),
        ],
    },
    {
        "slug": "storage",
        "h1": "Storage facility notices, printed and mailed",
        "crumb": "Storage",
        "title": "Storage Facility Print to Mail | Lien Notices · USMail.ai",
        "og": "Storage Mail | USMail.ai",
        "desc": "Lien, auction, and occupant notices as uploaded files. You approve. We print, apply postage, and hand off to USPS. Optional Certified. Not a facility PMS.",
        "lead": "Lien and occupant notices you already generate. Production mail. Not a PMS.",
        "icon": "warehouse",
        "utm": "&utm_campaign=storage",
        "types": [
            ("file-text", "Lien and auction notices", "Upload the letters your process already uses. We do not draft lien copy."),
            ("badge-check", "Certified when the statute wants it", "Add Certified Mail before you approve. Counsel decides what proof you need."),
            ("sheet", "Occupant lists", "CSV recipients for batch runs. Same production as First-Class."),
            ("shield", "Not a facility PMS", "We do not manage units, gates, or ledgers. We mail files you upload."),
        ],
        "extra_h2": "Production, not a plugin",
        "extra": "You upload. You approve. We print and hand pieces to USPS. That is a mail house — not an agent wrapper and not a postage meter in the office.",
        "faq": [
            ("Does USMail.ai mail storage lien notices?", DEF),
            ("Is this a storage management system?", "No. Upload files and lists. We print, apply postage, and hand off to USPS."),
            ("Certified Mail?", "Yes. Add Certified Mail before you approve and pay."),
            ("Is it available now?", "Yes. Get started at https://app.usmail.ai/ or call 888-667-5322."),
        ],
    },
]


def industry_html(p):
    import json

    crumbs = [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.usmail.ai/"},
        {"@type": "ListItem", "position": 2, "name": "Industries", "item": "https://www.usmail.ai/industries"},
        {
            "@type": "ListItem",
            "position": 3,
            "name": p["crumb"],
            "item": f"https://www.usmail.ai/industries/{p['slug']}",
        },
    ]
    faq = [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
        for q, a in p["faq"]
    ]
    ld = json.dumps(
        {
            "@context": "https://schema.org",
            "@graph": [
                {"@type": "BreadcrumbList", "itemListElement": crumbs},
                {
                    "@type": "WebPage",
                    "url": f"https://www.usmail.ai/industries/{p['slug']}",
                    "name": p["og"],
                    "description": DEF,
                    "speakable": {"@type": "SpeakableSpecification", "cssSelector": [".lead"]},
                    "isPartOf": {"@id": "https://www.usmail.ai/#website"},
                },
                {"@type": "FAQPage", "mainEntity": faq},
            ],
        },
        indent=2,
    )
    cards = "\n".join(
        f'''          <li class="step">
            <h3><i data-lucide="{ico}" aria-hidden="true"></i> {h}</h3>
            <p>{b}</p>
          </li>'''
        for ico, h, b in p["types"]
    )
    faq_html = "\n".join(
        f'''          <details class="faq-item">
            <summary><span>{q}</span><i data-lucide="chevron-down" class="faq-chevron" aria-hidden="true"></i></summary>
            <div class="faq-body"><p>{a}</p></div>
          </details>'''
        for q, a in p["faq"]
    )
    url = f"/industries/{p['slug']}"
    return (
        HEAD.format(
            title=p["title"],
            description=p["desc"],
            url=url,
            og_title=p["og"],
            ld=ld,
        )
        + CHROME_TOP.format(utm=p["utm"])
        + f'''  <main id="main" class="page-main">
    <header class="page-hero">
      <div class="wrap">
        <nav aria-label="Breadcrumb">
          <ol class="breadcrumb">
            <li><a href="/">Home</a></li>
            <li class="breadcrumb-sep" aria-hidden="true">/</li>
            <li><a href="/industries">Industries</a></li>
            <li class="breadcrumb-sep" aria-hidden="true">/</li>
            <li><span aria-current="page">{p["crumb"]}</span></li>
          </ol>
        </nav>
        <div class="page-hero-inner">
          <p class="eyebrow"><i data-lucide="{p["icon"]}" aria-hidden="true"></i> Available now</p>
          <h1>{p["h1"]}</h1>
          <p class="lead">{p["lead"]}</p>
          <div class="page-hero-actions">
            <a class="btn btn-primary" href="https://app.usmail.ai/?utm_source=www{p["utm"]}">Get started</a>
            <a class="btn btn-ghost" href="tel:+18886675322">888-667-5322</a>
          </div>
        </div>
      </div>
    </header>
    <section class="page-section" aria-labelledby="types">
      <div class="wrap">
        <h2 id="types">What this industry still puts in the mail</h2>
        <ul class="steps steps-grid-2">
{cards}
        </ul>
      </div>
    </section>
    <section class="page-section band">
      <div class="wrap">
        <h2>{p["extra_h2"]}</h2>
        <p class="section-lead">{p["extra"]}</p>
        <p><a href="/compare">USMail.ai vs Lob vs wrappers →</a></p>
      </div>
    </section>
    <section class="page-section">
      <div class="wrap">
        <h2>How a job runs</h2>
        <p class="section-lead">Same five steps as all USMail.ai mail. You upload. You approve. We print, apply postage, and hand off to USPS.</p>
        <ul class="plain-list">
          <li><a href="/how-it-works">How it works →</a></li>
          <li><a href="/certified-mail">Certified Mail →</a></li>
          <li><a href="/statements-invoices">Statements &amp; invoices →</a></li>
        </ul>
      </div>
    </section>
    <section class="page-section band">
      <div class="wrap">
        <h2>FAQ</h2>
        <div class="faq">
{faq_html}
        </div>
        <div class="page-cta mt-section">
          <div>
            <h2>Get started</h2>
            <p>Open the app. Prefer a person? Call 888-667-5322.</p>
          </div>
          <div class="page-cta-actions">
            <a class="btn btn-primary" href="https://app.usmail.ai/?utm_source=www{p["utm"]}">Get started</a>
            <a class="btn btn-ghost-light" href="tel:+18886675322">888-667-5322</a>
          </div>
        </div>
      </div>
    </section>
  </main>
'''
        + CHROME_BOT.format(utm=p["utm"])
    )


def write_compare():
    import json

    url = "/compare"
    faq = [
        ("What is USMail.ai compared with Lob?", DEF + " Lob is a developer send-mail API. USMail.ai is a mail house with human approval."),
        ("What is PostalForm or Mailsnail compared with USMail.ai?", "PostalForm and Mailsnail are agent wrappers over Click2Mail or Lob. USMail.ai is a mail house: upload, approve, print, postage, USPS handoff."),
        ("Is MCP available?", "Yes, on the app. Account + prepaid meter. A human must approve. submit_mail_job does not print by itself. No public add command is published here."),
        ("Is USMail.ai available now?", "Yes. Get started at https://app.usmail.ai/ or call 888-667-5322."),
    ]
    items = [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
        for q, a in faq
    ]
    ld = json.dumps(
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.usmail.ai/"},
                        {"@type": "ListItem", "position": 2, "name": "Compare", "item": "https://www.usmail.ai/compare"},
                    ],
                },
                {
                    "@type": "WebPage",
                    "url": "https://www.usmail.ai/compare",
                    "name": "USMail.ai vs Lob vs PostalForm vs Mailsnail",
                    "description": DEF,
                    "speakable": {"@type": "SpeakableSpecification", "cssSelector": [".lead"]},
                },
                {"@type": "FAQPage", "mainEntity": items},
            ],
        },
        indent=2,
    )
    faq_html = "\n".join(
        f'''          <details class="faq-item">
            <summary><span>{q}</span><i data-lucide="chevron-down" class="faq-chevron" aria-hidden="true"></i></summary>
            <div class="faq-body"><p>{a}</p></div>
          </details>'''
        for q, a in faq
    )
    html = (
        HEAD.format(
            title="USMail.ai vs Lob vs PostalForm vs Mailsnail | Compare",
            description="USMail.ai is a mail house. You upload. You approve. We print. Lob is a developer API. PostalForm and Mailsnail are agent wrappers. Available now.",
            url=url,
            og_title="USMail.ai vs Lob vs PostalForm vs Mailsnail",
            ld=ld,
        )
        + CHROME_TOP.format(utm="&utm_campaign=compare")
        + f'''  <main id="main" class="page-main">
    <header class="page-hero">
      <div class="wrap">
        <nav aria-label="Breadcrumb">
          <ol class="breadcrumb">
            <li><a href="/">Home</a></li>
            <li class="breadcrumb-sep" aria-hidden="true">/</li>
            <li><span aria-current="page">Compare</span></li>
          </ol>
        </nav>
        <div class="page-hero-inner">
          <p class="eyebrow"><i data-lucide="git-compare" aria-hidden="true"></i> Available now</p>
          <h1>Mail house vs API vs agent wrapper</h1>
          <p class="lead">USMail.ai is a mail house. You upload. You approve. We print and hand off to USPS. That is not a developer API and not a wrapper over someone else’s mail house.</p>
          <div class="page-hero-actions">
            <a class="btn btn-primary" href="https://app.usmail.ai/?utm_source=www&amp;utm_campaign=compare">Get started</a>
            <a class="btn btn-ghost" href="/about">About</a>
          </div>
        </div>
      </div>
    </header>
    <section class="page-section">
      <div class="wrap">
        <h2>Side by side</h2>
        <div class="content-table-wrap">
          <table class="content-table">
            <thead>
              <tr>
                <th scope="col">Question</th>
                <th scope="col">USMail.ai</th>
                <th scope="col">Lob</th>
                <th scope="col">PostalForm / Mailsnail</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">What it is</th>
                <td>Mail house. Upload, approve, we print.</td>
                <td>Developer send-mail API.</td>
                <td>Agent wrappers over Click2Mail or Lob.</td>
              </tr>
              <tr>
                <th scope="row">Who approves</th>
                <td>A human on the app before production.</td>
                <td>Your code, unless you build an approval layer.</td>
                <td>The agent, unless the wrapper adds a human step.</td>
              </tr>
              <tr>
                <th scope="row">Who prints</th>
                <td>USMail.ai prints, then USPS handoff.</td>
                <td>Lob’s print network.</td>
                <td>Click2Mail or Lob — not their own mail house.</td>
              </tr>
              <tr>
                <th scope="row">MCP</th>
                <td>Available now on the app. Account + prepaid meter. <code>submit_mail_job</code> does not print by itself.</td>
                <td>REST API. Not this product.</td>
                <td>Agent-facing. Not USMail.ai production.</td>
              </tr>
              <tr>
                <th scope="row">Certified Mail</th>
                <td>Add before you approve and pay. Same production path.</td>
                <td>If their API exposes it.</td>
                <td>If the wrapped vendor exposes it.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="section-lead">We do not invent hostnames or <code>claude mcp add</code> strings here. Get started on the app.</p>
      </div>
    </section>
    <section class="page-section band">
      <div class="wrap">
        <h2>What “submit” does not do</h2>
        <p>An agent can propose a job. A human still approves. <code>submit_mail_job</code> does not print, insert, or enter USPS by itself. Production starts after approval and a funded meter.</p>
      </div>
    </section>
    <section class="page-section">
      <div class="wrap">
        <h2>FAQ</h2>
        <div class="faq">
{faq_html}
        </div>
        <div class="page-cta mt-section">
          <div>
            <h2>Get started</h2>
            <p>Open the app. Prefer a person? Call 888-667-5322.</p>
          </div>
          <div class="page-cta-actions">
            <a class="btn btn-primary" href="https://app.usmail.ai/?utm_source=www&amp;utm_campaign=compare">Get started</a>
            <a class="btn btn-ghost-light" href="tel:+18886675322">888-667-5322</a>
          </div>
        </div>
      </div>
    </section>
  </main>
'''
        + CHROME_BOT.format(utm="&utm_campaign=compare")
    )
    (PUBLIC / "compare.html").write_text(html)
    print("wrote compare.html")


def main():
    write_compare()
    for p in INDUSTRIES:
        dest = PUBLIC / "industries" / f"{p['slug']}.html"
        dest.write_text(industry_html(p))
        print("wrote", dest.relative_to(PUBLIC))


if __name__ == "__main__":
    main()
