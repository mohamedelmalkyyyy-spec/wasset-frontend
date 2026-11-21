import {DEMO_ACCOUNTS,DEMO_PASSWORD} from '../../data/mock-demo.js';
import {ensureDemoPopulation} from './demo-population.js';
import {accountActive,requireActiveAccount} from './account-status.js';
import {agentMembership} from './agent-store.js';
// Session-only UI simulation. Public demo password comparison is not server identity/security.
export const ROLES={seeker:'باحث عن عقار',owner:'مالك عقار',broker:'سمسار عقاري مستقل',agency:'مكتب عقاري'};
const KEY='waseet-demo-v1';
const emailOK=value=>typeof value==='string'&&value.length<=120&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const cleanAccount=value=>value&&emailOK(value.email)&&(Object.hasOwn(ROLES,value.role)||value.role==='agent'||value.role==='admin')&&typeof value.name==='string'&&value.name.trim().length>=2&&value.name.length<=100
  ? {id:value.email.toLowerCase(),email:value.email.toLowerCase(),name:value.name.trim(),role:value.role}:null;
export function createDemoStore(storage){
  ensureDemoPopulation(storage);
  function read(){
    try{
      const raw=storage.getItem(KEY);if(raw&&raw.length>100000)throw new Error('Oversized state');
      const parsed=raw?JSON.parse(raw):{};
      const accounts=Array.isArray(parsed.accounts)?parsed.accounts.slice(0,30).map(cleanAccount).filter(Boolean):[];
      const unique=[...new Map(accounts.map(a=>[a.id,a])).values()];
      const favorites=Object.create(null);
      for(const a of unique){const ids=parsed.favorites?.[a.id];favorites[a.id]=Array.isArray(ids)?[...new Set(ids.filter(id=>Number.isSafeInteger(id)&&id>0))].slice(0,1000):[];}
      return {accounts:unique,current:unique.some(a=>a.id===parsed.current)?parsed.current:null,favorites};
    }catch{return {accounts:[],current:null,favorites:Object.create(null)};}
  }
  function write(state){storage.setItem(KEY,JSON.stringify(state));}
  function activeIdentity(account){if(!account||!accountActive(storage,account.email))return null;
    if(account.role==='agent'){try{const membership=agentMembership(storage,account.email);if(!membership?.member.active||!accountActive(storage,membership.agency.id))return null;}catch{return null;}}
    return account;
  }
  return {
    current(){const s=read();return activeIdentity(s.accounts.find(a=>a.id===s.current));},
    login(email,password){
      if(!emailOK(email))throw new Error('أدخل بريدًا إلكترونيًا صحيحًا.');
      const s=read(),id=email.trim().toLowerCase();
      if(DEMO_ACCOUNTS.some(x=>x.email===id)&&password!==DEMO_PASSWORD)throw new Error('كلمة مرور حساب العرض غير صحيحة. استخدم كلمة المرور الموضحة في دليل العرض.');
      let a=s.accounts.find(a=>a.id===id);requireActiveAccount(storage,id);
      const membership=agentMembership(storage,id);
      if(membership){
        requireActiveAccount(storage,membership.agency.id);
        if(!membership.member.active)throw new Error('تم إيقاف عضوية الموظف. راجع مدير المكتب.');
        if(a&&!['seeker','agent'].includes(a.role))throw new Error('بريد الدعوة مرتبط بنوع حساب مختلف. راجع مدير المكتب.');
        if(!a){if(s.accounts.length>=30)throw new Error('وصلت الحسابات التجريبية إلى الحد المتاح.');a={id,email:id,name:membership.member.name,role:'agent'};s.accounts.push(a);}
        else{a.role='agent';a.name=membership.member.name;}
      }else if(a?.role==='agent')throw new Error('دعوة المكتب غير متاحة. راجع مدير المكتب.');
      if(!a){if(s.accounts.length>=30)throw new Error('وصلت الحسابات التجريبية إلى الحد المتاح في هذه الجلسة.');
        const fixture={'elmalky-owner@gmail.com':['محمد أحمد — حساب تجريبي','owner'],'elmalky-broker@gmail.com':['كريم السيد — حساب تجريبي','broker'],'elmalky-agency@gmail.com':['عقارات السادات — حساب تجريبي','agency']}[id];
        a={id,email:id,name:fixture?.[0]||'مستخدم تجريبي',role:fixture?.[1]||'seeker'};s.accounts.push(a);}
      s.current=id;write(s);return a;
    },
    register(input){requireActiveAccount(storage,input?.email);if(!Object.hasOwn(ROLES,input?.role))throw new Error('الموظف ينضم من خلال دعوة المكتب فقط.');const a=cleanAccount(input);if(!a)throw new Error('راجع الاسم والبريد ونوع الحساب.');const s=read();
      if(s.accounts.some(x=>x.id===a.id))throw new Error('هذا البريد مسجل في الجلسة. استخدم تسجيل الدخول.');
      if(s.accounts.length>=30)throw new Error('وصلت الحسابات التجريبية إلى الحد المتاح.');
      s.accounts.push(a);s.current=a.id;write(s);return a;},
    logout(){const s=read();s.current=null;write(s);},
    favorites(){const s=read();return activeIdentity(s.accounts.find(a=>a.id===s.current))?s.favorites[s.current]||[]:[];},
    toggle(id){if(!Number.isSafeInteger(id)||id<1)throw new Error('العقار غير صالح.');const s=read();if(!activeIdentity(s.accounts.find(a=>a.id===s.current)))throw new Error('سجّل الدخول بحساب نشط أولًا.');
      const ids=s.favorites[s.current]||[];s.favorites[s.current]=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];write(s);return s.favorites[s.current].includes(id);},
  };
}
export function demoStore(){return createDemoStore(window.sessionStorage);}
export function safeReturn(value,root){
  const fallback=new URL('index.html',root).href;
  try{const url=new URL(value||fallback,root),base=new URL(root);
    if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return fallback;
    const path=url.pathname.slice(base.pathname.length);
    if(!['index.html','pages/properties.html','pages/property.html','pages/advertiser.html','pages/favorites.html','pages/account/notifications.html','pages/account/index.html','pages/account/properties.html','pages/account/property-form.html','pages/broker/index.html','pages/broker/properties.html','pages/broker/property-form.html','pages/agency/index.html','pages/agency/properties.html','pages/agency/property-form.html','pages/agency/employees.html','pages/agent/index.html','pages/agent/properties.html','pages/agent/property-form.html'].includes(path))return fallback;
    return url.href;
  }catch{return fallback;}
}
