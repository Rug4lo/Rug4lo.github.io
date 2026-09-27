// js/system/router.js
// Hash-based routing. GitHub Pages only serves static files, so a clean path
// like /machines/PikaTwoo would 404 when reloaded or opened from a shared
// link. The hash never reaches the server, so it survives both.
//
//   #/                      launcher
//   #/whoami                terminal
//   #/machines              section list
//   #/machines/PikaTwoo     one entry

const SECTIONS = ['machines', 'blogs', 'challenges'];
const APPS = [...SECTIONS, 'whoami'];

export class Router {
  // Goes up on every navigation. Any async work saves the value when it starts
  // and checks it before writing to the DOM: if it no longer matches, the user
  // has moved on and the result is of no interest.
  generation = 0;

  // Anything unrecognised becomes the launcher rather than a blank screen.
  static parse(hash) {
    const parts = String(hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
    const [app, entry] = parts;

    if (!APPS.includes(app)) return { app: null, entry: null };
    if (!SECTIONS.includes(app)) return { app, entry: null };
    return { app, entry: entry || null };
  }

  static toHash({ app, entry }) {
    if (!app) return '#/';
    return entry ? `#/${app}/${entry}` : `#/${app}`;
  }

  static current() {
    return Router.parse(window.location.hash);
  }

  start(onRoute) {
    this.onRoute = onRoute;
    window.addEventListener('hashchange', () => this.handle());
    this.handle();
  }

  handle() {
    this.generation++;
    const route = Router.current();
    const canonical = Router.toHash(route);

    // Rewrite a bogus hash so the address bar never shows a route that does
    // not exist. An empty hash is left alone: the site root has no hash.
    if (window.location.hash && window.location.hash !== canonical) {
      window.history.replaceState(null, '', canonical);
    }

    this.onRoute(route);
  }

  go(app, entry = null, { replace = false } = {}) {
    const hash = Router.toHash({ app, entry });

    // Setting the hash does not fire hashchange when it is already the same
    // destination, and at the root the hash is empty while toHash gives '#/'.
    // Without this, closing an app straight after boot did nothing.
    if (hash === Router.toHash(Router.current())) {
      this.handle();
      return;
    }

    if (replace) {
      window.history.replaceState(null, '', hash);
      this.handle();
    } else {
      window.location.hash = hash;
    }
  }

  back() {
    window.history.back();
  }

  forward() {
    window.history.forward();
  }
}

export const router = new Router();
