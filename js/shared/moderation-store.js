import {commitNotificationWrites} from './notification-store.js';
import {createAgencyTeam} from './agency-team.js';
import {advertiserVerified} from './verification-state.js';
import {accountActive} from './account-status.js';
import {createOwnerStore,cleanProperty} from './owner-store.js';
import {createBrokerStore} from './broker-store.js';
import {createAgencyStore} from './agency-store.js';
import {REVIEW_KEY,reviewKey,readReviews,imageOK} from './moderation-state.js';
const factories={owner:createOwnerStore,broker:createBrokerStore,agency:createAgencyStore};
export function publisherItems(storage,records){
  const result=[];
  for(const [role,factory]of Object.entries(factories)){
    let raw={};try{const text=storage.getItem(`waseet-${role}-v1`);if(text?.length<=4000000)raw=JSON.parse(text)||{};}catch{}
    const ids=new Set([`elmalky-${role}@gmail.com`,...Object.keys(raw).filter(email=>email.length<=120&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))]);
    for(const email of ids){const account={id:email,email,role};for(const item of factory(storage,account).list(records))result.push({...item,role,account,key:reviewKey(role,email,item.property.id)});}
  }return result;
}
export const proposed=item=>item.pending||{property:item.property,images:item.images};
export const snapshot=(item,kind)=>JSON.stringify([kind,item.key,item.property,item.images,proposed(item)]);
export function createModerationStore(storage,records,now=()=>Date.now()){
  function queue(kind){return publisherItems(storage,records).filter(item=>kind==='listing'?item.property.status==='pending':item.property.status==='published'&&item.pending).sort((a,b)=>Date.parse(b.property.created_at)-Date.parse(a.property.created_at));}
  return {
    queue,
    decide(key,kind,decision,reason='',expected){
      if(!['listing','edit'].includes(kind)||!['approve','reject'].includes(decision))throw Error('قرار مراجعة غير صالح.');
      const item=queue(kind).find(x=>x.key===key);if(!item)throw Error('تمت مراجعة هذا الطلب أو لم يعد متاحًا.');
      if(typeof expected!=='string'||snapshot(item,kind)!==expected)throw Error('تغيّر الطلب أثناء المراجعة. أعد تحميل الصفحة وقارن النسخة الجديدة.');
      if(decision==='reject'&&(typeof reason!=='string'||!reason.trim()||reason.trim().length>1000))throw Error('سبب الرفض مطلوب، بحد أقصى 1000 حرف.');
      const data=proposed(item),property=cleanProperty(data.property),images=data.images;
      if(decision==='approve'&&(!images.length||images.length>6||!images.every(imageOK)))throw Error('لا يمكن الموافقة دون صور صالحة.');
      const reviews=readReviews(storage,cleanProperty),review=reviews[key]||{};
      if(decision==='approve'){
        const conflict=publisherItems(storage,records).find(x=>x.property.id===item.property.id&&x.key!==key);
        if(conflict)throw Error('يوجد تعارض في رقم العقار التجريبي. أعد إرسال الإعلان برقم جديد.');
        review.accepted={property,images:[...images],expiresAt:kind==='listing'?now()+30*86400000:item.term||now()+30*86400000};delete review.rejection;
      }else review.rejection={kind,reason:reason.trim()};
      reviews[key]=review;
      const publisherKey=`waseet-${item.role}-v1`,raw=JSON.parse(storage.getItem(publisherKey)||'{}');
      if(!raw[item.account.id])throw Error('تعذّر العثور على طلب المعلن. أعد تحميل الصفحة.');
      // Consume the exact proposal. Future edits become fresh requests, including identical resubmissions.
      delete raw[item.account.id].edits?.[item.property.id];
      const recipients=[{email:item.account.id,role:item.role}];
      if(item.role==='agency'){
        const owned=publisherItems(storage,records).filter(x=>x.role==='agency'&&x.account.id===item.account.id).map(x=>x.property.id);
        const team=createAgencyTeam(storage,item.account,()=>owned).list(),member=team.members.find(x=>x.id===team.assignments[item.property.id]);
        if(member)recipients.push({email:member.email,role:'agent'});
      }
      const events=recipients.map(recipient=>({recipient:recipient.email,type:kind+'_'+(decision==='approve'?'approved':'rejected'),title:(kind==='listing'?'مراجعة الإعلان':'مراجعة التعديلات')+' — '+(decision==='approve'?'تمت الموافقة':'تم الرفض'),text:`${decision==='approve'?'تمت الموافقة على':'تم رفض'} ${kind==='listing'?'الإعلان':'تعديلات الإعلان'} «${property.title}».${decision==='reject'?' السبب: '+reason.trim():''}`,target:{view:'properties',role:recipient.role,id:item.property.id}}));
      commitNotificationWrites(storage,[[publisherKey,JSON.stringify(raw)],[REVIEW_KEY,JSON.stringify(reviews)]],events,now());
      return decision;
    },
  };
}

// Public projection uses only existing ERD fields; review metadata never becomes property data.
export function moderatedRecords(records,storage){
  const result={...records,properties:records.properties.map(x=>({...x})),users:records.users.map(x=>({...x})),property_images:records.property_images.map(x=>({...x}))};
  let accounts=[];try{accounts=JSON.parse(storage.getItem('waseet-demo-v1')||'{}').accounts||[];}catch{}
  for(const item of publisherItems(storage,records)){
    const p={...item.property};const index=result.properties.findIndex(x=>x.id===p.id);
    if(index>=0)result.properties[index]=p;else result.properties.push(p);
    if(!result.users.some(x=>x.id===p.user_id)){
      const account=Array.isArray(accounts)?accounts.find(x=>x.id===item.account.id&&x.role===item.role):null;
      result.users.push({id:p.user_id,role_id:item.role,full_name:typeof account?.name==='string'?account.name.slice(0,100):'معلن تجريبي',is_active:true,is_verified:false});
    }
    result.property_images=result.property_images.filter(x=>x.property_id!==p.id);
    item.images.forEach((url,i)=>result.property_images.push({id:p.id*10+i,property_id:p.id,url,is_main:i===0,sort_order:i}));
  }
  const fixtureEmails={1:'elmalky-owner@gmail.com',2:'elmalky-agency@gmail.com',3:'elmalky-broker@gmail.com'};
  for(const user of result.users){const email=fixtureEmails[user.id]||(typeof user.id==='string'&&user.id.startsWith('demo:')?user.id.slice(5):null);if(email){user.is_active=accountActive(storage,email,user.is_active);user.is_verified=advertiserVerified(storage,email,user.is_verified);}}
  return result;
}
export function moderationHiddenIds(records,storage,now=Date.now()){
  return publisherItems(storage,records).filter(x=>x.availability!=='available'||(x.term&&x.term<=now)).map(x=>x.property.id);
}
export function browserRecords(records){try{return moderatedRecords(records,window.sessionStorage);}catch{return records;}}
export function browserModerationHiddenIds(records){try{return moderationHiddenIds(records,window.sessionStorage);}catch{return [];}}
