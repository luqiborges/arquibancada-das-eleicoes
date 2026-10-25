const supportedRoutes = new Set(['/', '/papo-serio']);

export function resolveRoute(
  location: Pick<Location, 'pathname' | 'search' | 'hash'> = window.location,
  history: Pick<History, 'replaceState'> = window.history,
) {
  const route = location.pathname.replace(/\/$/, '') || '/';
  if (supportedRoutes.has(route)) return route;
  history.replaceState(null, '', `/${location.search}${location.hash}`);
  return '/';
}
