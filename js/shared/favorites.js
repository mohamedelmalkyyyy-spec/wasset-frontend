import {demoStore,safeReturn} from './demo-auth.js';
import {frontendRoot,frontendURL} from '../core/path-resolver.js';
import {dashboardURL} from './navigation.js';
export function authURL(propertyId,returnTo=location.href){const url=new URL(frontendURL('pages/auth.html'));if(returnTo)url.searchParams.set('return',safeReturn(returnTo,frontendRoot));if(propertyId)url.searchParams.set('save',propertyId);return url.href;}
export function announce(text){let el=document.querySelector('#demo-feedback');if(!el){el=document.createElement('p');el.id='demo-feedback';el.setAttribute('role','status');el.style.cssText='position:fixed;inset-block-end:18px;inset-inline:16px;z-index:200;background:#edf2e8;color:#526B38;padding:12px;border:1px solid #6F8B4E;border-radius:10px;';document.body.append(el);}el.textContent=text;}
export function updateFavoriteButton(button){try{const saved=demoStore().favorites().includes(Number(button.dataset.favoriteId));button.setAttribute('aria-pressed',String(saved));button.classList.toggle('w-saved',saved);button.setAttribute('aria-label',`${saved?'إزالة من المفضلة':'حفظ في المفضلة'}: ${button.dataset.favoriteTitle||'العقار'}`);}catch{button.setAttribute('aria-pressed','false');}}
function refresh(){document.querySelectorAll('[data-favorite-id]').forEach(updateFavoriteButton);}
export function toggleFavorite(id){
  try{const store=demoStore();if(!store.current()){location.href=authURL(id);return;}
    const saved=store.toggle(id);refresh();announce(saved?'تم حفظ العقار في المفضلة.':'تمت إزالة العقار من المفضلة.');dispatchEvent(new Event('waseet:favorites'));
  }catch{announce('تعذّر استخدام تخزين الجلسة. اسمح بتخزين بيانات الموقع ثم أعد المحاولة.');}
}
let initialized=false;
export function initFavoriteControls(){if(initialized)return;initialized=true;
  document.addEventListener('click',event=>{const button=event.target.closest('[data-favorite-id]');if(button){event.preventDefault();toggleFavorite(Number(button.dataset.favoriteId));}});
  addEventListener('waseet:favorites',refresh);
}
export function initAuthNavigation(){
  initFavoriteControls();let account=null;try{account=demoStore().current();}catch{}
  document.querySelectorAll('[data-nav-key="auth"],[data-nav-key="register"],[data-nav-key="favorites"]').forEach(link=>{
    const key=link.dataset.navKey;if(key==='register'&&account){link.remove();return;}
    link.href=key==='favorites'?frontendURL('pages/favorites.html'):authURL(undefined,null)+(key==='register'?'?mode=register':'');
    if(key==='auth'&&account)link.href=dashboardURL(account);
    if(key==='auth'&&account)link.textContent=`${account.name} · حساب تجريبي`;
    link.addEventListener('click',event=>{event.stopImmediatePropagation();if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();location.href=link.href;}},true);
    if(key==='auth'&&account){const logout=document.createElement('button');logout.className='w-button';logout.textContent='تسجيل الخروج';logout.addEventListener('click',()=>{try{demoStore().logout();location.href=frontendURL('index.html');}catch{announce('تعذّر إنهاء الجلسة.');}});link.after(logout);}
  });
}
