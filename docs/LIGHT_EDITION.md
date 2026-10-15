# Light edition v4.2: methods and evidence

## Architecture and scope

The original light UI uses its original per-page state with an independent calculation dataset (`light-data.mjs`) and pure `compliance-engine.mjs`. The original shared v3 dataset and the other edition's dedicated assets remain untouched. Static HTTP hosting is sufficient; no server-side calculation or build pipeline is introduced.

`index.html` declares the known DOM contract. Internal vessel, setting, route and view structures are trusted. Existing bounded sliders supply user inputs. No generic internal validation or fallback layer is added. Native `<dialog>` provides modal behavior inside the original glass backdrop/card appearance; no custom focus-trap fallback is added.

## Calculation boundaries

- The retained UI compares FuelEU target conditions for 2025–2029 versus 2030, with fixed 2026 ETS activity inputs (UK July–December). It is not a forecast of a complete future-year bill. The engine supports the corresponding year inputs.
- ETS: CO₂ subtotals only. Each illustrative activity retains `ch4Tonnes: null` and `n2oTonnes: null`; complete ETS totals remain unavailable. All demo data is unverified.
- EU/UK currencies remain separate. The UK 2026 example covers July–December activity. Special UK routes/exemptions and full legal-scope determination are outside the model.
- FuelEU: target is 91.16×0.98 through 2029, 91.16×0.94 from 2030. CB=(target−actual)×scoped energy. Only a negative residual balance produces a penalty. The engine supports Art. 23 escalation; the preserved UI currently demonstrates n=1 only, not verified history.
- Pool allocation is the minimum of requested tonnes, declared available tonnes and the ship's deficit. The pooling-only comparison derives demand dynamically. Actual participants, positive aggregate pool balance, verifier approvals and database registration are not implemented.
- The fixed-distance model uses squared speed ratio for sailing energy. Sailing is assumed to be 88% of EU energy, stationary activity 12%. Port CO₂ is unchanged by speed. v4.2 adds scoped extra sailing hours, daily non-fuel time cost and user-assumed additional auxiliary fuel. It does not establish a verified JIT window.
- The illustrative fuel energy fraction b reduces CO₂ by 0.26b and WtW intensity by 0.32b. These are not universal fuel/engine factors or certified biofuel treatment. Prices per VLSFO-equivalent tonne are cost assumptions.
- ETS records and annual FuelEU energy are independently specified. They have not been reconciled to one actual vessel-year fuel ledger.
- Physical figures are in-scope WtW model estimates, not entire-vessel annual emissions or observed reductions. Financial comparisons use the same year/prices; price-only effects are shown separately.
- FuelEU OPS, RFNBO rewards, ice adjustments, full certified-fuel methodology, borrowing and banking are not modelled.

The options table is a whole-unit summary; independent rounding may create rounding differences between displayed components and totals. The engine, calculation trace and JSON snapshot retain the unrounded calculation basis. No hidden FX conversion is applied.

## Evidence and capability states

Implemented: deterministic comparison, current-state formulas, official source links, data-scope notices, JSON snapshot export, bilingual original UI and illustrative geography.

Simulation/planning: source data, fuel/speed parameters, pooling supply, editable contract splits, static explanations, venture financial assumptions, customer-validation and ESG plans.

Not implemented: real-data import, complete three-gas ETS, AI/RAG, live policy updates, multi-tenant backend, external verification, human approval or filing. Exported snapshots explicitly state that verification and approval were not performed.

The course map uses the available cached Chinese Group Venture Project Brief, not a verified latest NTULearn notice. Its five written-rubric weights guide evidence coverage; the website does not replace the written report or establish a grade.

## Official references

Checked 2026-10-15; recheck applicability and amendments before real use.

- [EU ETS maritime scope and phase-in](https://climate.ec.europa.eu/areas-action/transport-decarbonisation/reducing-emissions-shipping-sector_en)
- [FuelEU Regulation (EU) 2023/1805: Art. 4, 20, 21, 23; Annex IV](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1805)
- [Commission FuelEU implementation questions and answers](https://transport.ec.europa.eu/transport-modes/maritime/decarbonising-maritime-transport-fueleu-maritime/questions-and-answers-regulation-eu-20231805-use-renewable-and-low-carbon-fuels-maritime-transport_en)
- [UK ETS maritime compliance](https://www.gov.uk/guidance/uk-emissions-trading-scheme-for-maritime-how-to-comply)
- [IMO ISWG-GHG 22: scheduled resumption subject to MEPC 85](https://www.imo.org/en/mediacentre/meetingsummaries/pages/iswg-ghg-22.aspx)
- [BIMCO ETS clause](https://www.bimco.org/contractual-affairs/bimco-clauses/current-clauses/etsa_clause/)
- [EMSA ETS port-of-call/transhipment FAQ](https://emsa.europa.eu/reducing-emissions/extension-ets/faq-extension-ets.html)

## Final user constraints

Original visual and motion design is retained. Layout fixes are appended without changing the original effect definitions or timings. FuelEU target selection is a condition comparison with fixed ETS activity inputs (2026; UK example July–December), not a forecast of a complete future-year bill. The preserved UI does not expose every engine setting. Core math regressions and one bounded page smoke check are sufficient for this delivery.

## UI v4.1.0

At the v4.1.0 checkpoint the calculation model remained v4.0 and the interface was v4.1.0, recorded separately in exported snapshots. Budget inputs and formulas are unchanged. Business/ROI controls leave the customer UI; their assumptions are preserved in [project plans](PROJECT_PLANNING.md). Course mappings live in [course documents](COURSE_MAPPING.md). Calculation traces and all official source links remain available through disclosures. This content migration is not a fresh regulatory or course-brief audit.


## UI/model v4.2.0

Both UI and calculation model are now versioned 4.2.0. `option-planner.mjs` performs a finite search and `planning-ui.mjs` handles native bounded user input and the comparison view. Default zero-adjustment benchmark values are unchanged. Scope/price defaults are editable and user confirmations start false and reset on vessel changes. Draft inputs are marked unapplied and cannot silently replace calculation inputs.

The declared distance represents cumulative sailing in the same scope/period as compared energy and records, not map distance. Added hours = distance/new speed − distance/base speed. Extra auxiliary fuel = added days × user-assumed tonnes/day. Its energy is added using 41,000 MJ/t VLSFO-eq; its CO₂ uses an editable assumed factor and ETS coverage. It shares the simplified fuel blend treatment. No claim is made that these assumptions constitute certified-fuel factors or reconciled actual records. Price/time/auxiliary defaults are demonstration inputs, not newly sourced regulatory facts.

Table totals contain EUR compliance, net fuel delta and non-fuel time cost. They exclude UK GBP and baseline costs common to compared options; they are not full voyage costs. Table party amounts apply the selected illustrative split to operating deltas as well; the existing headline owner KPI remains compliance-only. Both identities are explicit. Candidate ranking minimizes the scoped EUR total rather than owner-specific cost or whole-vessel multi-currency cost.

Search: speed step 0.2 kn across −2..0, fuel step 5 percentage points plus the exact entered cap, and zero/capped pooling endpoints. Include a valid current option. Pool costs and residual penalties are linear at fixed speed/fuel. Numeric infeasibility and unconfirmed resource/operating conditions are separate. A user-confirmed candidate is preferred when available; otherwise the cheapest pending model candidate is displayed. It does not certify an executable strategy or guarantee global optimality. Snapshots include applied input values, model vessel inputs, search scope, recommendation and evaluated rows.

The budget float now works on desktop and mobile when original KPIs are out of view; materials and drag/collapse/reset behavior are retained. No backend, procurement, forecasting or filing was added.
