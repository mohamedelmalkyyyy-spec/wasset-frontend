import {loadPropertyRecords} from '../shared/property-data.js';
import { frontendURL, resolveIcons } from '../core/path-resolver.js';
import { loadComponents } from '../core/component-loader.js';
import { initShell, openDialog } from '../core/shell-init.js';
import { createPropertyCard, publicProperties } from '../shared/property-cards.js';
import { publicRoute, resultsURL } from '../shared/public-routes.js';

const number = new Intl.NumberFormat('en-EG');
const entryLabels = {
  add: 'إضافة العقار', auth: 'تسجيل الدخول', favorites: 'المفضلة',
  property: 'تفاصيل العقار', advertiser: 'ملف المعلن', advanced: 'البحث المتقدم',
};
let records;
let eligible = [];
let form;

function entryURL(entry, id) {
  const url = new URL(frontendURL('index.html'));
  url.searchParams.set('entry', entry);
  if (id != null) url.searchParams.set('id', id);
  url.hash = 'demo-message';
  return url.href;
}

function showEntry(entry, id, opener) {
  if(entry==='add'){location.href=publicRoute('add');return;}
  if(['auth','register','favorites'].includes(entry)){location.href=publicRoute(entry);return;}
  if(entry==='property'||entry==='advertiser'){const url=new URL(frontendURL(`pages/${entry}.html`));url.searchParams.set('id',id);location.href=url;return;}
  const title = document.querySelector('#demo-title');
  const copy = document.querySelector('#demo-copy');
  title.textContent = entryLabels[entry] || 'معاينة وسيط';
  const property = eligible.find(item => item.id === Number(id));
  const user = records?.users.find(item => item.id === Number(id));
  if (entry === 'property') copy.textContent = property
    ? `الإعلان التجريبي: ${property.title}. صفحة التفاصيل غير متاحة في هذه الدفعة؛ لم يتم فتح إعلان حقيقي.`
    : 'هذا الإعلان التجريبي غير متاح.';
  else if (entry === 'advertiser') copy.textContent = user
    ? `${user.full_name}. صفحة ملف المعلن ستتوفر في دفعة لاحقة.`
    : 'ملف المعلن التجريبي غير متاح.';
  else if (entry === 'advanced') { location.href = resultsURL(currentQuery()); return; }
  else if (entry === 'favorites') copy.textContent = 'حفظ العقارات غير مفعّل في هذه الدفعة. لم تتم إضافة العقار إلى المفضلة أو حفظ أي بيانات.';
  else copy.textContent = `${entryLabels[entry] || 'هذه الصفحة'} ستتوفر في دفعة لاحقة. هذه نسخة تجريبية، ولم يتم إرسال أو حفظ أي بيانات.`;
  openDialog(document.querySelector('#demo-message'), opener);
}

function currentQuery() {
  const values = new URLSearchParams(new FormData(form));
  for (const [key, value] of [...values]) if (!value) values.delete(key);
  const keyword = new URLSearchParams(location.search).get('q');
  if (keyword) values.set('q', keyword.slice(0,200));
  return values;
}

function setTransaction(value) {
  form.elements.listing_type.value = value === 'rent' ? 'rent' : 'sale';
  form.querySelectorAll('[data-transaction]').forEach(button => {
    const active = button.dataset.transaction === form.elements.listing_type.value;
    button.classList.toggle('w-home-selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#rent-context').hidden = value !== 'rent';
}

function validatePrice() {
  const min = form.elements.min_price;
  const max = form.elements.max_price;
  min.removeAttribute('aria-invalid');
  max.removeAttribute('aria-invalid');
  let invalid;
  let message = '';
  if (!min.validity.valid || !max.validity.valid) {
    invalid = !min.validity.valid ? min : max;
    message = 'أدخل سعرًا صحيحًا غير سالب بالجنيه.';
  } else if (min.value && max.value && Number(min.value) > Number(max.value)) {
    invalid = max;
    message = 'السعر الأقصى يجب أن يكون أكبر من السعر الأدنى أو مساويًا له.';
  }
  document.querySelector('#search-error').textContent = message;
  if (invalid) {
    document.querySelector('#price-range').open = true;
    invalid.setAttribute('aria-invalid', 'true');
    invalid.focus();
    return false;
  }
  return true;
}

function updatePriceSummary() {
  const min = form.elements.min_price.value;
  const max = form.elements.max_price.value;
  document.querySelector('#price-summary').textContent = min || max
    ? `${min ? 'من ' + number.format(Number(min)) : ''}${min && max ? ' ' : ''}${max ? 'إلى ' + number.format(Number(max)) : ''}`
    : 'أي سعر';
}

function restoreSearch() {
  const query = new URLSearchParams(location.search);
  setTransaction(query.get('listing_type'));
  form.elements.property_type_id.value = records.property_types.some(item => item.id === query.get('property_type_id')) ? query.get('property_type_id') : '';
  form.elements.area_id.value = records.areas.some(item => item.id === query.get('area_id')) ? query.get('area_id') : '';
  for (const name of ['min_price', 'max_price']) {
    const value = query.get(name);
    form.elements[name].value = value && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? value : '';
  }
  updatePriceSummary();
  document.querySelector('#search-error').textContent = '';
  document.querySelector('#search-feedback').textContent = '';
}

function initSearch() {
  for (const category of [...records.property_categories].sort((a, b) => a.sort_order - b.sort_order)) {
    const group = document.createElement('optgroup');
    group.label = category.name;
    for (const type of records.property_types.filter(item => item.category_id === category.id)) group.append(new Option(type.name, type.id));
    form.elements.property_type_id.append(group);
  }
  for (const area of records.areas.filter(item => item.is_active)) form.elements.area_id.append(new Option(area.name, area.id));
  form.querySelectorAll('[data-transaction]').forEach(button => button.addEventListener('click', () => {
    setTransaction(button.dataset.transaction);
    // Sale totals and monthly rent ranges are not interchangeable.
    form.elements.min_price.value = '';
    form.elements.max_price.value = '';
    updatePriceSummary();
    document.querySelector('#search-error').textContent = '';
    document.querySelector('#search-feedback').textContent = '';
  }));
  document.querySelector('#apply-price').addEventListener('click', () => {
    if (!validatePrice()) return;
    updatePriceSummary();
    document.querySelector('#price-range').open = false;
    document.querySelector('#price-range summary').focus();
  });
  document.querySelector('#price-range').addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.currentTarget.open = false;
      event.currentTarget.querySelector('summary').focus();
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validatePrice()) return;
    updatePriceSummary();
    document.querySelector('#price-range').open = false;
    const query = currentQuery();
    location.href = resultsURL(query);
  });
  document.querySelector('#advanced-search').addEventListener('click', () => {
    if (validatePrice()) location.href = resultsURL(currentQuery()) + '#results-title';
  });
  restoreSearch();
  addEventListener('popstate', restoreSearch);
}

async function start() {
  await loadComponents(document,[],false);
  form = document.querySelector('#home-search');
  initShell({ shell: 'public', active: 'home', routeFor: publicRoute, onNavigate: (key, href) => {
    if (['home','listings','sale','rent','apartments','villas','land','commercial','auth','register','favorites','add'].includes(key)) location.href = href;
    else showEntry(key);
  }});
  try {
    records = await loadPropertyRecords();
    eligible = publicProperties(records);
    if (form) initSearch();
    const cards = document.querySelector('#latest-properties');
    const latest = [...eligible].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 6);
    cards.replaceChildren(...latest.map(property => createPropertyCard(property, records, {showDescription:true})));
    if (!latest.length) cards.textContent = 'لا توجد عقارات متاحة حاليًا.';
    document.querySelectorAll('[data-type-count]').forEach(el => { el.textContent = `${eligible.filter(p => p.property_type_id === el.dataset.typeCount).length} عقار تجريبي`; });
    document.querySelectorAll('[data-area-count]').forEach(el => { el.textContent = `${eligible.filter(p => p.area_id === el.dataset.areaCount).length} عقار تجريبي`; });
    document.querySelectorAll('[data-type], [data-area]').forEach(a => {
      const params = new URLSearchParams();
      params.set(a.dataset.type ? 'property_type_id' : 'area_id', a.dataset.type || a.dataset.area);
      a.href = resultsURL(params);
    });
    document.querySelectorAll('.w-home-view-all, .w-home-hero-actions a[href="#property-search"]').forEach(a => { a.href = resultsURL(); });
  } catch (error) {
    const message = document.createElement('p');
    message.className = 'w-load-error';
    message.setAttribute('role','alert');
    message.textContent = 'تعذّر تحميل العقارات التجريبية. '+error.message+' ';
    const retry = document.createElement('button');
    retry.className = 'w-button w-button--secondary';
    retry.textContent = 'إعادة المحاولة';
    retry.addEventListener('click', () => location.reload());
    message.append(retry);
    document.querySelector('#latest-properties').replaceChildren(message);
    form?.querySelectorAll('input,select,button').forEach(control => { control.disabled = true; });
    console.error('Homepage data failed:', error);
  }
  document.querySelectorAll('[data-entry]').forEach(a => a.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showEntry(a.dataset.entry, null, a);
  }));
  resolveIcons();
  const query = new URLSearchParams(location.search);
  if (Object.hasOwn(entryLabels, query.get('entry'))) showEntry(query.get('entry'), query.get('id'));
  document.documentElement.dataset.ready = 'true';
}

start();
