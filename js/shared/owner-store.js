import {PUBLISHER_IDS} from '../../data/mock-demo.js';
import {commitNotificationWrites,requestNotification} from './notification-store.js';
import {requireActiveAccount} from './account-status.js';
import {applyReviews,readReviews,reviewKey,nextPropertyId} from './moderation-state.js';
// Frontend workflow scenarios only; these keys are NOT ERD columns or entities.
const KEY='waseet-owner-v1',DAY=86400000;
export const STATUS={pending:'قيد المراجعة',published:'منشور',rejected:'مرفوض',expired:'منتهي'};
export const AVAILABILITY={available:'متاح',sold:'تم البيع',rented:'تم التأجير'};
export const seedIds=account=>account?.role==='owner'&&account.id==='elmalky-owner@gmail.com'?PUBLISHER_IDS.owner:[];
const imageOK=url=>typeof url==='string'&&((/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(url)&&url.length<2800000)||/^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?[^\s<>]+$/.test(url));
export function cleanProperty(p){
  if(!p||typeof p.title!=='string'||p.title.trim().length<3||p.title.length>150||typeof p.description!=='string'||!p.description.trim()||p.description.length>2000||!Number.isFinite(p.price)||p.price<=0||!Number.isFinite(p.size_m2)||p.size_m2<=0||!['sale','rent'].includes(p.listing_type)||!['apartment','villa','shop','office','land'].includes(p.property_type_id)||!['distinguished','first','second','third'].includes(p.area_id))throw new Error('راجع بيانات العقار: العنوان والوصف والسعر والمساحة والنوع والمنطقة.');
  const residential=['apartment','villa'].includes(p.property_type_id);
  for(const key of ['bedrooms','bathrooms','floor'])if(p[key]!=null&&(!Number.isSafeInteger(p[key])||p[key]<0||p[key]>200))throw new Error('أدخل أعدادًا صحيحة صالحة للمواصفات.');
  if(p.listing_type==='rent'&&!['month','year','day'].includes(p.rent_period))throw new Error('اختر فترة الإيجار.');
  return {title:p.title.trim(),description:p.description.trim(),price:p.price,size_m2:p.size_m2,listing_type:p.listing_type,property_type_id:p.property_type_id,area_id:p.area_id,bedrooms:residential?p.bedrooms??null:null,bathrooms:p.property_type_id==='land'?null:p.bathrooms??null,floor:p.property_type_id==='land'?null:p.floor??null,finishing_type:p.property_type_id!=='land'&&['سوبر لوكس','لوكس','نصف تشطيب','بدون تشطيب'].includes(p.finishing_type)?p.finishing_type:null,rent_period:p.listing_type==='rent'?p.rent_period:null};
}
export function createOwnerStore(storage,account,now=()=>Date.now()){
  const requireOwner=()=>{if(!account||account.role!=='owner')throw new Error('هذه الصفحة متاحة لحساب المالك فقط.');};
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
    list(records){const s=read();return applyReviews(storage,'owner',account,[...records.properties.filter(p=>seedIds(account).includes(p.id)).map(p=>({...p})),...s.created.map(x=>({...x.property,id:x.id,user_id:account.id==='elmalky-owner@gmail.com'?1:`demo:${account.id}`,status:'pending',created_at:x.created_at}))].map(p=>({property:p,pending:s.edits[p.id]||null,availability:s.availability[p.id]||'available',term:s.terms[p.id]||null,images:s.created.find(x=>x.id===p.id)?.images||records.property_images.filter(x=>x.property_id===p.id).sort((a,b)=>a.sort_order-b.sort_order).map(x=>x.url)})),cleanProperty);},
    initialize(){requireActiveAccount(storage,account?.id);const s=read();let changed=false;for(const id of seedIds(account))if(!s.terms[id]){s.terms[id]=now()+30*DAY;changed=true;}if(changed)write(s);},
    submit(property,images,id=null){requireActiveAccount(storage,account?.id);const s=read(),clean=cleanProperty(property);if(!Array.isArray(images)||!images.length||images.length>6||images.some(url=>!imageOK(url)))throw new Error('أضف من صورة واحدة إلى 6 صور صالحة.');
      if(id!=null){assertOwned(id,s);s.edits[id]={property:clean,images:[...images]};}
      else{if(s.created.length>=40)throw new Error('وصلت إلى الحد التجريبي للإعلانات.');id=nextPropertyId(storage,now());s.created.push({id,property:clean,images:[...images],created_at:new Date(now()).toISOString()});}
      const kind=seedIds(account).includes(id)||readReviews(storage,cleanProperty)[reviewKey('owner',account.id,id)]?.accepted?'edit':'listing';
      write(s,[requestNotification('owner',account.id,id,kind,clean.title)]);return id;
    },
    availability(id,value){requireActiveAccount(storage,account?.id);const s=read();assertOwned(id,s);if(!Object.hasOwn(AVAILABILITY,value))throw new Error('اختيار إتاحة غير صالح.');s.availability[id]=value;write(s);},
    renew(id){requireActiveAccount(storage,account?.id);const s=read();assertOwned(id,s);if(!seedIds(account).includes(id)&&!readReviews(storage,cleanProperty)[reviewKey('owner',account.id,id)]?.accepted)throw new Error('لا يمكن تجديد إعلان قبل موافقة الإدارة.');if((s.availability[id]||'available')!=='available')throw new Error('أعد إتاحة العقار قبل طلب التجديد.');s.terms[id]=Math.max(now(),s.terms[id]||readReviews(storage,cleanProperty)[reviewKey('owner',account.id,id)]?.accepted?.expiresAt||now())+30*DAY;write(s);return s.terms[id];},
  };
}
export function hiddenOwnerPropertyIds(storage,now=Date.now()){
  try{const raw=JSON.parse(storage.getItem(KEY)||'{}')['elmalky-owner@gmail.com'];if(!raw)return [];
    return PUBLISHER_IDS.owner.filter(id=>['sold','rented'].includes(raw.availability?.[id])||(Number.isFinite(raw.terms?.[id])&&raw.terms[id]>0&&raw.terms[id]<=now));
  }catch{return [];}
}
export function browserHiddenIds(){try{return typeof window==='undefined'?[]:hiddenOwnerPropertyIds(window.sessionStorage);}catch{return [];}}
