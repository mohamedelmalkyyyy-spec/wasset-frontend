import {NOTIFICATION_KEY} from './notification-store.js';
import {requireActiveAccount} from './account-status.js';
// Session-only adapter over the existing agency workflow and team scenarios.
// Membership, permissions and assignments are UI scenarios, not ERD additions.
import {createAgencyStore,seedIds} from './agency-store.js';
import {createAgencyTeam} from './agency-team.js';
export {STATUS,AVAILABILITY} from './agency-store.js';

export function agentMembership(storage,email){
  let saved={};
  try{const raw=storage.getItem('waseet-agency-team-v1');if(raw?.length<=100000)saved=JSON.parse(raw)||{};}catch{}
  const ids=new Set(['elmalky-agency@gmail.com',...Object.keys(saved).filter(id=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id))]);
  const matches=[];
  for(const id of ids){
    const agency={id,role:'agency'},store=createAgencyStore(storage,agency);
    const ownedIds=()=>[...seedIds(agency),...store.list({properties:[],property_images:[]}).map(x=>x.property.id)];
    const team=createAgencyTeam(storage,agency,ownedIds);
    const member=team.list().members.find(x=>x.email===email?.toLowerCase());
    if(member)matches.push({agency,member,store,team});
  }
  // Ambiguous invitations require manager resolution; never select an arbitrary office.
  if(matches.length>1)throw new Error('البريد مرتبط بأكثر من مكتب تجريبي. راجع مدير المكتب.');
  return matches[0]||null;
}

export function createAgentStore(storage,account){
  function access(permission){
    if(account?.role!=='agent')throw new Error('هذه الصفحة متاحة لموظفي المكتب فقط.');
    requireActiveAccount(storage,account.email);
    const membership=agentMembership(storage,account.email);
    if(membership)requireActiveAccount(storage,membership.agency.id);
    if(!membership?.member.active)throw new Error('دعوة المكتب غير متاحة أو تم إيقاف العضوية. راجع مدير المكتب.');
    if(permission&&!membership.member.permissions[permission])throw new Error('لا تملك صلاحية هذا الإجراء. راجع مدير المكتب.');
    return membership;
  }
  function assigned(id,permission){
    const context=access(permission);
    if(!context.member.permissions.view||context.team.list().assignments[id]!==context.member.id)throw new Error('العقار غير مسند إليك أو لم تعد لديك صلاحية عرضه.');
    return context;
  }
  return {
    membership:()=>access(),
    initialize(){access().store.initialize();},
    list(records){const c=access();if(!c.member.permissions.view)return [];const assignments=c.team.list().assignments;return c.store.list(records).filter(x=>assignments[x.property.id]===c.member.id);},
    submit(property,images,id=null){
      const c=id==null?access('create'):assigned(id,'edit');
      if(!c.member.permissions.view)throw new Error('يلزم منح صلاحية عرض العقارات أولاً.');
      // Keep creation and assignment together if session quota is exceeded.
      const keys=['waseet-agency-v1','waseet-agency-team-v1',NOTIFICATION_KEY],before=keys.map(key=>storage.getItem(key));
      try{const result=c.store.submit(property,images,id);if(id==null)c.team.assign(result,c.member.id);return result;}
      catch(error){keys.forEach((key,i)=>{if(before[i]==null)storage.removeItem(key);else storage.setItem(key,before[i]);});throw error;}
    },
    availability(id,value){assigned(id,'manage').store.availability(id,value);},
    renew(id){return assigned(id,'manage').store.renew(id);},
  };
}
