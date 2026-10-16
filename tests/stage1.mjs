import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {defaultSettings,computeScenario} from '../js/compliance-engine.mjs';
import {planOptions} from '../js/option-planner.mjs?v=4.2.1';
import {vessels} from '../js/light-data.mjs';

const baseURL=process.env.BASE_URL||'http://127.0.0.1:48179';
const evidence='docs/verification/v4.2.1',shots='docs/previews/v4.2.1';
const before=JSON.parse(await readFile(`${evidence}/baseline-before.json`,'utf8'));
const base=computeScenario(vessels[0],defaultSettings()),future=computeScenario(vessels[0],{...defaultSettings(),year:2030});
const after={eu:base.euEts,uk:base.ukEts,fuel:base.fuelEu,fuel6:future.fuelEu,owner:base.ownerEur,charterer:base.chartererEur,engineSha256:createHash('sha256').update(await readFile('js/compliance-engine.mjs')).digest('hex')};
assert.deepEqual(after,before);await writeFile(`${evidence}/baseline-after.json`,JSON.stringify(after,null,2)+'\n');
assert.deepEqual(planOptions(vessels[0],defaultSettings()),JSON.parse(await readFile(`${evidence}/planner-before.json`,'utf8')));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext();const blocked=[],errors=[];const result={widths:[],blockedExternalRequests:blocked,simulation:'Playwright request interception; not real offline; no uncached first-load guarantee'};
await context.route('**/*',route=>{
 const url=route.request().url();if(url.startsWith(`${baseURL}/`))return route.continue();
 blocked.push(url);return route.abort();
});
await context.addInitScript(()=>{
 let leaflet;
 Object.defineProperty(window,'L',{configurable:true,get(){return leaflet},set(value){leaflet=value;const factory=value.map;value.map=(...args)=>{const map=factory(...args);window.__stageMap=map;return map;};}});
});
function track(page){page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(30000);page.on('pageerror',error=>errors.push(error.message));}
const clickTab=(p,id)=>p.locator(`[data-tab="${id}"]`).click();
const input=async(p,selector,value)=>p.locator(selector).evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},String(value));
async function mapState(page){return page.evaluate(()=>{
 const map=window.__stageMap,lines=[],countries=[];map.eachLayer(layer=>{if(layer instanceof L.Polyline && !(layer instanceof L.Polygon))lines.push(layer);if(layer instanceof L.GeoJSON)layer.eachLayer(l=>countries.push({code:l.feature.properties.ADM0_A3,color:l.options.fillColor,iso:l.feature.properties.ISO_A2}));});
 return {lineCount:lines.length,allRouteCoordinatesVisible:lines.every(line=>line.getLatLngs().every(point=>map.getBounds().contains(point))),countries,height:map.getSize().y};
});}
for(const width of [1440,768,375]){
 const page=await context.newPage();track(page);await page.setViewportSize({width,height:1000});await page.goto(baseURL,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#mobileBudgetEu').textContent.length>0);
 await page.waitForFunction(()=>{let n=0;window.__stageMap.eachLayer(l=>{if(l instanceof L.GeoJSON)n=l.getLayers().length});return n===242;});
 const state=await mapState(page);assert.equal(state.lineCount,3);assert.equal(state.allRouteCoordinatesVisible,true);assert.ok(state.height>=320&&state.height<=480);
 const eu='AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE'.split(' ');
 assert.equal(eu.every(code=>state.countries.some(c=>c.code===code&&c.color==='#0284c7')),true);
 assert.equal(state.countries.find(c=>c.code==='FRA').iso,'-99');assert.equal(state.countries.find(c=>c.code==='GBR').color,'#0f172a');
 assert.equal(await page.locator('#kpiEuEtsVal').textContent(),'€88,000');assert.equal(await page.locator('#kpiUkEtsVal').textContent(),'£13,200');assert.equal(await page.locator('#kpiFuelEuVal').textContent(),'€237,191.27');
 assert.equal(await page.locator('#cockpitLegTableBody tr').count(),5);
 await page.mouse.move(0,0);await page.locator('#realMaritimeMap').screenshot({path:`${shots}/after-${width}-map.png`});
 await clickTab(page,'tab-sandbox');await page.waitForTimeout(900);await page.locator('#mobileBudgetToggle').evaluate(el=>{if(el.getAttribute('aria-expanded')==='true')el.click()});
 assert.equal(await page.locator('#optionCompareTable th:visible').count(),5);
 assert.equal(await page.locator('#optionCompareBody tr').first().locator('td:visible').count(),5);
 const tableSize=await page.locator('#optionCompareTable').locator('..').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));if(width===1440)assert.ok(tableSize.scroll<=tableSize.width+1);
 const order=await page.evaluate(()=>({sliders:document.querySelector('#tab-sandbox .split-grid-2 > .panel-card').getBoundingClientRect().top,split:document.querySelector('#ownerSplitLabel').getBoundingClientRect().top,recommendation:document.querySelector('#planningRecommendation').getBoundingClientRect().top,table:document.querySelector('.option-comparison-panel').getBoundingClientRect().top,rightContainsAction:document.querySelector('#tab-sandbox .split-grid-2 > .panel-card:last-child').contains(document.querySelector('#applyRecommendedOption'))}));
 assert.equal(order.rightContainsAction,true);if(width<1000)assert.ok(order.sliders<order.split&&order.split<order.recommendation&&order.recommendation<order.table);
 await page.locator('.option-comparison-panel').screenshot({path:`${shots}/after-${width}-table.png`});
 await page.locator('#showAllOptionColumns').check();assert.equal(await page.locator('#optionCompareTable th:visible').count(),11);
 await page.mouse.move(0,0);await page.waitForTimeout(450);
 await page.locator('#optionCompareTable').locator('..').evaluate(el=>el.scrollLeft=200);await page.waitForTimeout(60);
 const sticky=await page.locator('#optionCompareBody tr').first().locator('td').first().evaluate(el=>({left:el.getBoundingClientRect().left,parent:el.closest('.table-wrap').getBoundingClientRect().left,position:getComputedStyle(el).position}));assert.equal(sticky.position,'sticky');assert.ok(Math.abs(sticky.left-sticky.parent)<3,JSON.stringify(sticky));
 await page.locator('#showAllOptionColumns').uncheck();
 await clickTab(page,'tab-audit');await page.waitForTimeout(900);assert.equal(await page.locator('#a3AuditTableBody').isVisible(),true);
 for(const id of ['ringArcFinancial','ringArcPhysical']){assert.equal(await page.locator('#'+id).getAttribute('stroke-dasharray'),'0 251');assert.equal(await page.locator('#'+id).isVisible(),false);assert.match(await page.locator('#'+id).locator('..').getAttribute('aria-label'),/±30%/);}
 await page.locator('.dual-gauge-grid').screenshot({path:`${shots}/after-${width}-rings.png`});
 if(width===1440){
  // Exercise the scale through actual UI inputs, including below-minimum and capped magnitudes.
  await clickTab(page,'tab-sandbox');await page.locator('#planningInputsPanel summary').click();await page.locator('[name="poolPrice"]').fill('639');await page.locator('#planningForm button[type="submit"]').click();await input(page,'#tab-sandbox .sync-pool',25);
  await clickTab(page,'tab-audit');await page.waitForTimeout(900);const small=Number((await page.locator('#ringArcFinancial').getAttribute('stroke-dasharray')).split(' ')[0]);assert.ok(Math.abs(small-251*.03)<1e-8);
  await clickTab(page,'tab-sandbox');await page.locator('[name="poolPrice"]').fill('10000');await page.locator('#planningForm button[type="submit"]').click();await clickTab(page,'tab-audit');await page.waitForTimeout(900);
  assert.equal(await page.locator('#ringArcFinancial').getAttribute('stroke-dasharray'),'251 251');assert.equal(await page.locator('#ringArcFinancial').evaluate(el=>getComputedStyle(el).stroke),'rgb(217, 119, 6)');assert.equal(await page.locator('#ringArcPhysical').isVisible(),false);
  await clickTab(page,'tab-sandbox');await page.locator('[name="poolPrice"]').fill('0');await page.locator('#planningForm button[type="submit"]').click();await input(page,'#tab-sandbox .sync-pool',375);await clickTab(page,'tab-audit');await page.waitForTimeout(900);
  assert.equal(await page.locator('#ringArcFinancial').getAttribute('stroke-dasharray'),'251 251');assert.equal(await page.locator('#ringArcFinancial').evaluate(el=>getComputedStyle(el).stroke),'rgb(2, 132, 199)');
  await page.locator('[data-lang="en"]').click();assert.match(await page.locator('#ringArcFinancial').locator('..').getAttribute('aria-label'),/Full ring = ±30%/);assert.match(await page.locator('[data-leg-filter="E1"]').textContent(),/Extra-EU/);await page.locator('[data-lang="zh"]').click();assert.match(await page.locator('[data-leg-filter="E1"]').textContent(),/欧盟外航段/);
  await page.locator('#resetTwinBtn').click();await input(page,'.sync-eua',100);const amount=await page.locator('#kpiEuEtsVal').textContent();const url=page.url();
  const links=page.locator('a[href^="http://"],a[href^="https://"]');const count=await links.count();
  for(let i=0;i<count;i++){const link=links.nth(i);assert.equal(await link.getAttribute('target'),'_blank');assert.match(await link.getAttribute('rel'),/noopener/);assert.match(await link.getAttribute('rel'),/noreferrer/);const opened=page.waitForEvent('popup');await link.evaluate(el=>el.click());const popup=await opened;await popup.close();assert.equal(page.url(),url);assert.equal(await page.locator('#kpiEuEtsVal').textContent(),amount);}
  result.externalLinkClicks=count;
  await page.locator('#resetTwinBtn').click();await clickTab(page,'tab-cockpit');await page.locator('[data-target="6"]').click();assert.equal(await page.locator('#kpiFuelEuVal').textContent(),'€619,346.72');assert.match(await page.locator('#kpiFuelEuSub').textContent(),/85\.6904/);assert.doesNotMatch(await page.locator('#kpiFuelEuSub').textContent(),/85\.690399/);
  await page.locator('#resetTwinBtn').click();await page.waitForTimeout(1000);assert.equal((await mapState(page)).allRouteCoordinatesVisible,true);
  const countries=await page.evaluate(()=>{const map=window.__stageMap;let yes=false;map.eachLayer(l=>{if(l instanceof L.GeoJSON)yes=l.getLayers().length===242});return yes;});assert.equal(countries,true);
  result.rings={zeroHidden:true,minimumNonzeroArc:small,upColor:'warn',downColor:'accent',cappedAtFull:true,replayUsesSameScale:true};
 }
 result.widths.push({width,tableCoreColumns:5,tableSize,allRouteCoordinatesVisible:state.allRouteCoordinatesVisible,countryFeatures:state.countries.length,eu27Styled:true,offlineAmountsAndLedger:true,narrowOrderChecked:width<1000});await page.close();console.log(`PASS ${width}px: local map/route/countries, five/all columns, sticky column, zero rings and screenshots`);
}
// Pro Max compatibility only. Keep its source files untouched; provide its pinned Leaflet CDN bytes locally.
const pro=await browser.newContext({viewport:{width:1440,height:1000}});const vendorJs=await readFile('vendor/leaflet/leaflet.js'),vendorCss=await readFile('vendor/leaflet/leaflet.css');
await pro.route('**/*',r=>{const u=r.request().url();if(u.includes('unpkg.com/leaflet@1.9.4/dist/leaflet.js'))return r.fulfill({contentType:'application/javascript',body:vendorJs});if(u.includes('unpkg.com/leaflet@1.9.4/dist/leaflet.css'))return r.fulfill({contentType:'text/css',body:vendorCss});return u.startsWith(`${baseURL}/`)?r.continue():r.abort();});
const p=await pro.newPage();track(p);await p.goto(`${baseURL}/index-pro-max.html`,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.querySelector('#vesselSelect option')!==null);assert.equal(await p.locator('#kpiUkEtsVal').textContent(),'£13,200');
await p.evaluate(()=>{window.MAREG_DATA.twinState.ukEtsPrice=70;document.querySelector('.sync-eua').dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await p.locator('#kpiUkEtsVal').textContent(),'£15,400');assert.equal(await p.locator('.leaflet-pane').count()>0,true);
result.proMax={loaded:true,ukVariableStillUsed:true,leaflet:'CDN requests fulfilled with unchanged vendored 1.9.4 bytes; CDN availability not tested'};await pro.close();
assert.ok(blocked.some(u=>u.includes('fonts.googleapis.com')));assert.ok(blocked.some(u=>u.includes('arcgisonline.com')));assert.deepEqual(errors,[]);result.pageErrors=errors;result.engineAndPlannerUnchanged=true;
await writeFile(`${evidence}/browser-results.json`,JSON.stringify(result,null,2)+'\n');await browser.close();console.log('PASS stage 1: baselines + frozen engine/planner, intercepted external network, ring scale/colors/replay, external-link state safety, Pro Max compatibility.');
