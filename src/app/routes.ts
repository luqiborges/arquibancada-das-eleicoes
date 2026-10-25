const legacyRoutes = new Set([
  '/arquibancadas',
  '/previa-header',
  '/estadios',
  '/estadios-3d',
  '/estadio-3d',
  '/estadios/entorno',
  '/estadios/trofeu',
  '/estadios-3d/trofeu',
]);

export function resolveRoute() {
  const route = window.location.pathname.replace(/\/$/, '') || '/';
  if (legacyRoutes.has(route)) {
    window.history.replaceState(null, '', `/${window.location.search}${window.location.hash}`);
    return '/';
  }
  return route;
}
