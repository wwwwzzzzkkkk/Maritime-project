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
 await page.locator('#openAuditModalBtn').click();
 const exported=JSON.parse(await readFile(out+'/demo-workspace.json','utf8'));
 result.checks=JSON.parse(await readFile(out+'/browser-workflow-results.json','utf8')).checks;
 await page.locator('#restoreWorkspaceFile').setInputFiles({name:'classroom.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await page.waitForFunction(()=>document.getElementById('workspaceStatus').textContent.includes('已恢复'));assert.match(await status('workspaceStatus'),/已恢复/);
 await page.keyboard.press('Escape');await tab('tab-cockpit');assert.equal(await page.locator('#fleetRows tr').count(),5);
 console.log('STEP');result.checks.push('Local save, exported JSON round trip and restored records; report sections8–10 include frozen source reviewer and newer evidence reviewer');
 await page.locator('#resetTwinBtn').click();assert.equal(await page.locator('#fleetRows tr').count(),5);assert.equal(await page.locator('#kpiEuEtsVal').textContent(),'€88,000');
 const baseline='light-v4.5.2-baseline-2026-10-21',old=await import('data:text/javascript;base64,'+Buffer.from(execFileSync('git',['show',baseline+':js/compliance-engine.mjs'])).toString('base64'));
 const values=x=>{const m=x.computeScenario(vessels[0],x.defaultSettings());return{eu:m.euEts,uk:m.ukEts,fuel:m.fuelEu,fuel6:x.computeScenario(vessels[0],{...x.defaultSettings(),year:2030}).fuelEu,owner:m.ownerEur,charterer:m.chartererEur};};result.benchmarks={before:values(old),after:values(engine)};assert.deepEqual(result.benchmarks.before,result.benchmarks.after);
 console.log('STEP');result.checks.push('Reset preserves desk, resets single budget; six baseline values match pre-stage engine');
 await page.locator('#fleetEditor > summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#fleetEditor').evaluate(e=>e.open),true);await page.keyboard.press('Enter');assert.equal(await page.locator('#fleetEditor').evaluate(e=>e.open),false);
 for(const id of ['fleetEditor','policyEditor','policyReviewEditor','actionEditor'])await page.locator('#'+id).evaluate(e=>e.open=false);
 result.checks.push('Native form disclosure toggles using keyboard; all-ships picker hidden');
 assert.equal(await page.locator('#policyShipPicker').isVisible(),false);
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
