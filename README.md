# MultiReg Compliance & Digital Twin Cockpit (`maritime-compliance-gemini`)

> **MT6503 Group Venture Project — Track B: Compliance & RegTech**  
> **Role:** Member 10 (APP & AI Prototype Developer — Interactive Web App, AI Copilot & Digital Twin Demo)  
> **Repository Tag:** `maritime-compliance-gemini`

## 1. Project Overview
An interactive decision-support web prototype designed for SME shipowners and ship managers (5–20 vessels) navigating fragmented maritime carbon regulations (**EU ETS**, **FuelEU Maritime**, **UK ETS**, and pending **IMO Net-Zero Framework**).

### Core Design Principles (Aligned with MT6503 Rubric & Venture Report)
1. **Deterministic Calculation Engine vs. Guardrailed AI Copilot:**
   - All financial figures, allowances, and GHG intensity balances are computed via versioned deterministic formulas (zero LLM hallucination in financial outputs).
   - AI is strictly scoped to regulatory intelligence tracking, evidence-backed rule explanation, and commercial option synthesis, with mandatory `[Expert Review Required / Human-in-the-Loop]` triggers for ambiguous scope or major CAPEX decisions.
2. **Lightweight Voyage & Fleet Digital Twin (SME-Fit):**
   - Spreadsheet/CSV ingestion + public THETIS-MRV background check (no intrusive onboard OT hardware hookup in v1.0, avoiding premature IACS UR E26/E27 vessel-side certification claims).
   - Interactive What-If sandbox for **Speed/JIT Cube Law**, **Biofuel/Methanol Blending**, **FuelEU Pooling**, and **Charterparty Cost Allocation (GENCON / NYPE + BIMCO Clauses)**.
3. **Anti-Greenwashing & Evidence Boundary Governance:**
   - Explicit status badges on every regulatory rule: `[In-Force]`, `[Pending Proposal]`, and `[Client Planning Assumption]`.
   - Separate tracking of **Financial Compliance Bill** vs. **Physical Well-to-Wake (WtW) Lifecycle Emissions**.
   - Separate currency accounting (`EUR €` for EU ETS / FuelEU, `GBP £` for UK ETS) without hidden FX assumptions.

---

## 2. UI Layout Concepts (`v0.1.0`)
Three sci-fi telemetry UI layout paradigms have been designed for team selection:
- **Concept A (`Holographic Map-Centric Command Cockpit`):** Center interactive Asia–Europe–UK route topology map (`EU 50%`, `EU 100%`, `UK ETS`), flanked by the 10,000 GT Vessel Digital Twin controls on the left and multi-currency compliance cards + AI Copilot on the right.
- **Concept B (`Modular Bento Grid & White-Box Audit Terminal`):** Precision FinTech/RegTech Bento grid highlighting side-by-side EU ETS / FuelEU / UK ETS telemetry, an expandable White-Box Formula Audit Trail (`CO2 Verified` vs. `CH4/N2O Missing` guardrails), and a dual-gauge Anti-Greenwashing monitor.
- **Concept C (`Split-Screen Digital Twin Sandbox & 3-Scenario Stress-Test Studio`):** Left workbench dedicated to interactive vessel/charterparty simulation sliders and NYPE/GENCON cost splitting; right workbench dedicated to the IMO 3-Scenario Stress Test Matrix (`Adopted As-Is`, `Amended`, `Continued Deadlock`) and SME Client ROI (`120h Saved | Net Benefit €2,000/yr`).

---

## 3. Version History
- **`v0.1.0`** — Initialized `maritime-compliance-gemini` repository, documented 5-module software architecture, data pipeline, and 3 sci-fi UI layout concepts.
