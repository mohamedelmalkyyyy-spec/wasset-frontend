import {bootstrapAdminNotifications} from './notification-bootstrap.js';
import {frontendURL} from '../core/path-resolver.js';
import {initShell} from '../core/shell-init.js';
export function adminRoute(key){return frontendURL(`pages/admin/${['listings','listing','edits','edit','users','user','agencies','agency','verification','verify','reports','report','notifications'].includes(key)?key:'index'}.html`);}
export function initAdminShell(active='home'){
  try{bootstrapAdminNotifications(sessionStorage);}catch{/* The center shows storage errors without erasing state. */}
  initShell({shell:'admin',active,routeFor:adminRoute});
  document.querySelectorAll('.w-side-nav [data-nav-key]').forEach(a=>{if(!['home','listings','edits','users','agencies','verification','reports','notifications'].includes(a.dataset.navKey))a.remove();});
  document.querySelector('[data-preview-shell]').href=frontendURL('index.html');
  document.querySelectorAll('.w-side-nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('#admin-menu')?.close()));
}
