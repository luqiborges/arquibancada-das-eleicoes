// TSE: results publication starts at 17:00 Brasília, 25 October 2026.
// Explicit UTC offset keeps the gate independent of the visitor's timezone.
export const APURACAO_START_AT = Date.parse('2026-10-25T17:00:00-03:00');

export function isEntranceOpen(now: number, countedSections = 0) {
  return now >= APURACAO_START_AT || countedSections > 0;
}
