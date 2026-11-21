import {commitNotificationWrites,ADMIN_INBOX} from './notification-store.js';
import {createDemoStore} from './demo-auth.js';
import {moderatedRecords,moderationHiddenIds} from './moderation-store.js';
export const REPORT_CATEGORIES={fake:'إعلان وهمي',duplicate:'إعلان مكرر',misleading:'معلومات غير صحيحة',other:'أخرى'};
export const REPORTS_KEY='waseet-reports-v1';
export function reportableProperty(records,storage,id){const data=moderatedRecords(records,storage),property=data.properties.find(x=>x.id===id);return property?.status==='published'&&!moderationHiddenIds(records,storage).includes(id)&&data.users.some(x=>x.id===property.user_id&&x.is_active)&&data.areas.some(x=>x.id===property.area_id&&x.is_active)?property:null;}
function read(storage){
 try{const text=storage.getItem(REPORTS_KEY);if(text?.length>500000)throw Error();const raw=JSON.parse(text||'{"submissions":[],"decisions":{}}');if(!raw||!Array.isArray(raw.submissions)||!raw.decisions||typeof raw.decisions!=='object'||Array.isArray(raw.decisions))throw Error();
 const submissions=[];for(const row of raw.submissions){if(!/^R-\d+$/.test(row?.id)||!Number.isSafeInteger(row.property_id)||row.property_id<1||!Object.hasOwn(REPORT_CATEGORIES,row.category)||typeof row.description!=='string'||row.description.length>2000||typeof row.reporter!=='string'||row.reporter.length>100||typeof row.email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)||!Number.isFinite(Date.parse(row.date))||submissions.some(x=>x.id===row.id))throw Error();submissions.push({id:row.id,property_id:row.property_id,category:row.category,description:row.description,reporter:row.reporter,email:row.email,date:row.date});}
 const decisions={};for(const [id,value]of Object.entries(raw.decisions)){if(!/^R-\d+$/.test(id)||!['resolve','close'].includes(value?.decision)||typeof value.note!=='string'||value.note.length>1000)throw Error();decisions[id]={decision:value.decision,note:value.note};}
 return {submissions,decisions};
 }catch{throw Error('تعذّر قراءة البلاغات المحفوظة. لم يتم تغيير بيانات الجلسة.');}
}
const write=(storage,state,events=[])=>{try{commitNotificationWrites(storage,[[REPORTS_KEY,JSON.stringify(state)]],events);}catch{throw Error('تعذّر حفظ البلاغ أو القرار. تحقق من مساحة تخزين الجلسة.');}};
export function createReportsStore(storage,records,seeds=[]){
 const list=()=>{const state=read(storage);return [...state.submissions].reverse().concat(seeds).map(row=>{const decision=state.decisions[row.id];return {...row,status:decision?(decision.decision==='resolve'?'تم الحل':'مغلق'):row.status||'جديد',administrativeDecision:decision||null};});};
 return {
  list,
  submit(id,category,description=''){
   const account=createDemoStore(storage).current();if(!account)throw Error('سجّل الدخول بحساب تجريبي نشط لإرسال بلاغ.');const property=reportableProperty(records,storage,id);if(!property)throw Error('الإعلان لم يعد متاحًا للإبلاغ.');
   if(!Object.hasOwn(REPORT_CATEGORIES,category)||typeof description!=='string'||description.length>2000||(category==='other'&&!description.trim()))throw Error('اختر سبب البلاغ وأدخل توضيحًا عند اختيار أخرى.');
   const state=read(storage);if(state.submissions.length>=100)throw Error('وصلت إلى حد البلاغات التجريبية في هذا التبويب.');const key='R-'+Math.max(Date.now(),285,...state.submissions.map(x=>Number(x.id.slice(2))+1));
   state.submissions.push({id:key,property_id:id,category,description:description.trim(),reporter:account.name,email:account.email,date:new Date().toISOString()});write(storage,state,[{recipient:ADMIN_INBOX,type:'report_submitted',title:'بلاغ عقاري جديد',text:`تم استلام بلاغ عن «${property.title}» للمراجعة.`,target:{view:'report',id:key}}]);return key;
  },
  decide(id,decision,note='',expected){
   if(!['resolve','close'].includes(decision)||typeof note!=='string'||note.length>1000)throw Error('قرار البلاغ غير صالح.');const row=list().find(x=>x.id===id);if(!row)throw Error('البلاغ غير موجود.');if(!['جديد','قيد المراجعة'].includes(row.status)||row.status!==expected)throw Error('تمت مراجعة البلاغ أو تغيرت حالته. أعد تحميل الصفحة.');
   const state=read(storage);state.decisions[id]={decision,note:note.trim()};write(storage,state);
  },
 };
}
