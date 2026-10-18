import test from 'node:test';import assert from 'node:assert/strict';
import {LEDGER_TEMPLATE,parseLedgerCSV,screenLedger,compileLedger} from '../js/ledger.mjs';
import {WORKSPACE_SCHEMA,validateAnalysis,validateWorkspace,evaluateAnalysis} from '../js/analysis-state.mjs';
import {buildDecisionReport} from '../js/decision-report.mjs';
import {computeScenario,defaultSettings} from '../js/compliance-engine.mjs';
const profile={name:'My vessel',gt:10000,shipType:'cargo',serviceSpeedKn:13.5,periodStart:'2026-01-01',periodEnd:'2026-12-31',scopeStatus:'ordinary'};
const document=()=>({profile:{...profile},rows:parseLedgerCSV(LEDGER_TEMPLATE)});
const analysis=()=>({selectedVesselId:'v1',selectedScenario:'deadlock',language:'zh',twin:{euaPrice:80,fueleuTargetCut:2,jitSpeedDeltaKn:0,biofuelBlendPct:0,poolingSurplusTonnes:0,charterType:'voyage_gencon'},settings:defaultSettings(),vesselInputs:{},ledgerDocuments:{}});
test('one fuel ledger derives scoped energy, CO2, intensity and distance for the unchanged engine',()=>{
 const d=document(),c=compileLedger(d,'v1');assert.equal(c.screened.energyMJ,14432000);assert.equal(c.screened.distanceNm,3300);assert.ok(Math.abs(c.screened.actualWtWIntensity-91.6)<1e-10);
 const m=computeScenario(c.vessel,defaultSettings());assert.ok(Math.abs(m.euEts-(320*.5+160+32)*3.114*80)<1e-8);assert.ok(Math.abs(m.ukEts-(64+6.4)*3.114*60)<1e-8);
});
test('scope screening distinguishes 5000 GT, UK commencement, special calls and Norway/Iceland review',()=>{
 const d=document();d.profile.gt=5000;const boundary=screenLedger(d);assert.equal(boundary.regimes.euEts,'preliminary-in-scope');assert.equal(boundary.regimes.fuelEU,'outside-or-review');assert.equal(boundary.canApply,false);
 d.profile.gt=10000;d.rows[3].date='2026-06-30';assert.equal(screenLedger(d).rows[3].ukCoverage,0);d.profile.scopeStatus='review';assert.equal(screenLedger(d).canApply,false);d.profile.scopeStatus='ordinary';d.rows[0].from='NOBGO';assert.equal(screenLedger(d).canApply,false);
});
test('CSV import supports BOM, CRLF and quoted commas; rejects missing factors, duplicate IDs and invalid dates',()=>{
 const csv='\uFEFF'+LEDGER_TEMPLATE.replaceAll('\n','\r\n').replace('Demo log 002','"Log, 002"');assert.equal(parseLedgerCSV(csv)[1].source,'Log, 002');
 const d=document();d.rows[0].lhvMJPerKg=NaN;assert.throws(()=>screenLedger(d));const duplicate=document();duplicate.rows[1].id='R1';assert.throws(()=>screenLedger(duplicate));const date=document();date.rows[0].date='2026-02-30';assert.throws(()=>screenLedger(date));
});
test('workspaces preserve calculation inputs and recompute values rather than trusting outputs',()=>{
 const a=analysis(),file={schema:WORKSPACE_SCHEMA,name:'Budget',input:a,cases:[],savedAt:'2026-10-18'};
 const w=validateWorkspace(JSON.parse(JSON.stringify({...file,comparison:{fake:1}})));assert.deepEqual(evaluateAnalysis(w.input),evaluateAnalysis(a));assert.equal('comparison'in w,false);
 assert.throws(()=>validateWorkspace({uiVersion:'4.3.1'}));const bad=analysis();bad.twin.euaPrice=-1;assert.throws(()=>validateAnalysis(bad));
 const ledger=analysis();ledger.ledgerDocuments.v1=document();ledger.settings.distanceNm=3300;assert.equal(evaluateAnalysis(validateAnalysis(ledger)).vessel.euEnergyMJ,14432000);ledger.settings.distanceNm=6000;assert.throws(()=>validateAnalysis(ledger));
});
test('standalone report escapes imported text, separates currencies and retains formula/disclaimer evidence',()=>{
 const a=analysis(),html=buildDecisionReport({name:'<img src=x onerror=alert(1)>',input:a,cases:[]});assert.equal(html.includes('<img'),false);assert.ok(html.includes('&lt;img'));assert.ok(html.includes('€88,000'));assert.ok(html.includes('£13,200'));assert.ok(html.includes('41,000'));assert.ok(html.includes('不是标准租约默认条款'));assert.ok(html.includes('组合搜索'));assert.ok(html.includes('运营输入未确认'));assert.ok(html.includes('MV DEMO-01'));
});
test('explicit planning cases change conditional costs without changing regional law or base inputs',()=>{
 const a=analysis(),before=evaluateAnalysis(a);const b=structuredClone(a);b.twin.euaPrice=100;b.twin.fueleuTargetCut=6;
 const after=evaluateAnalysis(validateAnalysis(b));assert.equal(before.comparison.active.euEts,88000);assert.equal(after.comparison.active.euEts,110000);assert.equal(after.comparison.active.fuelEu.toFixed(2),'619346.72');assert.equal(after.comparison.active.ukEts,13200);assert.equal(a.twin.euaPrice,80);b.twin.poolingSurplusTonnes=1000;b.settings.poolAvailable=1000;assert.equal(evaluateAnalysis(validateAnalysis(b)).comparison.active.fuelEu,0);
});
