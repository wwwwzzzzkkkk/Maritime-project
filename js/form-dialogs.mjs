// Keep native dialogs in the top layer while Web Animations API fades them.
// This avoids relying on discrete `display`/`overlay` transitions, which are
// not consistently supported across browsers.
const states = new WeakMap();
const motionQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration = (name, fallback) => {
 const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
 return Number.isFinite(value) ? value : fallback;
};

function currentTranslate(card){
 const value=getComputedStyle(card).translate;
 return !value||value==='none'?'0px 0px':value;
}
function currentScale(card){
 const value=getComputedStyle(card).scale;
 return !value||value==='none'?'1':value;
}
function cancelAnimations(state){
 for(const animation of state.animations)animation.cancel();
 state.animations=[];
}
function animate(dialog,state,{opacityFrom,opacityTo,translateFrom,translateTo,scaleFrom,scaleTo,durationMs}){
 const card=dialog.querySelector('.modal-card');
 const timing={duration:durationMs,easing:'cubic-bezier(0.23, 1, 0.32, 1)',fill:'both'};
 const animations=[
  dialog.animate([{opacity:opacityFrom},{opacity:opacityTo}],timing),
  card.animate([{translate:translateFrom,scale:scaleFrom},{translate:translateTo,scale:scaleTo}],timing)
 ];
 state.animations=animations;
 return Promise.all(animations.map(animation=>animation.finished));
}

export function openFormDialog(id){
 const dialog=document.getElementById(id),state=states.get(dialog);
 if(dialog.open&&!state.closing)return;
 const wasOpen=dialog.open;
 const opacityFrom=wasOpen?Number.parseFloat(getComputedStyle(dialog).opacity):0;
 const card=dialog.querySelector('.modal-card');
 const translateFrom=wasOpen?currentTranslate(card):'0px 8px';
 const scaleFrom=wasOpen?currentScale(card):'0.985';
 state.generation++;
 cancelAnimations(state);
 state.closing=false;
 dialog.inert=false;
 if(!wasOpen)dialog.showModal();
 if(motionQuery()||typeof dialog.animate!=='function')return;
 const generation=state.generation;
 animate(dialog,state,{opacityFrom:Number.isFinite(opacityFrom)?opacityFrom:0,opacityTo:1,translateFrom,translateTo:'0px 0px',scaleFrom,scaleTo:'1',durationMs:duration('--form-enter',220)})
  .then(()=>{if(state.generation===generation&&dialog.open)cancelAnimations(state);})
  .catch(()=>{});
}

export function closeFormDialog(id){
 const dialog=document.getElementById(id),state=states.get(dialog);
 if(!dialog.open)return state.closed;
 if(state.closing)return state.closed;
 const card=dialog.querySelector('.modal-card');
 const opacityFrom=Number.parseFloat(getComputedStyle(dialog).opacity);
 const translateFrom=currentTranslate(card),scaleFrom=currentScale(card);
 const generation=++state.generation;
 state.closing=true;
 dialog.inert=true;
 cancelAnimations(state);
 if(motionQuery()||typeof dialog.animate!=='function'){
  dialog.close();state.closing=false;state.closed=Promise.resolve(true);return state.closed;
 }
 const animations=animate(dialog,state,{opacityFrom:Number.isFinite(opacityFrom)?opacityFrom:1,opacityTo:0,translateFrom,translateTo:'0px 6px',scaleFrom,scaleTo:'0.99',durationMs:duration('--form-exit',150)});
 state.closed=animations.then(()=>{
  if(state.generation!==generation||!dialog.open)return false;
  dialog.close();state.closing=false;cancelAnimations(state);return true;
 }).catch(()=>false);
 return state.closed;
}

export function initFormDialogs(){
 document.addEventListener('click',event=>{
  const opener=event.target.closest('[data-open-form]'),closer=event.target.closest('[data-close-form]');
  if(opener)openFormDialog(opener.dataset.openForm);
  if(closer)closeFormDialog(closer.dataset.closeForm);
 });
 for(const dialog of document.querySelectorAll('.form-dialog')){
  states.set(dialog,{generation:0,animations:[],closing:false,closed:Promise.resolve(true)});dialog.inert=true;
  dialog.addEventListener('click',event=>{if(event.target===dialog)closeFormDialog(dialog.id);});
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeFormDialog(dialog.id);});
  dialog.addEventListener('close',()=>{
   // During a dialog-to-dialog handoff, keep focus in the newly opened form.
   if(!document.querySelector('.form-dialog[open]'))document.querySelector('[data-open-form="'+dialog.id+'"]')?.focus({preventScroll:true});
  });
 }
}
