// Native modal focus containment and Escape behavior; fields remain mounted so drafts survive closing.
export function openFormDialog(id){document.getElementById(id).showModal();}
export function closeFormDialog(id){document.getElementById(id).close();}
export function initFormDialogs(){
 document.addEventListener('click',event=>{
  const opener=event.target.closest('[data-open-form]'),closer=event.target.closest('[data-close-form]');
  if(opener)openFormDialog(opener.dataset.openForm);
  if(closer)closeFormDialog(closer.dataset.closeForm);
 });
 for(const dialog of document.querySelectorAll('.form-dialog')){
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>document.querySelector('[data-open-form="'+dialog.id+'"]').focus());
 }
}
