import {loadPropertyRecords} from './property-data.js';
import {frontendURL,resolveIcons} from '../core/path-resolver.js';
import {loadComponents} from '../core/component-loader.js';
import {initShell,openDialog} from '../core/shell-init.js';
import {publicRoute} from './public-routes.js';
import {createPropertyCard,publicProperties} from './property-cards.js';
import {contactTargets} from './detail-data.js';
import {journeyURL} from './navigation.js';
export const $=selector=>document.querySelector(selector);
export const icon=name=>`<svg class="w-icon" aria-hidden="true"><use data-icon="public-${name}"></use></svg>`;
export function detailURL(kind,id){return journeyURL(kind,id);}
export function message(title,copy,opener){$('#demo-title').textContent=title;$('#demo-copy').textContent=copy;openDialog($('#demo-message'),opener);}
export function status(kind){
  const text={missing:['العقار غير موجود','تحقّق من رابط العقار أو تصفح الإعلانات المتاحة.'],expired:['انتهت مدة هذا الإعلان','لم يعد الإعلان متاحًا للتواصل. تصفح العقارات الأخرى.'],unavailable:['هذا الإعلان غير متاح','الإعلان أو بياناته غير متاحة للنشر حاليًا.'],advertiser:['المعلن غير متاح','تحقّق من الرابط أو تصفح العقارات.'],error:['تعذّر تحميل البيانات','أعد المحاولة بعد التحقق من الاتصال.']}[kind];
  $('#page-status').hidden=false;$('#status-title').textContent=text[0];$('#status-copy').textContent=text[1];$('#retry').hidden=kind!=='error';
}
export async function setup(){
  await loadComponents(document,[],false);initShell({shell:'public',active:'listings',routeFor:publicRoute});
  $('#retry').addEventListener('click',()=>location.reload());
  return loadPropertyRecords();
}
export function renderCards(host,properties,records){
  host.replaceChildren(...properties.map(p=>createPropertyCard(p,records,{routeFor:detailURL,onAction:(kind,id,opener)=>{
    if(kind==='property'||kind==='advertiser')location.href=detailURL(kind,id);
    else message('المفضلة','حفظ المفضلة سيتوفر في الدفعة الخامسة. لم يتم حفظ بيانات.',opener);
  }})));
  if(!properties.length)host.textContent='لا توجد عقارات متاحة حاليًا.';
}
export function advertiserInfo(records,user,property){
  const role=records.roles.find(r=>r.id===user.role_id);
  const broker=records.broker_profiles?.find(b=>b.user_id===user.id);
  $('#advertiser-name').textContent=user.full_name;
  $('#advertiser-role').textContent=role?.name||'معلن';
  $('#advertiser-initial').textContent=user.full_name.slice(0,1);
  $('#advertiser-verified').hidden=!user.is_verified;
  const targets=contactTargets(user,broker,property?`${property.title} — ${detailURL('property',property.id)}`:'أرغب في الاستفسار عن العقارات المتاحة.');
  document.querySelectorAll('[data-contact]').forEach(host=>{
    const kind=host.dataset.contact;
    const el=document.createElement(targets[kind]?'a':'button');
    el.className=`w-button ${kind==='whatsapp'?'d-whatsapp':'w-button--primary'}`;
    el.innerHTML=icon(kind==='whatsapp'?'message':'phone');
    el.append(document.createTextNode(kind==='whatsapp'?'واتساب':'اتصل الآن'));
    if(targets[kind]){el.href=targets[kind];if(kind==='whatsapp'){el.target='_blank';el.rel='noopener noreferrer';}}
    else {el.disabled=true;el.setAttribute('aria-label',`${kind==='whatsapp'?'واتساب':'الهاتف'}: بيانات التواصل غير متاحة`);}
    host.replaceChildren(el);
  });
  $('#contact-note').textContent=(!targets.phone&&!targets.whatsapp)?'لم تُضف بيانات هاتف أو واتساب لهذا المعلن التجريبي.':'';
  resolveIcons();return broker;
}
export {publicProperties,resolveIcons};
