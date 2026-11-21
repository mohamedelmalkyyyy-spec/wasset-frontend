import {refreshNotificationIndicators} from '../shared/notification-indicators.js';
import { frontendURL, resolveIcons } from './path-resolver.js';
import { initAuthNavigation } from '../shared/favorites.js';
import {initPageNavigation,refreshPublicActive} from '../shared/navigation.js';

const accountMenu = [
  ['home', 'نظرة عامة', 'grid'], ['properties', 'عقاراتي', 'building'],
  ['add', 'إضافة عقار', 'plus'], ['employees', 'إدارة الموظفين', 'users'],
  ['verification', 'التوثيق', 'shield'], ['favorites', 'المفضلة', 'heart'],
  ['notifications', 'الإشعارات', 'bell'], ['profile', 'الملف الشخصي', 'user'],
  ['settings', 'الإعدادات', 'settings'],
];
const adminMenu = [
  ['home', 'الرئيسية', 'home'], ['listings', 'مراجعة الإعلانات', 'building'],
  ['edits', 'مراجعة التعديلات', 'edit'], ['users', 'المستخدمون', 'users'],
  ['agencies', 'المكاتب العقارية', 'building'], ['verification', 'طلبات التوثيق', 'shield'],
  ['reports', 'البلاغات', 'flag'], ['notifications', 'الإشعارات', 'bell'],
];
const roles = {
  owner: ['محمد أحمد', 'حساب مالك'], broker: ['كريم السيد', 'حساب سمسار'],
  agency: ['عقارات السادات', 'حساب مكتب'], agent: ['أحمد سمير', 'حساب موظف'],
  seeker: ['زائر تجريبي', 'باحث عن عقار'],
};

export function accountItems(role, permissions = {}) {
  return accountMenu.filter(([key]) => {
    if (role === 'seeker') return ['favorites', 'notifications', 'profile'].includes(key);
    if (key === 'favorites') return false;
    if (key === 'employees' || key === 'settings') return role === 'agency';
    if (key === 'verification') return role !== 'agent';
    if (role === 'agent' && key === 'properties') return !!permissions.viewProperties;
    if (role === 'agent' && key === 'add') return !!permissions.createProperty;
    return true;
  });
}

export function initShell({ shell = 'public', role = 'owner', permissions = {}, active = 'home', routeFor, onNavigate } = {}) {
  role = Object.hasOwn(roles, role) ? role : 'owner';
  const nav = document.querySelector('[data-role-nav]');
  const productionAccount=shell==='account'&&/\/pages\/(account|broker|agency|agent)\//.test(location.pathname);
  const items = (shell === 'admin' ? adminMenu : accountItems(role, permissions)).filter(([key])=>!productionAccount||['home','properties','add','notifications',...(role==='agency'?['employees']:[]),...(role==='seeker'?['favorites']:[])].includes(key));
  if (nav) {
    nav.replaceChildren(...items.map(([key, label, icon]) => {
      const a = document.createElement('a');
      a.dataset.navKey = key;
      const prefix = icon === 'heart' ? 'public' : shell;
      a.innerHTML = `<svg class="w-icon" aria-hidden="true"><use data-icon="${prefix}-${icon}"></use></svg>`;
      a.append(document.createTextNode(label));
      return a;
    }));
  }
  if (shell === 'account') {
    document.querySelector('[data-user-name]').textContent = roles[role][0];
    document.querySelector('[data-user-role]').textContent = roles[role][1];
  }
  function markActive(key) {
    document.querySelectorAll('[data-nav-key]').forEach(a => {
      if (a.dataset.navKey === key) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  document.querySelectorAll('[data-nav-key]').forEach(a => {
    // The host page owns routing; Batch 1 provides preview destinations only.
    a.href = routeFor ? routeFor(a.dataset.navKey) : frontendURL('foundation-preview.html');
    const notification=a.dataset.navKey==='notifications'&&!location.pathname.includes('/preview/')&&!location.pathname.endsWith('/foundation-preview.html');
    if(notification)a.href=frontendURL(`pages/${shell==='admin'?'admin':'account'}/notifications.html`);
    if (onNavigate&&!notification) a.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      markActive(a.dataset.navKey);
      a.closest('dialog')?.close();
      onNavigate(a.dataset.navKey, a.href);
    });
  });
  markActive(active);
  resolveIcons();
  initDialogs();
  initSidebar(shell);
  initDropdowns();
  if (shell === 'public') {initAuthNavigation();refreshPublicActive();}
  initPageNavigation(shell);
  refreshNotificationIndicators(shell);
}

const returnFocus = new WeakMap();

export function openDialog(dialog, opener = document.activeElement) {
  if (!dialog || dialog.open) return;
  returnFocus.set(dialog, opener);
  dialog.showModal();
  document.body.classList.add('w-scroll-locked');
  if (opener?.hasAttribute('data-open-dialog')) opener.setAttribute('aria-expanded', 'true');
}

function initDialogs() {
  document.querySelectorAll('[data-open-dialog]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.openDialog);
      openDialog(dialog, button);
    });
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target.closest('[data-close-dialog]')) dialog.close();
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      }
    });
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('w-scroll-locked');
      const opener = returnFocus.get(dialog);
      if (opener?.hasAttribute('data-open-dialog')) opener.setAttribute('aria-expanded', 'false');
      if (opener?.getClientRects().length) opener.focus();
    });
    // Native modal dialogs make the page inert; explicit wrapping keeps Tab inside.
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('a[href],button:not(:disabled),input,select,textarea,summary,[tabindex="0"]')].filter(el => el.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
  });
}

function initSidebar(shell) {
  if (shell === 'public') {
    const media = matchMedia('(max-width: 900px)');
    media.addEventListener('change', () => { if (!media.matches) document.getElementById('public-menu')?.close(); });
    return;
  }
  const home = document.querySelector('[data-sidebar-home]');
  const mobile = document.querySelector('[data-sidebar-mobile]');
  const sidebar = document.querySelector(`.w-${shell}-sidebar`);
  const drawer = document.getElementById(`${shell}-menu`);
  const media = matchMedia(`(max-width: ${shell === 'admin' ? 780 : 800}px)`);
  function relocate() {
    if (!media.matches) drawer.close();
    (media.matches ? mobile : home).append(sidebar);
  }
  media.addEventListener('change', relocate);
  relocate();
}

function initDropdowns() {
  document.addEventListener('click', event => document.querySelectorAll('.w-dropdown[open]').forEach(menu => {
    if (!menu.contains(event.target) || event.target.closest('a')) menu.open = false;
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelectorAll('.w-dropdown[open]').forEach(menu => {
      menu.open = false; menu.querySelector('summary').focus();
    });
  });
}
