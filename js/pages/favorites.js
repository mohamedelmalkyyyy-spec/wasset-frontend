import {loadPropertyRecords} from '../shared/property-data.js';
import {loadComponents} from '../core/component-loader.js';
import {initShell} from '../core/shell-init.js';
import {frontendURL,resolveIcons} from '../core/path-resolver.js';
import {publicRoute} from '../shared/public-routes.js';
import {createPropertyCard,publicProperties} from '../shared/property-cards.js';
import {demoStore} from '../shared/demo-auth.js';
import {authURL} from '../shared/favorites.js';
await loadComponents(document,[],false);initShell({shell:'public',active:'favorites',routeFor:publicRoute});
document.querySelector('#retry').addEventListener('click',()=>location.reload());
try{
  const records=await loadPropertyRecords();
  function render(){
    const account=demoStore().current();const ids=demoStore().favorites();
    const properties=publicProperties(records).filter(p=>ids.includes(p.id));
    const host=document.querySelector('#favorite-properties');
    host.replaceChildren(...properties.map(p=>createPropertyCard(p,records,{})));
    document.querySelector('#favorite-count').textContent=`${properties.length} عقار محفوظ`;
    document.querySelector('#favorite-empty').hidden=properties.length>0;
    document.querySelector('#favorite-message').textContent=ids.length>properties.length?'بعض العقارات المحفوظة لم تعد متاحة للنشر.':'';
    if(!account){document.querySelector('#empty-title').textContent='سجّل دخولك لعرض المفضلة';document.querySelector('#empty-copy').textContent='تُحفظ المفضلة لكل حساب تجريبي بشكل مستقل في جلسة هذا التبويب.';const a=document.querySelector('#empty-action');a.href=authURL();a.textContent='تسجيل الدخول';}
    resolveIcons();
  }
  render();addEventListener('waseet:favorites',render);
}catch{document.querySelector('#favorite-error').hidden=false;}
document.documentElement.dataset.ready='true';
