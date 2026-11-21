import {commitSession} from './moderation-state.js';
// Session UI journal only; this is not a proposed notification/database schema.
export const NOTIFICATION_KEY='waseet-notifications-v1',ADMIN_INBOX='@admin';
const types=['listing_submitted','edit_submitted','verification_requested','report_submitted','listing_approved','listing_rejected','edit_approved','edit_rejected','verification_approved','verification_rejected'];
const roles=['owner','broker','agency','agent','seeker'];
const emailOK=value=>typeof value==='string'&&value.length<=120&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const recipientOK=value=>value===ADMIN_INBOX||emailOK(value);
function cleanTarget(value,recipient){
 if(!value||typeof value!=='object')throw Error();
 if(recipient===ADMIN_INBOX){
  if(['listing','edit'].includes(value.view)&&['owner','broker','agency'].includes(value.role)&&emailOK(value.email)&&Number.isSafeInteger(value.id)&&value.id>0)return {view:value.view,role:value.role,email:value.email,id:value.id};
  if(value.view==='verify'&&emailOK(value.email))return {view:'verify',email:value.email};
  if(value.view==='report'&&/^R-\d+$/.test(value.id))return {view:'report',id:value.id};
 }else if(['properties','home'].includes(value.view)&&roles.includes(value.role)&&(value.view==='home'||Number.isSafeInteger(value.id)&&value.id>0))return {view:value.view,role:value.role,...(value.view==='properties'?{id:value.id}:{})};
 throw Error();
}
function cleanEvent(value){
 if(!value||!recipientOK(value.recipient)||!types.includes(value.type)||typeof value.title!=='string'||!value.title.trim()||value.title.length>150||typeof value.text!=='string'||value.text.length>1500)throw Error();
 return {recipient:value.recipient,type:value.type,title:value.title,text:value.text,target:cleanTarget(value.target,value.recipient)};
}
function read(storage){
 try{const text=storage.getItem(NOTIFICATION_KEY);if(text?.length>1500000)throw Error();const raw=JSON.parse(text||'{"next":1,"events":[],"seen":[]}');if(!Number.isSafeInteger(raw.next)||raw.next<1||!Array.isArray(raw.events)||raw.events.length>500||!Array.isArray(raw.seen)||raw.seen.length>3000)throw Error();
 const ids=new Set(),events=raw.events.map(row=>{if(!Number.isSafeInteger(row?.id)||row.id<1||row.id>=raw.next||ids.has(row.id)||!Number.isFinite(Date.parse(row.at))||typeof row.read!=='boolean'||row.email!=='simulated')throw Error();ids.add(row.id);return {...cleanEvent(row),id:row.id,at:row.at,read:row.read,email:'simulated'};});
 if(raw.seen.some(key=>typeof key!=='string'||key.length>300))throw Error();return {next:raw.next,events,seen:[...new Set(raw.seen)]};
 }catch{throw Error('تعذّر قراءة الإشعارات المحفوظة. لم يتم مسح بيانات الجلسة.');}
}
export function commitNotificationWrites(storage,updates,events=[],time=Date.now()){
 const state=read(storage);let changed=false;
 for(const input of events){const event=cleanEvent(input);if(input.once&&state.seen.includes(input.once))continue;if(state.next>=Number.MAX_SAFE_INTEGER)throw Error('وصل سجل العرض إلى حده.');if(input.once){if(typeof input.once!=='string'||input.once.length>300)throw Error('مرجع الإشعار غير صالح.');state.seen.push(input.once);}state.events.push({...event,id:state.next++,at:new Date(time).toISOString(),read:false,email:'simulated'});changed=true;}
 state.events=state.events.slice(-500);state.seen=state.seen.slice(-3000);
 let text=JSON.stringify(state);while(text.length>1450000&&state.events.length>1){state.events.splice(0,Math.min(20,state.events.length-1));text=JSON.stringify(state);}
 commitSession(storage,[...updates,...(changed?[[NOTIFICATION_KEY,text]]:[])]);
}
export function createNotificationStore(storage,recipient){
 if(!recipientOK(recipient))throw Error('صندوق الإشعارات غير صالح.');
 return {
  list:()=>read(storage).events.filter(x=>x.recipient===recipient).sort((a,b)=>b.id-a.id),
  unread(){return this.list().filter(x=>!x.read).length;},
  mark(id,value=true){if(!Number.isSafeInteger(id)||typeof value!=='boolean')throw Error('حالة الإشعار غير صالحة.');const state=read(storage),row=state.events.find(x=>x.id===id&&x.recipient===recipient);if(!row)throw Error('الإشعار غير موجود في حسابك.');row.read=value;commitSession(storage,[[NOTIFICATION_KEY,JSON.stringify(state)]]);},
  markAll(){const state=read(storage);state.events.forEach(row=>{if(row.recipient===recipient)row.read=true;});commitSession(storage,[[NOTIFICATION_KEY,JSON.stringify(state)]]);},
 };
}
export function requestNotification(role,email,id,kind,title){return {recipient:ADMIN_INBOX,type:kind==='listing'?'listing_submitted':'edit_submitted',title:kind==='listing'?'إعلان جديد للمراجعة':'طلب تعديل جديد',text:`${kind==='listing'?'تم استلام إعلان':'تم استلام تعديلات على'} «${title}». لم تتم الموافقة بعد.`,target:{view:kind,role,email,id}};}
