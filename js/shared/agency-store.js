import {PUBLISHER_IDS} from '../../data/mock-demo.js';
import {commitNotificationWrites,requestNotification} from './notification-store.js';
import {requireActiveAccount} from './account-status.js';
import {applyReviews,readReviews,reviewKey,nextPropertyId} from './moderation-state.js';
// Agency workflow scenarios reuse existing property validation and status labels.
import {cleanProperty,STATUS,AVAILABILITY} from './owner-store.js';
export {STATUS,AVAILABILITY};
const KEY='waseet-agency-v1',DAY=86400000;
export const seedIds=account=>account?.role==='agency'&&account.id==='elmalky-agency@gmail.com'?PUBLISHER_IDS.agency:[];
const imageOK=url=>typeof url==='string'&&((/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(url)&&url.length<2800000)||/^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?[^\s<>]+$/.test(url));
export function createAgencyStore(storage,account,now=()=>Date.now()){
  const requireOwner=()=>{if(!account||account.role!=='agency')throw new Error('هذه الصفحة متاحة لحساب المكتب العقاري فقط.');};
  function readAll(){try{const raw=storage.getItem(KEY);if(raw?.length>4000000)throw Error();const parsed=raw?JSON.parse(raw):{};return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};}catch{return {};}}
  function read(){requireOwner();const raw=readAll()[account.id]||{};const state={created:[],edits:{},availability:{},terms:{}};
    for(const item of (Array.isArray(raw.created)?raw.created:[]).slice(0,40)){try{if(!Number.isSafeInteger(item.id)||item.id<1000)continue;const property=cleanProperty(item.property);const images=(Array.isArray(item.images)?item.images:[]).filter(imageOK).slice(0,6);state.created.push({id:item.id,property,images,created_at:typeof item.created_at==='string'?item.created_at:new Date(now()).toISOString()});}catch{}}
    const allowed=new Set([...seedIds(account),...state.created.map(x=>x.id)]);
    for(const id of allowed){
      if(Object.hasOwn(AVAILABILITY,raw.availability?.[id]))state.availability[id]=raw.availability[id];
      if(Number.isFinite(raw.terms?.[id])&&raw.terms[id]>0)state.terms[id]=raw.terms[id];
      try{if(raw.edits?.[id])state.edits[id]={property:cleanProperty(raw.edits[id].property),images:raw.edits[id].images.filter(imageOK).slice(0,6)};}catch{}
    }return state;
  }
  function write(state,events=[]){const all=readAll();all[account.id]=state;const raw=JSON.stringify(all);if(raw.length>3900000)throw new Error('تجاوزت الصور مساحة الجلسة. قلّل عدد الصور أو حجمها.');try{commitNotificationWrites(storage,[[KEY,raw]],events,now());}catch{throw new Error('تعذّر حفظ الجلسة. قلّل حجم الصور وتحقق من السماح بتخزين بيانات الموقع.');}}
  function assertOwned(id,state){if(!seedIds(account).includes(id)&&!state.created.some(x=>x.id===id))throw new Error('العقار غير موجود ضمن حسابك.');}
  return {
    list(records){const s=read();return applyReviews(storage,'agency',account,[...records.properties.filter(p=>seedIds(account).includes(p.id)).map(p=>({...p})),...s.created.map(x=>({...x.property,id:x.id,user_id:account.id==='elmalky-agency@gmail.com'?2:`demo:${account.id}`,status:'pending',created_at:x.created_at}))].map(p=>({property:p,pending:s.edits[p.id]||null,availability:s.availability[p.id]||'available',term:s.terms[p.id]||null,images:s.created.find(x=>x.id===p.id)?.images||records.property_images.filter(x=>x.property_id===p.id).sort((a,b)=>a.sort_order-b.sort_order).map(x=>x.url)})),cleanProperty);},
    initialize(){requireActiveAccount(storage,account?.id);const s=read();let changed=false;for(const id of seedIds(account))if(!s.terms[id]){s.terms[id]=now()+30*DAY;changed=true;}if(changed)write(s);},
    submit(property,images,id=null){requireActiveAccount(storage,account?.id);const s=read(),clean=cleanProperty(property);if(!Array.isArray(images)||!images.length||images.length>6||images.some(url=>!imageOK(url)))throw new Error('أضف من صورة واحدة إلى 6 صور صالحة.');
      if(id!=null){assertOwned(id,s);s.edits[id]={property:clean,images:[...images]};}
      else{if(s.created.length>=40)throw new Error('وصلت إلى الحد التجريبي للإعلانات.');id=nextPropertyId(storage,now());s.created.push({id,property:clean,images:[...images],created_at:new Date(now()).toISOString()});}
      const kind=seedIds(account).includes(id)||readReviews(storage,cleanProperty)[reviewKey('agency',account.id,id)]?.accepted?'edit':'listing';
      write(s,[requestNotification('agency',account.id,id,kind,clean.title)]);return id;
    },
    availability(id,value){requireActiveAccount(storage,account?.id);const s=read();assertOwned(id,s);if(!Object.hasOwn(AVAILABILITY,value))throw new Error('اختيار إتاحة غير صالح.');s.availability[id]=value;write(s);},
    renew(id){requireActiveAccount(storage,account?.id);const s=read();assertOwned(id,s);if(!seedIds(account).includes(id)&&!readReviews(storage,cleanProperty)[reviewKey('agency',account.id,id)]?.accepted)throw new Error('لا يمكن تجديد إعلان قبل موافقة الإدارة.');if((s.availability[id]||'available')!=='available')throw new Error('أعد إتاحة العقار قبل طلب التجديد.');s.terms[id]=Math.max(now(),s.terms[id]||readReviews(storage,cleanProperty)[reviewKey('agency',account.id,id)]?.accepted?.expiresAt||now())+30*DAY;write(s);return s.terms[id];},
  };
}
export function hiddenAgencyPropertyIds(storage,now=Date.now()){
  try{const raw=JSON.parse(storage.getItem(KEY)||'{}')['elmalky-agency@gmail.com'];if(!raw)return [];
    return PUBLISHER_IDS.agency.filter(id=>['sold','rented'].includes(raw.availability?.[id])||(Number.isFinite(raw.terms?.[id])&&raw.terms[id]>0&&raw.terms[id]<=now));
  }catch{return [];}
}
export function browserAgencyHiddenIds(){try{return typeof window==='undefined'?[]:hiddenAgencyPropertyIds(window.sessionStorage);}catch{return [];}}
