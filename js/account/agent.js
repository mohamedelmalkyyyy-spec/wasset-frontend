// Source-derived publisher controls; owner controller and templates remain untouched.
import {loadComponents} from '../core/component-loader.js';
import {frontendURL,frontendRoot,resolveIcons} from '../core/path-resolver.js';
import {initShell,openDialog} from '../core/shell-init.js';
import {demoStore} from '../shared/demo-auth.js';
import {createAgentStore,STATUS,AVAILABILITY} from '../shared/agent-store.js';
import {createPropertyCard} from '../shared/property-cards.js';
import {journeyURL,contextBackURL} from '../shared/navigation.js';
const $=selector=>document.querySelector(selector);
const page=document.body.dataset.ownerPage;
const route=key=>frontendURL(`pages/agent/${key==='home'?'index':key==='add'?'property-form':key}.html`);
let records,account,store;
const permissions=()=>store.membership().member.permissions;
const aicon=name=>`<svg class="w-icon" aria-hidden="true"><use data-icon="account-${name}"></use></svg>`;
function notify(text){$('#owner-feedback').textContent=text;}
function effective(item){return item.property.status==='published'&&item.term&&item.term<=Date.now()?'expired':item.property.status;}
function dialog(title,copy,action,opener){$('#assignment-field')?.remove();$('#owner-dialog-title').textContent=title;$('#owner-dialog-copy').textContent=copy;const button=$('#confirm-action');button.hidden=!action;button.disabled=false;button.onclick=()=>{button.disabled=true;try{action();$('#owner-dialog').close();}catch(error){notify(error.message);$('#owner-dialog').close();}};openDialog($('#owner-dialog'),opener);}
function cell(row,label){const td=document.createElement('td');td.dataset.label=label;row.append(td);return td;}
function table(items){
  const wrap=document.createElement('div');wrap.className='w-table-wrap';
  const t=document.createElement('table');t.className='w-table';t.innerHTML='<thead><tr><th scope="col">العقار</th><th scope="col">السعر</th><th scope="col">حالة الإعلان</th><th scope="col">تاريخ الانتهاء</th><th scope="col">الإجراءات</th></tr></thead><tbody></tbody>';
  for(const item of items){const p=item.property,row=document.createElement('tr');
    const title=cell(row,'العقار'),box=document.createElement('div');box.className='o-table-property';
    if(item.images[0]){const img=document.createElement('img');img.src=item.images[0];img.alt='';box.append(img);}
    const name=document.createElement('span');name.textContent=p.title;const area=document.createElement('small');area.textContent=records.areas.find(x=>x.id===p.area_id)?.name||'';name.append(area);box.append(name);title.append(box);
    cell(row,'السعر').textContent=`${new Intl.NumberFormat('en-EG').format(p.price)} جنيه${p.listing_type==='rent'?' / '+({month:'شهر',year:'سنة',day:'يوم'}[p.rent_period]||''):''}`;
    const badge=document.createElement('span');const status=effective(item);badge.className='w-badge w-badge--'+({published:'approved',pending:'pending',rejected:'rejected',expired:'expired'}[status]||'pending');badge.textContent=STATUS[status]||STATUS.pending;const statusCell=cell(row,'الحالة');statusCell.append(badge);
    if(item.pending){const note=document.createElement('small');note.className='o-status-note';note.textContent='تعديلات قيد المراجعة';statusCell.append(note);}
    if(item.rejectionReason){const reason=document.createElement('small');reason.className='o-status-note';reason.textContent='سبب الرفض: '+item.rejectionReason;statusCell.append(reason);}
    cell(row,'الانتهاء').textContent=item.term?new Intl.DateTimeFormat('ar-EG').format(item.term):'بعد موافقة الإدارة';
    const actions=document.createElement('div');actions.className='o-actions';
    const edit=document.createElement('a');edit.className='w-button w-button--secondary';edit.href=route('add')+'?'+new URLSearchParams({mode:'edit',id:String(p.id),from:location.href});edit.textContent='تعديل';if(permissions().edit)actions.append(edit);
    if(p.status==='published'){
      const view=document.createElement('a');view.className='w-button';view.href=journeyURL('property',p.id);view.textContent='عرض';actions.append(view);
      const renew=document.createElement('button');renew.type='button';renew.className='w-button';renew.textContent='تجديد 30 يوم';renew.addEventListener('click',()=>dialog('تجديد الإعلان',`تجدد «${p.title}» لمدة 30 يومًا إضافية؟ يبدأ التمديد من الأبعد: اليوم أو نهاية المدة الحالية. التجديد يدوي ولا ينشر أي تعديلات معلّقة.`,()=>{store.renew(p.id);notify('تم تمديد المدة التجريبية 30 يومًا.');renderList();},renew));if(permissions().manage)actions.append(renew);
    }
    const availability=document.createElement('select');availability.setAttribute('aria-label',`إتاحة ${p.title}`);for(const [key,label]of Object.entries(AVAILABILITY))availability.append(new Option(label,key));availability.value=item.availability;
    availability.addEventListener('change',()=>{const value=availability.value;availability.value=item.availability;dialog('تحديث إتاحة العقار',`تأكيد تغيير إتاحة «${p.title}» إلى «${AVAILABILITY[value]}»؟ البيع أو التأجير يخفي الإعلان عن التصفح العام.`,()=>{store.availability(p.id,value);notify('تم تحديث الإتاحة التجريبية.');renderList();},availability);});if(permissions().manage)actions.append(availability);
    cell(row,'الإجراءات').append(actions);t.querySelector('tbody').append(row);
  }wrap.append(t);if(!items.length){const empty=document.createElement('div');empty.className='w-empty';empty.textContent='لا توجد عقارات مطابقة ضمن حسابك.';wrap.replaceChildren(empty);}return wrap;
}
function renderList(){
  const all=store.list(records),filteredStatus=$('#status-filter')?$('#status-filter').value:new URLSearchParams(location.search).get('status')||'';
  $('#agency-request-summary').textContent=`إعلانات جديدة قيد المراجعة: ${all.filter(x=>x.property.status==='pending').length} · طلبات تعديل قيد المراجعة: ${all.filter(x=>x.pending).length}`;
  if(page==='index'){
    $('#counts').replaceChildren();for(const [key,label]of [['','جميع العقارات'],...Object.entries(STATUS)]){const a=document.createElement('a');a.className='o-stat';a.href=route('properties')+(key?'?status='+key:'');const image=document.createElement('span');image.className='ag-stat-icon ag-stat-'+key;image.innerHTML=aicon(({pending:'clock',published:'check',rejected:'alert',expired:'refresh'})[key]||'building');a.append(image);const n=document.createElement('strong');n.textContent=all.filter(x=>!key||effective(x)===key).length;const span=document.createElement('small');span.textContent=label;const info=document.createElement('div');info.append(n,span);a.append(info);a.insertAdjacentHTML('beforeend',aicon('chevron'));$('#counts').append(a);}
  }
  if(page==='index'){
    const nearest=all.filter(x=>x.term&&x.availability==='available').sort((a,b)=>a.term-b.term)[0];
    $('#expiry-title').textContent=nearest?`أقرب انتهاء خلال ${Math.max(0,Math.ceil((nearest.term-Date.now())/86400000))} يوم`:'لا توجد إعلانات نشطة لها مدة انتهاء';
  }
  const query=$('#query')?.value.trim()||'';
  const items=all.filter(x=>(!filteredStatus||effective(x)===filteredStatus)&&x.property.title.includes(query)).sort((a,b)=>Date.parse(b.property.created_at)-Date.parse(a.property.created_at));
  $('#property-table').replaceChildren(table(page==='index'?items.slice(0,3):items));
  if($('#status-tabs')){$('#status-tabs').replaceChildren();for(const [key,label]of [['','الكل'],...Object.entries(STATUS)]){const a=document.createElement('a');a.href=route('properties')+(key?'?status='+key:'');a.textContent=`${label} (${all.filter(x=>!key||effective(x)===key).length})`;if(key===filteredStatus)a.setAttribute('aria-current','page');a.addEventListener('click',e=>{e.preventDefault();$('#status-filter').value=key;history.replaceState({},'',a.href);renderList();});$('#status-tabs').append(a);}}
}
function initializeForm(){
  const params=new URLSearchParams(location.search),editingRequest=params.has('id')||params.get('mode')==='edit';
  if(!permissions().view||!permissions()[editingRequest?'edit':'create']){denied('لا تملك صلاحية '+(editingRequest?'تعديل هذا العقار.':'إضافة عقار.'));return;}
  const idParam=new URLSearchParams(location.search).get('id');const editing=new URLSearchParams(location.search).get('mode')==='edit'||idParam!=null;
  const selected=editing?store.list(records).find(x=>String(x.property.id)===idParam):null;
  if(editing&&!selected){denied('هذا العقار غير مسند إليك أو لم تعد لديك صلاحية عرضه.');return;}
  const form=$('#owner-form');let step=0,images=[...(selected?.pending?.images||selected?.images||[])],reading=false;
  if(editing){$('#form-title').textContent='تعديل العقار';$('#edit-warning').hidden=false;}
  const fill=(name,items)=>{for(const [value,label]of items)form.elements[name].append(new Option(label,value));};
  fill('listing_type',[['sale','بيع'],['rent','إيجار']]);fill('category',records.property_categories.map(x=>[x.id,x.name]));
  fill('area_id',records.areas.filter(x=>x.is_active).map(x=>[x.id,x.name]));fill('rent_period',[['month','شهري'],['year','سنوي'],['day','يومي']]);fill('finishing_type',[['','غير محدد'],...['سوبر لوكس','لوكس','نصف تشطيب','بدون تشطيب'].map(x=>[x,x])]);
  function typeOptions(value){form.elements.property_type_id.replaceChildren();fill('property_type_id',records.property_types.filter(x=>x.category_id===form.elements.category.value).map(x=>[x.id,x.name]));if(value)form.elements.property_type_id.value=value;}
  const initial=selected?.pending?.property||selected?.property;
  if(initial)form.elements.category.value=records.property_types.find(x=>x.id===initial.property_type_id).category_id;
  typeOptions(initial?.property_type_id);
  if(initial)for(const key of Object.keys(initial))if(form.elements[key])form.elements[key].value=initial[key]??'';
  function applicable(){const residential=form.elements.category.value==='residential',land=form.elements.category.value==='land';
    for(const [key,enabled]of Object.entries({bedrooms:residential,bathrooms:!land,floor:!land,finishing_type:!land,rent_period:form.elements.listing_type.value==='rent'})){form.elements[key].disabled=!enabled;form.elements[key].closest('label').hidden=!enabled;}
    form.elements.bedrooms.required=residential;form.elements.bathrooms.required=residential;
  }
  form.elements.category.addEventListener('change',()=>{typeOptions();applicable();});form.elements.listing_type.addEventListener('change',applicable);applicable();
  function value(){const p={};for(const key of ['title','description','listing_type','property_type_id','area_id','finishing_type','rent_period'])p[key]=form.elements[key].value;
    for(const key of ['price','size_m2','bedrooms','bathrooms','floor'])p[key]=form.elements[key].disabled||form.elements[key].value===''?null:Number(form.elements[key].value);return p;
  }
  function validate(index){let first;form.querySelectorAll(`[data-step="${index}"] input,[data-step="${index}"] select,[data-step="${index}"] textarea`).forEach(input=>{
    input.setCustomValidity('');if(input.required&&typeof input.value==='string'&&!input.value.trim())input.setCustomValidity('هذا الحقل مطلوب.');
    if(input.name==='title'&&input.value.trim().length<3)input.setCustomValidity('أدخل عنوانًا من 3 أحرف على الأقل.');
    const valid=input.disabled||input.checkValidity();input.setAttribute('aria-invalid',String(!valid));const error=form.querySelector(`[data-error="${input.name}"]`);if(error){error.textContent=valid?'':'أدخل قيمة صحيحة لهذا الحقل.';error.id=`error-${input.name}`;input.setAttribute('aria-describedby',error.id);}if(!valid&&!first)first=input;
  });if(index===3&&(!images.length||reading)){$('#image-error').textContent=reading?'انتظر تحميل الصور.':'أضف صورة واحدة على الأقل.';return false;}if(first){first.focus();return false;}return true;}
  function paintImages(){const host=$('#images');host.replaceChildren();images.forEach((src,i)=>{const box=document.createElement('div'),img=document.createElement('img');img.src=src;img.alt=`صورة العقار ${i+1}`;box.append(img);const label=document.createElement('small');label.textContent=i===0?'الصورة الرئيسية':'';box.append(label);for(const [text,fn]of [['↑',()=>{if(i){[images[i-1],images[i]]=[images[i],images[i-1]];paintImages();}}],['حذف',()=>{images.splice(i,1);paintImages();}]]){const button=document.createElement('button');button.type='button';button.textContent=text;button.setAttribute('aria-label',text==='↑'?`تحريك صورة ${i+1} للأعلى`:`حذف صورة ${i+1}`);button.addEventListener('click',fn);box.append(button);}host.append(box);});}
  $('#image-input').addEventListener('change',async event=>{
    const files=[...event.target.files];$('#image-error').textContent='';reading=true;$('#next').disabled=true;
    try{if(images.length+files.length>6)throw new Error('الحد الأقصى 6 صور.');if(files.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)))throw new Error('اختر JPG أو PNG أو WebP فقط.');
      if(files.reduce((n,f)=>n+f.size,0)+images.filter(x=>x.startsWith('data:')).reduce((n,x)=>n+x.length*.75,0)>2*1024*1024)throw new Error('مجموع الصور الجديدة يجب ألا يتجاوز 2 ميجابايت.');
      const added=[];for(const file of files){const image=await createImageBitmap(file);image.close();added.push(await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);}));}images.push(...added);paintImages();
    }catch(error){$('#image-error').textContent=error.message||'تعذّر قراءة الصورة.';}finally{reading=false;$('#next').disabled=false;event.target.value='';}
  });
  function paint(){form.querySelectorAll('[data-step]').forEach(el=>{el.hidden=Number(el.dataset.step)!==step;});document.querySelectorAll('[data-step-label]').forEach(el=>{if(Number(el.dataset.stepLabel)===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});$('#previous').hidden=step===0;$('#next').textContent=step===4?(editing?'إرسال التعديلات للمراجعة':'إرسال الإعلان للمراجعة'):'التالي';
    if(step===4){const p={...value(),id:selected?.property.id||1000,user_id:2,status:'pending'};const display={...records,property_images:images.map((url,i)=>({property_id:p.id,url,is_main:i===0,sort_order:i}))};const card=createPropertyCard(p,display,{});card.inert=true;$('#review-card').replaceChildren(card);}
  }
  $('#previous').addEventListener('click',()=>{step=Math.max(0,step-1);paint();});
  form.addEventListener('submit',event=>{event.preventDefault();if(step<4){if(!validate(step))return;step++;paint();return;}
    for(let i=0;i<4;i++)if(!validate(i)){step=i;paint();return;}
    $('#next').disabled=true;try{store.submit(value(),images,selected?.property.id??null);$('[data-page-content]').innerHTML='<section class="o-panel o-success"><h1>تم إرسال الإعلان للمراجعة</h1><p>لن تظهر التغييرات للعامة قبل موافقة الإدارة. تظل البيانات المعتمدة كما هي.</p><a class="w-button w-button--primary" href="properties.html" data-return-inventory>الرجوع لعقاراتي</a></section>';document.querySelector('[data-return-inventory]').href=contextBackURL();}
    catch(error){notify(error.message);$('#next').disabled=false;}
  });paintImages();paint();
}

function denied(message){
 const panel=document.createElement('section');panel.className='w-empty';const h=document.createElement('h1');h.textContent='الإجراء غير متاح';const p=document.createElement('p');p.textContent=message;const back=document.createElement('a');back.className='w-button';back.href=route('home');back.textContent='لوحة الحساب';panel.append(h,p,back);$('[data-page-content]').replaceChildren(panel);
}
await loadComponents();
try{
 account=demoStore().current();
 if(!account){const url=new URL(frontendURL('pages/auth.html'));url.searchParams.set('return',location.href);location.replace(url);}
 else if(account.role!=='agent'){denied('هذه الصفحات لموظف المكتب المدعو فقط. سجّل الدخول ببريد دعوة المكتب.');}
 else{
  store=createAgentStore(sessionStorage,account);const membership=store.membership();store.initialize();
  const response=await fetch(frontendURL('data/properties.json'));if(!response.ok)throw Error('تعذّر تحميل بيانات العقارات.');records=await response.json();
  const reference=await fetch(frontendURL(`pages/account/${page}.html`));if(!reference.ok)throw Error('تعذّر تحميل قالب الحساب.');
  const source=new DOMParser().parseFromString(await reference.text(),'text/html');const template=source.querySelector('#owner-content');
  if(page==='index'){const view=await fetch(frontendURL('components/account/agent-overview.html'));if(!view.ok)throw Error('تعذّر تحميل لوحة الموظف.');template.innerHTML=await view.text();}
  document.body.append(document.importNode(source.querySelector('#owner-dialog'),true));
  const host=$('[data-page-content]');host.append(template.content.cloneNode(true));
  if(page==='properties')host.querySelector('h1').textContent='العقارات المسندة لي';
  if(page==='index')$('#agent-welcome').textContent=`أهلاً ${membership.member.name}، تابع العقارات المسندة ليك والمهام المتاحة حسب صلاحياتك.`;
  const feedback=document.createElement('p');feedback.id='owner-feedback';feedback.className='o-notice';feedback.setAttribute('role','status');host.prepend(feedback);
  const intro=document.createElement('p');intro.className='o-session';intro.textContent='حساب موظف تجريبي مرتبط بدعوة المكتب. تُحفظ الصلاحيات والإسنادات في هذه الجلسة فقط؛ لا يمثل ذلك تسجيل دخول حقيقيًا. لا تنشر الإعلانات أو التعديلات قبل موافقة الإدارة.';host.prepend(intro);
  if(page!=='property-form'){const requests=document.createElement('p');requests.id='agency-request-summary';requests.className='o-session';host.prepend(requests);}
  const p=permissions();
  initShell({shell:'account',role:'agent',permissions:{viewProperties:p.view,createProperty:p.view&&p.create},active:page==='index'?'home':page==='properties'?'properties':'add',routeFor:route,onNavigate:(_,href)=>{location.href=href;}});
  const propertyLink=$('.w-side-nav [data-nav-key="properties"]');if(propertyLink?.lastChild)propertyLink.lastChild.textContent='العقارات المسندة لي';
  $('[data-user-name]').textContent=membership.member.name;$('[data-preview-shell]').href=frontendURL('index.html');
  const logout=document.createElement('button');logout.className='w-button o-logout';logout.textContent='تسجيل الخروج';logout.addEventListener('click',()=>{demoStore().logout();location.href=frontendURL('index.html');});$('.w-account-sidebar').append(logout);
  host.querySelectorAll('a[href="property-form.html"]').forEach(a=>{if(!p.view||!p.create)a.remove();});
  host.querySelectorAll('[data-agent-manage]').forEach(a=>{if(!p.view||!p.manage)a.remove();});
  if(page==='property-form')initializeForm();
  else if(!p.view){denied('تم إيقاف صلاحية عرض العقارات. راجع مدير المكتب.');}
  else{
   if($('#status-filter')){for(const [key,label]of [['','الكل'],...Object.entries(STATUS)])$('#status-filter').append(new Option(label,key));$('#status-filter').value=new URLSearchParams(location.search).get('status')||'';$('#status-filter').addEventListener('change',()=>{const url=new URL(location.href);const value=$('#status-filter').value;if(value)url.searchParams.set('status',value);else url.searchParams.delete('status');history.replaceState({},'',url);renderList();});$('#query').addEventListener('input',renderList);}
   renderList();
  }
  resolveIcons();
 }
}catch(error){denied(error.message||'تعذّر استخدام جلسة الموظف.');}
document.documentElement.dataset.ready='true';
