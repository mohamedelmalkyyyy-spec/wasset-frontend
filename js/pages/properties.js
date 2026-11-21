import {loadPropertyRecords} from '../shared/property-data.js';
import { frontendURL, resolveIcons } from '../core/path-resolver.js';
import { loadComponents } from '../core/component-loader.js';
import { initShell, openDialog } from '../core/shell-init.js';
import { createPropertyCard, publicProperties } from '../shared/property-cards.js';
import { publicRoute, resultsURL } from '../shared/public-routes.js';
import {refreshPublicActive} from '../shared/navigation.js';
import { searchScenarios } from '../../data/search-scenarios.js';
import { AMENITIES, PAYMENTS, FINISHING, GROUPS, RANGES, emptySearch, readSearch, writeSearch, validateRanges, applicability, clearInapplicable, filterProperties, sortProperties, paginate } from '../shared/search-engine.js';

let records, eligible = [], state = emptySearch(), form, quick, labels = {}, historyTimer;
const $ = selector => document.querySelector(selector);

function options() {
  labels = {
    listing_type:{sale:'للبيع',rent:'للإيجار'},
    category_id:Object.fromEntries(records.property_categories.map(x=>[x.id,x.name])),
    property_type_id:Object.fromEntries(records.property_types.map(x=>[x.id,x.name])),
    area_id:Object.fromEntries(records.areas.filter(x=>x.is_active).map(x=>[x.id,x.name])),
    bedrooms:{'1':'1','2':'2','3':'3','4+':'4+'}, bathrooms:{'1':'1','2':'2','3':'3','4+':'4+'},
    finishing_type:Object.fromEntries(FINISHING.map(x=>[x,x])), amenity:AMENITIES, payment_method:PAYMENTS,
    rent_period:{month:'شهري',year:'سنوي',day:'يومي'},
  };
  for (const key of GROUPS) {
    const host = form.querySelector(`[data-options="${key}"]`);
    for (const [value,label] of Object.entries(labels[key])) {
      const wrapper = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox'; input.name = key; input.value = value;
      const span = document.createElement('span'); span.textContent = label;
      wrapper.append(input,span); host.append(wrapper);
    }
  }
  for (const key of ['property_type_id','area_id']) {
    for (const [value,label] of Object.entries(labels[key])) quick.elements[key].append(new Option(label,value));
  }
}

function syncControls() {
  for (const key of GROUPS) form.querySelectorAll(`[name="${key}"]`).forEach(input => { input.checked = state[key].includes(input.value); });
  for (const key of RANGES) if (form.elements[key].value !== state[key]) form.elements[key].value = state[key];
  quick.elements.q.value = state.q;
  for (const key of ['property_type_id','area_id']) quick.elements[key].value = state[key].length > 1 ? '__multiple' : state[key][0] || '';
  document.querySelectorAll('[data-quick-transaction]').forEach(button => button.setAttribute('aria-pressed',String(state.listing_type.includes(button.dataset.quickTransaction))));
  $('#sort-order').value = state.sort;
  document.querySelectorAll('button[data-view]').forEach(button => button.setAttribute('aria-pressed',String(state.view === button.dataset.view)));
  $('#property-results').dataset.view = state.view;
  const applicable = applicability(state, records);
  for (const [key,enabled] of Object.entries({bedrooms:applicable.bedrooms,bathrooms:applicable.bathrooms,finishing_type:applicable.finishing,payment_method:applicable.payment,rent_period:!state.listing_type.length || state.listing_type.includes('rent')})) {
    form.querySelector(`[data-fieldset="${key}"]`).disabled = !enabled;
  }
  $('#quick-price-label').textContent = state.min_price || state.max_price
    ? `${state.min_price ? 'من '+state.min_price : ''} ${state.max_price ? 'إلى '+state.max_price : ''}`.trim() : 'أي سعر';
}

function syncURL(mode = 'push') {
  clearTimeout(historyTimer);
  const url = resultsURL(writeSearch(state));
  if (url !== location.href) history[mode === 'replace' ? 'replaceState' : 'pushState']({},'',url);
  refreshPublicActive();
}

function change(next, { delayed = false, resetPage = true } = {}) {
  if (!delayed) clearTimeout(historyTimer);
  const previous = state;
  state = { ...state, ...next };
  if (resetPage) state.page = 1;
  // Numeric sale totals and rent periods should not inherit each other's range.
  if (next.listing_type && String(previous.listing_type) !== String(next.listing_type)) { state.min_price = ''; state.max_price = ''; }
  clearInapplicable(state,records);
  syncControls(); render();
  if (delayed) { clearTimeout(historyTimer); historyTimer = setTimeout(() => syncURL(),250); }
  else syncURL();
}

function chipItems() {
  const items = [];
  for (const key of GROUPS) for (const value of state[key]) items.push({key,value,label: `${key==='bedrooms'?'غرف النوم: ':key==='bathrooms'?'حمامات: ':''}${labels[key][value]}`});
  const names = {min_price:'السعر من',max_price:'السعر إلى',min_size:'المساحة من',max_size:'المساحة إلى'};
  for (const key of RANGES) if (state[key] !== '') items.push({key,value:state[key],label:`${names[key]} ${state[key]} ${key.includes('price')?'جنيه':'م²'}`});
  if (state.q) items.push({key:'q',value:state.q,label:`البحث: ${state.q}`});
  return items;
}

function renderChips() {
  const chips = chipItems();
  const host = $('#active-filters'); host.replaceChildren();
  for (const item of chips) {
    const button = document.createElement('button'); button.type='button';
    button.textContent = item.label + ' ×'; button.setAttribute('aria-label',`إزالة فلتر ${item.label}`);
    button.addEventListener('click', () => {
      change({[item.key]:GROUPS.includes(item.key)?state[item.key].filter(x=>x!==item.value):''});
      $('#results-title').focus({preventScroll:true});
    }); host.append(button);
  }
  if (chips.length) {
    const clear = document.createElement('button'); clear.className='w-listings-clear-chip'; clear.textContent='مسح الكل';
    clear.addEventListener('click',reset); host.append(clear);
  }
  document.querySelectorAll('[data-filter-count]').forEach(el=>{el.textContent=chips.length;});
  $('#search-summary').textContent = chips.length ? `مدينة السادات · ${chips.length} اختيارات بحث مطبّقة` : 'كل العقارات المتاحة في مدينة السادات';
}

function entryURL(entry,id) {
  const url = new URL(resultsURL(writeSearch(state)));
  url.searchParams.set('entry',entry); url.searchParams.set('id',id); return url.href;
}
function showEntry(entry,id,opener) {
  if(entry==='favorites'){location.href=publicRoute('favorites');return;}
  if(entry==='property'||entry==='advertiser'){const url=new URL(frontendURL(`pages/${entry}.html`));url.searchParams.set('id',id);location.href=url;return;}
  const property = eligible.find(x=>String(x.id)===String(id));
  const user = records.users.find(x=>String(x.id)===String(id));
  $('#demo-title').textContent = entry==='property'?'تفاصيل العقار':entry==='advertiser'?'ملف المعلن':'المفضلة';
  $('#demo-copy').textContent = entry==='property'
    ? property ? `${property.title}. صفحة التفاصيل ستتوفر في الدفعة الرابعة؛ هذا إعلان تجريبي.` : 'هذا الإعلان غير متاح.'
    : entry==='advertiser' ? `${user?.full_name || 'المعلن'}. ملف المعلن غير متاح في هذه الدفعة.`
    : 'المفضلة غير مفعّلة في هذه الدفعة. لم يتم حفظ العقار؛ ستتوفر هذه الوظيفة في الدفعة الخامسة.';
  openDialog($('#demo-message'),opener);
}

function render() {
  renderChips();
  const errors = validateRanges(state);
  for (const key of RANGES) {
    form.elements[key].setAttribute('aria-invalid',String(!!errors[key]));
    $(`#error-${key}`).textContent=errors[key] || '';
  }
  const invalid = Object.keys(errors).length > 0;
  const matches = invalid ? [] : filterProperties(eligible,records,state,searchScenarios);
  const sorted = sortProperties(matches,state.sort);
  const page = paginate(sorted.properties,state.page); state.page=page.page;
  $('#results-error').hidden=!invalid;
  $('#results-error').textContent=invalid?'صحّح نطاق السعر أو المساحة لإظهار النتائج.':'';
  $('#sort-notice').hidden=!sorted.blocked;
  $('#sort-notice').textContent=sorted.blocked?'لترتيب السعر، اختر البيع فقط أو إيجارات بفترة واحدة. لا نقارن إجمالي البيع بالإيجار أو فترات إيجار مختلفة؛ تُعرض النتائج بالأحدث حاليًا.':'';
  $('#results-count').textContent=invalid?'تعذّر تطبيق البحث بسبب نطاق غير صحيح.':`لقينا ${matches.length} عقار مناسب لاختياراتك`;
  document.querySelectorAll('[data-mobile-results]').forEach(el=>{el.textContent=invalid?'راجع النطاق':`${matches.length} عقار`;});
  $('#filter-live-count').textContent=invalid?'صحّح النطاق قبل التطبيق':`${matches.length} عقار مطابق`;
  const host=$('#property-results'); host.setAttribute('aria-busy','false');
  host.replaceChildren(...page.items.map(property=>createPropertyCard(property,records,{routeFor:entryURL,onAction:showEntry,amenities:searchScenarios[String(property.id)]?.amenities || []})));
  $('#empty-results').hidden=invalid || matches.length>0;
  $('#empty-title').textContent=eligible.length?'لا توجد نتائج مطابقة':'لا توجد عقارات متاحة حاليًا';
  $('#empty-copy').textContent=eligible.length?'جرّب توسيع نطاق السعر أو المساحة، أو امسح الفلاتر.':'يمكنك العودة لاحقًا للاطلاع على العقارات الجديدة.';
  $('#empty-results [data-reset]').hidden=!eligible.length;
  const pagination=$('#pagination'); pagination.replaceChildren();
  if (!invalid && matches.length && page.pages>1) {
    const button=(label,target,disabled,current=false)=>{
      const el=document.createElement('button'); el.type='button'; el.textContent=label; el.disabled=disabled;
      if(current)el.setAttribute('aria-current','page');
      el.setAttribute('aria-label', typeof label==='number'?`الصفحة ${label}`:label);
      el.addEventListener('click',()=>{change({page:target},{resetPage:false});$('#results-title').focus();}); pagination.append(el);
    };
    button('السابق',page.page-1,page.page===1);
    for(let n=1;n<=page.pages;n++)button(n,n,false,n===page.page);
    button('التالي',page.page+1,page.page===page.pages);
  }
}

function reset() {
  clearTimeout(historyTimer); state=emptySearch();
  $('#location-warning').hidden=true;
  syncControls(); render(); syncURL();
}
function restore() {
  clearTimeout(historyTimer);
  const restored=readSearch(new URLSearchParams(location.search),records); state=restored.state;
  $('#location-warning').textContent=restored.warnings.join(' '); $('#location-warning').hidden=!restored.warnings.length;
  syncControls(); render(); syncURL('replace');
}
function initFilters() {
  form.addEventListener('change', event=>{
    const key=event.target.name;
    if(GROUPS.includes(key))change({[key]:[...form.querySelectorAll(`[name="${key}"]:checked`)].map(x=>x.value)});
  });
  form.addEventListener('input',event=>{
    if(RANGES.includes(event.target.name))change({[event.target.name]:event.target.value},{delayed:true});
  });
  form.addEventListener('submit',event=>{
    event.preventDefault(); clearTimeout(historyTimer); syncURL();
    const errors=validateRanges(state);
    if(Object.keys(errors).length){form.elements[Object.keys(errors)[0]].focus();return;}
    $('#filter-dialog').close();
    $('#results-title').focus();
  });
  document.querySelectorAll('[data-reset]').forEach(button=>button.addEventListener('click',reset));
  quick.addEventListener('submit',event=>{event.preventDefault();syncURL();$('#results-title').focus();});
  quick.elements.q.addEventListener('input',event=>change({q:event.target.value},{delayed:true}));
  for(const key of ['property_type_id','area_id'])quick.elements[key].addEventListener('change',event=>{
    const next={[key]:event.target.value?[event.target.value]:[]};
    if(key==='property_type_id')next.category_id=[];
    change(next);
  });
  document.querySelectorAll('[data-quick-transaction]').forEach(button=>button.addEventListener('click',()=>change({listing_type:[button.dataset.quickTransaction]})));
  $('#sort-order').addEventListener('change',event=>change({sort:event.target.value}));
  document.querySelectorAll('button[data-view]').forEach(button=>button.addEventListener('click',()=>change({view:button.dataset.view},{resetPage:false})));
  const mobile=matchMedia('(max-width:620px)');
  const relocate=()=>{if(!mobile.matches)$('#filter-dialog').close();$(mobile.matches?'#filter-mobile':'#filter-desktop').append(form);};
  mobile.addEventListener('change',relocate); relocate();
  $('#edit-price').addEventListener('click',event=>{
    if(mobile.matches)openDialog($('#filter-dialog'),event.currentTarget);
    form.elements.min_price.focus();
  });
  addEventListener('popstate',restore);
}

async function fetchRecords() {
  $('#load-error').hidden=true;
  $('#property-results').setAttribute('aria-busy','true');
  try {
    records=await loadPropertyRecords(); eligible=publicProperties(records);
    options(); initFilters();
    const initial=new URLSearchParams(location.search);
    restore();
    if(['property','advertiser','favorites'].includes(initial.get('entry')))showEntry(initial.get('entry'),initial.get('id'));
    document.documentElement.dataset.ready='true';
  } catch(error) {
    $('#load-error').hidden=false; $('#load-error p').textContent='تعذّر تحميل العقارات. '+error.message; $('#property-results').replaceChildren(); $('#property-results').setAttribute('aria-busy','false');
    $('#results-count').textContent='تعذّر تحميل النتائج.';
    document.querySelectorAll('#property-filters input,#property-filters button,#quick-search input,#quick-search select,#quick-search button,#sort-order').forEach(el=>{el.disabled=true;});
    console.error('Property results failed:',error);
  }
}

await loadComponents(document,[],false);
form=$('#property-filters'); quick=$('#quick-search');
initShell({shell:'public',active:'listings',routeFor:publicRoute});
$('#retry-data').addEventListener('click',()=>location.reload());
if(form && $('#property-card-template'))await fetchRecords();
