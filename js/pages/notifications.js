import {loadComponents} from '../core/component-loader.js';
import {frontendURL,resolveIcons} from '../core/path-resolver.js';
import {initShell,openDialog} from '../core/shell-init.js';
import {demoStore} from '../shared/demo-auth.js';
import {dashboardURL} from '../shared/navigation.js';
import {agentMembership} from '../shared/agent-store.js';
import {ADMIN_INBOX,createNotificationStore} from '../shared/notification-store.js';
import {notificationDestination} from '../shared/notification-targets.js';
import {refreshNotificationIndicators} from '../shared/notification-indicators.js';
const admin=document.body.dataset.notificationCenter==='admin',shell=admin?'admin':'account';
const $=selector=>document.querySelector(selector),el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!=null)node.textContent=text;if(cls)node.className=cls;return node;};
const icon=name=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','w-icon');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.dataset.icon=(admin?'admin-':'account-')+name;svg.append(use);return svg;};
const areas={owner:'account',broker:'broker',agency:'agency',agent:'agent'};
let account,records,store,host,list,count,feedback,allButton,filter=new URLSearchParams(location.search).get('filter')==='unread'?'unread':'all';
function fail(error){feedback.textContent=error.message||'تعذّر تحديث الإشعارات.';feedback.className='n-error';}
function preview(row,opener){const copy=$('#email-copy');copy.replaceChildren(el('strong','محاكاة مسجلة فقط — لم يُرسل بريد إلكتروني','n-email-stamp'));const dl=el('dl');for(const [label,value]of [['المستلم',row.recipient===ADMIN_INBOX?'صندوق إدارة تجريبي — لا يوجد عنوان إرسال فعلي':row.recipient],['الموضوع',row.title],['القناة','معاينة قالب محلية، دون اتصال بخدمة بريد']])dl.append(el('dt',label),el('dd',value));copy.append(dl,el('pre',row.text));openDialog($('#email-preview'),opener);}
function render(){
 const rows=store.list(),unread=rows.filter(x=>!x.read).length;count.textContent=`${unread} إشعارات غير مقروءة من ${rows.length}`;allButton.disabled=unread===0;list.replaceChildren();
 document.querySelectorAll('[data-notification-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.notificationFilter===filter)));
 const visible=rows.filter(row=>filter==='all'||!row.read);
 if(!visible.length){const empty=el('div',null,'n-empty');empty.append(icon('bell'),el('h2',filter==='unread'?'لا توجد إشعارات غير مقروءة':'لا توجد إشعارات بعد'),el('p','تظهر هنا تحديثات العمليات التجريبية الخاصة بهذا الصندوق.'));list.append(empty);}
 for(const row of visible){
  const article=el('article',null,'n-row'+(row.read?'':' unread'));const mood=row.type.endsWith('_rejected')?'error':row.type.endsWith('_approved')?'success':'warning',symbol=el('span',null,'n-icon '+mood);
  const name=admin?(row.type==='verification_requested'?'shield':row.type==='report_submitted'?'flag':row.type==='edit_submitted'?'edit':'building'):(mood==='error'?'alert':mood==='success'?'check':'clock');symbol.append(icon(name));
  const copy=el('div',null,'n-copy'),title=el('div');title.append(el('h3',row.title));if(!row.read){const dot=el('i');dot.setAttribute('aria-label','غير مقروء');title.append(dot);}copy.append(title,el('p',row.text),el('small',new Intl.DateTimeFormat('ar-EG',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Cairo'}).format(new Date(row.at))+' · داخل التطبيق وبريد محاكى غير مُرسل'));
  const actions=el('div',null,'n-actions'),destination=notificationDestination(row,account,records,sessionStorage,admin);
  if(destination){const link=el('a','عرض التفاصيل');link.href=destination;link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;try{store.mark(row.id,true);refreshNotificationIndicators(shell);}catch(error){event.preventDefault();fail(error);}});actions.append(link);}else actions.append(el('span','التفاصيل غير متاحة بالصلاحيات الحالية.'));
  const mark=el('button',row.read?'تعليم كغير مقروء':'تعليم كمقروء');mark.type='button';mark.setAttribute('aria-label',`${mark.textContent}: ${row.title}`);mark.addEventListener('click',()=>{try{store.mark(row.id,!row.read);feedback.textContent='تم تحديث حالة القراءة.';feedback.className='n-feedback';render();}catch(error){fail(error);}});
  const email=el('button','معاينة البريد المحاكى');email.type='button';email.addEventListener('click',()=>preview(row,email));actions.append(mark,email);article.append(symbol,copy,actions);list.append(article);
 }
 resolveIcons();refreshNotificationIndicators(shell);
}
await loadComponents();
try{
 host=$('[data-page-content]');if(admin){const {initAdminShell}=await import('../admin/shell.js');initAdminShell('notifications');$('.w-breadcrumbs span[aria-current]').textContent='إشعارات الإدارة';}
 else{
  account=demoStore().current();if(!account){const url=new URL(frontendURL('pages/auth.html'));url.searchParams.set('return',location.href);location.replace(url);}
  else{
   const membership=account.role==='agent'?agentMembership(sessionStorage,account.email):null,permissions=membership?.member.permissions||{};
   const route=key=>key==='notifications'?frontendURL('pages/account/notifications.html'):key==='favorites'?frontendURL('pages/favorites.html'):key==='home'?dashboardURL(account):frontendURL(`pages/${areas[account.role]||'account'}/${key==='add'?'property-form':key}.html`);
   initShell({shell:'account',role:account.role,permissions:{viewProperties:!!permissions.view,createProperty:!!permissions.view&&!!permissions.create},active:'notifications',routeFor:route});$('[data-user-name]').textContent=account.name;$('[data-preview-shell]').href=frontendURL('index.html');$('[data-account-breadcrumb] a').href=dashboardURL(account);
   const logout=el('button','تسجيل الخروج','w-button o-logout');logout.type='button';logout.addEventListener('click',()=>{demoStore().logout();location.href=frontendURL('index.html');});$('.w-account-sidebar').append(logout);
  }
 }
 if(admin||account){
  const response=await fetch(frontendURL('data/properties.json'));if(!response.ok)throw Error('تعذّر تحميل الروابط المرتبطة بالإشعارات.');records=await response.json();if(admin){const {bootstrapAdminNotifications}=await import('../admin/notification-bootstrap.js');bootstrapAdminNotifications(sessionStorage,records);}
  store=createNotificationStore(sessionStorage,admin?ADMIN_INBOX:account.email);host.classList.add(admin?'n-admin':'n-account');const heading=el('div',null,'n-heading'),copy=el('div');copy.append(el('h1',admin?'إشعارات الإدارة':'الإشعارات'),el('p',admin?'تابع مهام المراجعة والتحديثات الإدارية.':'تابع تحديثات العقارات والتوثيق الخاصة بحسابك.'));allButton=el('button','تعليم الكل كمقروء','n-link');allButton.type='button';allButton.addEventListener('click',()=>{try{store.markAll();feedback.textContent='تم تعليم إشعارات هذا الصندوق كمقروءة.';feedback.className='n-feedback';render();}catch(error){fail(error);}});heading.append(copy,allButton);host.append(heading,el('p','محاكاة في جلسة هذا التبويب فقط. البريد عبارة عن معاينة قالب مسجلة، ولم يتم إرسال أي رسالة. لا توجد مصادقة إدارية حقيقية.','n-note'));
  feedback=el('p','','n-feedback');feedback.setAttribute('role','status');count=el('p','','n-count');count.setAttribute('aria-live','polite');const panel=el('section',null,'n-panel'),tabs=el('div',null,'n-tabs');tabs.setAttribute('aria-label','تصفية الإشعارات');for(const [key,label]of [['all','الكل'],['unread','غير مقروء']]){const b=el('button',label);b.type='button';b.dataset.notificationFilter=key;b.addEventListener('click',()=>{filter=key;const url=new URL(location.href);if(key==='unread')url.searchParams.set('filter','unread');else url.searchParams.delete('filter');history.replaceState({},'',url);try{render();}catch(error){fail(error);}});tabs.append(b);}list=el('div',null,'n-list');panel.append(tabs,list);host.append(feedback,count,panel);render();
 }
}catch(error){const target=host||document.body;target.replaceChildren();const box=el('section',null,'n-empty');box.append(el('h1','تعذّر تحميل الإشعارات'),el('p',error.message));const retry=el('button','إعادة المحاولة','w-button');retry.type='button';retry.addEventListener('click',()=>location.reload());box.append(retry);target.append(box);}
document.documentElement.dataset.ready='true';
