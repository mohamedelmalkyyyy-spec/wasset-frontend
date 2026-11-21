import {requireActiveAccount} from './account-status.js';
// Demo membership/permission/assignment scenarios, not ERD entities or fields.
export const PERMISSIONS={view:'عرض العقارات',create:'إضافة عقار',edit:'تعديل العقارات المسندة',manage:'إدارة العقارات المسندة'};
const KEY='waseet-agency-team-v1';
const seed=[
 {id:1,name:'أحمد سمير',email:'elmalky-agent@gmail.com',phone:'01012345678',active:true},
 {id:2,name:'سارة محمود',email:'sara@alsadat.example',phone:'01198765432',active:true},
 {id:3,name:'محمود علي',email:'mahmoud@alsadat.example',phone:'01245678901',active:false},
];
const emailOK=value=>typeof value==='string'&&value.length<=120&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function createAgencyTeam(storage,account,ownedIds){
 function allowed(){if(account?.role!=='agency')throw new Error('إدارة الموظفين متاحة لحساب المكتب فقط.');}
 function all(){try{const text=storage.getItem(KEY);if(text?.length>100000)throw Error();const raw=JSON.parse(text||'{}');return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};}catch{return {};}}
 function read(){allowed();const saved=all()[account.id];
   const raw=saved||{members:account.id==='elmalky-agency@gmail.com'?seed.map(x=>({...x,permissions:{view:true,create:true,edit:true,manage:false}})):[],assignments:account.id==='elmalky-agency@gmail.com'?{'2':2}:{}};
   const members=[];
   for(const member of (Array.isArray(raw.members)?raw.members:[]).slice(0,50)){
     if(!Number.isSafeInteger(member?.id)||member.id<1||typeof member.name!=='string'||member.name.trim().length<2||member.name.length>100||!emailOK(member.email)||typeof member.phone!=='string'||!/^01[0125]\d{8}$/.test(member.phone))continue;
     if(members.some(x=>x.id===member.id||x.email===member.email.toLowerCase()))continue;
     members.push({id:member.id,name:member.name.trim(),email:member.email.toLowerCase(),phone:member.phone,active:member.active===true,permissions:Object.fromEntries(Object.keys(PERMISSIONS).map(key=>[key,member.permissions?.[key]===true]))});
   }
   const assignments={};for(const id of ownedIds()){
     const member=members.find(x=>x.id===raw.assignments?.[id]&&x.active&&x.permissions.view);
     if(member)assignments[id]=member.id;
   }return {members,assignments};
 }
 function write(state){requireActiveAccount(storage,account.id);const raw=all();raw[account.id]=state;try{storage.setItem(KEY,JSON.stringify(raw));}catch{throw new Error('تعذّر حفظ جلسة المكتب. تحقق من مساحة التخزين.');}}
 return {
   list:()=>read(),
   add(input){const state=read();if(state.members.length>=50)throw new Error('وصلت إلى الحد التجريبي للموظفين.');
     if(typeof input.name!=='string'||input.name.trim().length<2||input.name.length>100||!emailOK(input.email)||!/^01[0125]\d{8}$/.test(input.phone||''))throw new Error('أدخل اسمًا وبريدًا ورقم موبايل مصريًا صحيحًا.');
     const email=input.email.toLowerCase().trim();if(state.members.some(x=>x.email===email))throw new Error('هذا البريد موجود ضمن موظفي المكتب.');
     const id=Math.max(1000,Date.now(),...state.members.map(x=>x.id+1));
     state.members.push({id,name:input.name.trim(),email,phone:input.phone,active:input.active===true,permissions:{view:true,create:false,edit:false,manage:false}});write(state);return id;
   },
   permissions(id,permissions,active){const state=read(),member=state.members.find(x=>x.id===id);if(!member)throw new Error('الموظف غير موجود ضمن مكتبك.');
     member.permissions=Object.fromEntries(Object.keys(PERMISSIONS).map(key=>[key,permissions[key]===true]));member.active=active===true;
     if(!member.active||!member.permissions.view)for(const key of Object.keys(state.assignments))if(state.assignments[key]===id)delete state.assignments[key];write(state);
   },
   assign(propertyId,memberId){const state=read();if(!ownedIds().includes(propertyId))throw new Error('هذا العقار غير تابع للمكتب.');
     if(memberId==null)delete state.assignments[propertyId];else{const member=state.members.find(x=>x.id===memberId&&x.active&&x.permissions.view);if(!member)throw new Error('اختر موظفًا نشطًا لديه صلاحية عرض العقارات.');requireActiveAccount(storage,member.email);state.assignments[propertyId]=memberId;}write(state);
   },
 };
}
