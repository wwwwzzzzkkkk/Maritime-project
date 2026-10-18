// Focused Chrome checks; private credentials are read from the process environment only.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const live=process.argv.includes('--live'),base=live?'https://wwwwzzzzkkkk.github.io/Maritime-project/':'http://127.0.0.1:48184/';
const service='https://mareg-ai.mareg-light-edition.workers.dev',out='docs/verification/v4.5.0';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const result={mode:live?'public-page-to-cloud':'local-ui-with-cloud-access-check',base,service,localAiServerStopped:true};
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.route('**/*',r=>r.request().url().startsWith(base)||r.request().url().startsWith(service+'/')?r.continue():r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'commit',timeout:60000});await page.waitForSelector('#optionCompareBody tr',{state:'attached',timeout:60000});
 assert.equal(await page.locator('#kpiEuEtsVal').textContent(),'€88,000');
 await page.locator('[data-tab="tab-ai-esg"]').click();
 assert.equal(await page.locator('#aiServiceUrl').inputValue(),service);
 assert.equal(await page.locator('#askAiBtn').isDisabled(),true);
 await page.locator('#connectAiBtn').click();await page.waitForFunction(()=>document.getElementById('aiServiceStatus').textContent.includes('deepseek-flash'),{timeout:20000});
 assert.equal(await page.locator('#aiAccessCodeField').isVisible(),true);result.health=await page.locator('#aiServiceStatus').textContent();
 await page.locator('#aiSendConsent').check();assert.equal(await page.locator('#askAiBtn').isDisabled(),true);
 await page.locator('#aiQuestion').fill('用两句话说明当前预算中 EUR 与 GBP 分开列示，并提醒这些是未核验的示例估算。请引用已有来源。');
 if(live){
   assert.ok(process.env.MAREG_ACCESS_CODE?.length>=12);await page.locator('#aiAccessCode').fill(process.env.MAREG_ACCESS_CODE);
   await page.locator('#aiSendConsent').uncheck();assert.equal(await page.locator('#askAiBtn').isDisabled(),true);await page.locator('#aiSendConsent').check();
   const response=page.waitForResponse(r=>r.url()===service+'/api/explain'&&r.request().method()==='POST',{timeout:60000});await page.locator('#askAiBtn').click();const r=await response;assert.equal(r.status(),200);const data=await r.json();
   await page.waitForFunction(()=>document.getElementById('liveAiAnswer').textContent.length>0,{timeout:10000});
   assert.equal(data.provider,'deepseek');assert.equal(data.model,'deepseek-flash');assert.ok(data.answer.length>0);assert.equal(data.reviewRequired,true);assert.equal(JSON.stringify(data).includes(process.env.MAREG_ACCESS_CODE),false);
   result.model={status:r.status(),provider:data.provider,model:data.model,answer:data.answer,sources:data.sources,incomplete:data.incomplete};
 } else {
   await page.locator('#aiAccessCode').fill('deliberately-wrong-code');
   const response=page.waitForResponse(r=>r.url()===service+'/api/explain'&&r.request().method()==='POST',{timeout:20000});await page.locator('#askAiBtn').click();const r=await response;assert.equal(r.status(),401);assert.equal((await r.json()).kind,'access');
   await page.waitForFunction(()=>document.getElementById('aiServiceStatus').textContent.includes('课堂访问码错误'));assert.equal(await page.locator('#liveAiAnswer').textContent(),'');result.wrongCodeStatus=r.status();
 }
 result.gating={requiresCode:true,requiresConsent:true};result.screens=[];
 await page.locator('#aiAccessCode').fill('');
 for(const [language,width] of [['zh',1440],['en',375]]){
   await page.setViewportSize({width,height:1000});await page.locator(`[data-lang="${language}"]`).click();await page.locator('#liveAiPanel').scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.waitForTimeout(500);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const path=`${out}/${live?'cloud-live':'access-ui'}-${language}-${width}.png`;await page.screenshot({path,fullPage:true});result.screens.push(path);
 }
 assert.equal(await page.locator('#kpiEuEtsVal').textContent(),'€88,000');assert.deepEqual(errors,[]);result.errors=errors;
 if(!live){const pro=await context.newPage();await context.route('**/leaflet.js',r=>r.fulfill({path:'vendor/leaflet/leaflet.js',contentType:'text/javascript'}));await context.route('**/leaflet.css',r=>r.fulfill({path:'vendor/leaflet/leaflet.css',contentType:'text/css'}));const proErrors=[];pro.on('pageerror',e=>proErrors.push(e.message));await pro.goto(base+'index-pro-max.html',{waitUntil:'commit'});await pro.waitForTimeout(1500);assert.ok(await pro.locator('body').innerText());assert.deepEqual(proErrors,[]);result.proMax={loaded:true,pageErrors:proErrors,externalLeafletReplacedWithLocal:true};}
 await writeFile(`${out}/${live?'cloud-live':'access-ui'}.json`,JSON.stringify(result,null,2)+'\n');console.log('PASS:',result.mode,'code/consent gating; unchanged EU benchmark; Chrome zh1440/en375 layout.',live?'Real DeepSeek cloud response.':'Wrong code returns 401; Pro Max smoke passed.');
} finally {await browser.close();}
