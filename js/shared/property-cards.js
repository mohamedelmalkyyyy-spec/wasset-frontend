import {browserModerationHiddenIds} from './moderation-store.js';
import { frontendURL, resolveIcons } from '../core/path-resolver.js';
import { AMENITIES } from './search-engine.js';
import { updateFavoriteButton, initFavoriteControls } from './favorites.js';
import { browserHiddenIds } from './owner-store.js';
import { browserBrokerHiddenIds } from './broker-store.js';
import { browserAgencyHiddenIds } from './agency-store.js';
import {journeyURL} from './navigation.js';

const number = new Intl.NumberFormat('en-EG');

// Demo status vocabulary only. Expiry/renewal requires the future backend contract.
export function publicProperties(records) {
  const hidden=[...browserModerationHiddenIds(records),...browserHiddenIds(),...browserBrokerHiddenIds(),...browserAgencyHiddenIds()];
  return records.properties.filter(property => property.status === 'published'
    && !hidden.includes(property.id)
    && records.users.some(user => user.id === property.user_id && user.is_active)
    && records.areas.some(area => area.id === property.area_id && area.is_active));
}

export function createPropertyCard(property, records, { routeFor, onAction, showDescription = false, amenities = [], template = document.querySelector('#property-card-template') }) {
  if (!template) throw new Error('Property card template was not loaded');
  const card = template.content.firstElementChild.cloneNode(true);
  const type = records.property_types.find(item => item.id === property.property_type_id);
  const category = records.property_categories.find(item => item.id === type?.category_id);
  const area = records.areas.find(item => item.id === property.area_id);
  const user = records.users.find(item => item.id === property.user_id);
  const role = records.roles.find(item => item.id === user?.role_id);
  const image = records.property_images.filter(item => item.property_id === property.id)
    .sort((a, b) => Number(b.is_main) - Number(a.is_main) || a.sort_order - b.sort_order)[0];
  card.dataset.propertyId = property.id;
  const set = (selector, text) => { card.querySelector(selector).textContent = text; };
  set('[data-card-title]', property.title);
  if(showDescription&&property.description){
    const description=document.createElement('p');
    description.className='w-place';
    description.dataset.cardDescription='';
    description.textContent=property.description.length>100?property.description.slice(0,97)+'…':property.description;
    card.querySelector('h3').after(description);
  }
  set('[data-card-advertiser]', role?.name || 'المعلن');
  set('[data-card-category]', category?.name || '');
  set('[data-card-location]', `${area?.name || 'مدينة السادات'}، مدينة السادات`);
  set('[data-card-size]', `${number.format(property.size_m2)} م²`);
  // Residential room fields are not fabricated for shops, offices or land.
  const specs = category?.id === 'residential'
    ? [property.bedrooms != null ? `${property.bedrooms} غرف` : '', property.bathrooms != null ? `${property.bathrooms} حمام` : ''].filter(Boolean).join(' · ')
    : property.description.length>72?property.description.slice(0,69)+'…':property.description;
  set('[data-card-specs]', specs);
  if (amenities.length) {
    const list = document.createElement('div');
    list.className = 'w-property-amenities';
    list.setAttribute('aria-label', 'مميزات تجريبية');
    const icons = {elevator:'elevator',garage:'car',garden:'leaf',balcony:'balcony'};
    for (const value of amenities.filter(value => Object.hasOwn(AMENITIES,value))) {
      const item = document.createElement('span');
      item.innerHTML = `<svg class="w-icon" aria-hidden="true"><use data-icon="public-${icons[value]}"></use></svg>`;
      item.append(document.createTextNode(AMENITIES[value]));
      list.append(item);
    }
    card.querySelector('.w-property-bottom').before(list);
  }
  const rental = property.listing_type === 'rent';
  const period = { month: 'شهر', year: 'سنة', day: 'يوم' }[property.rent_period];
  set('[data-card-price]', `${number.format(property.price)} جنيه${rental && period ? ' / ' + period : ''}`);
  set('[data-card-transaction]', rental ? 'للإيجار' : 'للبيع');
  card.querySelector('[data-card-transaction]').classList.toggle('w-rent', rental);
  card.querySelector('[data-card-verified]').hidden = !user?.is_verified;
  const img = card.querySelector('[data-card-image]');
  img.alt = `${property.title} — صورة توضيحية`;
  const showMissing = () => { img.hidden = true; card.querySelector('.w-property-image-fallback').hidden = false; };
  img.addEventListener('error', showMissing, { once: true });
  if (image?.url) img.src = image.url; else showMissing();
  for (const [selector, action, id] of [['[data-card-title]', 'property', property.id], ['[data-card-details]', 'property', property.id], ['[data-card-advertiser]', 'advertiser', property.user_id]]) {
    const link = card.querySelector(selector);
    link.href = journeyURL(action,id);
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      location.href = link.href;
    });
  }
  const favorite = card.querySelector('[data-card-favorite]');
  favorite.dataset.favoriteId=property.id;
  favorite.dataset.favoriteTitle=property.title;
  initFavoriteControls();updateFavoriteButton(favorite);
  resolveIcons(card);
  return card;
}
