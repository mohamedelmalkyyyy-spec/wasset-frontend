import {browserModerationHiddenIds} from './moderation-store.js';
import {browserHiddenIds} from './owner-store.js';
import {browserBrokerHiddenIds} from './broker-store.js';
import {browserAgencyHiddenIds} from './agency-store.js';
export function propertyState(records,id) {
  const property=records.properties.find(p=>String(p.id)===String(id));
  if(!property)return {kind:'missing'};
  if(property.status==='expired')return {kind:'expired'};
  if([...browserModerationHiddenIds(records),...browserHiddenIds(),...browserBrokerHiddenIds(),...browserAgencyHiddenIds()].includes(property.id))return {kind:'unavailable'};
  const user=records.users.find(u=>u.id===property.user_id && u.is_active);
  const area=records.areas.find(a=>a.id===property.area_id && a.is_active);
  const type=records.property_types.find(t=>t.id===property.property_type_id);
  if(property.status!=='published'||!user||!area||!type)return {kind:'unavailable'};
  return {kind:'available',property,user,area,type,category:records.property_categories.find(c=>c.id===type.category_id)};
}
export function orderedImages(records,id) {
  return records.property_images.filter(x=>String(x.property_id)===String(id)).sort((a,b)=>Number(b.is_main)-Number(a.is_main)||a.sort_order-b.sort_order);
}
export function contactTargets(user,broker,reference='') {
  const phone=String(user?.phone||'').replace(/[\s()-]/g,'');
  const whatsapp=String(broker?.whatsapp||'').replace(/[\s()+-]/g,'');
  return {phone:/^\+?[1-9]\d{7,14}$/.test(phone)?`tel:${phone}`:null,
    whatsapp:/^[1-9]\d{7,14}$/.test(whatsapp)?`https://wa.me/${whatsapp}?text=${encodeURIComponent(reference)}`:null};
}
