import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import * as engine from '../js/compliance-engine.mjs';
import {vessels,sources} from '../js/light-data.mjs';
const base='http://127.0.0.1:48184',out='docs/verification/v4.7.0';
const fixture=JSON.parse(await readFile('docs/verification/v4.6.0/demo-workspace.json','utf8'));fixture.desk.actions=[];
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const result={scope:'Chrome only; synthetic fixture; mock AI responses, no paid model calls',checks:[],screens:[]};
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),requests=[];
 await context.route('**/*',async route=>{
  const url=route.request().url();
  if(url.endsWith('/api/health'))return route.fulfill({json:{protocol:'mareg-explain-v1',configured:true,provider:'deepseek',model:'test-mock',knowledgeVersion:'4.7.0',requiresAccessCode:true}});
  if(url.endsWith('/api/explain')){
   const body=route.request().postDataJSON();requests.push(body);
   const comparison=body.context.policyComparison;
   const answer=comparison?(comparison.totals.deltaEur===null?'影响：没有明确数值条件，费用影响无法量化，不能当作零。\n\n建议：补充适用条件后再比较。\n\n待核：来源由用户填写，未联网核验。[userpolicy]':'影响：当前条件使船队欧元费用增加，英镑费用保持单列。\n\n建议：优先复核受影响船舶，再到方案比较核对选择。\n\n待核：这些是输入条件下的模型估算，尚未联网核验。[userpolicy]'):'当前单船预算仅含CO₂部分；欧元与英镑分列。[eu]';
   const source=comparison?{id:'userpolicy',title:'用户录入政策（未联网核验）：'+comparison.policy.title,url:comparison.policy.url,checkedAt:comparison.policy.checkedOn}:{id:'eu',title:'EU ETS',url:sources.find(s=>s.id==='eu').url,checkedAt:'2026-10-15'};
   return route.fulfill({json:{answer,provider:'deepseek',model:'test-mock',knowledgeVersion:'4.7.0',incomplete:false,sources:[source],reviewRequired:true}});
  }
  return url.startsWith(base+'/')?route.continue():route.abort();
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('#optionCompareBody tr',{state:'attached',timeout:60000});assert.deepEqual(errors,[]);
 const tab=async id=>{await page.locator('[data-tab="'+id+'"]').click();await page.mouse.move(0,0);};
 const restore=async data=>{await page.locator('#openAuditModalBtn').click();await page.locator('#restoreWorkspaceFile').setInputFiles({name:'synthetic.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.waitForFunction(()=>document.getElementById('restoreWorkspaceFile').value==='');await page.waitForFunction(()=>document.getElementById('workspaceStatus').textContent.includes('已恢复'));await page.keyboard.press('Escape');};
 await restore(fixture);const budgetBefore=await page.locator('#kpiEuEtsVal').textContent();
 await tab('tab-ai-esg');await page.locator('#connectAiBtn').click();await page.waitForFunction(()=>document.getElementById('aiConnectionBadge').textContent==='已连接');await page.locator('#aiAccessCode').fill('CLASSROOM-TEST-ONLY');await page.locator('#aiSendConsent').check();
 await tab('tab-scenarios');await page.locator('[data-policy-ai]').first().click();
 assert.equal(await page.locator('#aiPolicyContext').isVisible(),true);assert.equal(await page.locator('#aiSendConsent').isChecked(),false);assert.equal(await page.locator('#askAiBtn').isDisabled(),true);assert.equal(requests.length,0);
 assert.match(await page.locator('#aiPolicySummary').innerText(),/1,998,777.29/);
 const preview=JSON.parse(await page.locator('#aiPolicyPayload').textContent());assert.equal(preview.vessels.length,5);assert.equal(JSON.stringify(preview).includes('Demo Vessel'),false);assert.equal('author'in preview.policy,false);assert.equal('review'in preview.policy,false);
 await page.locator('#aiPolicyPreview > summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#aiPolicyPreview').evaluate(e=>e.open),true);await page.keyboard.press('Enter');
 await page.locator('#aiSendConsent').check();await page.locator('#askAiBtn').click();await page.waitForFunction(()=>!document.getElementById('aiAnswerSection').hidden);
 assert.equal(requests.length,1);assert.deepEqual(requests[0].context.policyComparison,preview);assert.equal('metrics'in requests[0].context,false);assert.equal(await page.locator('#liveAiSources a').getAttribute('href'),fixture.desk.policies[0].url);assert.equal((await page.locator('#liveAiAnswer').innerText()).includes('[userpolicy]'),false);assert.equal(await page.locator('#kpiEuEtsVal').textContent(),budgetBefore);
 result.checks.push('Existing policy record opens the existing assistant; no automatic send; fresh consent, keyboard preview, anonymous body, user-source citation and unchanged budget passed');console.log('PASS linked workflow');
 for(const language of['zh','en']){
  await page.locator('[data-lang="'+language+'"]').click();
  for(const width of[1440,768,375]){
   await page.setViewportSize({width,height:1000});await page.locator('#liveAiPanel').scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.waitForTimeout(350);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const path=out+'/policy-ai-'+language+'-'+width+'.png';await page.locator('#liveAiPanel').screenshot({path,style:'#mobileBudget {visibility:hidden}'});result.screens.push(path);
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.locator('[data-lang="zh"]').click();
 await tab('tab-cockpit');await page.locator('.sync-eua').first().evaluate(e=>{e.value='80';e.dispatchEvent(new Event('input',{bubbles:true}));});await page.waitForFunction(()=>document.getElementById('kpiEuEtsVal').textContent==='€88,000');
 assert.equal(await page.locator('#aiAnswerStale').textContent(),'');
 await page.locator('[data-fleet-update]').first().click();await tab('tab-ai-esg');assert.match(await page.locator('#aiAnswerStale').textContent(),/依据已改变/);
 result.checks.push('Editing the active single vessel alone does not invalidate a saved-fleet answer; explicit fleet update marks the previous answer stale');
 const evidenceOnly=structuredClone(fixture);evidenceOnly.desk.policies[0].assumptions={};evidenceOnly.desk.policies[0].review=null;
 await restore(evidenceOnly);await tab('tab-scenarios');await page.locator('[data-policy-ai]').first().click();assert.match(await page.locator('#aiPolicySummary').innerText(),/无法量化/);
 await page.locator('#aiSendConsent').check();await page.locator('#askAiBtn').click();await page.waitForFunction(()=>!document.getElementById('aiAnswerSection').hidden);assert.equal(requests.at(-1).context.policyComparison.totals.deltaEur,null);assert.match(await page.locator('#liveAiAnswer').innerText(),/不能当作零/);
 await tab('tab-scenarios');page.once('dialog',d=>d.accept());await page.locator('[data-policy-remove]').first().click();await tab('tab-ai-esg');assert.equal(await page.locator('#askAiBtn').isDisabled(),true);assert.match(await page.locator('#aiPolicySummary').innerText(),/已移除/);
 await page.locator('#aiClearPolicy').click();assert.equal(await page.locator('#aiPolicyContext').isVisible(),false);assert.equal(await page.locator('#aiSendConsent').isChecked(),false);assert.equal(await page.locator('#aiQuestion').inputValue(),'');
 await page.locator('#aiQuestion').fill('解释当前单船预算');await page.locator('#aiSendConsent').check();await page.locator('#askAiBtn').click();await page.waitForFunction(()=>!document.getElementById('aiAnswerSection').hidden);assert.ok(requests.at(-1).context.metrics);assert.equal('policyComparison'in requests.at(-1).context,false);
 result.checks.push('Evidence-only cost impact stays null; deleting a linked source blocks sending; returning to vessel Q&A clears consent/question and preserves the original request contract');
 await page.locator('#resetTwinBtn').click();assert.equal(await page.locator('#kpiEuEtsVal').textContent(),'€88,000');
 const old=await import('data:text/javascript;base64,'+Buffer.from(execFileSync('git',['show','light-v4.6.0-baseline-2026-10-22:js/compliance-engine.mjs'])).toString('base64'));
 const values=x=>{const m=x.computeScenario(vessels[0],x.defaultSettings());return{eu:m.euEts,uk:m.ukEts,fuel:m.fuelEu,fuel6:x.computeScenario(vessels[0],{...x.defaultSettings(),year:2030}).fuelEu,owner:m.ownerEur,charterer:m.chartererEur};};result.benchmarks={before:values(old),after:values(engine)};assert.deepEqual(result.benchmarks.before,result.benchmarks.after);
 await context.route('**/leaflet.js',r=>r.fulfill({path:'vendor/leaflet/leaflet.js',contentType:'text/javascript'}));await context.route('**/leaflet.css',r=>r.fulfill({path:'vendor/leaflet/leaflet.css',contentType:'text/css'}));const pro=await context.newPage(),proErrors=[];pro.on('pageerror',e=>proErrors.push(e.message));await pro.goto(base+'/index-pro-max.html',{waitUntil:'domcontentloaded'});await pro.waitForTimeout(500);assert.ok(await pro.locator('body').innerText());assert.deepEqual(proErrors,[]);assert.deepEqual(errors,[]);
 result.pageErrors=errors;result.proMax={loaded:true,pageErrors:proErrors,localLeafletSubstitution:true};result.requests=requests;console.log('PASS',JSON.stringify(result,null,2));
}catch(error){result.failure=error.stack;throw error;}finally{await writeFile(out+'/browser-results.json',JSON.stringify(result,null,2)+'\n');await browser.close();}
