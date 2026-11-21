import {createVerificationStore,adminReports} from './trust-store.js';
import {REPORT_CATEGORIES} from '../shared/reports-store.js';
import {accountDirectory} from '../shared/account-directory.js';
import {initAdminShell,adminRoute} from './shell.js';
import {createModerationStore,moderatedRecords,proposed} from '../shared/moderation-store.js';
import {loadComponents} from '../core/component-loader.js';
import {frontendURL,resolveIcons} from '../core/path-resolver.js';
import {openDialog} from '../core/shell-init.js';
import {adminDemo} from '../../data/admin-demo.js';
import {adminSummary,ADMIN_PANELS} from './summary.js';

let summary,moderation;
const $=selector=>document.querySelector(selector);
const icon=name=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','w-icon');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.dataset.icon='admin-'+name;svg.append(use);return svg;};
function text(tag,value,className){const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;}
function detailFields(kind,row){
  if(kind==='listings')return [['الإعلان',row.title],['الرقم التجريبي',row.id],['نوع العقار',row.type],['المعاملة',row.deal],['المعلن',row.advertiser],['نوع المعلن',row.advertiserType],['تاريخ الإرسال في المثال',row.date],['الحالة',row.status]];
  if(kind==='verification')return [['الاسم',row.name],['نوع الحساب',row.type],['تاريخ الطلب في المثال',row.date],['الحالة',row.status]];
  return [['رقم البلاغ التجريبي',row.id],['العقار',row.property],['مقدم البلاغ',row.reporter],['السبب',row.reason],['تاريخ البلاغ في المثال',row.date],['الحالة',row.status]];
}
function definitionList(fields){const dl=document.createElement('dl');for(const [label,value]of fields){const div=document.createElement('div');div.append(text('dt',label),text('dd',value));dl.append(div);}return dl;}
function showDialog(title,content,opener){$('#admin-summary-title').textContent=title;$('#admin-summary-copy').replaceChildren(content);openDialog($('#admin-summary-dialog'),opener);}
function rowButton(kind,row){
  const button=document.createElement('a');button.href=row.reviewHref;button.className='a9-row'+(kind==='listings'?'':' a9-row-compact');
  if(kind==='listings'){const image=document.createElement('img');image.src=row.image;image.alt='';button.append(image);}
  else{const badge=document.createElement('span');badge.className='a9-quick-icon'+(kind==='reports'?' a9-quick-icon-terra':'');badge.append(icon(kind==='reports'?'flag':'shield'));button.append(badge);}
  const copy=document.createElement('span');copy.className='a9-row-copy';
  copy.append(text('b',kind==='listings'?row.title:kind==='verification'?row.name:row.reason),text('small',`${kind==='listings'?row.advertiser:kind==='verification'?row.type:row.property} · ${row.date}`));button.append(copy);
  if(kind==='listings')button.append(text('span',row.status,'a9-badge'));
  button.setAttribute('aria-label',`عرض ملخص ${kind==='listings'?row.title:kind==='verification'?row.name:row.id}`);
  return button;
}
function emptyState(kind){const [title,copy]=ADMIN_PANELS[kind].empty;const el=document.createElement('div');el.className='a9-empty';const badge=document.createElement('span');badge.append(icon('search'));el.append(badge,text('h3',title),text('p',copy));return el;}
function allRows(kind){const el=document.createElement('div');for(const row of summary[kind]){const h=text('h3',kind==='listings'?row.title:kind==='verification'?row.name:row.reason);el.append(h,definitionList(detailFields(kind,row)));}return summary[kind].length?el:emptyState(kind);}
function goPanel(kind){const panel=document.getElementById(ADMIN_PANELS[kind].id);panel.focus();panel.scrollIntoView({block:'start'});}
function currentNavigation(){const hash=location.hash;document.querySelectorAll('[data-nav-key]').forEach(a=>{const key=a.dataset.navKey;const active=hash?ADMIN_PANELS[key]?.id===hash.slice(1):key==='home';if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}

await loadComponents();
try{
  const response=await fetch(frontendURL('data/properties.json'));if(!response.ok)throw Error('تعذّر تحميل طلبات المراجعة.');const records=await response.json();moderation=createModerationStore(sessionStorage,records);const projected=moderatedRecords(records,sessionStorage);
  const listingRows=moderation.queue('listing').map(item=>{const p=proposed(item),user=projected.users.find(x=>x.id===item.property.user_id);const url=new URL(adminRoute('listing'));url.search=new URLSearchParams({role:item.role,account:item.account.id,id:String(item.property.id)});return {id:item.property.id,title:p.property.title,image:p.images[0],advertiser:user?.full_name||item.account.email,date:new Intl.DateTimeFormat('ar-EG').format(new Date(item.property.created_at)),status:'قيد المراجعة',reviewHref:url.href};});
  const verificationRows=createVerificationStore(sessionStorage,records).list().map(row=>{const url=new URL(adminRoute('verify'));url.searchParams.set('id',row.email);return {...row,name:row.user.full_name,reviewHref:url.href};});
  const reportRows=adminReports(sessionStorage,records).list().map(row=>{const url=new URL(adminRoute('report'));url.searchParams.set('id',row.id);return {...row,property:projected.properties.find(x=>x.id===row.property_id)?.title||row.property||'عقار غير متاح',reason:REPORT_CATEGORIES[row.category],reviewHref:url.href};});
  const directory=accountDirectory(sessionStorage,records);
  summary=adminSummary({...adminDemo,listings:listingRows,verification:verificationRows,reports:reportRows,users:directory.users,agencies:directory.agencies});
  const host=$('[data-page-content]');if(!host)throw Error('تعذّر تحميل لوحة الإدارة. أعد تحميل الصفحة.');host.append($('#admin-home-content').content.cloneNode(true));
  // Existing destinations are this dashboard's real panels. Future moderation routes stay hidden.

  initAdminShell('home');
  for(const [key,kind]of [['listings','listing'],['edits','edit']]){const badge=text('small',String(moderation.queue(kind).length));document.querySelector(`.w-side-nav [data-nav-key="${key}"]`).append(badge);}
  $('.w-side-nav').querySelectorAll('[data-nav-key]').forEach(a=>{if(!['home','edits','users','agencies','notifications',...Object.keys(ADMIN_PANELS)].includes(a.dataset.navKey))a.remove();});
  for(const [key,count]of [['verification',verificationRows.filter(x=>x.status==='قيد المراجعة').length],['reports',reportRows.filter(x=>['جديد','قيد المراجعة'].includes(x.status)).length]])document.querySelector(`.w-side-nav [data-nav-key="${key}"]`).append(text('small',String(count)));
  $('[data-preview-shell]').href=frontendURL('index.html');
  $('.w-breadcrumbs span[aria-current]').textContent='لوحة الإدارة';
  const counts=summary.counts;
  for(const [kind,number,label,symbol]of [['listings',counts.listings,'إعلاناً قيد المراجعة','building'],['verification',counts.verification,'طلبات توثيق','shield'],['reports',counts.reports,'بلاغات جديدة','flag'],['users',counts.users,`مستخدماً و${counts.agencies} مكاتب`,'users']]){
    const card=document.createElement('a');card.className='a9-stat';
    if(kind==='users'){card.href=adminRoute('users');}
    else{card.href=adminRoute(kind);}
    const badge=document.createElement('span');badge.append(icon(symbol));const copy=document.createElement('div');copy.append(text('strong',new Intl.NumberFormat('en-EG').format(number)),text('small',label));card.append(badge,copy,icon('arrow'));$('#admin-summary').append(card);
  }
  for(const [kind,panel]of Object.entries(ADMIN_PANELS)){
    const list=$(`[data-admin-list="${kind}"]`),rows=summary[kind].slice(0,panel.limit);list.replaceChildren(...(rows.length?rows.map(row=>rowButton(kind,row)):[emptyState(kind)]));
    const button=$(`[data-expand="${kind}"]`);button.setAttribute('aria-label','عرض كل '+panel.title);button.addEventListener('click',()=>{location.href=adminRoute(kind);});
  }
  window.addEventListener('hashchange',currentNavigation);currentNavigation();resolveIcons();
  const panel=Object.keys(ADMIN_PANELS).find(key=>'#'+ADMIN_PANELS[key].id===location.hash);if(panel)goPanel(panel);
}catch(error){const host=$('[data-page-content]')||document.body;const message=text('p',error.message||'تعذّر تحميل الملخص الإداري.','w-load-error');message.setAttribute('role','alert');host.append(message);}
document.documentElement.dataset.ready='true';
