import {demoStore} from './demo-auth.js';
import {authURL} from './favorites.js';
import {createReportsStore,REPORT_CATEGORIES} from './reports-store.js';
import {openDialog} from '../core/shell-init.js';
export function initPropertyReporting(records,property){
 const form=document.querySelector('#property-report-form'),dialog=document.querySelector('#property-report-dialog'),opener=document.querySelector('#report'),store=createReportsStore(sessionStorage,records);
 const error=document.querySelector('#property-report-error'),status=document.querySelector('#property-report-status'),submit=document.querySelector('#submit-property-report');
 form.elements.category.append(new Option('اختر سبب البلاغ',''));for(const [value,label]of Object.entries(REPORT_CATEGORIES))form.elements.category.append(new Option(label,value));
 function open(){
  if(!demoStore().current()){const url=new URL(location.href);url.searchParams.set('report','1');location.href=authURL(undefined,url.href);return;}
  form.reset();error.textContent='';status.textContent='';submit.hidden=false;submit.disabled=false;document.querySelector('#report-fields').hidden=false;for(const input of form.elements)input.removeAttribute('aria-invalid');openDialog(dialog,opener);
 }
 opener.addEventListener('click',open);
 form.addEventListener('submit',event=>{
  event.preventDefault();error.textContent='';const category=form.elements.category,description=form.elements.description;category.setAttribute('aria-invalid',String(!category.value));description.setAttribute('aria-invalid',String(category.value==='other'&&!description.value.trim()));
  if(!category.value||category.value==='other'&&!description.value.trim()){error.textContent='اختر سبب البلاغ وأدخل توضيحًا عند اختيار أخرى.';(!category.value?category:description).focus();return;}
  submit.disabled=true;try{const id=store.submit(property.id,category.value,description.value);status.textContent=`تم تسجيل البلاغ ${id} في جلسة العرض. لم يتم إرسال إشعارات.`;document.querySelector('#report-fields').hidden=true;submit.hidden=true;}catch(failure){error.textContent=failure.message;submit.disabled=false;}
 });
 const url=new URL(location.href);if(url.searchParams.get('report')==='1'){url.searchParams.delete('report');history.replaceState({},'',url);open();}
}
