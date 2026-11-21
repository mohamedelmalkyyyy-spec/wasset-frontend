import { frontendURL, resolveIcons } from './core/path-resolver.js';
import { loadComponents } from './core/component-loader.js';
import { initShell } from './core/shell-init.js';

const params = new URLSearchParams(location.search);
const shell = ['public', 'account', 'admin'].includes(params.get('shell')) ? params.get('shell') : 'public';
const role = ['owner', 'broker', 'agency', 'agent', 'seeker'].includes(params.get('role')) ? params.get('role') : 'owner';
const permissions = { viewProperties: params.get('view') !== '0', createProperty: params.get('create') !== '0' };
const shellSelect = document.querySelector('#preview-shell');
const roleSelect = document.querySelector('#preview-role');
shellSelect.value = shell;
roleSelect.value = role;
document.querySelector('#role-control').hidden = shell !== 'account';
document.querySelector('#permission-controls').hidden = shell !== 'account' || role !== 'agent';
document.querySelector('#permission-view').checked = permissions.viewProperties;
document.querySelector('#permission-create').checked = permissions.createProperty;
document.querySelector('#preview-config').addEventListener('change', () => {
  const url = new URL(location.href);
  url.search = new URLSearchParams({ shell: shellSelect.value, role: roleSelect.value, view: document.querySelector('#permission-view').checked ? '1' : '0', create: document.querySelector('#permission-create').checked ? '1' : '0' });
  location.href = url;
});
const host = document.querySelector('#preview-shell-host');
if (shell === 'public') host.innerHTML = '<div class="w-public"><div data-component="components/public/header.html"></div><main id="main-content" tabindex="-1" class="w-container w-public-main"><div data-page-content></div></main><div data-component="components/public/footer.html"></div></div>';
else host.dataset.component = `components/${shell}/shell.html`;
await loadComponents();
// Explicit developer-only failure fixture; never used by production shells.
if (params.get('testFailure') === '1') {
  const failure = document.createElement('div');
  failure.dataset.component = 'components/intentional-missing-test.html';
  host.prepend(failure);
  await loadComponents();
}
const page = document.querySelector('[data-page-content]');
if (page) {
  page.dataset.component = 'components/shared/patterns.html';
  await loadComponents();
  const routeFor = key => {
    const url = new URL(location.href);
    url.searchParams.set('section', key);
    return url.href;
  };
  initShell({ shell, role, permissions, active: params.get('section') || (role === 'seeker' && shell === 'account' ? 'favorites' : 'home'), routeFor,
    onNavigate: (key, href) => {
      history.pushState({}, '', href);
      document.querySelector('#preview-status').textContent = 'تم تحديد عنصر التنقل للمعاينة فقط؛ الصفحة الفعلية غير منفّذة في الدفعة الأولى.';
    },
  });
  document.querySelectorAll('[data-preview-shell]').forEach(a => { a.href = frontendURL('foundation-preview.html'); });
  document.querySelectorAll('.w-pagination a').forEach(a => a.addEventListener('click', () => {
    document.querySelectorAll('.w-pagination a').forEach(link => link.removeAttribute('aria-current'));
    a.setAttribute('aria-current', 'page');
  }));
  resolveIcons();
  document.documentElement.dataset.ready = 'true';
}
addEventListener('popstate', () => location.reload());
