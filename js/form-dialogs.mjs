// Native dialog lifecycle and focus behavior; CSS owns the interruptible visual transitions.
const states=new WeakMap();
export function openFormDialog(id){
 const dialog=document.getElementById(id),state=states.get(dialog);
 state.generation++;dialog.inert=false;dialog.showModal();
}
export function closeFormDialog(id){
 const dialog=document.getElementById(id),state=states.get(dialog);
 if(!dialog.open)return state.closed;
 const generation=++state.generation;
 dialog.inert=true;dialog.close();
 // Await only this dialog's opacity transition, never unrelated/infinite child effects.
 // Reopening or changing reduced-motion can cancel a transition; this is a normal interruption.
 const transitions=dialog.getAnimations().filter(a=>a instanceof CSSTransition&&a.transitionProperty==='opacity');
 state.closed=Promise.allSettled(transitions.map(a=>a.finished)).then(()=>state.generation===generation&&!dialog.open);
 return state.closed;
}
export function initFormDialogs(){
 document.addEventListener('click',event=>{
  const opener=event.target.closest('[data-open-form]'),closer=event.target.closest('[data-close-form]');
  if(opener)openFormDialog(opener.dataset.openForm);
  if(closer)closeFormDialog(closer.dataset.closeForm);
 });
 for(const dialog of document.querySelectorAll('.form-dialog')){
  states.set(dialog,{generation:0,closed:Promise.resolve(true)});dialog.inert=true;
  dialog.addEventListener('click',event=>{if(event.target===dialog)closeFormDialog(dialog.id);});
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeFormDialog(dialog.id);});
  dialog.addEventListener('close',()=>document.querySelector('[data-open-form="'+dialog.id+'"]').focus({preventScroll:true}));
 }
}
