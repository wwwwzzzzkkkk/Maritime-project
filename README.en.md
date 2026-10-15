# MAREG — Multi-Regime Maritime Compliance & Digital Twin Platform (English Documentation)

<p align="left">
  <a href="./README.md">🌐 Bilingual Main README (README.md)</a> &nbsp;|&nbsp;
  <a href="./README.zh-CN.md">🇨🇳 中文文档 (README.zh-CN.md)</a>
</p>

> **NTU MSc Maritime Studies · MT6503 Group Venture Project — Track B: Compliance & RegTech**  
> **GitHub Repository:** [https://github.com/wwwwzzzzkkkk/Maritime-project](https://github.com/wwwwzzzzkkkk/Maritime-project)  
> **🌐 Live Demo URL (Daylight Liquid Glass 3D Edition):** [https://wwwwzzzzkkkk.github.io/Maritime-project/](https://wwwwzzzzkkkk.github.io/Maritime-project/)  
> **🌐 Live Demo URL (UI/UX Pro Max Workbench Edition):** [https://wwwwzzzzkkkk.github.io/Maritime-project/index-pro-max.html](https://wwwwzzzzkkkk.github.io/Maritime-project/index-pro-max.html)  
> **Project Name:** `Maritime-project` · **Developer Role:** Member 10 (APP & AI Prototype Developer)

---

## 1. Executive Summary & Dual-Edition Architecture

**MAREG (`Maritime-project`)** is an interactive decision-support web application built for small-to-medium shipping enterprises (SMEs operating 5–20 vessels) navigating multi-jurisdictional carbon regulations across **EU ETS, FuelEU Maritime, UK ETS, and the pending IMO Net-Zero Framework (NZF)**.

The repository includes **two complete, one-click switchable frontend editions** powered by a shared deterministic calculation engine ([`js/data-and-i18n.js`](./js/data-and-i18n.js)):

1. **[`index.html`](./index.html) — Apple Daylight Liquid Glass & Spatial 3D Tilt Edition (`v3.4`)**
   - Features a cool architectural silver-gray canvas (`#edf1f7`), high-contrast obsidian slate typography (`#0f172a`), inline SVG Snell's-law optical refraction (`#apple-liquid-refract`), angle-sensitive `1.25px` masked specular rims, real-time 3D perspective pitch/roll tilt (`rotateX / rotateY`) with multi-plane Z-axis parallax depth, and keyless Esri `World_Light_Gray_Base` maritime GIS tiles.
2. **[`index-pro-max.html`](./index-pro-max.html) — UI/UX Pro Max Split-Pane Command Workbench Edition (`v1.0`)**
   - Built strictly to the `ui-ux-pro-max` 10-priority specification. Combines a **320px Persistent Left Command Rail & Live Digital Twin Telemetry Dock** with an inspectable **Slide-Over White-Box Formula Trace Drawer (`f(x) A3`)**, keyboard navigation (`1–5` to switch views, `Esc` to close drawer), and `<300nm` anti-evasion transshipment radius rings around East Port Said (`EGPSD`) and Tanger Med (`MAPTM`).

---

## 2. Quick Start

Open [`index.html`](./index.html) or [`index-pro-max.html`](./index-pro-max.html) directly in any modern browser, or run a local static server inside the project directory:

```bash
python3 -m http.server 8080
```

---

## 3. Verified Deterministic Benchmarks (Appendices A1, A2, A3)

- **EU ETS Allowance Bill (EUR Only)**: `Leg E1 (500t) + Leg E2 (500t) + Leg E3 Berth (100t) = 1,100 tCO₂ × 100% × €80 = €88,000` (`€60 / €100` sensitivity: `€66,000 / €110,000`), with an automated **2026 `CH₄/N₂O` Data Hygiene Gate** preventing zero-defaulting of missing gases.
- **UK ETS Domestic Maritime Bill (GBP Separate)**: `Leg U1 Domestic (200t) + Leg U2 Berth (20t) = 220 tCO₂ × £60 = £13,200` (strictly isolated in `GBP £` without unauthorized FX conversion).
- **FuelEU Maritime WtW Penalty (EUR Only)**: At `164,000,000 MJ` EU energy and `91.6 gCO₂e/MJ` actual intensity, yields a **`€237,191.27` penalty** under the `2025–2029 (-2% · 89.3368)` target and **`€619,346.72` penalty** under the `2030 (-6% · 85.6904)` condition comparison.
- **Appendix A1 5-Vessel SME Client ROI**: `120 hrs saved × €40/h (€4,800) + €2,000 cancellable advisor fee = €6,800` gross annual value; net of the `€4,800` annual subscription, delivers **`€2,000` recurring annual net benefit** and **`€1,400` Year-1 net benefit** (after `€600` onboarding).
