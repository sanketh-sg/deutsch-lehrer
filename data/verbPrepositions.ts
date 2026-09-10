/**
 * Verbs with a fixed preposition. The preposition is not chosen by meaning,
 * it comes with the verb and has to be learned as a unit, which is why these
 * are their own drill items rather than a rule.
 *
 * Two-way prepositions appearing here are locked to one case by the verb, so
 * "warten auf" is always accusative regardless of movement.
 */

export interface VerbPreposition {
  verb: string;
  prep: string;
  case: 'akkusativ' | 'dativ';
  english: string;
  level: 'A2' | 'B1' | 'B2';
  example: { de: string; en: string };
}

export const VERB_PREPOSITIONS: VerbPreposition[] = [
  { verb: 'warten', prep: 'auf', case: 'akkusativ', english: 'to wait for', level: 'A2', example: { de: 'Ich warte auf den Bus.', en: 'I am waiting for the bus.' } },
  { verb: 'denken', prep: 'an', case: 'akkusativ', english: 'to think of', level: 'A2', example: { de: 'Ich denke oft an meine Familie.', en: 'I often think of my family.' } },
  { verb: 'sich freuen', prep: 'auf', case: 'akkusativ', english: 'to look forward to', level: 'A2', example: { de: 'Ich freue mich auf das Wochenende.', en: 'I am looking forward to the weekend.' } },
  { verb: 'sich freuen', prep: 'über', case: 'akkusativ', english: 'to be pleased about', level: 'A2', example: { de: 'Sie freut sich über das Geschenk.', en: 'She is pleased about the present.' } },
  { verb: 'sprechen', prep: 'über', case: 'akkusativ', english: 'to talk about', level: 'A2', example: { de: 'Wir sprechen über den Film.', en: 'We are talking about the film.' } },
  { verb: 'sprechen', prep: 'mit', case: 'dativ', english: 'to talk to', level: 'A2', example: { de: 'Ich spreche mit dem Lehrer.', en: 'I am talking to the teacher.' } },
  { verb: 'sich interessieren', prep: 'für', case: 'akkusativ', english: 'to be interested in', level: 'A2', example: { de: 'Er interessiert sich für Musik.', en: 'He is interested in music.' } },
  { verb: 'bitten', prep: 'um', case: 'akkusativ', english: 'to ask for', level: 'B1', example: { de: 'Ich bitte dich um Hilfe.', en: 'I am asking you for help.' } },
  { verb: 'fragen', prep: 'nach', case: 'dativ', english: 'to ask about, ask for', level: 'A2', example: { de: 'Er fragt nach dem Weg.', en: 'He asks for directions.' } },
  { verb: 'antworten', prep: 'auf', case: 'akkusativ', english: 'to answer (a question)', level: 'A2', example: { de: 'Sie antwortet auf meine Frage.', en: 'She answers my question.' } },
  { verb: 'sich erinnern', prep: 'an', case: 'akkusativ', english: 'to remember', level: 'B1', example: { de: 'Ich erinnere mich an den Tag.', en: 'I remember the day.' } },
  { verb: 'sich gewöhnen', prep: 'an', case: 'akkusativ', english: 'to get used to', level: 'B1', example: { de: 'Er gewöhnt sich an das Wetter.', en: 'He is getting used to the weather.' } },
  { verb: 'sich kümmern', prep: 'um', case: 'akkusativ', english: 'to take care of', level: 'B1', example: { de: 'Sie kümmert sich um die Kinder.', en: 'She takes care of the children.' } },
  { verb: 'sich bewerben', prep: 'um', case: 'akkusativ', english: 'to apply for', level: 'B1', example: { de: 'Ich bewerbe mich um die Stelle.', en: 'I am applying for the job.' } },
  { verb: 'sich bewerben', prep: 'bei', case: 'dativ', english: 'to apply to (a company)', level: 'B1', example: { de: 'Ich bewerbe mich bei einer Bank.', en: 'I am applying to a bank.' } },
  { verb: 'teilnehmen', prep: 'an', case: 'dativ', english: 'to take part in', level: 'B1', example: { de: 'Wir nehmen an dem Kurs teil.', en: 'We take part in the course.' } },
  { verb: 'gehören', prep: 'zu', case: 'dativ', english: 'to belong to, be part of', level: 'B1', example: { de: 'Das gehört zu meinen Aufgaben.', en: 'That is part of my duties.' } },
  { verb: 'sich handeln', prep: 'um', case: 'akkusativ', english: 'to be a matter of', level: 'B2', example: { de: 'Es handelt sich um einen Fehler.', en: 'It is a matter of a mistake.' } },
  { verb: 'bestehen', prep: 'aus', case: 'dativ', english: 'to consist of', level: 'B1', example: { de: 'Das Team besteht aus fünf Leuten.', en: 'The team consists of five people.' } },
  { verb: 'bestehen', prep: 'auf', case: 'dativ', english: 'to insist on', level: 'B2', example: { de: 'Sie besteht auf ihrem Recht.', en: 'She insists on her right.' } },
  { verb: 'sich beschäftigen', prep: 'mit', case: 'dativ', english: 'to occupy oneself with', level: 'B1', example: { de: 'Er beschäftigt sich mit dem Thema.', en: 'He is occupying himself with the topic.' } },
  { verb: 'sich unterhalten', prep: 'mit', case: 'dativ', english: 'to converse with', level: 'B1', example: { de: 'Ich unterhalte mich mit meiner Nachbarin.', en: 'I am chatting with my neighbour.' } },
  { verb: 'sich verlassen', prep: 'auf', case: 'akkusativ', english: 'to rely on', level: 'B1', example: { de: 'Du kannst dich auf mich verlassen.', en: 'You can rely on me.' } },
  { verb: 'achten', prep: 'auf', case: 'akkusativ', english: 'to pay attention to', level: 'B1', example: { de: 'Achte auf die Kinder.', en: 'Keep an eye on the children.' } },
  { verb: 'sich konzentrieren', prep: 'auf', case: 'akkusativ', english: 'to concentrate on', level: 'B1', example: { de: 'Ich konzentriere mich auf die Arbeit.', en: 'I am concentrating on the work.' } },
  { verb: 'sich vorbereiten', prep: 'auf', case: 'akkusativ', english: 'to prepare for', level: 'B1', example: { de: 'Wir bereiten uns auf die Prüfung vor.', en: 'We are preparing for the exam.' } },
  { verb: 'sich entscheiden', prep: 'für', case: 'akkusativ', english: 'to decide on', level: 'B1', example: { de: 'Sie entscheidet sich für das rote Kleid.', en: 'She decides on the red dress.' } },
  { verb: 'sich ärgern', prep: 'über', case: 'akkusativ', english: 'to be annoyed about', level: 'B1', example: { de: 'Ich ärgere mich über den Lärm.', en: 'I am annoyed about the noise.' } },
  { verb: 'sich beschweren', prep: 'über', case: 'akkusativ', english: 'to complain about', level: 'B1', example: { de: 'Er beschwert sich über das Essen.', en: 'He complains about the food.' } },
  { verb: 'sich sorgen', prep: 'um', case: 'akkusativ', english: 'to worry about', level: 'B1', example: { de: 'Sie sorgt sich um ihren Sohn.', en: 'She worries about her son.' } },
  { verb: 'sich verlieben', prep: 'in', case: 'akkusativ', english: 'to fall in love with', level: 'B1', example: { de: 'Er verliebt sich in seine Kollegin.', en: 'He falls in love with his colleague.' } },
  { verb: 'leiden', prep: 'unter', case: 'dativ', english: 'to suffer from', level: 'B2', example: { de: 'Sie leidet unter dem Stress.', en: 'She suffers from the stress.' } },
  { verb: 'sterben', prep: 'an', case: 'dativ', english: 'to die of', level: 'B2', example: { de: 'Er starb an einer Krankheit.', en: 'He died of an illness.' } },
  { verb: 'zweifeln', prep: 'an', case: 'dativ', english: 'to doubt', level: 'B2', example: { de: 'Ich zweifle an seiner Aussage.', en: 'I doubt his statement.' } },
  { verb: 'sich beziehen', prep: 'auf', case: 'akkusativ', english: 'to refer to', level: 'B2', example: { de: 'Der Text bezieht sich auf die Studie.', en: 'The text refers to the study.' } },
  { verb: 'hinweisen', prep: 'auf', case: 'akkusativ', english: 'to point out', level: 'B2', example: { de: 'Sie weist auf das Problem hin.', en: 'She points out the problem.' } },
  { verb: 'verzichten', prep: 'auf', case: 'akkusativ', english: 'to do without', level: 'B2', example: { de: 'Ich verzichte auf den Nachtisch.', en: 'I am doing without dessert.' } },
  { verb: 'sich einigen', prep: 'auf', case: 'akkusativ', english: 'to agree on', level: 'B2', example: { de: 'Wir einigen uns auf einen Termin.', en: 'We agree on a date.' } },
  { verb: 'protestieren', prep: 'gegen', case: 'akkusativ', english: 'to protest against', level: 'B2', example: { de: 'Sie protestieren gegen das Gesetz.', en: 'They protest against the law.' } },
  { verb: 'kämpfen', prep: 'für', case: 'akkusativ', english: 'to fight for', level: 'B1', example: { de: 'Wir kämpfen für unsere Rechte.', en: 'We fight for our rights.' } },
  { verb: 'sich schützen', prep: 'vor', case: 'dativ', english: 'to protect oneself from', level: 'B1', example: { de: 'Schütze dich vor der Sonne.', en: 'Protect yourself from the sun.' } },
  { verb: 'Angst haben', prep: 'vor', case: 'dativ', english: 'to be afraid of', level: 'A2', example: { de: 'Ich habe Angst vor dem Hund.', en: 'I am afraid of the dog.' } },
  { verb: 'einladen', prep: 'zu', case: 'dativ', english: 'to invite to', level: 'A2', example: { de: 'Sie lädt mich zu ihrer Party ein.', en: 'She invites me to her party.' } },
  { verb: 'gratulieren', prep: 'zu', case: 'dativ', english: 'to congratulate on', level: 'B1', example: { de: 'Ich gratuliere dir zum Geburtstag.', en: 'I congratulate you on your birthday.' } },
  { verb: 'sich bedanken', prep: 'für', case: 'akkusativ', english: 'to thank for', level: 'B1', example: { de: 'Ich bedanke mich für deine Hilfe.', en: 'I thank you for your help.' } },
  { verb: 'sich bemühen', prep: 'um', case: 'akkusativ', english: 'to make an effort for', level: 'B2', example: { de: 'Er bemüht sich um eine Lösung.', en: 'He is making an effort to find a solution.' } },
];
