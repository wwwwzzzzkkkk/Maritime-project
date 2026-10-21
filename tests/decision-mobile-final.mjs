import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const base='http://127.0.0.1:48184',out='docs/verification/v4.6.0',results={scope:'Final375px label/value grouping fix only; synthetic fixture; floating overlay hidden only during panel captures',screens:[]};
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const context=await browser.newContext({viewport:{width:375,height:1000}});await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('#optionCompareBody tr',{state:'attached',timeout:60000});
 await page.locator('#openAuditModalBtn').click();await page.locator('#restoreWorkspaceFile').setInputFiles({name:'synthetic.json',mimeType:'application/json',buffer:await readFile(out+'/demo-workspace.json')});await page.waitForFunction(()=>document.getElementById('workspaceStatus').textContent.includes('已恢复'));await page.keyboard.press('Escape');
 for(const language of['zh','en']){
  await page.locator('[data-lang="'+language+'"]').click();
  for(const [tab,panel]of[['tab-cockpit','fleetDesk'],['tab-scenarios','policyEvidenceDesk'],['tab-sandbox','actionDesk']]){
   await page.locator('[data-tab="'+tab+'"]').click();await page.mouse.move(0,0);await page.locator('#'+panel).scrollIntoViewIfNeeded();await page.waitForTimeout(250);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.ok(await page.locator('#'+panel+' td[data-label]').evaluateAll(cells=>cells.every(c=>c.children.length===1&&c.firstElementChild.classList.contains('desk-cell-value'))));
   const path=out+'/'+panel+'-'+language+'-375-final.png';await page.locator('#'+panel).screenshot({path,style:'#mobileBudget { visibility: hidden; }'});results.screens.push(path);
  }
 }
 assert.deepEqual(errors,[]);results.pageErrors=errors;results.containmentAndValueGrouping=true;console.log('PASS',JSON.stringify(results,null,2));
}finally{await writeFile(out+'/mobile-final-results.json',JSON.stringify(results,null,2)+'\n');await browser.close();}
