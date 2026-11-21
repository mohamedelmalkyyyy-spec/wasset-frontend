import {frontendRoot} from '../core/path-resolver.js';
import {createModerationStore} from './moderation-store.js';
import {reportableProperty} from './reports-store.js';
import {agentMembership} from './agent-store.js';
const areas={owner:'account',broker:'broker',agency:'agency',agent:'agent'};
export function notificationDestination(row,account,records,storage,admin=false,root=frontendRoot){
 const target=row.target||{},url=path=>new URL(path,root);
 if(admin){
  if(['listing','edit'].includes(target.view)){
   const pending=createModerationStore(storage,records).queue(target.view).some(x=>x.role===target.role&&x.account.id===target.email&&x.property.id===target.id);
   const result=url(`pages/admin/${pending?target.view:target.view==='listing'?'listings':'edits'}.html`);
   if(pending)result.search=new URLSearchParams({role:target.role,account:target.email,id:String(target.id)});return result.href;
  }
  if(target.view==='verify'){const result=url('pages/admin/verify.html');result.searchParams.set('id',target.email);return result.href;}
  if(target.view==='report'){const result=url('pages/admin/report.html');result.searchParams.set('id',target.id);return result.href;}
  return url('pages/admin/notifications.html').href;
 }
 if(!account)return null;
 const home=url(areas[account.role]?`pages/${areas[account.role]}/index.html`:'pages/favorites.html').href;
 if(target.view!=='properties'||target.role!==account.role)return home;
 if(account.role==='agent'){
  const membership=agentMembership(storage,account.email);if(!membership?.member.permissions.view||membership.team.list().assignments[target.id]!==membership.member.id)return null;
 }
 if(row.type.endsWith('_approved')&&reportableProperty(records,storage,target.id)){const result=url('pages/property.html');result.searchParams.set('id',target.id);return result.href;}
 return areas[account.role]?url(`pages/${areas[account.role]}/properties.html`).href:home;
}
