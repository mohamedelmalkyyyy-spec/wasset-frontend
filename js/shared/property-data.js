import {frontendURL} from '../core/path-resolver.js';
import {ensureDemoPopulation} from './demo-population.js';
import {moderatedRecords} from './moderation-store.js';

export class PropertyDataError extends Error{
  constructor(stage,message,cause){super(message,{cause});this.name='PropertyDataError';this.stage=stage;this.url=frontendURL('data/properties.json');}
}

// Validate the existing catalogue contract, not a replacement dataset or schema.
export function validatePropertyRecords(records){
  const tables=['property_categories','property_types','areas','roles','users','properties','property_images'];
  for(const table of tables){
    if(!Array.isArray(records?.[table]))throw Error(`Missing catalogue array: ${table}`);
    const ids=new Set();for(const row of records[table]){if(!row||!['number','string'].includes(typeof row.id)||ids.has(row.id))throw Error(`Invalid/duplicate identity: ${table}`);ids.add(row.id);}
  }
  for(const [table,key,parent] of [['property_types','category_id','property_categories'],['users','role_id','roles'],['properties','property_type_id','property_types'],['properties','area_id','areas'],['properties','user_id','users'],['property_images','property_id','properties']]){
    const ids=new Set(records[parent].map(x=>x.id));for(const row of records[table])if(!ids.has(row[key]))throw Error(`Unresolved ${table}.${key}: ${row.id}`);
  }
  for(const row of records.properties)if(typeof row.title!=='string'||typeof row.description!=='string'||!Number.isFinite(row.price)||!Number.isFinite(row.size_m2))throw Error(`Invalid property content: ${row.id}`);
  return records;
}

// Every public property consumer reads the same URL, then the same session projection.
// Never cache a merged snapshot: Admin decisions and favorites survive navigation independently.
export async function loadPropertyRecords(options={}){
  const url=frontendURL('data/properties.json'),fetchImpl=options.fetchImpl||globalThis.fetch;
  let response,records,storage;
  try{response=await fetchImpl(url,{cache:'no-store',headers:{Accept:'application/json'}});}
  catch(cause){throw new PropertyDataError('network','تعذّر الاتصال بملف العقارات. تأكد من تشغيل الموقع عبر HTTP.',cause);}
  if(!response.ok)throw new PropertyDataError('http',`تعذّر تحميل ملف العقارات (HTTP ${response.status}).`);
  try{records=JSON.parse((await response.text()).replace(/^\uFEFF/,''));}
  catch(cause){throw new PropertyDataError('json','استجابة ملف العقارات ليست JSON صالحاً. تحقق من مسار الملف وإعدادات الخادم.',cause);}
  try{validatePropertyRecords(records);}
  catch(cause){throw new PropertyDataError('catalogue','بيانات العقارات أو مراجع الأنواع والمناطق غير صالحة.',cause);}
  try{
    storage=options.storage||globalThis.sessionStorage;
    for(const key of ['waseet-demo-v1','waseet-owner-v1','waseet-broker-v1','waseet-agency-v1','waseet-agency-team-v1','waseet-moderation-v1','waseet-account-status-v1','waseet-verification-v1']){
      const text=storage.getItem(key);if(text!==null){const value=JSON.parse(text);if(!value||typeof value!=='object'||Array.isArray(value))throw Error(`Invalid session object: ${key}`);}
    }
    ensureDemoPopulation(storage);
  }
  catch(cause){throw new PropertyDataError('storage','تعذّرت تهيئة جلسة العرض. لم يتم مسح البيانات المحفوظة. '+cause.message,cause);}
  try{return validatePropertyRecords(moderatedRecords(records,storage));}
  catch(cause){throw new PropertyDataError('projection','تعذّر دمج حالة المراجعة مع العقارات. لم يتم استبدالها ببيانات بديلة.',cause);}
}
