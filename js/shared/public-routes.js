import { frontendURL } from '../core/path-resolver.js';
import { demoStore } from './demo-auth.js';
import { publisherURL } from './navigation.js';

export function resultsURL(params = new URLSearchParams()) {
  const url = new URL(frontendURL('pages/properties.html'));
  url.search = params.toString();
  return url.href;
}
export function publicRoute(key) {
  if (key === 'home') return frontendURL('index.html');
  if (key === 'auth' || key === 'register' || key === 'favorites') return frontendURL(`pages/${key==='register'?'auth':key}.html`)+(key==='register'?'?mode=register':'');
  if (key === 'add') {
    let account;try{account=demoStore().current();}catch{}
    const target=publisherURL(account);if(target)return target;
    const url=new URL(frontendURL('pages/auth.html'));url.searchParams.set('intent','publish');url.searchParams.set('return',location.href);
    if(account)url.searchParams.set('mode','register');return url.href;
  }
  if (['listings','sale','rent','apartments','villas','land','commercial'].includes(key)) {
    const params = new URLSearchParams(location.pathname.endsWith('/pages/properties.html')?location.search:'');
    for(const key of ['page','entry','id'])params.delete(key);
    if (key === 'sale' || key === 'rent') params.set('listing_type',key);
    const type = {apartments:'apartment',villas:'villa',land:'land',commercial:'shop'}[key];
    if (type) params.set('property_type_id',type);
    return resultsURL(params);
  }
  const url = new URL(frontendURL('index.html'));
  url.searchParams.set('entry',key);
  url.hash = 'demo-message';
  return url.href;
}
