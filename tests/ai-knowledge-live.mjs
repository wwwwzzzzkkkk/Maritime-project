// One genuine request from the published page; credentials never enter artifacts.
import{chromium}from'playwright';import assert from'node:assert/strict';import{writeFile}from'node:fs/promises';
const base='https://wwwwzzzzkkkk.github.io/Maritime-project/',service='https://mareg-ai.mareg-light-edition.workers.dev',out='docs/verification/v4.5.1';
const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const c=await b.newContext({viewport:{width:1440,height:1000}});await c.route('**/*',r=>r.request().url().startsWith(base)||r.request().url().startsWith(service+'/')?r.continue():r.abort());
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base,{waitUntil:'commit',timeout:60000});await p.waitForSelector('#optionCompareBody tr',{state:'attached',timeout:60000});await p.locator('[data-tab="tab-ai-esg"]').click();
 await p.locator('#connectAiBtn').click();await p.waitForFunction(()=>document.getElementById('aiAccessCodeField').hidden===false);
 assert.ok(process.env.MAREG_ACCESS_CODE?.length>=12);await p.locator('#aiAccessCode').fill(process.env.MAREG_ACCESS_CODE);await p.locator('#aiSendConsent').check();
 await p.locator('#aiQuestion').fill('用两句话解释默认400 tCB可用量和180欧元/tCB报价的依据，不要列其他内容。');
 const wait=p.waitForResponse(r=>r.url()===service+'/api/explain'&&r.request().method()==='POST',{timeout:60000});await p.locator('#askAiBtn').click();const response=await wait;assert.equal(response.status(),200);const data=await response.json();
 assert.equal(data.knowledgeVersion,'4.5.1');assert.equal(data.provider,'deepseek');assert.equal(data.model,'deepseek-flash');assert.equal(data.incomplete,false);assert.equal(JSON.stringify(data).includes(process.env.MAREG_ACCESS_CODE),false);
 await writeFile(out+'/live-response.json',JSON.stringify(data,null,2)+'\n');await p.locator('#aiAnswerSection').waitFor({state:'visible'});const text=await p.locator('#liveAiAnswer').innerText();assert.ok(text.length>0);assert.equal(/[ \t]+[，。；：！？、]/.test(text),false);assert.equal(/\*\*|<\/?p[ >]|\[(eu|uk|fuel|pool|charter|imo|ports)\]/.test(text),false);assert.ok(await p.locator('#liveAiAnswer p').count()>0);assert.equal(await p.locator('#kpiEuEtsVal').textContent(),'€88,000');
 await p.locator('#aiAccessCode').fill('');const collapse=p.locator('#mobileBudget button').filter({hasText:'收起'});if(await collapse.isVisible())await collapse.click();
 for(const width of[1440,375]){await p.setViewportSize({width,height:1000});await p.locator('#aiAnswerSection').scrollIntoViewIfNeeded();await p.mouse.move(0,0);await p.waitForTimeout(600);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:out+'/live-'+width+'.png',fullPage:true});}
 assert.deepEqual(errors,[]);await writeFile(out+'/live-result.json',JSON.stringify({base,service,httpStatus:response.status(),provider:data.provider,model:data.model,knowledgeVersion:data.knowledgeVersion,incomplete:data.incomplete,rawAnswer:data.answer,displayedAnswer:text,displayedCharacters:text.length,sources:data.sources,requestCount:1,localAiBackendUsed:false,rawFormattingHidden:true,pageErrors:errors,screens:['live-1440.png','live-375.png'],screenshotNote:'Existing floating budget collapsed manually for answer readability; product behavior unchanged.'},null,2)+'\n');
 console.log('PASS: published page → cloud → DeepSeek, knowledge4.5.1, readable paragraphs, no raw markup, unchanged €88,000, one genuine request.');
}finally{await b.close();}
