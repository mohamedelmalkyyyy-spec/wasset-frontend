// Pure search/URL functions. No DOM, storage, network or backend schema changes.
export const PAGE_SIZE = 4;
export const AMENITIES = { elevator: 'أسانسير', garage: 'جراج', garden: 'حديقة', balcony: 'بلكونة' };
export const PAYMENTS = { cash: 'كاش', installments: 'تقسيط' };
export const FINISHING = ['سوبر لوكس', 'لوكس', 'نصف تشطيب', 'بدون تشطيب'];
export const SORTS = { newest: 'الأحدث', price_asc: 'الأقل سعرًا', price_desc: 'الأعلى سعرًا', area_desc: 'الأكبر مساحة' };
export const GROUPS = ['listing_type', 'category_id', 'property_type_id', 'area_id', 'bedrooms', 'bathrooms', 'finishing_type', 'amenity', 'payment_method', 'rent_period'];
export const RANGES = ['min_price', 'max_price', 'min_size', 'max_size'];
export function emptySearch() {
  return { ...Object.fromEntries(GROUPS.map(key => [key, []])), ...Object.fromEntries(RANGES.map(key => [key, ''])), q: '', sort: 'newest', page: 1, view: 'grid' };
}
export function allowedValues(records) {
  return {
    listing_type: ['sale', 'rent'], category_id: records.property_categories.map(x => String(x.id)),
    property_type_id: records.property_types.map(x => String(x.id)), area_id: records.areas.filter(x => x.is_active).map(x => String(x.id)),
    bedrooms: ['1','2','3','4+'], bathrooms: ['1','2','3','4+'], finishing_type: FINISHING,
    amenity: Object.keys(AMENITIES), payment_method: Object.keys(PAYMENTS), rent_period: ['month','year','day'],
  };
}
export function readSearch(params, records) {
  const state = emptySearch();
  const allowed = allowedValues(records);
  const warnings = [];
  for (const key of GROUPS) {
    const supplied = params.getAll(key).filter(Boolean);
    state[key] = [...new Set(supplied.filter(value => allowed[key].includes(value)))];
    if (supplied.some(value => !allowed[key].includes(value))) warnings.push(key === 'area_id'
      ? 'المنطقة المطلوبة غير موجودة ضمن مناطق مدينة السادات المتاحة؛ اختر منطقة من القائمة.'
      : 'تم تجاهل اختيار غير متاح في رابط البحث.');
  }
  for (const key of RANGES) state[key] = params.get(key) || '';
  state.q = (params.get('q') || '').slice(0, 200).trim();
  state.sort = Object.hasOwn(SORTS, params.get('sort')) ? params.get('sort') : 'newest';
  const page = Number(params.get('page'));
  state.page = Number.isSafeInteger(page) && page > 0 ? page : 1;
  state.view = params.get('view') === 'list' ? 'list' : 'grid';
  clearInapplicable(state, records);
  return { state, warnings: [...new Set(warnings)] };
}
export function writeSearch(state) {
  const params = new URLSearchParams();
  for (const key of GROUPS) for (const value of state[key]) params.append(key, value);
  for (const key of RANGES) if (state[key] !== '') params.set(key, state[key]);
  if (state.q) params.set('q', state.q);
  params.set('sort', state.sort);
  if (state.page > 1) params.set('page', String(state.page));
  if (state.view !== 'grid') params.set('view', state.view);
  return params;
}
export function applicability(state, records) {
  const types = records.property_types.filter(type => (!state.property_type_id.length || state.property_type_id.includes(String(type.id)))
    && (!state.category_id.length || state.category_id.includes(String(type.category_id))));
  return { bedrooms: types.some(type => type.category_id === 'residential'), bathrooms: types.some(type => type.category_id !== 'land'),
    finishing: types.some(type => type.category_id !== 'land'), payment: !state.listing_type.length || state.listing_type.includes('sale') };
}
export function clearInapplicable(state, records) {
  const enabled = applicability(state, records);
  if (!enabled.bedrooms) state.bedrooms = [];
  if (!enabled.bathrooms) state.bathrooms = [];
  if (!enabled.finishing) state.finishing_type = [];
  if (!enabled.payment) state.payment_method = [];
  if (state.listing_type.length && !state.listing_type.includes('rent')) state.rent_period = [];
}
export function validateRanges(state) {
  const errors = {};
  for (const key of RANGES) {
    if (state[key] === '') continue;
    const isPrice = key.includes('price');
    const valid = (isPrice ? /^\d+$/ : /^\d+(\.\d{1,2})?$/).test(state[key]);
    if (!valid || !Number.isFinite(Number(state[key])) || Number(state[key]) > Number.MAX_SAFE_INTEGER) errors[key] = isPrice
      ? 'أدخل سعرًا صحيحًا غير سالب بالجنيه.' : 'أدخل مساحة غير سالبة بالمتر المربع، بحد أقصى منزلتين عشريتين.';
  }
  for (const [min, max, label] of [['min_price','max_price','السعر'], ['min_size','max_size','المساحة']]) {
    if (!errors[min] && !errors[max] && state[min] !== '' && state[max] !== '' && Number(state[min]) > Number(state[max])) errors[max] = `${label}: الحد الأدنى يجب ألا يتجاوز الحد الأقصى.`;
  }
  return errors;
}
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').toLowerCase();
const matchesNumber = (selected, value) => !selected.length || (value != null && selected.some(n => n === '4+' ? value >= 4 : value === Number(n)));
export function filterProperties(properties, records, state, scenarios) {
  const has = (key, value) => !state[key].length || state[key].includes(String(value));
  return properties.filter(property => {
    const type = records.property_types.find(type => type.id === property.property_type_id);
    const demo = scenarios[String(property.id)] || {};
    if (!has('listing_type',property.listing_type) || !has('category_id',type?.category_id)
      || !has('property_type_id',property.property_type_id) || !has('area_id',property.area_id)) return false;
    if (state.q && !normalize(`${property.title} ${property.description}`).includes(normalize(state.q))) return false;
    for (const [key, value, minimum] of [['min_price',property.price,true],['max_price',property.price,false],['min_size',property.size_m2,true],['max_size',property.size_m2,false]]) {
      if (state[key] !== '' && (value == null || (minimum ? value < Number(state[key]) : value > Number(state[key])))) return false;
    }
    if (state.bedrooms.length && type?.category_id !== 'residential') return false;
    if (state.bathrooms.length && type?.category_id === 'land') return false;
    if (!matchesNumber(state.bedrooms,property.bedrooms) || !matchesNumber(state.bathrooms,property.bathrooms)) return false;
    if (!has('finishing_type',property.finishing_type)) return false;
    if (state.amenity.length && !state.amenity.some(value => demo.amenities?.includes(value))) return false;
    if (state.payment_method.length && (property.listing_type !== 'sale' || !state.payment_method.some(value => demo.paymentMethods?.includes(value)))) return false;
    if (state.rent_period.length && (property.listing_type !== 'rent' || !has('rent_period',property.rent_period))) return false;
    return true;
  });
}
export function comparablePrices(properties) {
  // Sale totals and rental periods must never be treated as comparable amounts.
  const units = new Set(properties.map(property => property.listing_type === 'sale' ? 'sale' : `rent:${property.rent_period || 'unknown'}`));
  return units.size <= 1 && !units.has('rent:unknown');
}
export function sortProperties(properties, sort) {
  const blocked = sort.startsWith('price_') && !comparablePrices(properties);
  const effective = blocked ? 'newest' : sort;
  const result = [...properties].sort((a,b) => {
    const delta = effective === 'price_asc' ? a.price-b.price : effective === 'price_desc' ? b.price-a.price
      : effective === 'area_desc' ? b.size_m2-a.size_m2 : Date.parse(b.created_at)-Date.parse(a.created_at);
    return delta || String(a.id).localeCompare(String(b.id));
  });
  return { properties: result, blocked };
}
export function paginate(properties, page, size = PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(properties.length / size));
  const current = Math.min(Math.max(1,page),pages);
  return { items:properties.slice((current-1)*size,current*size), page:current, pages };
}
