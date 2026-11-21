import {frontendRoot,frontendURL} from '../core/path-resolver.js';
import {safeReturn} from './demo-auth.js';
export const DASHBOARDS={owner:'pages/account/index.html',broker:'pages/broker/index.html',agency:'pages/agency/index.html',agent:'pages/agent/index.html',seeker:'pages/favorites.html',admin:'pages/admin/index.html'};
export function dashboardURL(account){return frontendURL(DASHBOARDS[account?.role]||'index.html');}
export function publisherURL(account){const path=DASHBOARDS[account?.role];return path&&['owner','broker','agency','agent'].includes(account.role)?frontendURL(path.replace('index.html','property-form.html')):null;}
export function afterLogin(account,params,root=frontendRoot){
  const base=new URL(root);const dashboard=new URL(DASHBOARDS[account?.role]||'index.html',base).href;
  if(params.get('intent')==='publish'){
    if(!['owner','broker','agency','agent'].includes(account?.role))return null;
    const url=new URL(DASHBOARDS[account.role].replace('index.html','property-form.html'),base);
    if(params.get('return'))url.searchParams.set('from',safeReturn(params.get('return'),base));return url.href;
  }
  if(!params.get('return'))return dashboard;
  const target=safeReturn(params.get('return'),base);const path=new URL(target).pathname.slice(base.pathname.length);
  if(path==='pages/account/notifications.html')return target;
  const privateArea=/^pages\/(account|broker|agency|agent)\//.exec(path)?.[1];
  if(privateArea&&privateArea!==({owner:'account',broker:'broker',agency:'agency',agent:'agent'}[account?.role]))return dashboard;
  return target;
}
export function journeyURL(kind,id,source=location.href){
  const origin=new URL(safeReturn(source,frontendRoot));
  const from=safeReturn(origin.searchParams.get('from')||origin.href,frontendRoot);
  origin.searchParams.delete('back');
  const url=new URL(frontendURL(`pages/${kind}.html`));url.searchParams.set('id',id);url.searchParams.set('from',from);url.searchParams.set('back',origin.href);return url.href;
}
export function contextBackURL(){
  const params=new URLSearchParams(location.search),from=params.get('back')||params.get('from');
  if(/\/pages\/(account|broker|agency|agent)\/property-form\.html$/.test(location.pathname)){
    const inventory=new URL('properties.html',location.href);
    if(from){const candidate=new URL(safeReturn(from,frontendRoot));if(candidate.pathname===inventory.pathname)return candidate.href;}
    return inventory.href;
  }
  if(from)return safeReturn(from,frontendRoot);
  if(/\/pages\/(account|broker|agency|agent)\//.test(location.pathname))return new URL('properties.html',location.href).href;
  return frontendURL('pages/properties.html');
}
export function initPageNavigation(shell){
  if(location.pathname.includes('/preview/')||location.pathname.endsWith('/foundation-preview.html'))return;
  const isAccount=shell==='account';
  if(isAccount){

    const path=location.pathname.split('/').at(-1);const area=location.pathname.split('/').at(-2);
    const host=document.querySelector('[data-page-content]');
    if(host&&!host.querySelector('[data-account-breadcrumb]')){
      const nav=document.createElement('nav');nav.className='w-breadcrumbs';nav.dataset.accountBreadcrumb='';nav.setAttribute('aria-label','مسار التنقل');
      const home=document.createElement('a');home.href=new URL('index.html',location.href);home.textContent='لوحة الحساب';nav.append(home);
      if(path==='property-form.html'){const list=document.createElement('a');list.href=contextBackURL();list.textContent=' › عقاراتي';nav.append(list);}
      const current=document.createElement('span');current.textContent=' › '+({ 'index.html':'نظرة عامة','properties.html':area==='agency'?'عقارات المكتب':'عقاراتي','employees.html':'إدارة الموظفين','notifications.html':'الإشعارات','property-form.html':new URLSearchParams(location.search).has('id')?'تعديل عقار':'إضافة عقار'}[path]||'الحساب');current.setAttribute('aria-current','page');nav.append(current);host.prepend(nav);
    }
    document.querySelector('#agency-profile')?.setAttribute('hidden','');
  }
  if(/\/pages\/(property|advertiser)\.html$/.test(location.pathname)){
    const nav=document.querySelector('.w-breadcrumbs');if(nav){
      const link=document.createElement('a');link.href=contextBackURL();link.textContent='العودة إلى الصفحة السابقة';link.dataset.contextBack='';
      const crumb=nav.querySelector('a[href="properties.html"]');if(crumb){const origin=new URL(safeReturn(new URLSearchParams(location.search).get('from'),frontendRoot));crumb.href=origin.pathname.endsWith('/pages/properties.html')?origin.href:frontendURL('pages/properties.html');}
      nav.before(link);
    }
  }
}
export function refreshPublicActive(){
  const path=location.pathname;let key=path.endsWith('/index.html')||path.endsWith('/')?'home':path.endsWith('/favorites.html')?'favorites':'listings';
  if(path.endsWith('/properties.html')){const values=new URLSearchParams(location.search).getAll('listing_type');if(values.length===1&&['sale','rent'].includes(values[0]))key=values[0];}
  document.querySelectorAll('.w-public-nav [data-nav-key],.w-public-actions [data-nav-key],.w-public-mobile > [data-nav-key]').forEach(link=>{if(link.dataset.navKey===key)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
}
