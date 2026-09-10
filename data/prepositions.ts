/**
 * Prepositions grouped by the case they govern. Hand-written, because this is
 * the part of German that has to be memorised rather than derived, and it is
 * short enough to get right by hand.
 */

export interface Example {
  de: string;
  en: string;
}

export interface FixedCasePreposition {
  prep: string;
  english: string;
  case: 'akkusativ' | 'dativ';
  example: Example;
}

/** Always accusative. */
export const ACCUSATIVE: FixedCasePreposition[] = [
  { prep: 'durch', english: 'through', case: 'akkusativ', example: { de: 'Wir gehen durch den Park.', en: 'We walk through the park.' } },
  { prep: 'für', english: 'for', case: 'akkusativ', example: { de: 'Das Geschenk ist für meinen Bruder.', en: 'The present is for my brother.' } },
  { prep: 'gegen', english: 'against, around (time)', case: 'akkusativ', example: { de: 'Ich spiele gegen den Computer.', en: 'I play against the computer.' } },
  { prep: 'ohne', english: 'without', case: 'akkusativ', example: { de: 'Ich trinke den Kaffee ohne den Zucker.', en: 'I drink the coffee without the sugar.' } },
  { prep: 'um', english: 'around, at (time)', case: 'akkusativ', example: { de: 'Wir sitzen um den Tisch.', en: 'We sit around the table.' } },
  { prep: 'bis', english: 'until, as far as', case: 'akkusativ', example: { de: 'Der Bus fährt bis den Bahnhof.', en: 'The bus goes as far as the station.' } },
  { prep: 'entlang', english: 'along (follows its noun)', case: 'akkusativ', example: { de: 'Wir laufen den Fluss entlang.', en: 'We walk along the river.' } },
];

/** Always dative. */
export const DATIVE: FixedCasePreposition[] = [
  { prep: 'aus', english: 'out of, from', case: 'dativ', example: { de: 'Sie kommt aus der Türkei.', en: 'She comes from Turkey.' } },
  { prep: 'außer', english: 'except for', case: 'dativ', example: { de: 'Alle außer dem Lehrer lachen.', en: 'Everyone except the teacher laughs.' } },
  { prep: 'bei', english: 'at, near, at the home of', case: 'dativ', example: { de: 'Ich wohne bei meinen Eltern.', en: 'I live with my parents.' } },
  { prep: 'gegenüber', english: 'opposite', case: 'dativ', example: { de: 'Die Bank liegt gegenüber dem Kino.', en: 'The bank is opposite the cinema.' } },
  { prep: 'mit', english: 'with, by (transport)', case: 'dativ', example: { de: 'Ich fahre mit dem Zug.', en: 'I travel by train.' } },
  { prep: 'nach', english: 'after, to (places without an article)', case: 'dativ', example: { de: 'Nach dem Essen gehen wir spazieren.', en: 'After the meal we go for a walk.' } },
  { prep: 'seit', english: 'since, for (time up to now)', case: 'dativ', example: { de: 'Ich lerne seit einem Jahr Deutsch.', en: 'I have been learning German for a year.' } },
  { prep: 'von', english: 'from, of, by', case: 'dativ', example: { de: 'Das ist das Auto von meinem Freund.', en: 'That is my friend’s car.' } },
  { prep: 'zu', english: 'to (people and places)', case: 'dativ', example: { de: 'Ich gehe zu dem Arzt.', en: 'I am going to the doctor.' } },
];

/**
 * Wechselpräpositionen. Accusative answers wohin (movement towards a target),
 * dative answers wo (position). This is the single highest-value contrast in
 * A2 German, so each one carries a matched pair.
 */
export interface TwoWayPreposition {
  prep: string;
  english: string;
  akk: Example;
  dat: Example;
}

export const TWO_WAY: TwoWayPreposition[] = [
  { prep: 'an', english: 'at, on (vertical surface), to',
    akk: { de: 'Ich hänge das Bild an die Wand.', en: 'I hang the picture onto the wall.' },
    dat: { de: 'Das Bild hängt an der Wand.', en: 'The picture hangs on the wall.' } },
  { prep: 'auf', english: 'on (horizontal surface), onto',
    akk: { de: 'Ich lege das Buch auf den Tisch.', en: 'I put the book onto the table.' },
    dat: { de: 'Das Buch liegt auf dem Tisch.', en: 'The book lies on the table.' } },
  { prep: 'hinter', english: 'behind',
    akk: { de: 'Er stellt das Fahrrad hinter das Haus.', en: 'He puts the bike behind the house.' },
    dat: { de: 'Das Fahrrad steht hinter dem Haus.', en: 'The bike stands behind the house.' } },
  { prep: 'in', english: 'in, into',
    akk: { de: 'Ich gehe in die Schule.', en: 'I go into the school.' },
    dat: { de: 'Ich bin in der Schule.', en: 'I am in the school.' } },
  { prep: 'neben', english: 'next to',
    akk: { de: 'Setz dich neben mich.', en: 'Sit down next to me.' },
    dat: { de: 'Sie sitzt neben mir.', en: 'She sits next to me.' } },
  { prep: 'über', english: 'over, above, across',
    akk: { de: 'Das Flugzeug fliegt über die Stadt.', en: 'The plane flies over the city.' },
    dat: { de: 'Das Flugzeug kreist über der Stadt.', en: 'The plane circles above the city.' } },
  { prep: 'unter', english: 'under, among',
    akk: { de: 'Die Katze läuft unter das Bett.', en: 'The cat runs under the bed.' },
    dat: { de: 'Die Katze schläft unter dem Bett.', en: 'The cat sleeps under the bed.' } },
  { prep: 'vor', english: 'in front of, before, ago',
    akk: { de: 'Ich stelle den Stuhl vor das Fenster.', en: 'I put the chair in front of the window.' },
    dat: { de: 'Der Stuhl steht vor dem Fenster.', en: 'The chair stands in front of the window.' } },
  { prep: 'zwischen', english: 'between',
    akk: { de: 'Er setzt sich zwischen die Kinder.', en: 'He sits down between the children.' },
    dat: { de: 'Er sitzt zwischen den Kindern.', en: 'He sits between the children.' } },
];
