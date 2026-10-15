# Design System Master Specification — MultiReg Maritime Compliance & Digital Twin Platform (`maritime-compliance-gemini`)

> **Generated via 6-Skill Pipeline:** `frontend-design` + `ui-ux-pro-max` + `design-tokens` (OKLCH) + `web-design-guidelines` + `motion` + `identity-skill`

## 1. Domain & Competitor Benchmarking Synthesis
- **Benchmarked Competitors:**
  - **DNV Veracity Emissions Connect & Veson IMOS:** Verified data pipelines (THETIS-MRV / DCS verification), voyage P&L integration, enterprise-heavy setup.
  - **ZeroNorth & StormGeo s-Insight:** Map-centric vessel telemetry, weather/speed optimization, CII/ETS dashboards.
  - **OceanScore Compliance Manager & NAPA Fleet Intelligence:** EU ETS / FuelEU surplus-deficit tracking and charterparty allocation, but priced and structured for large corporate fleets.
- **Our Differentiated UI Positioning (SME 5–20 Vessel Focus):**
  - Combines **Concept A (Holographic Route & Digital Twin Cockpit)**, **Concept B (Bento Multi-Regime & White-Box Formula Audit Grid + Anti-Greenwashing Dual-Gauge)**, and **Concept C (Split-Screen Charterparty/JIT Sandbox & IMO 3-Scenario Stress-Test Matrix)** into a unified, zero-friction web application with **instant Bilingual (`中文 / EN`) switching**.

## 2. Perceptual `oklch()` Color Token System (`design-tokens`)
- **Canvas & Surfaces (Hue `252` Deep Abyssal Telemetry Navy):**
  - `--surface-canvas`: `oklch(12.5% 0.024 252)` (`#060b16`)
  - `--surface-panel`: `oklch(16.5% 0.028 252)` (`#0b1324`)
  - `--surface-elevated`: `oklch(20.5% 0.032 252)` (`#111c33`)
  - `--surface-glass`: `oklch(17.5% 0.030 252 / 0.82)`
- **Semantic Accents (Perceptually matched at `L = 76%–80%`):**
  - `--accent-cyan`: `oklch(79% 0.155 202)` — Active Telemetry, Digital Twin Controls & `[Assumption]` tag
  - `--accent-emerald`: `oklch(78% 0.168 162)` — Verified Data, Surplus Balance & `[In-Force]` tag
  - `--accent-amber`: `oklch(81% 0.165 78)` — Data Hygiene Warnings (`CH4/N2O Missing`), Supply Bottlenecks & `[Pending]` tag
  - `--accent-rose`: `oklch(68% 0.195 22)` — FuelEU Deficit Penalty & Non-Compliance Risk
  - `--accent-indigo`: `oklch(72% 0.165 278)` — UK ETS (`GBP £`) & Guardrailed AI Copilot

## 3. Typography & Numeric Discipline (`frontend-design` & `web-design-guidelines`)
- **Display & Headings:** `'Space Grotesk', 'PingFang SC', 'Microsoft YaHei', sans-serif` — geometric technical authority.
- **UI Body & Bilingual Copy:** `'Inter', -apple-system, 'PingFang SC', sans-serif` — clean legibility at 13–15px.
- **Telemetry & Financial Figures:** `'JetBrains Mono', 'SF Mono', monospace` with strict `font-variant-numeric: tabular-nums` and `white-space: nowrap` on all currency (`€`, `£`) and physical unit (`tCO2`, `gCO2e/MJ`, `kn`, `MJ`) readouts.

## 4. Five-Module Interactive Architecture
1. **Tab 1 — 全息指挥舱与多制度总览 (`Command Cockpit & Route Twin`)**:
   - Interactive SVG Asia–Europe–UK route topology map (`E1: Extra-EU 50%`, `E2: Intra-EU 100%`, `E3: EU Berth 100%`, `U1/U2: UK Domestic & Port 100%`) with animated flow particles, vessel selector (5 SME ships anchored by the Appendix A3 **10,000 GT Cargo Vessel**), live multi-currency KPI cards (`EUR` & `GBP` strictly separated), and quick What-If telemetry sliders.
2. **Tab 2 — 白盒审计链与数据质检台 (`White-Box Audit & Data Hygiene`)**:
   - Line-by-line interactive formula inspector matching Appendix A3 (`E1/E2/E3`, `U1/U2`, `FuelEU 2% vs 6%`), explicit data hygiene gate (`CO2 Verified` vs `CH4/N2O Missing — Blocked from Zero-Defaulting`), CSV/Spreadsheet import simulator, and the **Anti-Greenwashing Dual-Gauge** (Financial Bill vs. Physical WtW Lifecycle Emissions).
3. **Tab 3 — 航次、组池与租约数字孪生沙盒 (`Digital Twin & Charterparty Sandbox`)**:
   - Interactive simulation of **JIT Arrival Speed Cube Law** ($P \propto v^3$, connecting to Course Week 8), **Biofuel / e-Methanol Blend** (with regional green fuel supply bottleneck warnings), **FuelEU Pooling Calculator** (Course Lecture 3), and **Charterparty Cost Allocation** (`GENCON Voyage Charter` vs `NYPE Time Charter + BIMCO ETS/FuelEU Clauses`).
4. **Tab 4 — IMO 三情景压力测试矩阵 (`IMO 3-Scenario Stress-Test Matrix`)**:
   - One-click stress testing across **Scenario 1: Adopted As-Is (原样通过)**, **Scenario 2: Adopted but Amended (修订后通过)**, and **Scenario 3: Continued Deadlock (持续僵局)**, simultaneously modelling **Client Vessel Compliance Exposure (2026–2030)** AND **Platform Venture Resilience (Break-even: 70 / 67 / 57 vessels, Fixed Cost €210k / €200k / €180k)** plus the **Name-Your-Dependency fallback plan**.
5. **Tab 5 — 受控 AI 政策雷达、ESG 与商业模型中心 (`Guardrailed AI, ESG & A1 ROI Hub`)**:
   - Guardrailed AI Regulatory Intelligence stream with `[In-Force]`, `[Pending]`, and `[Assumption]` tags and `[Human-in-the-Loop Expert Review]` triggers; interactive AI Q&A presets; Appendix A1 **SME Client ROI Calculator** (`240h → 120h`, `€40/h`, `€2,000` advisor savings, `€4,800` subscription + `€600` onboarding = `€1,400` Year-1 net benefit); and Appendix A2 Risk Register & Own-Footprint Scope 1/2/3 ESG tracker.
