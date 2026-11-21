import {DEMO_ACCOUNTS} from '../../data/mock-demo.js';
import {advertiserVerified} from './verification-state.js';
import {adminDemo} from '../../data/admin-demo.js';
import {publisherItems} from './moderation-store.js';
import {createAgencyTeam} from './agency-team.js';
import {ACCOUNT_STATUS_KEY,readAccountStatuses,accountActive} from './account-status.js';
export const ACCOUNT_TYPES={owner:'مالك عقار',broker:'سمسار عقاري مستقل',agency:'مكتب عقاري',agent:'موظف مكتب',seeker:'باحث عن عقار',admin:'مشرف'};
const emailOK=email=>typeof email==='string'&&email.length<=120&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
function saved(storage,key,limit=100000){try{const text=storage.getItem(key);if(text?.length>limit)return {};const value=JSON.parse(text||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
export function accountDirectory(storage,records){
  const statuses=readAccountStatuses(storage,true),users=new Map(),items=publisherItems(storage,records);
  function add(email,role,name,extra={}){if(!emailOK(email)||!Object.hasOwn(ACCOUNT_TYPES,role))return;email=email.toLowerCase();const previous=users.get(email);
    const source=adminDemo.users.find(x=>x.email===email);
    users.set(email,{id:email,email,role_id:role,full_name:typeof name==='string'&&name.trim()?name.trim().slice(0,100):email,phone:source?.phone||null,created_at:null,is_active:true,is_verified:source?.verified==='موثق',...previous,...extra});
  }
  for(const account of DEMO_ACCOUNTS){const user=records.users.find(x=>x.email===account.email);if(user)add(account.email,account.role,user.full_name,{source_id:user.id,phone:user.phone||null,created_at:user.created_at||null,is_active:user.is_active,is_verified:user.is_verified});}
  // Only the source's seeker has no existing publisher/team identity to map.
  for(const user of adminDemo.users.filter(x=>x.type==='باحث عن عقار'))add(user.email,'seeker',user.name,{phone:user.phone,is_active:user.status==='نشط',is_verified:user.verified==='موثق'});
  const accounts=saved(storage,'waseet-demo-v1').accounts;
  for(const a of (Array.isArray(accounts)?accounts:[]).slice(0,30))if(Object.hasOwn(ACCOUNT_TYPES,a?.role)&&typeof a.name==='string'&&a.name.trim().length>=2)add(a.email,a.role,a.name,{role_id:a.role,full_name:a.name.trim().slice(0,100)});
  for(const item of items)if(!users.has(item.account.id))add(item.account.id,item.role,item.account.id);
  for(const email of Object.keys(saved(storage,'waseet-agency-team-v1')))if(!users.has(email))add(email,'agency',email);
  const agencies=[...users.values()].filter(x=>x.role_id==='agency').map(user=>{
    const properties=items.filter(x=>x.role==='agency'&&x.account.id===user.id);
    const team=createAgencyTeam(storage,{id:user.id,role:'agency'},()=>properties.map(x=>x.property.id)).list();
    for(const member of team.members){const existing=users.get(member.email);if(!existing||existing.role_id==='agent')add(member.email,'agent',member.name,{role_id:'agent',full_name:member.name,phone:member.phone,is_active:member.active});}
    return {id:user.id,properties,team};
  });
  for(const user of users.values()){
    user.is_active=statuses[user.id]??user.is_active;
    user.is_verified=advertiserVerified(storage,user.id,user.is_verified);
    user.memberships=agencies.filter(a=>a.team.members.some(m=>m.email===user.id)).map(a=>({agency_id:a.id,member:a.team.members.find(m=>m.email===user.id)}));
    user.properties=user.role_id==='agent'?agencies.flatMap(a=>{const m=a.team.members.find(x=>x.email===user.id);return m?a.properties.filter(x=>a.team.assignments[x.property.id]===m.id):[];}):items.filter(x=>x.account.id===user.id&&x.role===user.role_id);
    user.agency_blocked=user.memberships.some(m=>!(statuses[m.agency_id]??users.get(m.agency_id)?.is_active??true));
  }
  return {users:[...users.values()],agencies:agencies.map(a=>({...users.get(a.id),team:a.team,properties:a.properties}))};
}
export function createAccountManagement(storage,records){return {
  directory:()=>accountDirectory(storage,records),
  setActive(id,active,expected){
    if(!emailOK(id)||typeof active!=='boolean'||typeof expected!=='boolean')throw Error('حالة حساب غير صالحة.');
    const user=accountDirectory(storage,records).users.find(x=>x.id===id);if(!user)throw Error('الحساب غير موجود.');
    if(user.is_active!==expected)throw Error('تغيّرت حالة الحساب. أعد تحميل الصفحة قبل التأكيد.');
    const states=readAccountStatuses(storage,true);states[id]=active;
    try{storage.setItem(ACCOUNT_STATUS_KEY,JSON.stringify(states));}catch{throw Error('تعذّر حفظ حالة الحساب. لم يتم تغيير بيانات الملكية أو الإسناد.');}
    return active;
  },
};}
