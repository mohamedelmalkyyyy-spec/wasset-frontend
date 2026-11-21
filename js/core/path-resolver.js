// Resolved from this module, never from the current document depth.
export const frontendRoot = new URL('../../', import.meta.url);
export function frontendURL(path) {
  const url = new URL(path, frontendRoot);
  if (url.origin !== frontendRoot.origin || !url.pathname.startsWith(frontendRoot.pathname)) {
    throw new Error('Path must stay inside frontend/');
  }
  return url.href;
}
export function resolveIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(use => {
    use.setAttribute('href', frontendURL('assets/icons/source-icons.svg') + '#' + use.dataset.icon);
  });
}
