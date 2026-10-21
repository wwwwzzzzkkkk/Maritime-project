import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import * as engine from '../js/compliance-engine.mjs';
import {vessels} from '../js/light-data.mjs';
const base='http://127.0.0.1:48184',out='docs/verification/v4.6.0';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const result={scope:'Chrome only; external fonts/tiles blocked; no live AI request',checks:[],screens:[]};
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message);});page.on('requestfailed',r=>{if(r.url().startsWith(base))console.log('LOCAL REQUEST FAILED',r.url(),r.failure());});
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('#optionCompareBody tr',{state:'attached',timeout:60000});
 assert.deepEqual(errors,[]);assert.equal(await page.locator('#kpiEuEtsVal').textContent(),'€88,000');
 const tab=async name=>{await page.locator('[data-tab="'+name+'"]').click();await page.mouse.move(0,0);};
 const fill=async(form,values)=>{for(const[k,v]of Object.entries(values)){const field=page.locator('#'+form+' [name="'+k+'"]');await field.evaluate(e=>{for(let d=e.closest('details');d;d=d.parentElement.closest('details'))d.open=true;});await field.fill(String(v));}};
 const submit=async(form)=>{assert.ok(await page.locator('#'+form).evaluate(e=>e.checkValidity()),form+' invalid');await page.locator('#'+form+' button[type="submit"]').first().click();};
 const status=async id=>await page.locator('#'+id).textContent();
 const open=async id=>await page.locator('#'+id).evaluate(e=>{e.open=true;});
 await tab('tab-sandbox');await page.locator('#loadDemoAssumptionsBtn').click();await tab('tab-cockpit');await open('fleetEditor');
 for(let i=1;i<=5;i++){
  await fill('fleetForm',{name:'Demo Vessel '+i,reference:'DEMO-'+i,gt:10000,serviceSpeedKn:13.5});await submit('fleetForm');
  assert.equal(await page.locator('#fleetRows tr').count(),i,await status('fleetStatus'));
 }
 console.log('STEP');result.checks.push('Five uniquely referenced, independently stored vessels; confirmed default inputs');
 assert.match(await page.locator('#fleetTotals').innerText(),/1,625,956.33/);
 assert.match(await page.locator('#fleetTotals').innerText(),/66,000/);
 await page.locator('#fleetRows [data-fleet-edit]').first().click();await fill('fleetForm',{name:'Demo Vessel One'});await submit('fleetForm');
 await page.locator('#fleetRows [data-fleet-load]').first().click();
 await page.locator('.sync-eua').first().evaluate(e=>{e.value='100';e.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.waitForTimeout(80);assert.match(await page.locator('#fleetRows tr').nth(1).innerText(),/325,191.27/);
 await page.locator('#fleetRows [data-fleet-update]').first().click();assert.match(await page.locator('#fleetRows tr').first().innerText(),/347,191.27/);
 console.log('STEP');result.checks.push('Profile edits and explicit snapshot update affect only selected vessel; active editing does not silently change fleet');
 await tab('tab-scenarios');await open('policyEditor');
 await fill('policyEvidenceForm',{title:'6% planning condition',url:'https://eur-lex.europa.eu/eli/reg/2023/1805/oj/eng',publishedOn:'2023-09-22',checkedOn:'2026-10-21',author:'Alice',before:'2% demonstration target',after:'6% condition at fixed activity',uncertainty:'Scope and certification unverified',euaPrice:100});
 await page.locator('#policyEvidenceForm [name="targetCut"]').selectOption('6');await submit('policyEvidenceForm');
 assert.equal(await page.locator('#policyRecords article').count(),1,await status('policyEvidenceStatus'));
 assert.match(await page.locator('#policyImpact').innerText(),/729,346.72/);assert.equal(await page.locator('#kpiEuEtsVal').textContent(),'€110,000');
 await open('policyReviewEditor');await fill('policyReviewForm',{reviewer:'Bob',note:'Checked source and assumptions, not external approval'});await submit('policyReviewForm');
 assert.match(await page.locator('#policyRecords').innerText(),/Bob/);
 console.log('STEP');result.checks.push('Manual evidence and explicit 6%/EUA100 comparison; no automatic mutation of active single analysis; different-person review');
 await tab('tab-sandbox');
 await page.locator('#actionGenerateForm [name="fleetId"]').selectOption({label:'Demo Vessel One · DEMO-1'});
 await page.locator('#actionGenerateForm [name="kind"]').selectOption('pooling');await submit('actionGenerateForm');
 assert.equal(await page.locator('#actionRecords article').count(),1,await status('actionStatus'));
 await page.locator('#actionPlan').click();assert.match(await status('actionStatus'),/复核|review/);
 await fill('actionEditForm',{owner:'Alice',dueOn:'2026-11-01',reviewer:'Bob',reviewNote:'Reviewed both currencies and conditions; hypothetical'});
 await page.locator('#actionEditForm button[value="review"]').click();assert.match(await status('actionStatus'),/已保存|saved/);
 await page.locator('#actionPlan').click();assert.match(await page.locator('#actionRecords').innerText(),/计划中/);
 await page.locator('#actionImplement').click();assert.match(await status('actionStatus'),/凭证|Evidence/);
 await page.locator('#actionEditForm [name="evidence"]').evaluate(e=>{e.closest('details').open=true;});
 await fill('actionEditForm',{evidence:'CLASSROOM-DEMO-ONLY-001',outcome:'Hypothetical classroom exercise; no purchase executed'});
 await page.locator('#actionEditForm button[value="review"]').click();await page.locator('#actionImplement').click();assert.match(await page.locator('#actionRecords').innerText(),/已实施/);
 console.log('STEP');result.checks.push('Action generation; unreviewed planning blocked; planning succeeds after review; implementation requires evidence/outcome and remains self-reported');
 await tab('tab-scenarios');await open('policyReviewEditor');await fill('policyReviewForm',{reviewer:'Carol',note:'New source revision for classroom exercise'});await submit('policyReviewForm');
 await tab('tab-sandbox');assert.match(await page.locator('#actionRecords').innerText(),/来源已更新/);
 console.log('STEP');result.checks.push('Source revision marks old actions stale without overwriting original inputs/evidence');
 await tab('tab-cockpit');await page.locator('#deskSaveProject').click();await page.locator('#analysisName').fill('Classroom demo fleet');await page.locator('#saveAnalysisBtn').click();assert.match(await status('workspaceStatus'),/已保存/);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mareg.saved-analyses.v1')).at(-1));assert.equal(saved.desk.fleet.length,5);assert.equal(saved.desk.actions[0].status,'implemented');assert.equal(saved.desk.actions[0].policySnapshots[0].revision,2);assert.equal(saved.desk.policies[0].revision,3);
 const download=async(id)=>{const promise=page.waitForEvent('download');await page.locator('#'+id).click();const file=await promise;return readFile(await file.path(),'utf8');};
 const exported=JSON.parse(await download('downloadWorkspaceBtn'));assert.deepEqual(exported.desk,saved.desk);
 const report=await download('downloadReportBtn');assert.ok(report.includes('8. 船队'));assert.ok(report.includes('9. 政策'));assert.ok(report.includes('10. 行动'));assert.ok(report.includes('CLASSROOM-DEMO-ONLY-001'));assert.ok(report.includes('Carol'));assert.ok(report.includes('Bob'));
 await page.locator('#restoreWorkspaceFile').setInputFiles({name:'classroom.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await page.waitForFunction(()=>document.getElementById('workspaceStatus').textContent.includes('已恢复'));assert.match(await status('workspaceStatus'),/已恢复/);
 await page.keyboard.press('Escape');await tab('tab-cockpit');assert.equal(await page.locator('#fleetRows tr').count(),5);
 console.log('STEP');result.checks.push('Local save, exported JSON round trip and restored records; report sections8–10 include frozen source reviewer and newer evidence reviewer');
 await page.locator('#resetTwinBtn').click();assert.equal(await page.locator('#fleetRows tr').count(),5);assert.equal(await page.locator('#kpiEuEtsVal').textContent(),'€88,000');
 const baseline='light-v4.5.2-baseline-2026-10-21',old=await import('data:text/javascript;base64,'+Buffer.from(execFileSync('git',['show',baseline+':js/compliance-engine.mjs'])).toString('base64'));
 const values=x=>{const m=x.computeScenario(vessels[0],x.defaultSettings());return{eu:m.euEts,uk:m.ukEts,fuel:m.fuelEu,fuel6:x.computeScenario(vessels[0],{...x.defaultSettings(),year:2030}).fuelEu,owner:m.ownerEur,charterer:m.chartererEur};};result.benchmarks={before:values(old),after:values(engine)};assert.deepEqual(result.benchmarks.before,result.benchmarks.after);
 console.log('STEP');result.checks.push('Reset preserves desk, resets single budget; six baseline values match pre-stage engine');
 for(const language of['zh','en']){
  await page.locator('[data-lang="'+language+'"]').click();
  for(const width of[1440,768,375]){
   await page.setViewportSize({width,height:1000});
   for(const[view,panel]of[['tab-cockpit','fleetDesk'],['tab-scenarios','policyEvidenceDesk'],['tab-sandbox','actionDesk']]){
    await tab(view);await page.locator('#'+panel).scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.waitForTimeout(400);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),language+width+panel+' overflow');
    const path=out+'/'+panel+'-'+language+'-'+width+'.png';await page.locator('#'+panel).screenshot({path});result.screens.push(path);
   }
  }
 }
 assert.deepEqual(errors,[]);result.pageErrors=errors;
 const pro=await context.newPage(),proErrors=[];pro.on('pageerror',e=>proErrors.push(e.message));
 await context.route('**/leaflet.js',r=>r.fulfill({path:'vendor/leaflet/leaflet.js',contentType:'text/javascript'}));await context.route('**/leaflet.css',r=>r.fulfill({path:'vendor/leaflet/leaflet.css',contentType:'text/css'}));
 await pro.goto(base+'/index-pro-max.html',{waitUntil:'domcontentloaded'});await pro.waitForTimeout(500);assert.ok(await pro.locator('body').innerText());assert.deepEqual(proErrors,[]);result.proMax={loaded:true,pageErrors:proErrors,leafletReplacedWithLocalVendor:true};
 console.log('STEP');result.checks.push('Chinese/English ×1440/768/375 new panels contained; unchanged Pro Max loads with no page errors');
 console.log('PASS',JSON.stringify(result,null,2));
} catch(error){result.failure=error.stack;throw error;} finally {await writeFile(out+'/browser-results.json',JSON.stringify(result,null,2)+'\n');await browser.close();}
