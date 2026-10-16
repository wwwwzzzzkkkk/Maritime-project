import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const phase=process.argv[2];
const out=`docs/verification/v4.3.0/${phase}`,shots='docs/previews/v4.3.0';
await mkdir(out,{recursive:true});await mkdir(shots,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const ctx=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const origin='http://127.0.0.1:48181';await ctx.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
const p=await ctx.newPage();p.setDefaultTimeout(20000);p.setDefaultNavigationTimeout(60000);
await p.goto(origin,{waitUntil:'commit'});await p.waitForFunction(()=>document.querySelector('#mobileBudgetEu')?.textContent.length>0,{},{timeout:60000});
await p.waitForFunction(()=>document.querySelectorAll('#realMaritimeMap .leaflet-overlay-pane path').length>100);
const settle=async()=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const freeze=async()=>p.evaluate(()=>{document.getAnimations().forEach(a=>{if(a.effect.getTiming().iterations===Infinity){a.pause();a.currentTime=1000}else a.finish()});});
const results={phase,browser:await browser.version(),scope:'Readability only; external requests blocked; Chrome 1440x1000 DPR1. No performance comparison.'};
if(phase!=='consolidated'){
 await p.addScriptTag({path:'vendor/axe/axe.min.js'});
 results.axe=await p.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return{tool:'axe-core '+axe.version,officialScore:null,violations:r.violations,passes:r.passes.length,incomplete:r.incomplete}});
}
// Only consolidation changes are compared pixel-for-pixel at these fixed animation times.
results.computed={};
for(const width of [1440,768,375]){
 await p.setViewportSize({width,height:1000});await p.locator('#resetTwinBtn').click();await p.mouse.move(0,0);await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await settle();await freeze();
 results.computed[width]=await p.evaluate(()=>Object.fromEntries(['body','.topbar-inner','.brand-cluster','.vessel-select','.topbar-right','.nav-tabs','.nav-btn','.kpi-top','.kpi-label','.kpi-sub','.telemetry-table','.table-wrap','.modal-backdrop','.modal-card','.mobile-budget'].map(s=>{const e=document.querySelector(s),c=getComputedStyle(e);return[s,Object.fromEntries(['fontSize','color','height','width','padding','display','flex','flexWrap','gap','maxHeight','overflow','borderRadius','backdropFilter'].map(k=>[k,c[k]]))]})));
 await p.screenshot({path:`${shots}/${phase}-${width}.png`,fullPage:true});
}
await writeFile(`${out}/results.json`,JSON.stringify(results,null,2)+'\n');
await writeFile(`${out}/results.json`,JSON.stringify(results,null,2)+'\n');
if(phase!=='consolidated'){
 await p.setViewportSize({width:1440,height:1000});results.contrastSamples=[];
 const samples=[['.kpi-sub span:first-child','overview'],['.kpi-card .badge','overview'],['.control-hint span','overview'],['#cockpitLegTableBody','overview'],['.formula-code','audit'],['#tab-audit .customer-details > summary','audit'],['.footer-bar > span','audit']];
 for(let i=0;i<samples.length;i++){
  const[selector,tab]=samples[i];await p.locator(`[data-tab="tab-${tab==='audit'?'audit':'cockpit'}"]`).click();await settle();await freeze();const el=p.locator(selector).first();await el.scrollIntoViewIfNeeded();await p.mouse.move(0,0);await settle();await freeze();
  const details=await el.evaluate(e=>{const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n.textContent.trim()){const range=document.createRange();range.selectNodeContents(n);const r=range.getClientRects()[0],b=e.getBoundingClientRect(),s=getComputedStyle(n.parentElement);return{selector:e.id||e.className,foreground:s.color,fontSize:s.fontSize,text:n.textContent.trim(),viewport:{x:r.left+r.width/2,y:r.top+r.height/2},local:{x:r.left+r.width/2-b.left,y:r.top+r.height/2-b.top},box:{x:b.left,y:b.top,width:b.width,height:b.height}}}}});
  await el.screenshot({path:`${out}/sample-${i}-text.png`});const previous=await el.evaluate(e=>{const nodes=[e,...e.querySelectorAll('*')];const a=nodes.map(x=>[x,x.getAttribute('style')]);window.__ink=a;nodes.forEach(x=>{x.style.setProperty('color','transparent','important');x.style.setProperty('-webkit-text-fill-color','transparent','important');x.style.setProperty('text-shadow','none','important')});return true});
  await el.screenshot({path:`${out}/sample-${i}-background.png`});await p.evaluate(()=>window.__ink.forEach(([e,s])=>s===null?e.removeAttribute('style'):e.setAttribute('style',s)));
  results.contrastSamples.push({...details,sourceSelector:selector,file:`sample-${i}-background.png`});
  await writeFile(`${out}/results.json`,JSON.stringify(results,null,2)+'\n');
 }
}
await writeFile(`${out}/results.json`,JSON.stringify(results,null,2)+'\n');console.log(`Saved ${phase} measurements`);await browser.close();
