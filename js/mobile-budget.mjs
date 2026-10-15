// Floating presentation only; values are supplied by the existing calculation/render pipeline.
export function createMobileBudget() {
  const windowEl=document.getElementById('mobileBudget');
  const content=document.getElementById('mobileBudgetContent');
  const handle=document.getElementById('mobileBudgetHandle');
  const toggle=document.getElementById('mobileBudgetToggle');
  const reset=document.getElementById('mobileBudgetReset');
  const summary=document.querySelector('.kpi-strip');
  const header=document.querySelector('.topbar');
  const viewport=window.visualViewport;
  const position={x:0,y:0,custom:false};
  let language='zh';
  let collapsed=false;
  let drag=null;
  let queued=false;

  function place(x,y) {
    const rect=windowEl.getBoundingClientRect();
    position.x=Math.min(Math.max(x,viewport.offsetLeft+12),viewport.offsetLeft+viewport.width-rect.width-12);
    position.y=Math.min(Math.max(y,viewport.offsetTop+12),viewport.offsetTop+viewport.height-rect.height-12);
    windowEl.style.transform=`translate3d(${position.x}px,${position.y}px,0)`;
  }

  function reposition() {
    const rect=windowEl.getBoundingClientRect();
    place(position.custom?position.x:viewport.offsetLeft+viewport.width-rect.width-12,
      position.custom?position.y:viewport.offsetTop+viewport.height-rect.height-12);
  }

  function refresh() {
    const rect=summary.getBoundingClientRect();
    const originalVisible=summary.getClientRects().length>0
      && rect.bottom>Math.max(viewport.offsetTop,header.getBoundingClientRect().bottom)
      && rect.top<viewport.offsetTop+viewport.height;
    const show=!originalVisible;
    const wasHidden=windowEl.hidden;
    windowEl.hidden=!show;
    if(show&&wasHidden)reposition();
  }

  function schedule() {
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;refresh();});
  }

  function resize() {
    schedule();
    if(!windowEl.hidden)reposition();
  }

  function labels() {
    const zh=language==='zh';
    document.getElementById('mobileBudgetTitle').textContent=zh?'实时预算':'Budget';
    document.getElementById('mobileBudgetNote').textContent=zh?'模型估算 · ETS 仅含 CO₂':'Model estimates · ETS covers CO₂ only';
    document.getElementById('mobileBudgetOwnerLabel').textContent=zh?'船东（欧元）':'Owner (EUR)';
    document.getElementById('mobileBudgetFuelLabel').textContent=zh?'FuelEU 估算':'FuelEU model';
    document.getElementById('mobileBudgetInstructions').textContent=zh?'拖动标题移动浮窗；也可用方向键移动。':'Drag the title to move the window, or use the arrow keys.';
    handle.setAttribute('aria-label',zh?'移动预算浮窗':'Move budget window');
    reset.textContent=zh?'归位':'Reset';
    reset.setAttribute('aria-label',zh?'恢复预算浮窗默认位置':'Restore the budget window position');
    toggle.textContent=zh?(collapsed?'展开':'收起'):(collapsed?'Expand':'Collapse');
    toggle.setAttribute('aria-label',zh?(collapsed?'展开预算':'收起预算'):(collapsed?'Expand budget':'Collapse budget'));
    toggle.setAttribute('aria-expanded',String(!collapsed));
  }

  toggle.addEventListener('click',()=>{
    collapsed=!collapsed;
    content.hidden=collapsed;
    labels();reposition();
  });
  reset.addEventListener('click',()=>{position.custom=false;reposition();});

  handle.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0)return;
    drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:position.x,y:position.y};
    handle.setPointerCapture(event.pointerId);
    windowEl.classList.add('is-dragging');
  });
  handle.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    position.custom=true;
    place(drag.x+event.clientX-drag.startX,drag.y+event.clientY-drag.startY);
  });
  function endDrag(event) {
    if(!drag||event.pointerId!==drag.id)return;
    drag=null;
    windowEl.classList.remove('is-dragging');
  }
  handle.addEventListener('pointerup',endDrag);
  handle.addEventListener('pointercancel',endDrag);
  handle.addEventListener('lostpointercapture',()=>{drag=null;windowEl.classList.remove('is-dragging');});
  handle.addEventListener('keydown',event=>{
    const moves={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]};
    if(!Object.hasOwn(moves,event.key))return;
    event.preventDefault();position.custom=true;
    place(position.x+moves[event.key][0],position.y+moves[event.key][1]);
  });

  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',resize);
  viewport.addEventListener('resize',resize);
  viewport.addEventListener('scroll',schedule,{passive:true});

  return {
    refresh,
    update(metrics,lang) {
      language=lang;labels();
      const euro=(value,decimals=0)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'EUR',minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(value);
      document.getElementById('mobileBudgetEu').textContent=euro(metrics.euEtsBillEur);
      document.getElementById('mobileBudgetFuel').textContent=euro(metrics.fueleuPenaltyEur,2);
      document.getElementById('mobileBudgetUk').textContent=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(metrics.ukEtsBillGbp);
      document.getElementById('mobileBudgetOwner').textContent=euro(metrics.ownerEurExposure);
      refresh();
    }
  };
}
