import {DEMO_ACCOUNTS,LEGACY_IDENTITIES,PUBLISHER_IDS,SEED_PROPERTIES,SEED_IMAGES} from '../../data/mock-demo.js';
import {commitSession,reviewKey} from './moderation-state.js';
import {commitNotificationWrites,NOTIFICATION_KEY,ADMIN_INBOX,requestNotification} from './notification-store.js';

// One-time, transactional population of existing session UI stores. No network or schema changes.
export const POPULATION_KEY='waseet-mock-population-v1';
const DAY=86400000;
const keys=['waseet-demo-v1','waseet-owner-v1','waseet-broker-v1','waseet-agency-v1','waseet-agency-team-v1','waseet-moderation-v1','waseet-account-status-v1','waseet-verification-v1','waseet-contact-demo-v1','waseet-reports-v1',NOTIFICATION_KEY];
const email=role=>DEMO_ACCOUNTS.find(x=>x.role===role).email;
function rename(value){let result=value;for(const [before,after] of Object.entries(LEGACY_IDENTITIES))result=result.replaceAll(before,after);return result;}
function migrate(value){
  if(typeof value==='string')return Object.hasOwn(LEGACY_IDENTITIES,value)||value.startsWith('demo:')||/^(backfill:|seed:)/.test(value)?rename(value):value;
  if(Array.isArray(value))return value.map(migrate);
  if(value&&typeof value==='object'){
    const result={};for(const [key,item] of Object.entries(value)){const next=rename(key);if(Object.hasOwn(result,next))throw Error('تعارض بين حساب تجريبي قديم وحديث. لم تتغير البيانات المحفوظة.');result[next]=migrate(item);}return result;
  }return value;
}
function property(value){const {id,user_id,status,created_at,...fields}=value;return fields;}
export function ensureDemoPopulation(storage,time=Date.now()){
  if(storage.getItem(POPULATION_KEY))return;
  const before=new Map(keys.map(key=>[key,storage.getItem(key)]));
  const state=new Map();
  for(const [key,text] of before){if(text!=null){let parsed;try{parsed=JSON.parse(text);}catch{throw Error('تعذّر تهيئة الأمثلة دون تغيير بيانات الجلسة الحالية.');}if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('بيانات الجلسة الحالية غير صالحة.');state.set(key,migrate(parsed));}}
  const get=(key,empty={})=>{if(!state.has(key))state.set(key,empty);return state.get(key);};
  const auth=get('waseet-demo-v1',{accounts:[],current:null,favorites:{}});
  if(!Array.isArray(auth.accounts)||auth.accounts.length+DEMO_ACCOUNTS.filter(x=>!auth.accounts.some(a=>a.email===x.email)).length>30)throw Error('لا توجد مساحة كافية لإضافة حسابات العرض دون حذف حساباتك.');
  auth.favorites??={};
  if(typeof auth.favorites!=='object'||Array.isArray(auth.favorites))throw Error('بيانات المفضلة الحالية غير صالحة. لم تتغير بيانات الجلسة.');
  for(const account of DEMO_ACCOUNTS){const previous=auth.accounts.find(x=>x.email===account.email);if(previous){previous.role=account.role;previous.id=account.id;}else auth.accounts.push({...account});if(!Object.hasOwn(auth.favorites,account.id))auth.favorites[account.id]=account.role==='admin'?[]:account.role==='seeker'?[1,4,5,15]:[1,5];}
  const reviews=get('waseet-moderation-v1'),events=[];
  for(const [index,role] of ['owner','broker','agency'].entries()){
    const actor=email(role),all=get(`waseet-${role}-v1`);
    if(Object.hasOwn(all,actor))continue; // Existing edits, removals, terms and empty states are intentional.
    const base=SEED_PROPERTIES[role],start=1101+index*100;
    const created=[0,1,2].map((offset)=>({id:start+offset,property:{...property(base[offset]),title:base[offset].title+[' — طلب نشر جديد',' — يحتاج مراجعة البيانات',' — إعلان معتمد'][offset]},images:[...SEED_IMAGES[base[offset].id]],created_at:new Date(time-(3-offset)*DAY).toISOString()}));
    const terms=Object.fromEntries(PUBLISHER_IDS[role].map((id,i)=>[id,time+(i===4?-2:12+i*2)*DAY]));
    const edited=base.find(x=>x.id===({owner:1,broker:4,agency:5})[role]);
    all[actor]={created,edits:{[edited.id]:{property:{...property(edited),price:edited.price+(edited.listing_type==='rent'?1000:100000),description:edited.description+' طلب تعديل: تحسين وصف المساحة والمواصفات ومراجعة السعر.'},images:[...SEED_IMAGES[edited.id],...SEED_IMAGES[7].slice(0,1)].slice(0,6)}},availability:{[PUBLISHER_IDS[role].at(-1)]:role==='agency'?'rented':'sold'},terms};
    reviews[reviewKey(role,actor,start+1)]={rejection:{kind:'listing',reason:'يرجى توضيح وصف العقار ومراجعة ترتيب الصور قبل إعادة الإرسال.'}};
    reviews[reviewKey(role,actor,start+2)]={accepted:{property:created[2].property,images:created[2].images,expiresAt:time+25*DAY}};
    events.push(requestNotification(role,actor,start,'listing',created[0].property.title),requestNotification(role,actor,edited.id,'edit',edited.title));
    events.push({recipient:actor,type:'listing_approved',title:'تمت الموافقة على إعلانك',text:`تم نشر «${created[2].property.title}» في العرض التجريبي.`,target:{view:'properties',role,id:start+2}},
      {recipient:actor,type:'listing_rejected',title:'إعلان يحتاج استكمال البيانات',text:'تم رفض طلب النشر حتى توضيح الوصف وترتيب الصور.',target:{view:'properties',role,id:start+1}});
  }
  const teams=get('waseet-agency-team-v1');
  if(!Object.hasOwn(teams,email('agency')))teams[email('agency')]={members:[
    {id:1,name:'أحمد سمير',email:email('agent'),phone:'01012345678',active:true,permissions:{view:true,create:true,edit:true,manage:false}},
    {id:2,name:'سارة محمود',email:'sara@alsadat.example',phone:'01198765432',active:true,permissions:{view:true,create:false,edit:true,manage:true}},
    {id:3,name:'محمود علي',email:'mahmoud@alsadat.example',phone:'01245678901',active:false,permissions:{view:true,create:false,edit:false,manage:false}}
  ],assignments:{2:2,5:1,15:2,16:1,1301:1,1302:1,1303:1}};
  const reports=get('waseet-reports-v1',{submissions:[],decisions:{'R-276':{decision:'resolve',note:'تمت مراجعة المثال وتوضيح بيانات الإعلان؛ لا يتم إيقافه تلقائياً.'},'R-285':{decision:'close',note:'تم إغلاق المثال دون إجراء على العقار.'}}});
  // Existing Admin report fixtures supply the initial queue; their bindings live in trust-store.js.
  if(!Array.isArray(reports.submissions)||!reports.decisions)throw Error('بيانات البلاغات الحالية غير صالحة.');
  const verification=get('waseet-verification-v1');
  if(!Object.hasOwn(verification,email('seeker')))verification[email('seeker')]={status:'موثق',reason:''};
  const contacts=get('waseet-contact-demo-v1');for(const account of DEMO_ACCOUNTS)if(!Object.hasOwn(contacts,account.email))contacts[account.email]=true;
  events.push({recipient:email('agent'),type:'listing_approved',title:'تم نشر عقار مسند إليك',text:'تمت الموافقة على إعلان المكتب المسند إليك؛ يمكنك متابعة بياناته ضمن صلاحياتك.',target:{view:'properties',role:'agent',id:1303}},
    {recipient:email('agent'),type:'listing_rejected',title:'ملاحظات على إعلان مسند',text:'راجع وصف العقار وترتيب الصور ثم أعد إرسال التعديل إلى الإدارة.',target:{view:'properties',role:'agent',id:1302}},
    {recipient:email('seeker'),type:'verification_approved',title:'حالة حساب العرض التجريبي',text:'الحساب التجريبي موثق داخل هذه الجلسة فقط. لا يمثل تحققاً حقيقياً من الهوية أو البريد.',target:{view:'home',role:'seeker'}},
    {recipient:ADMIN_INBOX,type:'verification_requested',title:'طلب توثيق مكتب عقاري',text:'طلب عقارات السادات متاح للمراجعة مع أسماء مستندات توضيحية فقط.',target:{view:'verify',email:email('agency')}});
  // Build and validate the notification journal in an isolated adapter before committing anything.
  const scratch=new Map(state.has(NOTIFICATION_KEY)?[[NOTIFICATION_KEY,JSON.stringify(state.get(NOTIFICATION_KEY))]]:[]);
  const adapter={getItem:key=>scratch.get(key)??null,setItem:(key,value)=>scratch.set(key,value),removeItem:key=>scratch.delete(key)};
  commitNotificationWrites(adapter,[],events.map((event,i)=>({...event,once:'population:v1:'+i})),time);
  state.set(NOTIFICATION_KEY,JSON.parse(scratch.get(NOTIFICATION_KEY)));
  const updates=[...state].map(([key,value])=>[key,JSON.stringify(value)]);
  updates.push([POPULATION_KEY,JSON.stringify({version:1})]);
  commitSession(storage,updates);
}
