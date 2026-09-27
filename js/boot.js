// js/boot.js
// Entry point. Decides the first screen: the lockscreen on a plain visit, or
// the requested screen straight away when the URL already points at one.
//
// Module scripts are deferred, so the document is already parsed by the time
// this runs; there is nothing to wait for.

import { Router, router } from './system/router.js';
import { i18n } from './system/i18n.js';
import { lockscreen } from './system/lockscreen.js';

async function startDesktop() {
  const { desktop } = await import('./system/desktop.js');
  desktop.init();
  router.start(route => desktop.showRoute(route));
}

// Before anything is painted: the lockscreen already carries translatable text.
await i18n.init();

const route = Router.current();

if (!route.app) {
  lockscreen.init(startDesktop);
} else {
  // A shared link arrives with nothing behind it in history, so Back would
  // leave the site. Put the section list underneath the entry first.
  if (route.entry) {
    window.history.replaceState(null, '', Router.toHash({ app: route.app }));
    window.history.pushState(null, '', Router.toHash(route));
  }

  startDesktop();
}
