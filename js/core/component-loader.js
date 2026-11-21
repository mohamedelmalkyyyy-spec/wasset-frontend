import {ensureDemoPopulation} from '../shared/demo-population.js';
import { frontendURL } from './path-resolver.js';

// Only trusted, repository-owned HTML fragments are accepted. No user HTML.
export async function loadComponents(root = document, ancestors = [], initializeDemo = true) {
  if(initializeDemo&&!ancestors.length&&!location.pathname.includes('/preview/')&&!location.pathname.endsWith('/foundation-preview.html'))ensureDemoPopulation(sessionStorage);
  const hosts = [...root.querySelectorAll('[data-component]')].filter(host => !host.parentElement?.closest('[data-component]'));
  await Promise.all(hosts.map(async host => {
    const path = host.dataset.component;
    try {
      if (ancestors.includes(path)) throw new Error('Circular fragment reference');
      const response = await fetch(frontendURL(path));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      if (/<!doctype|<html[\s>]/i.test(html)) throw new Error('Expected an HTML fragment');
      host.innerHTML = html;
      // Remove the marker before recursively finding direct descendants.
      host.removeAttribute('data-component');
      await loadComponents(host, [...ancestors, path], initializeDemo);
    } catch (error) {
      host.removeAttribute('data-component');
      const fallback = document.createElement('section');
      fallback.className = 'w-load-error';
      fallback.setAttribute('role', 'alert');
      fallback.textContent = 'تعذّر تحميل جزء من الواجهة. تحقّق من تشغيل خادم HTTP ثم أعد تحميل الصفحة.';
      const retry = document.createElement('button');
      retry.className = 'w-button w-button--secondary';
      retry.textContent = 'إعادة تحميل الصفحة';
      retry.addEventListener('click', () => location.reload());
      fallback.append(retry);
      host.replaceChildren(fallback);
      console.error('Component load failed:', path, error);
    }
  }));
}
