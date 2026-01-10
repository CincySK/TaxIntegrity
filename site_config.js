// Edit-friendly config for Civic Tax AI
// Tell me edits like:
// - Change site.tagline to "New tagline"
// - Change audit.btn1 to "New button label"

window.CIVIC_TAX_AI_CONFIG = {
  site: {
    title: "TaxIntegrity",
    tagline: ""
  },
  audit: {
    heading: "AI‑Powered Tax Audit Assistance",
    subheading: "Streamline Your Tax Audit Process with AI",
    btn1: "Automated Audit Analysis",
    btn2: "Document Verification",
    btn3: "Risk Scoring",
    check1: "Identify Errors",
    check2: "Detect Anomalies",
    check3: "Provide Insights"
  },
  evasion: {
    heading: "Combating Tax Evasion with AI",
    subheading: "Uncover Hidden Income & Fraudulent Activities",
    btn1: "Income Tracking",
    btn2: "Offshore Account Detection",
    btn3: "Behavioral Analysis",
    check1: "Find Offshore Accounts",
    check2: "Track Undisclosed Income",
    check3: "Spot Fraud Schemes"
  },
  progress: {
    heading: "AI Progress in Fighting Tax Evasion",
    p1: { label: "Hidden Income Detected" },
    p2: { label: "Offshore Accounts Found" },
    p3: { label: "Fraud Schemes Uncovered" }
  },
  signals: {
    ev_income: [
      { t: "Third‑party mismatch", d: "Reported income differs from third‑party info (W‑2/1099‑like signals)." },
      { t: "Peer‑group anomaly", d: "Outliers vs similar taxpayers (industry/state/income band)." },
      { t: "Time‑series change", d: "Sudden unexplained shifts across filing years." }
    ],
    ev_offshore: [
      { t: "Network indicators", d: "Connected entities, shared addresses, agents, or ownership structures." },
      { t: "Cross‑border patterns", d: "Aggregated payment anomalies and routing patterns (illustrative)." },
      { t: "Entity resolution", d: "Match the same entity across registries and accounts." }
    ],
    ev_behavior: [
      { t: "Invoice text similarity", d: "NLP clusters near‑duplicate invoices (where lawful)." },
      { t: "Circular flows", d: "Graph analysis detects money loops and round‑tripping." },
      { t: "Risk propagation", d: "Risk spreads across connected networks for triage." }
    ],
    audit_auto: [
      { t: "Case triage", d: "Rank cases by expected yield + risk, keeping humans in control." },
      { t: "Explainability notes", d: "Show why a case scored high (drivers and evidence)." },
      { t: "Drift monitoring", d: "Detect when patterns change so models stay reliable." }
    ],
    audit_docs: [
      { t: "Document QA", d: "Spot missing fields, inconsistencies, or suspicious templates." },
      { t: "Receipt matching", d: "Align totals and categories; flag duplicates." },
      { t: "Summaries", d: "NLP summarizes long audit files for faster review." }
    ],
    audit_risk: [
      { t: "Transparent scoring", d: "Weights on gap size, mismatches, and risk indicators." },
      { t: "False‑positive control", d: "Thresholding + sampling + analyst feedback loops." },
      { t: "Fairness checks", d: "Monitor bias and disparate impact (illustrative)." }
    ]
  }
};
