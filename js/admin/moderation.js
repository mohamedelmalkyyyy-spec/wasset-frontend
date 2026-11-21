import {loadComponents} from '../core/component-loader.js';
import {frontendURL,resolveIcons} from '../core/path-resolver.js';
import {openDialog} from '../core/shell-init.js';
import {initAdminShell,adminRoute} from './shell.js';
import {createModerationStore,proposed,snapshot,moderatedRecords} from '../shared/moderation-store.js';
const $=s=>document.querySelector(s),page=document.body.dataset.reviewPage;
const kind=['edits','edit'].includes(page)?'edit':'listing',inventory=kind==='edit'?'edits':'listings';
const titles={listings:'مراجعة الإعلانات',listing:'مراجعة الإعلان',edits:'مراجعة التعديلات',edit:'مراجعة التعديلات المقترحة'};
const labels={title:'عنوان الإعلان',price:'السعر',description:'وصف العقار',size_m2:'المساحة',listing_type:'المعاملة',property_type_id:'نوع العقار',area_id:'المنطقة',bedrooms:'غرف النوم',bathrooms:'الحمامات',floor:'الدور',finishing_type:'التشطيب',rent_period:'فترة الإيجار'};
let records,displayRecords,store,host,selection,confirmation;
const el=(tag,value,cls)=>{const node=document.createElement(tag);if(value!=null)node.textContent=value;if(cls)node.className=cls;return node;};
const icon=name=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','w-icon');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.dataset.icon='admin-'+name;svg.append(use);return svg;};
function link(label,href,cls='admin-secondary'){const a=el('a',label,cls);a.href=href;return a;}
function button(label,action,cls='admin-primary'){const b=el('button',label,cls);b.type='button';b.addEventListener('click',()=>action(b));return b;}
function image(url){const img=el('img');img.src=url;img.alt='صورة العقار التوضيحية';return img;}
function empty(title,copy){const box=el('section',null,'admin-panel b9-empty');box.append(icon('search'),el('h2',title),el('p',copy));return box;}
function format(key,value){if(value==null||value==='')return 'غير مسجل';if(key==='property_type_id')return records.property_types.find(x=>x.id===value)?.name||value;if(key==='area_id')return records.areas.find(x=>x.id===value)?.name||value;if(key==='listing_type')return value==='rent'?'إيجار':'بيع';if(key==='rent_period')return {month:'شهري',year:'سنوي',day:'يومي'}[value]||value;if(key==='price')return new Intl.NumberFormat('en-EG').format(value)+' جنيه';if(key==='size_m2')return value+' م²';return String(value);}
function advertiser(item){return displayRecords.users.find(x=>x.id===item.property.user_id)||{full_name:item.account.email,role_id:item.role};}
function reviewURL(item){const url=new URL(adminRoute(kind));url.searchParams.set('role',item.role);url.searchParams.set('account',item.account.id);url.searchParams.set('id',item.property.id);url.searchParams.set('from',location.href);return url.href;}
function backURL(){try{const url=new URL(new URLSearchParams(location.search).get('from'));if(url.origin===location.origin&&url.pathname===new URL(adminRoute(inventory)).pathname)return url.href;}catch{}return adminRoute(inventory);}
function heading(){const box=el('div',null,'admin-heading'),copy=el('div');copy.append(el('h1',titles[page]),el('p',kind==='edit'?'راجع التغييرات المهمة المقترحة مع إبقاء البيانات المعتمدة ظاهرة للعامة.':'راجع بيانات العقار والمعلن بعناية قبل اتخاذ القرار.'));box.append(copy);return box;}
function changedFields(item){const p=proposed(item);return [...Object.keys(labels).filter(key=>JSON.stringify(item.property[key]??null)!==JSON.stringify(p.property[key]??null)),...(JSON.stringify(item.images)!==JSON.stringify(p.images)?['images']:[])];}
function table(items){
  const panel=el('section',null,'admin-panel table-panel'),wrap=el('div',null,'admin-table-wrap'),t=el('table');
  const columns=kind==='listing'?['صورة العقار','عنوان الإعلان','نوع العقار','المعلن','تاريخ الإرسال','حالة المراجعة','الإجراءات']:['الإعلان','المعلن','الحقول المعدلة','تاريخ الطلب','الحالة','الإجراءات'];
  const head=el('thead'),hr=el('tr');columns.forEach(x=>{const th=el('th',x);th.scope='col';hr.append(th);});head.append(hr);const body=el('tbody');
  for(const item of items){const row=el('tr'),data=proposed(item),p=data.property,user=advertiser(item);const cell=(label,...nodes)=>{const td=el('td');td.dataset.label=label;td.append(...nodes);row.append(td);};
    if(kind==='listing'){
      const img=data.images[0]?image(data.images[0]):el('span','لا توجد صورة');img.className='table-thumb';cell('صورة العقار',img);
      cell('عنوان الإعلان',el('b',p.title),el('small',`${item.property.id} · ${format('listing_type',p.listing_type)}`));cell('نوع العقار',el('span',format('property_type_id',p.property_type_id)));
      cell('المعلن',el('b',user.full_name),el('small',({owner:'مالك',broker:'سمسار',agency:'مكتب عقاري'})[item.role]));
      cell('تاريخ الإرسال',el('span',new Intl.DateTimeFormat('ar-EG').format(new Date(item.property.created_at))));
    }else{
      cell('الإعلان',el('b',item.property.title),el('small',String(item.property.id)));cell('المعلن',el('span',user.full_name));
      const fields=changedFields(item);cell('الحقول المعدلة',...fields.map(key=>el('span',key==='images'?'الصور':labels[key],'change-chip')),...(!fields.length?[el('span','لا توجد فروق في البيانات')]:[]));
      cell('تاريخ الطلب',el('span','غير مسجل في بيانات العرض'));
    }
    cell('الحالة',el('span','قيد المراجعة','a9-badge'));cell('الإجراءات',link(kind==='listing'?'مراجعة':'مقارنة',reviewURL(item),'table-action'));body.append(row);
  }t.append(head,body);wrap.append(t);panel.append(wrap);return panel;
}
function listPage(){
  const queue=store.queue(kind),filters=el('form',null,'admin-filters b9-filters');filters.setAttribute('aria-label','تصفية طلبات المراجعة');
  const q=el('input');q.type='search';q.placeholder='ابحث بعنوان الإعلان أو اسم المعلن...';q.setAttribute('aria-label','البحث في الطلبات');q.className='admin-search';q.name='q';filters.append(q);
  const selects={};for(const [key,label,values]of [['type','نوع العقار',records.property_types.map(x=>[x.id,x.name])],['deal','المعاملة',[['sale','بيع'],['rent','إيجار']]],['role','نوع المعلن',[['owner','مالك'],['broker','سمسار'],['agency','مكتب عقاري']]]]){const select=el('select');select.name=key;select.setAttribute('aria-label',label);select.append(new Option('كل '+label,''));values.forEach(([value,text])=>select.append(new Option(text,value)));filters.append(select);selects[key]=select;}
  const date=el('input');date.type='date';date.name='date';date.setAttribute('aria-label','تاريخ الإرسال');date.disabled=kind==='edit';filters.append(date);
  const params=new URLSearchParams(location.search);for(const input of filters.elements)input.value=params.get(input.name)||'';
  const count=el('p',null,'b9-feedback');count.setAttribute('role','status');const results=el('div');
  function render(){const query=q.value.trim().toLowerCase();const items=queue.filter(item=>{const p=proposed(item).property;return (!query||`${p.title} ${advertiser(item).full_name}`.toLowerCase().includes(query))&&(!selects.type.value||p.property_type_id===selects.type.value)&&(!selects.deal.value||p.listing_type===selects.deal.value)&&(!selects.role.value||item.role===selects.role.value)&&(!date.value||item.property.created_at.slice(0,10)===date.value);});
    count.textContent=`${items.length} طلب قيد المراجعة`;results.replaceChildren(items.length?table(items):empty(queue.length?'لا توجد نتائج بحث':'لا توجد طلبات معلقة',queue.length?'جرّب تغيير الفلاتر.':'ستظهر هنا طلبات المعلنين التجريبية عند إرسالها من صفحات الحساب.'));
    const url=new URL(location.href);for(const input of filters.elements){if(input.value)url.searchParams.set(input.name,input.value);else url.searchParams.delete(input.name);}history.replaceState({},'',url);
  }filters.addEventListener('submit',event=>event.preventDefault());filters.addEventListener('input',render);host.append(filters,count,results);render();
}
function photos(images){const gallery=el('div',null,'review-gallery');if(!images.length)return empty('لا توجد صور','لا يمكن الموافقة على إعلان دون صور صالحة.');gallery.append(image(images[0]));if(images.length>1){const side=el('div');images.slice(1,3).forEach(url=>side.append(image(url)));side.append(button(`عرض كل الصور (${images.length})`,opener=>{const all=$('#all-photos');all.replaceChildren(...images.map(image));openDialog($('#photos-dialog'),opener);},'admin-secondary'));gallery.append(side);}return gallery;}
function decisionBox(item){const box=el('section',null,'admin-panel decision-box');box.append(el('h3','قرار المراجعة'),el('p',kind==='edit'?'ستظل البيانات المعتمدة كما هي حتى الموافقة.':'لن يظهر الإعلان للعامة قبل الموافقة عليه.'),button(kind==='edit'?'الموافقة على التعديلات':'الموافقة على الإعلان',opener=>confirm(item,'approve',opener)),button('رفض مع ذكر السبب',opener=>confirm(item,'reject',opener),'admin-danger'));return box;}
function listingPage(item){const data=proposed(item),p=data.property,user=advertiser(item);const layout=el('div',null,'admin-detail-layout'),main=el('div',null,'admin-detail-main'),side=el('aside',null,'admin-review-side');
  const panel=el('section',null,'admin-panel property-review');panel.append(photos(data.images));const title=el('div',null,'review-title'),copy=el('div');copy.append(el('span',`${format('property_type_id',p.property_type_id)} · ${format('listing_type',p.listing_type)}`),el('h2',p.title),el('p',`${format('area_id',p.area_id)}، مدينة السادات، المنوفية`));title.append(copy,el('strong',format('price',p.price)));panel.append(title);
  const specs=el('div',null,'spec-grid');for(const key of ['size_m2','bedrooms','bathrooms','finishing_type','floor'])if(p[key]!=null){const cell=el('div');cell.append(el('small',labels[key]),el('b',format(key,p[key])));specs.append(cell);}const id=el('div');id.append(el('small','رقم الإعلان'),el('b',String(item.property.id)));specs.append(id);panel.append(specs);
  const description=el('section',null,'admin-panel prose-review');description.append(el('h2','وصف العقار'),el('p',p.description));const amenities=el('section',null,'admin-panel');amenities.append(el('h2','المميزات والخدمات'),el('p','لا توجد بيانات مميزات مسجلة لهذا الطلب.','b9-note'));main.append(panel,description,amenities);
  const advertiserBox=el('section',null,'admin-panel advertiser-box');advertiserBox.append(el('span','بيانات المعلن','section-label'));const who=el('div',null,'advertiser-head');who.append(el('span',user.full_name[0]));const info=el('div');info.append(el('h3',user.full_name),el('p',({owner:'مالك',broker:'سمسار مستقل',agency:'مكتب عقاري'})[item.role]));who.append(info);advertiserBox.append(who,el('p',user.is_verified?'موثق':'غير موثق','b9-status'),el('p',user.phone||'رقم الهاتف غير مسجل','b9-note'));
  const url=new URL(frontendURL('pages/advertiser.html'));url.searchParams.set('id',user.id);advertiserBox.append(link('عرض ملف المعلن',url.href));side.append(advertiserBox,decisionBox(item));layout.append(main,side);host.append(layout);
}
function comparisonPage(item){const note=el('div',null,'comparison-note');note.append(icon('shield'),el('b','الإعلان المنشور محمي — هذه التعديلات لم تظهر للعامة بعد.'));const grid=el('div',null,'comparison-grid'),proposal=proposed(item);const changes=changedFields(item);
  for(const proposedSide of [false,true]){const panel=el('section',null,'admin-panel'+(proposedSide?' proposed':'')),head=el('div',null,'compare-head'+(proposedSide?'':' current')),copy=el('span');copy.append(el('h2',proposedSide?'التعديلات المقترحة':'البيانات المعتمدة حالياً'),el('p',proposedSide?'الطلب الحالي قيد المراجعة':'المعروضة للعامة الآن'));head.append(icon(proposedSide?'edit':'check'),copy);panel.append(head);const content=el('div',null,'compare-content');
    for(const key of Object.keys(labels)){const value=(proposedSide?proposal.property:item.property)[key];if(value==null&&!changes.includes(key))continue;const field=el('label',null,proposedSide&&changes.includes(key)?'changed':'');const caption=el('span',labels[key]);if(proposedSide&&changes.includes(key))caption.append(el('b','تم التغيير'));field.append(caption,el(key==='price'?'strong':'p',format(key,value)));content.append(field);}
    const field=el('label',null,proposedSide&&changes.includes('images')?'changed':''),caption=el('span','صور العقار');if(proposedSide&&changes.includes('images'))caption.append(el('b','تم التغيير'));const images=el('div',null,'compare-images b9-pictures');(proposedSide?proposal.images:item.images).forEach(url=>images.append(image(url)));field.append(caption,images);content.append(field);panel.append(content);grid.append(panel);
  }const actions=el('div',null,'sticky-actions');actions.append(el('span','هل راجعت جميع التغييرات؟'),button('رفض التعديلات',opener=>confirm(item,'reject',opener),'admin-danger'),button('الموافقة على التعديلات',opener=>confirm(item,'approve',opener)));host.append(note,grid,actions);
}
function confirm(item,decision,opener){confirmation={key:item.key,decision,expected:snapshot(item,kind)};$('#decision-title').textContent=decision==='reject'?'تأكيد الرفض':'تأكيد الموافقة';$('#decision-copy').textContent=decision==='reject'?'يجب توضيح سبب الرفض ليتمكن صاحب الطلب من معرفة المطلوب.':'هل أنت متأكد؟ سيتم تحديث بيانات العرض في هذه الجلسة فقط.';$('#reason-field').hidden=decision!=='reject';$('#decision-form').reset();$('#decision-form').elements.reason.required=decision==='reject';$('#decision-form').elements.reason.setAttribute('aria-invalid','false');$('#decision-error').textContent='';$('#confirm-decision').disabled=false;$('#confirm-decision').textContent=decision==='reject'?'تأكيد الرفض':'تأكيد الإجراء';openDialog($('#review-dialog'),opener);}

await loadComponents();
try{
  initAdminShell(inventory);host=$('[data-page-content]');$('.w-breadcrumbs span[aria-current]').textContent=titles[page];
  const response=await fetch(frontendURL('data/properties.json'));if(!response.ok)throw Error('تعذّر تحميل بيانات العقارات.');records=await response.json();displayRecords=moderatedRecords(records,sessionStorage);store=createModerationStore(sessionStorage,records);
  host.append(heading(),el('p','مراجعة إدارية تجريبية في نفس التبويب. لا توجد مصادقة إدارية أو إشعارات فعلية.','b9-note'));
  if(['listings','edits'].includes(page))listPage();else{
    host.prepend(link('العودة إلى '+titles[inventory],backURL(),'b9-back'));const params=new URLSearchParams(location.search);selection=store.queue(kind).find(x=>x.role===params.get('role')&&x.account.id===params.get('account')&&String(x.property.id)===params.get('id'));
    if(!selection)host.append(empty('الطلب غير متاح','تحقّق من الرابط أو ارجع إلى القائمة. ربما تمت مراجعة هذا الطلب.'));else if(kind==='edit')comparisonPage(selection);else listingPage(selection);
  }
  for(const [key,reviewKind]of [['listings','listing'],['edits','edit']]){const a=$(`.w-side-nav [data-nav-key="${key}"]`);a.append(el('small',String(store.queue(reviewKind).length)));}
  $('#decision-form').addEventListener('submit',event=>{
    event.preventDefault();if(!confirmation)return;const reason=event.currentTarget.elements.reason;
    if(confirmation.decision==='reject'&&!reason.value.trim()){$('#decision-error').textContent='سبب الرفض مطلوب لإكمال الإجراء.';reason.setAttribute('aria-invalid','true');reason.focus();return;}
    $('#confirm-decision').disabled=true;try{store.decide(confirmation.key,kind,confirmation.decision,reason.value,confirmation.expected);$('#review-dialog').close();const result=el('section',null,'admin-panel b9-result');result.append(icon('check'),el('h2',confirmation.decision==='approve'?'تمت الموافقة':'تم رفض الطلب'),el('p',confirmation.decision==='approve'?'تم تحديث بيانات العرض التجريبية. تظل الإتاحة ومدة الإعلان مطبقتين.':'سبب الرفض: '+reason.value.trim()),link('العودة إلى '+titles[inventory],backURL()));if(confirmation.decision==='approve'){const url=new URL(frontendURL('pages/property.html'));url.searchParams.set('id',selection.property.id);result.append(link('عرض العقار',url.href));}host.replaceChildren(result);confirmation=null;for(const [key,k]of [['listings','listing'],['edits','edit']])$(`.w-side-nav [data-nav-key="${key}"] small`).textContent=store.queue(k).length;resolveIcons();}
    catch(error){$('#decision-error').textContent=error.message;$('#confirm-decision').disabled=false;}
  });resolveIcons();
}catch(error){const target=$('[data-page-content]')||document.body;target.append(empty('تعذّر تحميل المراجعة',error.message));}
document.documentElement.dataset.ready='true';
