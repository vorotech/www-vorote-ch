globalThis.process ??= {}; globalThis.process.env ??= {};
import { r as renderers } from './chunks/_@astro-renderers_D3y9eoyh.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CkP_of96.mjs';
import { manifest } from './manifest_D3cVivnd.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/404.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/api/feedback.astro.mjs');
const _page3 = () => import('./pages/posts.astro.mjs');
const _page4 = () => import('./pages/posts/_---slug_.astro.mjs');
const _page5 = () => import('./pages/tools/scheduler.astro.mjs');
const _page6 = () => import('./pages/tools/security-audit.astro.mjs');
const _page7 = () => import('./pages/tools.astro.mjs');
const _page8 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["src/pages/404.astro", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/api/feedback.ts", _page2],
    ["src/pages/posts/index.astro", _page3],
    ["src/pages/posts/[...slug].astro", _page4],
    ["src/pages/tools/scheduler.astro", _page5],
    ["src/pages/tools/security-audit.astro", _page6],
    ["src/pages/tools/index.astro", _page7],
    ["src/pages/index.astro", _page8]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = undefined;
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
