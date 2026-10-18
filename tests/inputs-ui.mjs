import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const base=process.env.BASE_URL||'http://127.0.0.1:48183';
const evidence='docs/verification/v4.3.1',shots='docs/previews/v4.3.1';
await mkdir(evidence,{recursive:true});await mkdir(shots,{recursive:true});
const result={scope:'Only Chrome; external fonts and map services blocked; no performance measurements',checks:[],screens:[]};
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
const flush=()=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const tab=id=>p.locator(`[data-tab="${id}"]`).click();
const snapshot=async name=>{await p.locator('#openAuditModalBtn').click();const downloaded=p.waitForEvent('download');await p.locator('#downloadSnapshotBtn').click();await(await downloaded).saveAs(`${evidence}/${name}.json`);await p.keyboard.press('Escape');return JSON.parse(await readFile(`${evidence}/${name}.json`,'utf8'));};
const keyboardClick=async locator=>{await locator.focus();await p.keyboard.press('Enter');await flush();};
const clean=s=>{const{uiVersion,generatedAt,...same}=s;return same;};
try {
await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.querySelector('#optionCompareBody tr')!==null);
const before=JSON.parse(await readFile(`${evidence}/snapshot-before.json`,'utf8')),after=await snapshot('snapshot-after');
assert.deepEqual(clean(after),clean(before));assert.equal(after.uiVersion,'4.3.1');assert.equal(JSON.stringify(after).includes('fuelTonnes'),false);
result.snapshot={equalExcept:['uiVersion','generatedAt'],noTonnesField:true};
result.baselines={before:{eu:before.comparison.active.euEts,uk:before.comparison.active.ukEts,fuel:before.comparison.active.fuelEu,owner:before.comparison.active.ownerEur,charterer:before.comparison.active.chartererEur},after:{eu:after.comparison.active.euEts,uk:after.comparison.active.ukEts,fuel:after.comparison.active.fuelEu,owner:after.comparison.active.ownerEur,charterer:after.comparison.active.chartererEur}};
await p.locator('[data-target="6"]').first().click();await flush();
const future=await snapshot('snapshot-six-percent');assert.equal(future.comparison.active.fuelEu.toFixed(2),'619346.72');result.baselines.fuel6={before:'619346.72',after:future.comparison.active.fuelEu.toFixed(2)};
await p.locator('#resetTwinBtn').click();await tab('tab-sandbox');await flush();
assert.equal(await p.locator('#planningForm input[type="number"]:visible').count(),5);assert.equal(await p.locator('#planningForm input[name]').count(),14);assert.equal(await p.locator('#planningForm input[type="checkbox"]').count(),0);assert.match(await p.locator('#advancedAssumptionsSummary').textContent(),/10/);result.checks.push('Five visible numeric inputs; all 14 original named inputs retained; advanced default count 10');
// Every original boundary attribute is retained.
const original=spawnSync('git',['show','light-v4.3.0-baseline-2026-10-18:index.html'],{encoding:'utf8'}).stdout;
const originalFields=[...original.matchAll(/<input type="number"[^>]+name="([^"]+)"[^>]+>/g)];
for(const [markup,name]of originalFields){for(const attr of ['min','max','step']){const value=markup.match(new RegExp(`${attr}="([^"]+)"`))[1];assert.equal(await p.locator(`[name="${name}"]`).getAttribute(attr),value);}}
result.checks.push('All original min/max/step attributes unchanged');
await p.locator('#input-fuelTonnes').fill('4000.5');assert.equal(await p.locator('[name="euEnergyMJ"]').inputValue(),'164020500');assert.match(await p.locator('#assumptionDraftStatus').textContent(),/未应用/);assert.match(await p.locator('#assumptionTags').textContent(),/4,000 等效吨/);
await keyboardClick(p.locator('#advancedAssumptionsSummary'));await p.locator('[name="euEnergyMJ"]').fill('1001');assert.ok(Math.abs(Number(await p.locator('#input-fuelTonnes').inputValue())-1001/41000)<1e-12);
await keyboardClick(p.locator('[data-restore="euEnergyMJ"]'));assert.equal(await p.locator('#input-fuelTonnes').inputValue(),'4000');await p.locator('#planningForm [type="submit"]').click();await flush();
await p.locator('[name="bunkerPrice"]').fill('10001');await p.locator('#planningForm [type="submit"]').click();assert.match(await p.locator('#error-bunkerPrice').textContent(),/0.*10000/);assert.equal(await p.locator('#input-bunkerPrice').getAttribute('aria-invalid'),'true');assert.equal(await p.locator('#kpiEuEtsVal').textContent(),'€88,000');
await p.locator('[name="bunkerPrice"]').fill('');await p.locator('#planningForm [type="submit"]').click();assert.ok(await p.locator('#error-bunkerPrice').textContent());
await keyboardClick(p.locator('[data-restore="bunkerPrice"]'));await p.locator('#input-fuelTonnes').fill('4000.000001');assert.match(await p.locator('#error-fuelTonnes').textContent(),/整数 MJ/);await keyboardClick(p.locator('[data-restore="fuelTonnes"]'));await p.locator('#planningForm [type="submit"]').click();await flush();assert.equal((await p.locator('#planningInputsPanel').textContent()).includes('NaN'),false);
result.checks.push('Bidirectional conversion incl. 1001 MJ; draft/applied tags; default restore; empty/range/fractional-MJ errors blocked without NaN');
await p.locator('#advancedAssumptions').evaluate(e=>e.open=false);await keyboardClick(p.locator('#assumptionTags [data-jump="poolAvailable"]'));assert.equal(await p.locator('#advancedAssumptions').evaluate(e=>e.open),true);assert.equal(await p.locator('#input-poolAvailable').evaluate(e=>e===document.activeElement),true);
await keyboardClick(p.locator('.pool-supply-shortcut [data-jump]'));assert.equal(await p.locator('#input-poolAvailable').evaluate(e=>e===document.activeElement),true);
for(const button of await p.locator('[data-help]').all()) {
 await button.focus();const id=await button.getAttribute('aria-controls');assert.equal(await p.locator('#'+id).isVisible(),true);assert.equal(await button.getAttribute('aria-describedby'),id);await p.keyboard.press('Escape');assert.equal(await p.locator('#'+id).isVisible(),false);
}
for(const button of await p.locator('#assumptionTags [data-jump]').all()) {await tab('tab-sandbox');const name=await button.getAttribute('data-jump');await keyboardClick(button);assert.equal(await p.locator(name==='eua'?'.sync-eua':`#input-${name}`).first().evaluate(e=>e===document.activeElement),true);}
await tab('tab-sandbox');await p.locator('#resetTwinBtn').click();await flush();await tab('tab-sandbox');
assert.match(await p.locator('#optionCompareBody tr').nth(1).textContent(),/运营输入未确认/);
const initialRow=await p.locator('#optionCompareBody tr').nth(1).locator('td').nth(1).textContent();
await keyboardClick(p.locator('#confirmAssumptionsBtn'));assert.equal(await p.locator('#optionCompareBody tr').nth(1).locator('td').nth(1).textContent(),initialRow);assert.match(await p.locator('#confirmationStatus').textContent(),/三项假设已确认/);
const confirmed=await snapshot('snapshot-confirmed');for(const key of ['operationsConfirmed','fuelConfirmed','poolConfirmed'])assert.equal(confirmed.settings[key],true);
await p.locator('#resetTwinBtn').click();await flush();assert.match(await p.locator('#confirmationStatus').textContent(),/未确认/);
await keyboardClick(p.locator('#loadDemoAssumptionsBtn'));assert.equal(await p.locator('#optionCompareBody tr').nth(1).locator('td').nth(1).textContent(),initialRow);assert.match(await p.locator('#confirmationStatus').textContent(),/三项假设已确认/);
await p.locator('#input-bunkerPrice').fill('600');await p.locator('#planningForm [type="submit"]').click();await flush();assert.match(await p.locator('#confirmationStatus').textContent(),/未确认/);await keyboardClick(p.locator('#loadDemoAssumptionsBtn'));assert.equal(await p.locator('#input-bunkerPrice').inputValue(),'550');
result.checks.push('Keyboard help (15), assumption tags, advanced disclosure and restore; one-action confirmation; demo defaults; reset clears all flags');
// Presets alter exactly the requested slider(s), preserving applied price/energy/supply and flags.
const prior=await snapshot('snapshot-before-presets');
for(const [id,expected]of [['fuel',[20,0,0]],['speed',[20,-1,0]],['pool',[20,-1,200]],['baseline',[0,0,0]]]) {
 await keyboardClick(p.locator(`[data-preset="${id}"]`));
 const actual=await p.evaluate(()=>['.sync-bio','.sync-jit','.sync-pool'].map(s=>Number(document.querySelector(s).value)));assert.deepEqual(actual,expected);
}
const following=await snapshot('snapshot-after-presets');assert.deepEqual(following.settings,prior.settings);assert.deepEqual(following.modelInputs,prior.modelInputs);
result.checks.push('All four exact demo presets keyboard-operated; non-baseline presets leave other sliders unchanged; prices/energy/supply/confirmation unchanged');
// Continuous slider input is a pass/fail interaction check, not a performance measurement.
await p.evaluate(()=>new Promise(resolve=>{let i=0;const e=document.querySelector('.sync-eua');function step(){e.value=50+(i%15)*5;e.dispatchEvent(new Event('input',{bubbles:true}));if(++i<30)requestAnimationFrame(step);else resolve();}requestAnimationFrame(step);}));await flush();assert.equal(await p.locator('#kpiEuEtsVal').textContent(),'€132,000');
await p.locator('#resetTwinBtn').click();await flush();
for(const lang of ['zh','en'])for(const width of [1440,768,375]) {
 await p.setViewportSize({width,height:1000});await p.locator(`[data-lang="${lang}"]`).click();await tab('tab-sandbox');await p.locator('#advancedAssumptions').evaluate(e=>e.open=false);await flush();await p.mouse.move(0,0);await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(350);
 assert.equal(await p.locator('#planningForm input[type="number"]:visible').count(),5);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const overflow=await p.locator('#planningInputsPanel input:visible,#planningInputsPanel button:visible,#planningInputsPanel summary:visible').evaluateAll(elements=>elements.filter(e=>{const r=e.getBoundingClientRect();return r.left<0||r.right>innerWidth+1}).map(e=>e.id||e.textContent));assert.deepEqual(overflow,[]);
 assert.equal(await p.locator('#optionCompareBody tr').count(),6);assert.match(await p.locator('#advancedAssumptionsSummary').textContent(),lang==='zh'?/高级假设/:/Advanced assumptions/);
 await p.screenshot({path:`${shots}/inputs-${lang}-${width}.png`,fullPage:true});result.screens.push({lang,width,path:`${shots}/inputs-${lang}-${width}.png`});
}
await keyboardClick(p.locator('#advancedAssumptionsSummary'));assert.equal(await p.locator('#planningForm input[type="number"]:visible').count(),15);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`${shots}/advanced-en-375.png`,fullPage:true});
result.checks.push('Bilingual 1440/768/375 layout; all 15 inputs visible when advanced is open; no page/control overflow; 30-frame continuous slider input');
// Historical Pro Max remains unchanged; replace its remote Leaflet with the vendored bytes for this smoke check.
const proContext=await browser.newContext({viewport:{width:1440,height:1000}});const leaflet=await readFile('vendor/leaflet/leaflet.js'),leafletCss=await readFile('vendor/leaflet/leaflet.css');
await proContext.route('**/*',r=>{const u=r.request().url();if(u.includes('unpkg.com/leaflet@1.9.4/dist/leaflet.js'))return r.fulfill({contentType:'application/javascript',body:leaflet});if(u.includes('unpkg.com/leaflet@1.9.4/dist/leaflet.css'))return r.fulfill({contentType:'text/css',body:leafletCss});return u.startsWith(base+'/')?r.continue():r.abort();});
const pro=await proContext.newPage(),proErrors=[];pro.on('pageerror',e=>proErrors.push(e.message));pro.on('console',m=>{if(m.type()==='error'&&!m.text().includes('net::ERR_FAILED'))proErrors.push(m.text());});
await pro.goto(base+'/index-pro-max.html',{waitUntil:'domcontentloaded'});await pro.waitForSelector('#vesselSelect option',{state:'attached'});assert.equal(await pro.locator('#kpiUkEtsVal').textContent(),'£13,200');assert.ok(await pro.locator('.leaflet-pane').count());assert.deepEqual(proErrors,[]);result.proMax={pass:true,errors:proErrors,note:'CDN Leaflet replaced by unchanged vendored 1.9.4 in test; external network errors excluded; CDN availability not assessed'};
assert.deepEqual(errors,[]);result.pageErrors=errors;
await writeFile(`${evidence}/browser-results.json`,JSON.stringify(result,null,2)+'\n');console.log('PASS: snapshots; five quick inputs; conversion; validation; keyboard; presets; confirmations; six bilingual layouts; Pro Max smoke.');
} catch(error) {
 await writeFile(`${evidence}/browser-failure.json`,JSON.stringify({error:error.stack,pageErrors:errors,completed:result},null,2)+'\n');throw error;
} finally {await browser.close();}
