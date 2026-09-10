/**
 * Which auxiliary a verb takes in the Perfekt.
 *
 * german-verbs-dict gives us every conjugated form but does NOT record this,
 * and "hat gegangen" is the single most common Perfekt mistake, so the list is
 * written by hand. It is a small closed class: intransitive verbs of motion or
 * change of state, plus a handful of occurrence verbs. Everything not listed
 * here takes haben, which is correct for the overwhelming majority.
 *
 * scripts/check-data.mts flags any verb whose English gloss looks like motion
 * or change of state but which fell through to haben, which catches omissions.
 */

/** Takes sein. */
export const SEIN = new Set([
  // core
  'sein', 'werden', 'bleiben',

  // occurrence and outcome
  'passieren', 'geschehen', 'vorkommen', 'gelingen', 'misslingen', 'glücken',
  'scheitern', 'folgen', 'begegnen', 'auffallen', 'ausfallen', 'einfallen',
  'zufallen',

  // motion
  'gehen', 'kommen', 'laufen', 'rennen', 'eilen', 'springen', 'hüpfen',
  'fallen', 'steigen', 'sinken', 'klettern', 'wandern', 'reisen', 'fliehen',
  'flüchten', 'stürzen', 'rutschen', 'gleiten', 'schleichen', 'kriechen',
  'marschieren', 'stolpern', 'wackeln', 'landen', 'starten',

  // change of state
  'sterben', 'wachsen', 'aufwachen', 'erwachen', 'einschlafen', 'entschlafen',
  'genesen', 'ertrinken', 'erfrieren', 'verhungern', 'entstehen', 'erscheinen',
  'verschwinden', 'platzen', 'explodieren', 'verwelken', 'aufblühen',
  'verfaulen', 'verrotten', 'umkommen', 'aufwachsen', 'heranwachsen',
  'anwachsen', 'einfrieren', 'auftauen', 'altern', 'reifen',

  // separable derivatives of kommen
  'ankommen', 'mitkommen', 'zurückkommen', 'herkommen', 'hinkommen',
  'wiederkommen', 'vorbeikommen', 'hereinkommen', 'herauskommen',
  'entgegenkommen', 'nachkommen', 'weiterkommen', 'davonkommen', 'freikommen',
  'entkommen', 'durchkommen', 'rauskommen', 'reinkommen',

  // separable derivatives of gehen
  'weggehen', 'ausgehen', 'hingehen', 'mitgehen', 'zurückgehen', 'vorgehen',
  'untergehen', 'aufgehen', 'losgehen', 'durchgehen', 'eingehen', 'vergehen',
  'entgehen', 'hinausgehen', 'hineingehen', 'herumgehen', 'umgehen',
  'weitergehen', 'vorbeigehen', 'zugehen', 'abgehen',

  // stehen and steigen
  'aufstehen', 'aufsteigen', 'einsteigen', 'aussteigen', 'umsteigen',
  'absteigen', 'hinaufsteigen', 'ansteigen',

  // fallen
  'hinfallen', 'umfallen', 'runterfallen', 'herunterfallen', 'zusammenfallen',
  'durchfallen', 'abfallen', 'wegfallen',

  // laufen
  'weglaufen', 'davonlaufen', 'fortlaufen', 'herumlaufen', 'mitlaufen',
  'zusammenlaufen', 'ablaufen', 'verlaufen', 'überlaufen',

  // fahren and fliegen, intransitive directional derivatives
  'abfahren', 'losfahren', 'wegfahren', 'hinfahren', 'zurückfahren',
  'mitfahren', 'vorbeifahren', 'weiterfahren', 'einfahren', 'ausfahren',
  'abfliegen', 'wegfliegen', 'davonfliegen', 'losfliegen',

  // moving house and travelling
  'umziehen', 'einziehen', 'ausziehen', 'wegziehen', 'verreisen', 'abreisen',
  'anreisen', 'auswandern', 'einwandern', 'zurückkehren', 'heimkehren',
  'umkehren', 'einkehren',

  // breaking out and setting off
  'aufbrechen', 'ausbrechen', 'einbrechen', 'zusammenbrechen', 'losrennen',

  // found by the gloss heuristic in scripts/check-data.mts
  'entfliehen', 'absterben', 'schiefgehen', 'entlangfahren', 'antanzen',
  'entfremden', 'hinzukommen', 'zurücklaufen', 'hochgehen', 'hinfahren',
  'hinfliegen', 'eintreffen',

  // appearing and treading
  'eintreten', 'austreten', 'auftreten', 'zurücktreten', 'beitreten',
]);

/**
 * Takes haben when transitive, sein when intransitive and directional.
 *   Ich habe das Auto gefahren.  /  Ich bin nach Berlin gefahren.
 * The UI shows both and says which is which.
 */
export const BOTH = new Set([
  'fahren', 'fliegen', 'schwimmen', 'reiten', 'segeln', 'rudern', 'joggen',
  'tanzen', 'ziehen', 'treten', 'stoßen', 'brechen', 'biegen', 'schmelzen',
  'heilen', 'verderben', 'trocknen', 'frieren', 'bummeln', 'klettern',
  'spazieren', 'wenden', 'durchfahren', 'verkehren',
]);

export type Aux = 'haben' | 'sein' | 'both';

export function auxFor(infinitive: string): Aux {
  if (BOTH.has(infinitive)) return 'both';
  if (SEIN.has(infinitive)) return 'sein';
  return 'haben';
}
